import { useState, useEffect, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImageFile } from '../utils/cropImage';
import './ImageCropper.css';

const ASPECT_PRESETS = [
  { id: 'original',  label: 'Original'  },
  { id: 'free',      label: 'Free'      },
  { id: 'square',    label: '1:1'       },
  { id: 'portrait',  label: '4:5'       },
  { id: 'landscape', label: '16:9'      },
  { id: 'cover',     label: '2:1'       },
];

const ASPECT_VALUES = { square: 1, portrait: 4 / 5, landscape: 16 / 9, cover: 2 };

function ZoomOutIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>;
}
function ZoomInIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>;
}

// One-photo-at-a-time cropper. `onSave` receives a cropped File; `onSkip`
// keeps the original file untouched; `onCancel` abandons the whole
// selection (used for the multi-image queue in CreatePostModal).
export default function ImageCropper({ file, index = 0, total = 1, defaultAspect = 'original', cropShape = 'rect', onCancel, onSkip, onSave }) {
  // NOTE: don't revoke this on unmount — React 18 StrictMode double-invokes
  // effects in dev (mount → cleanup → mount again), which would revoke the
  // blob right after creating it and leave the cropper showing a blank
  // image. It's a short-lived modal blob; letting it get GC'd is fine.
  const [imageUrl] = useState(() => URL.createObjectURL(file));
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspectId, setAspectId] = useState(defaultAspect);
  const [naturalAspect, setNaturalAspect] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onCancel(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const handleMediaLoaded = useCallback((mediaSize) => {
    setNaturalAspect(mediaSize.naturalWidth / mediaSize.naturalHeight);
  }, []);

  const handleCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const currentAspect = aspectId === 'free'
    ? undefined
    : aspectId === 'original'
      ? (naturalAspect ?? undefined)
      : ASPECT_VALUES[aspectId];

  async function handleSave() {
    if (!croppedAreaPixels) { onSkip(); return; }
    setSaving(true);
    try {
      const croppedFile = await getCroppedImageFile(imageUrl, croppedAreaPixels, file.name, file.type || 'image/jpeg');
      onSave(croppedFile);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="imgcrop-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="imgcrop-modal" role="dialog" aria-modal="true">
        <div className="imgcrop-header">
          <h3 className="imgcrop-title">Crop photo{total > 1 ? ` (${index + 1} of ${total})` : ''}</h3>
          <button className="imgcrop-close-btn" onClick={onCancel} aria-label="Cancel">✕</button>
        </div>

        <div className="imgcrop-stage">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={currentAspect || 1}
            cropShape={cropShape}
            objectFit="contain"
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
            onMediaLoaded={handleMediaLoaded}
          />
        </div>

        <div className="imgcrop-controls">
          <div className="imgcrop-aspects">
            {ASPECT_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`imgcrop-aspect-btn${aspectId === p.id ? ' imgcrop-aspect-btn--active' : ''}`}
                onClick={() => setAspectId(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="imgcrop-zoom-row">
            <ZoomOutIcon />
            <input
              type="range"
              className="imgcrop-zoom-slider"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              aria-label="Zoom"
            />
            <ZoomInIcon />
          </div>
        </div>

        <div className="imgcrop-footer">
          <button className="imgcrop-skip-btn" type="button" onClick={onSkip}>Use original</button>
          <button className="imgcrop-save-btn" type="button" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save crop'}
          </button>
        </div>
      </div>
    </div>
  );
}
