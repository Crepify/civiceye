import { useEffect, useState, useRef, useMemo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { EffectComposer } from "@react-three/postprocessing"
import { Vector2, CanvasTexture } from "three"
import { AsciiEffect } from "./ui/ascii-effect"

function SceneWithDelayedComposer({ resolution, mousePos }: { resolution: Vector2, mousePos: Vector2 }) {
  const { gl, viewport } = useThree()
  const [composerReady, setComposerReady] = useState(false)
  const frameCount = useRef(0)

  const trailCanvas = useMemo(() => document.createElement('canvas'), [])
  const trailTexture = useMemo(() => new CanvasTexture(trailCanvas), [trailCanvas])
  const lastMousePos = useRef(new Vector2())

  useEffect(() => {
    if (resolution.x > 0 && resolution.y > 0) {
      trailCanvas.width = resolution.x / 2
      trailCanvas.height = resolution.y / 2
      const ctx = trailCanvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = 'black'
        ctx.fillRect(0, 0, trailCanvas.width, trailCanvas.height)
      }
    }
  }, [resolution, trailCanvas])

  useFrame(() => {
    frameCount.current++
    if (frameCount.current >= 3 && !composerReady) {
      setTimeout(() => {
        try {
          const context = gl.getContext()
          if (context && !(context as WebGLRenderingContext).isContextLost?.()) {
            setComposerReady(true)
          }
        } catch (e) {
          /* ignore WebGL context errors */
        }
      }, 100)
    }

    const ctx = trailCanvas.getContext('2d')
    if (ctx && trailCanvas.width > 0) {
      // Fade out previous frames slowly
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)'
      ctx.fillRect(0, 0, trailCanvas.width, trailCanvas.height)

      const x = (mousePos.x / resolution.x) * trailCanvas.width
      const y = (mousePos.y / resolution.y) * trailCanvas.height

      const dist = lastMousePos.current.distanceTo(mousePos)
      lastMousePos.current.copy(mousePos)

      // Radius is small but expands slightly on fast movement
      const targetRadius = Math.max(30, Math.min(60, 30 + dist * 0.4))
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, targetRadius)
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, targetRadius, 0, Math.PI * 2)
      ctx.fill()
      
      trailTexture.needsUpdate = true
    }
  })

  return (
    <>
      <color attach="background" args={["#000000"]} />
      
      <mesh>
        <planeGeometry args={[viewport.width, viewport.height]} />
        <meshBasicMaterial map={trailTexture} />
      </mesh>
      
      {composerReady && (
        <EffectComposer>
          <AsciiEffect
            style="standard"
            cellSize={10}
            invert={false}
            color={true}
            characterSet="terminal"
            volumeShading={false}
            tintColor="#E52B50"
            resolution={resolution}
            mousePos={mousePos}
            postfx={{
              contrastAdjust: 1.0,
              brightnessAdjust: 0.0,
              mouseGlowEnabled: false,
              mouseGlowOnly: false,
              scanlineIntensity: 0.1,
              noiseIntensity: 0.5,
              noiseScale: 20.0,
            }}
          />
        </EffectComposer>
      )}
    </>
  )
}

export function AsciiAnimation() {
  const [mousePos] = useState(() => new Vector2(0, 0))
  const [resolution] = useState(() => new Vector2(1920, 1080))

  useEffect(() => {
    const updateResolution = () => {
      resolution.set(window.innerWidth, window.innerHeight)
    }

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.set(e.clientX, e.clientY) // window coordinates directly
    }

    updateResolution()
    window.addEventListener('resize', updateResolution)
    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener('resize', updateResolution)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [mousePos, resolution])

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black"
    >
      <Canvas
        dpr={Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 1.5)}
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ alpha: false, antialias: false }}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = 1.0
        }}
      >
        <SceneWithDelayedComposer
          resolution={resolution}
          mousePos={mousePos}
        />
      </Canvas>
    </div>
  )
}
