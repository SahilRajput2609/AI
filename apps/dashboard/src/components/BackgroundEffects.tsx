import { useEffect, useRef } from 'react'

export function BackgroundEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let w = 0
    let h = 0

    const particles: { x: number; y: number; vx: number; vy: number; r: number }[] = []
    const PARTICLE_COUNT = 40

    const resize = () => {
      w = canvas.width = canvas.offsetWidth
      h = canvas.height = canvas.offsetHeight
    }

    const init = () => {
      resize()
      particles.length = 0
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          r: Math.random() * 1.5 + 0.5,
        })
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      // Particles
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.04)'
        ctx.fill()
      }

      // Connect nearby particles with lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 140) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(124,107,255,${0.03 * (1 - dist / 140)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      // Orbital rings
      const cx = w * 0.5
      const cy = h * 0.45
      const t = Date.now() * 0.0001

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(t)
      ctx.beginPath()
      ctx.ellipse(0, 0, w * 0.28, w * 0.12, 0, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(124,107,255,0.025)'
      ctx.lineWidth = 0.8
      ctx.stroke()
      ctx.restore()

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(-t * 0.7)
      ctx.beginPath()
      ctx.ellipse(0, 0, w * 0.22, w * 0.18, Math.PI / 3, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255,255,255,0.015)'
      ctx.lineWidth = 0.6
      ctx.stroke()
      ctx.restore()

      // Radial purple glow
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.35)
      glow.addColorStop(0, 'rgba(124,107,255,0.04)')
      glow.addColorStop(0.5, 'rgba(124,107,255,0.015)')
      glow.addColorStop(1, 'transparent')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, w, h)

      animId = requestAnimationFrame(draw)
    }

    init()
    draw()
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 1 }} />
  )
}
