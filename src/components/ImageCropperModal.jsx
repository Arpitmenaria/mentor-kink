import { useRef, useState } from 'react';
import './ImageCropperModal.css';

function CloseIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

const FRAME_WIDTH = 480;

/**
 * Lightweight pan/zoom image cropper — no external dependency.
 * aspect = width / height of the crop frame (e.g. 2 for a 2:1 cover image, 1 for a square avatar).
 */
export default function ImageCropperModal({ src, aspect = 2, onSave, onCancel }) {
  const frameHeight = FRAME_WIDTH / aspect;

  const [naturalSize, setNaturalSize] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);
  const imgRef = useRef(null);

  const handleImgLoad = (e) => {
    setNaturalSize({ w: e.target.naturalWidth, h: e.target.naturalHeight });
    setOffset({ x: 0, y: 0 });
    setZoom(1);
  };

  const baseScale = naturalSize ? Math.max(FRAME_WIDTH / naturalSize.w, frameHeight / naturalSize.h) : 1;
  const effectiveScale = baseScale * zoom;
  const dispW = naturalSize ? naturalSize.w * effectiveScale : 0;
  const dispH = naturalSize ? naturalSize.h * effectiveScale : 0;

  const clampOffset = (x, y) => {
    const maxX = Math.max(0, (dispW - FRAME_WIDTH) / 2);
    const maxY = Math.max(0, (dispH - frameHeight) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y)),
    };
  };

  const handlePointerDown = (e) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, origin: offset };
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setOffset(clampOffset(dragRef.current.origin.x + dx, dragRef.current.origin.y + dy));
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const handleZoomChange = (e) => {
    const newZoom = Number(e.target.value);
    setZoom(newZoom);
    setOffset((prev) => clampOffset(prev.x, prev.y));
  };

  const handleSave = () => {
    if (!naturalSize) return;
    const outputW = 960;
    const outputH = Math.round(outputW / aspect);

    const imgLeft = FRAME_WIDTH / 2 - dispW / 2 + offset.x;
    const imgTop = frameHeight / 2 - dispH / 2 + offset.y;

    const sx = (0 - imgLeft) / effectiveScale;
    const sy = (0 - imgTop) / effectiveScale;
    const sw = FRAME_WIDTH / effectiveScale;
    const sh = frameHeight / effectiveScale;

    const canvas = document.createElement('canvas');
    canvas.width = outputW;
    canvas.height = outputH;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgRef.current, sx, sy, sw, sh, 0, 0, outputW, outputH);

    canvas.toBlob((blob) => {
      if (blob) onSave(blob);
    }, 'image/jpeg', 0.92);
  };

  return (
    <div className="icm-overlay" onClick={onCancel}>
      <div className="icm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="icm-header">
          <h3>Adjust Image</h3>
          <button type="button" className="icm-close" onClick={onCancel} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <div
          className="icm-frame"
          style={{ width: FRAME_WIDTH, height: frameHeight }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <img
            ref={imgRef}
            src={src}
            alt="Crop preview"
            onLoad={handleImgLoad}
            draggable={false}
            style={{
              width: dispW || 'auto',
              height: dispH || 'auto',
              transform: `translate(${offset.x}px, ${offset.y}px)`,
            }}
          />
        </div>

        <div className="icm-zoom-row">
          <span>Zoom</span>
          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={zoom}
            onChange={handleZoomChange}
          />
        </div>

        <div className="icm-actions">
          <button type="button" className="icm-btn-secondary" onClick={onCancel}>Cancel</button>
          <button type="button" className="icm-btn-primary" onClick={handleSave} disabled={!naturalSize}>Save</button>
        </div>
      </div>
    </div>
  );
}
