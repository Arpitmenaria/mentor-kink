function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', reject);
    image.crossOrigin = 'anonymous';
    image.src = url;
  });
}

// Renders the cropped region of `imageSrc` (an object URL) onto an offscreen
// canvas and hands back a File with the same name/type as the original, so
// it can drop straight into the existing upload FormData path.
export async function getCroppedImageFile(imageSrc, pixelCrop, fileName, mimeType = 'image/jpeg') {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height,
  );
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, mimeType, 0.92));
  return new File([blob], fileName, { type: mimeType });
}
