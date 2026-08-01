'use client'

import jsQR from 'jsqr'
import { useEffect, useImperativeHandle, useRef } from 'react'

const drawSource = (source, canvas, maxDimension) => {
  const sourceWidth = source.videoWidth || source.naturalWidth || source.width
  const sourceHeight = source.videoHeight || source.naturalHeight || source.height
  if (!sourceWidth || !sourceHeight) return false

  const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight))
  canvas.width = Math.max(1, Math.round(sourceWidth * scale))
  canvas.height = Math.max(1, Math.round(sourceHeight * scale))
  const context = canvas.getContext('2d', { willReadFrequently: true })
  context.drawImage(source, 0, 0, canvas.width, canvas.height)
  return true
}

const decodeCanvas = (canvas) => {
  const context = canvas.getContext('2d', { willReadFrequently: true })
  const image = context.getImageData(0, 0, canvas.width, canvas.height)
  return jsQR(image.data, image.width, image.height, { inversionAttempts: 'attemptBoth' })?.data || null
}

const loadImage = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file)
  const image = new Image()
  image.onload = () => { URL.revokeObjectURL(url); resolve(image) }
  image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('The selected image could not be read')) }
  image.src = url
})

const QrScannerClient = ({ scannerRef, legacyMode = false, onError, onScan, delay = 250, style, className = '' }) => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const inputRef = useRef(null)
  const streamRef = useRef(null)
  const scanTimerRef = useRef(null)
  const onErrorRef = useRef(onError)
  const onScanRef = useRef(onScan)
  onErrorRef.current = onError
  onScanRef.current = onScan

  const stop = () => {
    window.clearTimeout(scanTimerRef.current)
    scanTimerRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }

  useImperativeHandle(scannerRef, () => ({
    openImageDialog: () => inputRef.current?.click(),
    stop,
  }))

  useEffect(() => {
    if (legacyMode) return undefined
    let active = true

    const scanFrame = () => {
      if (!active) return
      const video = videoRef.current
      const canvas = canvasRef.current
      if (video?.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && canvas && drawSource(video, canvas, 960)) {
        const result = decodeCanvas(canvas)
        if (result) {
          onScanRef.current?.(result)
          return
        }
      }
      scanTimerRef.current = window.setTimeout(scanFrame, delay)
    }

    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          const unsupported = new Error('Camera access is not supported by this browser')
          unsupported.name = 'NotSupportedError'
          throw unsupported
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })

        if (!active) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        scanFrame()
      } catch (error) {
        if (active) onErrorRef.current?.(error)
      }
    }

    start()
    return () => { active = false; stop() }
  }, [delay, legacyMode])

  const scanImage = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const image = await loadImage(file)
      const canvas = canvasRef.current
      const result = canvas && drawSource(image, canvas, 1600) ? decodeCanvas(canvas) : null
      onScanRef.current?.(result)
    } catch (_error) {
      onScanRef.current?.(null)
    }
  }

  return (
    <section className={className}>
      {legacyMode ? (
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={scanImage} />
      ) : (
        <video ref={videoRef} muted playsInline autoPlay style={style} aria-label="Live camera preview" />
      )}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
    </section>
  )
}

export default QrScannerClient
