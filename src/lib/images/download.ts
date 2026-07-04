/**
 * Downloads a cross-origin image by fetching it as a blob and triggering a download on a local object URL.
 */
export async function triggerImageDownload(url: string, filename: string): Promise<void> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error("Failed to download image via blob:", err);
    // Fallback: open the image in a new tab
    window.open(url, "_blank");
  }
}
