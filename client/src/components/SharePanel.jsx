import { useState } from 'react'
import { Camera, Share2, Link, X } from 'lucide-react'
import html2canvas from 'html2canvas'

export default function SharePanel({ onClose, selected }) {
  const [capturing, setCapturing] = useState(false)
  const [copied, setCopied]       = useState(false)

  const takeScreenshot = async () => {
    setCapturing(true)
    try {
      const el = document.querySelector('.dashboard') || document.body
      const canvas = await html2canvas(el, {
        useCORS: true,
        allowTaint: true,
        scale: 1.5,
        backgroundColor: '#0e0b08',
      })
      const link = document.createElement('a')
      link.download = `earth-alert-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (e) {
      console.error('Screenshot failed:', e)
    }
    setCapturing(false)
  }

  const copyLink = () => {
    const url = selected
      ? `${window.location.origin}/app?event=${encodeURIComponent(selected.id)}`
      : `${window.location.origin}/app`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareNative = async () => {
    const text = selected
      ? `🌍 ${selected.severity.toUpperCase()} ${selected.type} — ${selected.name} | Earth Alert`
      : '🌍 Real-time global disaster tracking — Earth Alert'
    if (navigator.share) {
      await navigator.share({ title: 'Earth Alert', text, url: window.location.href })
    } else {
      copyLink()
    }
  }

  return (
    <div style={s.panel}>
      <div style={s.header}>
        <span style={s.title}>Share</span>
        <button style={s.close} onClick={onClose}><X size={14} /></button>
      </div>
      <div style={s.body}>
        <button style={s.btn} onClick={takeScreenshot} disabled={capturing}>
          <Camera size={15} color="#ff6600" />
          <div>
            <div style={s.btnTitle}>{capturing ? 'Capturing...' : 'Screenshot'}</div>
            <div style={s.btnSub}>Save map as PNG image</div>
          </div>
        </button>

        <button style={s.btn} onClick={copyLink}>
          <Link size={15} color="#4488ff" />
          <div>
            <div style={s.btnTitle}>{copied ? 'Copied!' : 'Copy Link'}</div>
            <div style={s.btnSub}>{selected ? 'Link to this event' : 'Link to dashboard'}</div>
          </div>
        </button>

        <button style={s.btn} onClick={shareNative}>
          <Share2 size={15} color="#00cc88" />
          <div>
            <div style={s.btnTitle}>Share</div>
            <div style={s.btnSub}>Share via browser</div>
          </div>
        </button>
      </div>
    </div>
  )
}

const s = {
  panel:   { position: 'absolute', bottom: 50, right: 10, width: 240, background: '#141008', border: '1px solid #3d2e1e', borderRadius: 12, zIndex: 1001, animation: 'fadeIn 0.2s ease-out' },
  header:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #2a1f12' },
  title:   { color: '#e8ddd0', fontWeight: 700, fontSize: 13 },
  close:   { background: 'none', border: 'none', color: '#5a4535', cursor: 'pointer', display: 'flex' },
  body:    { padding: '8px' },
  btn:     { display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 12px', background: 'none', border: 'none', borderRadius: 8, cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' },
  btnTitle:{ color: '#e8ddd0', fontSize: 12, fontWeight: 600 },
  btnSub:  { color: '#5a4535', fontSize: 10, marginTop: 2 },
}
