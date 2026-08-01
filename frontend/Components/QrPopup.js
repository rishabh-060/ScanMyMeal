'use client'

import dynamic from 'next/dynamic'
import { Camera, ImageUp, RefreshCw, ShieldAlert } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { Button, Modal } from '@/Components/ui'

const QrScanner = dynamic(() => import('./QrScannerClient'), { ssr: false })

const getCameraError = (error) => {
  const name = error?.name || ''

  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return {
      title: 'Camera access is blocked',
      message: 'Allow camera access for this site in your browser settings, then try again.',
    }
  }

  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return {
      title: 'No camera was found',
      message: 'Connect a camera or scan a saved photo of the table QR code instead.',
    }
  }

  if (name === 'NotReadableError' || name === 'TrackStartError') {
    return {
      title: 'Camera is already in use',
      message: 'Close other camera apps or browser tabs, then retry. You can also scan from a photo.',
    }
  }

  return {
    title: 'Camera could not start',
    message: 'Check your camera connection and browser permissions, then try again.',
  }
}

const extractTableId = (text) => {
  try {
    const url = new URL(text, window.location.origin)
    const match = url.pathname.match(/^\/table\/([^/]+)$/)
    return match?.[1] ? decodeURIComponent(match[1]) : null
  } catch (_error) {
    return null
  }
}

const QRPopup = ({ onClose }) => {
  const router = useRouter()
  const [scanned, setScanned] = useState(false)
  const [mode, setMode] = useState('camera')
  const [cameraError, setCameraError] = useState(null)
  const [retryKey, setRetryKey] = useState(0)
  const scannerRef = useRef(null)

  const handleScan = useCallback((text) => {
    if (!text || scanned) return
    const tableId = extractTableId(text)
    if (!tableId) return toast.error('This is not a valid Scan My Meal table QR code')
    setScanned(true)
    scannerRef.current?.stop?.()
    router.push(`/table/${encodeURIComponent(tableId)}`)
    onClose?.()
  }, [onClose, router, scanned])

  const handleImageScan = useCallback((text) => {
    if (!text) return toast.error('No readable QR code was found in that photo')
    handleScan(text)
  }, [handleScan])

  const handleCameraError = useCallback((error) => {
    setCameraError(getCameraError(error))
  }, [])

  const retryCamera = () => {
    scannerRef.current?.stop?.()
    setCameraError(null)
    setRetryKey((key) => key + 1)
  }

  const closeScanner = () => {
    scannerRef.current?.stop?.()
    onClose?.()
  }

  const openImagePicker = () => {
    if (scannerRef.current?.openImageDialog) {
      scannerRef.current.openImageDialog()
      return
    }
    toast.error('The image picker is still loading. Please try again.')
  }

  return (
    <Modal title="Scan table QR" onClose={closeScanner}>
      <div className="relative min-h-80 overflow-hidden rounded-2xl bg-[#111914]">
        {mode === 'camera' && !cameraError && (
          <>
            <QrScanner
              key={retryKey}
              scannerRef={scannerRef}
              delay={250}
              facingMode="rear"
              onError={handleCameraError}
              onScan={handleScan}
              style={{ width: '100%', height: '320px', objectFit: 'cover' }}
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_center,transparent_0,transparent_30%,rgb(0_0_0_/_0.2)_31%,rgb(0_0_0_/_0.5)_100%)]">
              <div className="h-52 w-52 rounded-3xl border-2 border-white/90 shadow-[0_0_0_999px_rgb(0_0_0_/_0.08)]" />
            </div>
          </>
        )}

        {mode === 'camera' && cameraError && (
          <div className="grid min-h-80 place-items-center p-6 text-center text-white">
            <div className="max-w-sm">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-orange-300 ring-1 ring-white/10">
                <ShieldAlert aria-hidden="true" size={27} />
              </span>
              <h3 className="mt-4 text-lg font-black">{cameraError.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/65">{cameraError.message}</p>
              <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
                <Button size="sm" onClick={retryCamera}>
                  <RefreshCw aria-hidden="true" size={16} /> Retry camera
                </Button>
                <Button size="sm" variant="outline" onClick={() => { scannerRef.current?.stop?.(); setMode('image') }}>
                  <ImageUp aria-hidden="true" size={16} /> Scan from photo
                </Button>
              </div>
            </div>
          </div>
        )}

        {mode === 'image' && (
          <div className="grid min-h-80 place-items-center p-6 text-center text-white">
            <QrScanner
              scannerRef={scannerRef}
              legacyMode
              onError={() => {}}
              onScan={handleImageScan}
              style={{ display: 'none' }}
            />
            <div className="max-w-sm">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-orange-300 ring-1 ring-white/10">
                <ImageUp aria-hidden="true" size={27} />
              </span>
              <h3 className="mt-4 text-lg font-black">Scan a saved QR photo</h3>
              <p className="mt-2 text-sm leading-6 text-white/65">Choose a clear image containing the complete table QR code.</p>
              <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
                <Button size="sm" onClick={openImagePicker}>
                  <ImageUp aria-hidden="true" size={16} /> Choose photo
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setMode('camera'); retryCamera() }}>
                  <Camera aria-hidden="true" size={16} /> Use camera
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <p className="mt-3 text-center text-sm text-neutral-600">
        {mode === 'camera' ? 'Allow camera access and align the table QR inside the frame.' : 'For best results, use a sharp, well-lit image.'}
      </p>
    </Modal>
  )
}

export default QRPopup
