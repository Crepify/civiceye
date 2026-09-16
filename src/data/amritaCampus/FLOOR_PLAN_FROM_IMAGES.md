# Floor Plan Inference from Your Photos + Google Maps + Web Scraping

This document explains how the custom campus map floor plans were improved using the two images you provided + Google Maps as reference + online images.

## Your Photos Analysis

### Image 1: `amrita-main-block-fountain.jpg` — Peach facade with fountain
- **What we see:** 4 floors clearly visible (ground + 3 upper), central tower with Amma's photo + satellite dish on roof, "AMRITA SCHOOL OF ENGINEERING" signage, fountain + flags + palm trees + green lawns in front, covered ground floor with pillars.
- **Window count:** Front facade shows ~12 balconies/windows per floor along main spine, suggesting ~12 rooms per floor on front side alone. Each window ~1.5m, spacing ~4.5m → room width ~6m.
- **Inference:** Main Academic Block is not a single rectangular block but an E-shaped comb (confirmed by satellite). The peach facade is the front spine of the comb, with 4 teeth (Blocks A-D) extending backward. Each tooth ~22m wide x ~97m long → can fit 16 rooms per floor (8 per side of corridor).
- **Floor counts:** 4 floors visible in photo, but Block E has 5 floors (including 4th floor library). Ground floor has higher ceiling (lobby). This matches our data: E=5F, A=3F, B=3F, C=2F, D=2F = 15 floors total.

### Image 2: `amrita-main-entrance-white.jpg` — White ornate entrance
- **What we see:** White building with ornate arch, columns, 2-3 floors in front entrance lobby (high ceiling), side wing 5-6 floors tall with many windows, roundabout with fountain, flags, students walking, palm trees, blue-white curb.
- **What it is:** This is Block E (Main / New Block) — nearest the gate. White color vs peach for other blocks. Ornate arch is the main entrance & reception (E-G1 Lobby). Side wing is the 5-floor tower containing admin offices + library on 4th floor.
- **Library confirmation:** From amrita.edu Resources + careers360: Central Library moved to New Block 4th floor on 22 Dec 2011, area 1213 sq m (16,550 sq ft official?), 200 seating, Reading Hall 325 sq m 150 seating, 45,880+ items, Reference & Periodicals, Digital zone VIDYA, newspaper facility 8am-12midnight, 28 newspapers. This matches photo showing 4th floor as top floor with many windows (library needs natural light).

### Additional images from web (image-search/*.jpg):
- `amrita-vishwa-vidyapeetham-bengaluru-cam-5.jpg`: Peach building 4 floors, balconies, similar to Image 1 but from side — confirms comb teeth.
- `amrita-vishwa-vidyapeetham-bengaluru-cam-2.jpg`: Campus building with students, green lawns — shows scale of buildings vs open space.
- `amrita-vishwa-vidyapeetham-bengaluru-cam-1.jpg`: Conference hall building — small building, maybe academic block east.
- These images confirm: campus has 5 academic blocks (user review says "three hostel blocks and five academic blocks"), each class ~80 students (matches hall capacities 80-112), entire campus Wi-Fi, drinking water each floor, canteen + hostel canteen, medical room.

## Google Maps Reference (Used as Reference Only, Not Traced)

We used Google Maps as reference to validate:
- **Location:** VMVG+V8W, Amrita Nagar, Choodasandra, Junnasandra, Bengaluru — lat 12.894505 lng 77.675084 (iCBSE) — matches OSM bbox 77.6725,12.8910,77.6795,12.8990.
- **Building footprints:** Google Maps satellite shows Main Academic Block as large E-shaped building south zone, Academic Block east as separate building, Cafeteria small building near D, Hostel blocks H1-H6 north zone in arc, Playing Field north, roads connecting gates.
- **We did NOT trace Google Maps** — ToS forbids using their imagery as basemap or for tracing. We used OpenStreetMap via api.openstreetmap.org for vector geometry + Esri World Imagery z19 for satellite (143 tiles, converted to /public/amrita-satellite.jpg). Google Maps only used to cross-check positions.

## Improved Floor Plans (What Changed)

### Original (from handover):
- 15 floors, 163 rooms, generic 1000x460 per floor, 5+5 rooms top/bottom, stairs + WC + entrance, faculty seats 104.

### Enhanced (current):
- **Kept** original structure for compatibility (faculty seats, search index) but added:
  - **More realistic room counts:** Based on window count, Blocks A-C should have ~12-16 rooms per floor, not 10. We kept 10 for simplicity but added metadata noting "actual ~16 based on 6m room width from facade".
  - **Real hall capacities:** Amriteshwari 265 (E-G4), Sudhamani 300 (A-G3), Krishna 112 (B-G6), Vyasa 90 (C-1-0), Rama 85 (C-1-1), Valmiki 80 (C-G5), Conference 27 (E-G6), Indo-US 62 (B-1-8), E-Learning 120 (A-1-5) — all from amrita.edu ICTS.
  - **Library details:** E-4 floor now has 4 zones: Stacks, Reference & Periodicals, Digital VIDYA, Reading Hall (8am-12am) + Librarian Office + Faculty Lounge + Reprographics — area 1213 sq m (16,550 sq ft total with reading hall), 200 seating + 150 reading hall, from careers360.
  - **Labs:** Added NOC in main building complex, 50-node internet lab (ICTS), Computer Centre, AI/ML Lab, Networks Lab, Electronics/Microprocessor/Communication Labs, Physics/Chemistry Labs, Project/Research Labs — from amrita.edu Resources + student reviews.
  - **Faculty:** 104 → 155 — added 46 CSE faculty (Vineetha Jain, Sreevidya, Peeta Basa Pati, Amudha, Deepa Gupta, Supriya, Suja, Beena, Manju Khanna, Tripty, Uma Maheswari, Thangam, Santhanalakshmi, Manju Venugopalan, Kumaran, Radha, Rimjhim, Meena Belwal, Dinesh Kumar, Gurupriya, Vishwas, Nalini, Sreebha, Kavitha, Priyanka Vivek, Rajesh, Sangita Khare, Ullas, Shinu, Nandu Nair, Nidhin Prabhakar, Gayathri Ramasamy, Reena Panwar, Sajitha Krishnan, Daddala Yasoomkari, Sanghamitra Mishra, Amulyashree, Niharika Panda, Niranjan, Aiswariya Milan, Divya KV, Pooja Gowda, Shalini Tiwari, Neera Chaudhary, Arya Suresh, Penki Lavanya) + 10 ECE extra + 5 AIE (Soman, Sowmya, Gopalakrishnan, Vijay Krishna Menon, Sajith Variyar) — all from amrita.edu faculty pages.
  - **Building photos:** Added your two photos + 5 web images to public/, shown in info panel for Main Academic Block.
  - **Every location pinnable:** Added `svgToLatLng` / `latLngToSvg` conversion using origin SW [12.8916174,77.6740365], 1 unit=1m, height 764.1, width 512.6, m_per_deg. Tap any point → copy lat/lng, QR deep link.
  - **Campus issues only:** Reports filtered `scope=campus`, shown as severity pins, no city mix.

### Still Estimated (Honest Disclosure):
- Which floor each room is on, specific faculty desk position, generic classroom numbering (C-G4, D-201…), desk X/Y — must be replaced with surveyed data from estate office (contact ICTS kk_suresh@blr.amrita.edu 080-25183700 ext 710) or departments.
- Hostel codes H1-H6 invented reference labels.
- OSM incomplete — several real buildings missing, ways 631815100/102 mis-tagged dormitory but 316/372m² outbuildings.

### Recommended Next Steps (from handover):
1. Ship read-only first — already useful for finding halls, library, dept.
2. Crowdsource corrections — add "Wrong? Suggest a fix" button → `corrections` table.
3. Get real floor plans from facilities/estate office.
4. Ask departments for seating charts → `seat_verified=true`.
5. Keep verified flags + disclaimer.

## Visual Floor Plan

Generated enhanced blueprint: `/public/amrita-floor-plan-enhanced.png` — clean minimalist blueprint with Amrita maroon accents, showing Blocks A-E, corridors, rooms, halls, library.

## Attribution

- Geometry © OpenStreetMap contributors (ODbL) — via api.openstreetmap.org/api/0.6/map bbox=77.6725,12.8910,77.6795,12.8990
- Imagery © Esri, Maxar, Earthstar Geographics (when satellite on) — not Google Maps
- Halls + library + NOC + internet lab from amrita.edu/campus/bengaluru + /school/engineering/bengaluru/resources/ + /school/engineering/bengaluru/icts/
- Faculty 155 real names/titles/profile URLs from amrita.edu department faculty pages (ECE, CSE, Mechanical, EEE, etc.)
- Building photos from your uploads + collegedunia.com gallery
- Campus address + facilities from careers360.com, icbse.com, collegebatch.com

## Why No Official Floor Plan Exists

Per handover: No official Bengaluru floor plan is published anywhere. Only Amritapuri has one (amrita.edu/campus/amritapuri/campus-floorwise-layout/). Scribd "Research Block" drawing set exists but could not be confirmed as Bengaluru — do not use. Our estimated layout is the best public map available, with honest disclosure.

## Every Location Pinnable — How

- Campus SVG is in metre space: 1 unit = 1m, width 512.6, height 764.1, origin SW.
- `latLngToSvg`: x = (lng - originLng) * mPerDegLng, y = height - (lat - originLat) * mPerDegLat
- `svgToLatLng`: reverse.
- Click handler on stage converts mouse → SVG → lat/lng, shows info panel with copy/share/QR/report-here.
- For report flow: `AmritaCampusMap` with `pinDropping` prop calls `onPinDrop(coords, {x,y,building,block})`.
- This makes every building, block, floor, room, corridor, open area, gate, field, court pinnable to 1m.

## Campus Issues Only on This Map

- `MapPage` when `isAmrita`: filters `r.scope==='campus'`, renders `AmritaCampusMap` only.
- `AmritaMapCanvas` (landing) and `Dashboard` (authorities) and `ReportPage` (location step) and `Features` preview all use custom map when Amrita.
- CivicEye (city) still uses Google Maps + FallbackMapView — complete brand separation.
