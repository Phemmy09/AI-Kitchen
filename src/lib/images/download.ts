/**
 * Downloads a cross-origin image by fetching it as a blob and triggering a download on a local object URL.
 */
export async function triggerImageDownload(url: string, filename: string): Promise<void> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    
    const contentType = res.headers.get("Content-Type") || "";
    let ext = "png"; // default fallback
    if (contentType.includes("jpeg") || contentType.includes("jpg")) {
      ext = "jpg";
    } else if (contentType.includes("webp")) {
      ext = "webp";
    } else if (contentType.includes("png")) {
      ext = "png";
    }

    // Strip any existing extension and append the correct one
    const baseName = filename.replace(/\.[a-zA-Z0-9]+$/, "");
    const finalFilename = `${baseName}.${ext}`;

    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = finalFilename;
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
