import { useEffect, useRef, useState } from 'react'
import {
  checkIn,
  checkOut,
  DEMO_QR_TOKEN,
  getDeviceId,
  OFFICE,
} from '../../../services/attendanceService'
import { statusLabel } from './statusMeta'
import './employee.css'

const ERROR_TEXT = {
  no_location: 'Please detect your location first.',
  low_accuracy: 'Location accuracy is too low. Please retry.',
  outside_area: (e) =>
    e.distanceM != null
      ? `You are outside the allowed work area (${e.distanceM} m from ${OFFICE.name}).`
      : 'You are outside the allowed work area.',
  invalid_qr: 'The QR code is invalid or expired. Please scan a new one.',
  duplicate: 'You already checked in today.',
  no_active_checkin: 'There is no active check-in to check out from.',
}

function errorMessage(err) {
  const entry = ERROR_TEXT[err.code]
  if (typeof entry === 'function') return entry(err)
  return entry ?? err.message ?? 'Something went wrong. Please try again.'
}

// Check-in / check-out dialog: location + QR are verified by the (mock) Verification Service.
function CheckPanel({ userId, action, onClose, onSuccess }) {
  const [location, setLocation] = useState(null)
  const [locating, setLocating] = useState(false)
  const [qrToken, setQrToken] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const dialogRef = useRef(null)

  const actionLabel = action === 'check-in' ? 'Check in' : 'Check out'

  useEffect(() => {
    dialogRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const detectLocation = () => {
    setError(null)
    if (!navigator.geolocation) {
      setError('Location is not supported on this device.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          source: 'gps',
        })
        setLocating(false)
      },
      () => {
        setLocating(false)
        setError('Could not get your location. Allow location access or use the demo location.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const useDemoLocation = () => {
    setError(null)
    setLocation({
      latitude: OFFICE.latitude + 0.0002,
      longitude: OFFICE.longitude + 0.0002,
      accuracy: 15,
      source: 'demo',
    })
  }

  const submit = async (event) => {
    event.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const run = action === 'check-in' ? checkIn : checkOut
      const record = await run(userId, {
        deviceId: getDeviceId(),
        latitude: location?.latitude,
        longitude: location?.longitude,
        accuracy: location?.accuracy,
        qrToken,
      })
      await onSuccess(
        action === 'check-in'
          ? `Checked in successfully (${statusLabel(record.status).toLowerCase()}).`
          : 'Checked out successfully. See you tomorrow!'
      )
    } catch (err) {
      setError(errorMessage(err))
      setBusy(false)
    }
  }

  return (
    <div className="emp-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="emp-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="emp-dialog-title"
        tabIndex={-1}
        ref={dialogRef}
      >
        <div className="emp-card-head">
          <h2 id="emp-dialog-title">{actionLabel}</h2>
          <button type="button" className="btn emp-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form className="emp-form" onSubmit={submit}>
          <div className="emp-step">
            <div className="emp-step-title">
              <span className="emp-step-num">1</span> Location
              {location && <span className="emp-ok">✓</span>}
            </div>
            <div className="emp-row">
              <button type="button" className="btn" onClick={detectLocation} disabled={locating || busy}>
                {locating ? 'Detecting...' : 'Detect my location'}
              </button>
              <button type="button" className="btn" onClick={useDemoLocation} disabled={busy}>
                Use office location (demo)
              </button>
            </div>
            {location && (
              <p className="emp-muted emp-small">
                {location.source === 'demo' ? 'Demo location' : 'GPS'} · accuracy ±
                {location.accuracy} m
              </p>
            )}
          </div>

          <div className="emp-step">
            <div className="emp-step-title">
              <span className="emp-step-num">2</span> QR code
              {qrToken && <span className="emp-ok">✓</span>}
            </div>
            <div className="emp-row">
              <input
                className="input emp-grow"
                value={qrToken}
                onChange={(e) => setQrToken(e.target.value)}
                placeholder="Scan or enter the QR code"
                aria-label="QR code"
                disabled={busy}
              />
              <button type="button" className="btn" onClick={() => setQrToken(DEMO_QR_TOKEN)} disabled={busy}>
                Use demo QR
              </button>
            </div>
          </div>

          {error && (
            <p className="emp-alert emp-alert-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="emp-btn-brand" disabled={busy || !location || !qrToken}>
            {busy ? 'Verifying...' : actionLabel}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CheckPanel
