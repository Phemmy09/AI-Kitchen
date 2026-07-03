import sharp from "sharp";

// Composites a subtle "Created with RatedWorktops" wordmark + logo mark onto
// the bottom-right of a render, per the brand requirement that every shared
// or downloaded image carries attribution. Drawn as SVG so it doesn't depend
// on a logo image file being supplied - swap in a real logo raster/SVG here
// once the client provides brand assets.
export async function applyWatermark(imageBuffer: Buffer): Promise<Buffer> {
  const image = sharp(imageBuffer);
  const { width = 1200, height = 900 } = await image.metadata();

  const barHeight = Math.round(height * 0.07);
  const fontSize = Math.max(14, Math.round(barHeight * 0.4));
  const badgeSize = Math.round(barHeight * 0.62);

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="black" stop-opacity="0" />
          <stop offset="1" stop-color="black" stop-opacity="0.55" />
        </linearGradient>
      </defs>
      <rect x="0" y="${height - barHeight}" width="${width}" height="${barHeight}" fill="url(#fade)" />
      <rect x="${width - badgeSize - fontSize * 11.5}" y="${height - barHeight / 2 - badgeSize / 2}"
            width="${badgeSize}" height="${badgeSize}" rx="${badgeSize * 0.22}"
            fill="#caa15d" />
      <text x="${width - badgeSize - fontSize * 11.5 + badgeSize / 2}" y="${height - barHeight / 2 + fontSize * 0.35}"
            font-family="Georgia, serif" font-weight="700" font-size="${badgeSize * 0.55}"
            fill="#0a0a0d" text-anchor="middle">R</text>
      <text x="${width - badgeSize - fontSize * 11.5 + badgeSize + fontSize * 0.6}" y="${height - barHeight / 2 + fontSize * 0.35}"
            font-family="Georgia, serif" font-size="${fontSize}" fill="#ffffff" opacity="0.9">
        Created with RatedWorktops
      </text>
    </svg>
  `;

  return image
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .jpeg({ quality: 92 })
    .toBuffer();
}
