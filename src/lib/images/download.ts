/**
 * Downloads a cross-origin image by fetching it as a blob and triggering a download on a local object URL.
 */
export async function triggerImageDownload(url: string, filename: string): Promise<void> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    
    const originalBlob = await res.blob();
    
    // Convert the image to a true JPEG using a Canvas to guarantee format consistency
    const bitmap = await createImageBitmap(originalBlob);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get 2D canvas context");
    
    // Draw white background first to handle any transparency from PNGs gracefully
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0);
    
    // Export as JPEG at maximum quality
    canvas.toBlob((jpegBlob) => {
      if (!jpegBlob) {
        throw new Error("Canvas compilation to JPEG failed");
      }
      
      const blobUrl = URL.createObjectURL(jpegBlob);
      const a = document.createElement("a");
      a.href = blobUrl;
      
      // Force filename to have .jpg extension
      const baseName = filename.replace(/\.[a-zA-Z0-9]+$/, "");
      a.download = `${baseName}.jpg`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    }, "image/jpeg", 1.0);

  } catch (err) {
    console.error("Failed to download image via blob:", err);
    // Fallback: open the image in a new tab
    window.open(url, "_blank");
  }
}
