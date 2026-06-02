export function overlayLogo(imageDataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let canvas, ctx
      try {
        canvas = document.createElement('canvas')
        canvas.width  = img.width
        canvas.height = img.height
        ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Canvas 2D context unavailable')
        ctx.drawImage(img, 0, 0)
      } catch (err) {
        reject(err)
        return
      }

      const logo = new Image()
      logo.crossOrigin = 'anonymous'
      const logoTimeout = setTimeout(() => resolve(imageDataUrl), 8000)
      logo.onload = () => {
        clearTimeout(logoTimeout)
        try {
          const logoH   = img.height * 0.13
          const logoW   = (logo.width / logo.height) * logoH
          const padding = img.width * 0.04

          // Pill background (white, semi-transparent)
          const pH = logoH * 0.28
          const pW = logoW * 0.18
          const rx = padding - pW
          const ry = img.height - logoH - padding - pH
          const rw = logoW + pW * 2
          const rh = logoH + pH * 2
          const r  = rh / 2

          ctx.shadowColor   = 'rgba(0,0,0,0.12)'
          ctx.shadowBlur    = 8
          ctx.shadowOffsetY = 2
          ctx.fillStyle = 'rgba(255,255,255,0.90)'
          ctx.beginPath()
          ctx.moveTo(rx + r, ry)
          ctx.lineTo(rx + rw - r, ry)
          ctx.quadraticCurveTo(rx + rw, ry,      rx + rw, ry + r)
          ctx.lineTo(rx + rw, ry + rh - r)
          ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - r, ry + rh)
          ctx.lineTo(rx + r, ry + rh)
          ctx.quadraticCurveTo(rx,      ry + rh, rx, ry + rh - r)
          ctx.lineTo(rx,      ry + r)
          ctx.quadraticCurveTo(rx,      ry,      rx + r, ry)
          ctx.closePath()
          ctx.fill()

          ctx.shadowColor = 'transparent'
          ctx.shadowBlur  = 0

          ctx.drawImage(logo, padding, img.height - logoH - padding, logoW, logoH)
          resolve(canvas.toDataURL('image/png'))
        } catch (err) {
          // SecurityError (canvas taint) or other drawing error — return original
          resolve(imageDataUrl)
        }
      }
      logo.onerror = () => { clearTimeout(logoTimeout); resolve(imageDataUrl) }
      logo.src = '/logo.png'
    }
    img.onerror = () => reject(new Error('Failed to load image for logo overlay'))
    img.src = imageDataUrl
  })
}
