# 📡 Live AI Detection — from prototype to production

The **`/live` page** in this repo simulates a computer-vision watchtower: a mock model watches CCTV feeds and auto-creates CivicEye reports when it spots potholes, accidents, garbage, etc.

This document explains how to make it **real** — a Python service that actually ingests live streams, detects issues with YOLOv8, and pushes events into CivicEye (or any backend).

---

## 1. How the real pipeline works

```
CCTV / dashcam / drone streams
      │  RTSP / HLS / WebRTC
      ▼
┌──────────────────────────────┐
│  STREAM INGESTER             │  Python · OpenCV / GStreamer
│  • decode stream             │  • keep-alive, reconnect
│  • sample 2–5 fps            │  • buffer latest frame
└──────────────────────────────┘
      ▼
┌──────────────────────────────┐
│  DETECTOR                    │  Ultralytics YOLOv8 / v11 (GPU or CPU)
│  • object detection          │  • person, car, truck, traffic light…
│  • fine-tuned classes        │  • pothole, debris, damaged vehicle…
│  • instance segmentation     │  (optional: YOLOv8-seg, SAM2)
└──────────────────────────────┘
      ▼
┌──────────────────────────────┐
│  EVENT INFERENCE             │  Temporal logic (frame N vs N-k)
│  • severity scoring          │  • accident ⇐ sudden stop cluster /
│  • dedupe / cooldown         │    vehicles stopped in a lane
│  • geo-tag (camera)          │  • pothole ⇐ stable detection + size
└──────────────────────────────┘
      ▼
┌──────────────────────────────┐
│  CIVICEYE API                │  POST /api/reports (same shape as the
│  • auto-create pending report│  mock `detectionService` emits)
│  • notify ward dashboard     │
└──────────────────────────────┘
```

**Key design decision:** the mock `DetectionResult` in `src/services/detectionService.ts` is *the contract*. A real service that returns the same JSON can replace it with zero changes to the frontend.

---

## 2. Recommended stack

| Concern | Choice | Notes |
| --- | --- | --- |
| Language/runtime | **Python 3.11 + FastAPI** | Async, auto OpenAPI docs at `/docs` |
| Detection | **Ultralytics YOLOv8n / YOLOv8s** | Pretrained COCO out of the box; fine-tune for civic classes |
| Streams | **OpenCV `VideoCapture`** (RTSP/HLS) + **Aiortc** for WebRTC | Reconnect + frame sampling |
| Acceleration | CUDA GPU (≥ 4 GB) or **OpenVINO / TensorRT** export | CPU works for 1–2 cams at ~10 fps |
| Queue (scale) | Redis Streams / Kafka | When > ~10 cameras |
| Deploy | Docker + any VPS / Render / Railway | GPU instance for many cams |

**Models / datasets to fine-tune on:**
- Potholes: **Pothole-600**, **RDCLD** (road damage), **AigleRN**, **Crack500** — or one-shot with **YOLO-World** (zero-shot open-vocabulary detection of "pothole", "debris"…).
- Accidents: **UA-DETRAC**, **CARLA**-generated scenes, or a small hand-labelled set (~500–1000 frames of crash scenes). Accidents are rare events — combine detection with **temporal heuristics** (stopped-vehicle clusters, speed deltas) for recall.
- Garbage/illegal dumping: **TACO** (Trash Annotations in Context).

---

## 3. Starter service (drop-in for the mock)

```python
# stream_detector.py — FastAPI + YOLOv8 → POSTs events to CivicEye
# pip install fastapi uvicorn ultralytics opencv-python httpx

import asyncio, cv2, httpx, os
from fastapi import FastAPI
from ultralytics import YOLO

CIVICEYE_API = os.getenv("CIVICEYE_API", "https://your-app.vercel.app/api/reports")
STREAMS = {  # camera_id -> (rtsp_url, area, lat, lng)
    "CAM-01": ("rtsp://user:pass@cam1/stream", "Koramangala, Bengaluru", 12.9352, 77.6245),
    "CAM-02": ("rtsp://user:pass@cam2/stream", "MG Road, Bengaluru", 12.9757, 77.6040),
}
FPS = 2
CONF_THRESHOLD = 0.55
COOLDOWN_S = 20            # don't re-report the same issue too often
SEVERITY_BY_CONF = lambda c: "critical" if c > 0.82 else "high" if c > 0.68 else "medium" if c > 0.5 else "low"

app = FastAPI(title="CivicEye Stream Detector")
model = YOLO("yolov8n.pt")  # swap for a fine-tuned civic model

async def send_report(cam_id, label, conf, frame, area, lat, lng):
    async with httpx.AsyncClient(timeout=10) as client:
        await client.post(CIVICEYE_API, json={
            "title": f"Live detection: {label} on {cam_id}",
            "category": label.lower().replace(" ", "-"),
            "severity": SEVERITY_BY_CONF(conf),
            "confidence": round(conf, 2),
            "coordinates": {"lat": lat, "lng": lng},
            "locationName": area,
            "image": frame,  # base64 jpeg
            "source": f"stream:{cam_id}",
            "status": "pending",
        })

async def watch(cam_id, rtsp, area, lat, lng):
    cap = cv2.VideoCapture(rtsp)
    last_report = 0.0
    while True:
        ok, frame = cap.read()
        if not ok:                      # reconnect on drop
            cap = cv2.VideoCapture(rtsp); await asyncio.sleep(2); continue
        results = model(frame, verbose=False)[0]
        for box in results.boxes:
            conf = float(box.conf[0]); cls = model.names[int(box.cls[0])]
            if conf >= CONF_THRESHOLD and time.time() - last_report > COOLDOWN_S:
                last_report = time.time()
                _, buf = cv2.imencode(".jpg", frame)
                asyncio.create_task(send_report(cam_id, cls, conf,
                    buf.tobytes().decode("latin1"), area, lat, lng))
        await asyncio.sleep(1 / FPS)

@app.on_event("startup")
async def start():
    for cam_id, (url, area, lat, lng) in STREAMS.items():
        asyncio.create_task(watch(cam_id, url, area, lat, lng))
```

Run with `uvicorn stream_detector:app --host 0.0.0.0 --port 8000`.

---

## 4. Contract the frontend expects

`src/services/detectionService.ts` already defines the exact shape — mirror it server-side:

```jsonc
{
  "frameIndex": 1042,
  "camera": { "id": "CAM-01", "name": "Koramangala 80ft Rd", "streamLabel": "CCTV-KMG-01" },
  "category": "pothole",            // one of the 13 CategoryIds
  "confidence": 0.91,
  "severity": "high",
  "boxes": [{ "label": "pothole", "confidence": 0.87, "x": 12, "y": 20, "w": 30, "h": 24 }],
  "timestamp": "2026-08-01T10:00:00Z",
  "image": "https://…/frame-1042.jpg",
  "summary": "Detected pothole on Koramangala 80ft Rd (confidence 91%)."
}
```

To go live in the app: replace the mock `detectFrame()` with a `fetch` to your service (or a WebSocket for push), and auto-reporting already works.

---

## 5. Pitfalls & good practices

- **Privacy:** blur faces & licence plates before persisting frames (OpenCV `CascadeClassifier` or YOLO person-crop + Gaussian blur).
- **Rare events:** accidents are rare — train on a small curated set and *always* keep a human-confirm step (that's exactly what CivicEye's community validation provides).
- **Dedup:** cooldown per (camera, class) + IoU overlap check — otherwise one pothole creates 50 reports.
- **Costs:** YOLOv8n on a $0.05–0.15/hr CPU instance handles 1–3 cameras; a 1×T4 GPU (≈$0.35/hr) handles 10+.
- **Ops:** run as a systemd/Docker service with a watchdog; alert on stream disconnects (Prometheus + Grafana if you're fancy).
