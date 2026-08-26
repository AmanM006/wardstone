'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'

const ShaderGradientCanvas = dynamic(
  () => import('@shadergradient/react').then((mod) => mod.ShaderGradientCanvas),
  { ssr: false }
)
const ShaderGradient = dynamic(
  () => import('@shadergradient/react').then((mod) => mod.ShaderGradient),
  { ssr: false }
)

export default function GlobalShaderGradient() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // Only show on the landing page — same as Mantleye
  const isVisible = pathname === '/'

  if (!mounted || !isVisible) return null

  return (
    <>
      {/* Exact 1:1 copy of Mantleye GlobalShaderGradient — fixed behind all content */}
      <div style={{
        position: 'fixed', inset: 0,
        pointerEvents: 'none', zIndex: 0,
      }}>
        <ShaderGradientCanvas
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}
        >
          <ShaderGradient
            {...({
              animate: "on",
              axesHelper: "off",
              brightness: 1.2,
              cAzimuthAngle: 180,
              cDistance: 3.6,
              cPolarAngle: 90,
              cameraZoom: 1,
              color1: "#4c1d95",
              color2: "#2563eb",
              color3: "#0f172a",
              destination: "onCanvas",
              embedMode: "off",
              envPreset: "city",
              format: "gif",
              fov: 45,
              frameRate: 10,
              gizmoHelper: "hide",
              grain: "on",
              lightType: "3d",
              loop: "on",
              loopDuration: 10,
              pixelDensity: 1,
              positionX: -1.4,
              positionY: 0,
              positionZ: 0,
              range: "enabled",
              rangeEnd: 10,
              rangeStart: 0,
              reflection: 0.1,
              rotationX: 0,
              rotationY: 10,
              rotationZ: 50,
              shader: "defaults",
              toggleAxis: false,
              type: "plane",
              uAmplitude: 1,
              uDensity: 1.3,
              uFrequency: 5.5,
              uSpeed: 0.2,
              uStrength: 4,
              uTime: 0,
              wireframe: false,
              zoomOut: false,
            } as any)}
          />
        </ShaderGradientCanvas>
      </div>

      {/* Film grain noise overlay — exact 1:1 Mantleye noise-overlay + mix-blend-overlay */}
      <div
        className="noise-overlay"
        style={{
          position: 'fixed', inset: 0,
          pointerEvents: 'none', zIndex: 1,
          opacity: 0.15,
          mixBlendMode: 'overlay',
        }}
      />
    </>
  )
}
