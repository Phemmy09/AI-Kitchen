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
  const label = "Created with RatedWorktops";

  // Text width isn't known analytically in SVG without a real layout pass,
  // so estimate it from an average glyph width for this serif font/weight
  // and shrink the font until the whole watermark (badge + gap + text +
  // margins) fits within the image - this is what caused the label to run
  // off the right edge of square/narrow renders before.
  const AVG_CHAR_WIDTH_EM = 0.56;
  let fontSize = Math.max(12, Math.round(barHeight * 0.4));
  const rightMargin = () => fontSize * 0.8;
  const gap = () => fontSize * 0.6;
  const badgeSize = () => Math.round(fontSize * 1.55);
  const textWidth = () => label.length * fontSize * AVG_CHAR_WIDTH_EM;
  const totalWidth = () => badgeSize() + gap() + textWidth() + rightMargin() * 2;

  while (fontSize > 10 && totalWidth() > width * 0.7) {
    fontSize -= 1;
  }

  const badge = badgeSize();
  const textX = width - rightMargin();
  const badgeX = textX - textWidth() - gap() - badge;
  const centerY = height - barHeight / 2;

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="black" stop-opacity="0" />
          <stop offset="1" stop-color="black" stop-opacity="0.55" />
        </linearGradient>
      </defs>
      <rect x="0" y="${height - barHeight}" width="${width}" height="${barHeight}" fill="url(#fade)" />
      <rect x="${badgeX}" y="${centerY - badge / 2}"
            width="${badge}" height="${badge}" rx="${badge * 0.22}"
            fill="#caa15d" />
      <text x="${badgeX + badge / 2}" y="${centerY + fontSize * 0.35}"
            font-family="Georgia, serif" font-weight="700" font-size="${badge * 0.55}"
            fill="#0a0a0d" text-anchor="middle">R</text>
      <text x="${textX}" y="${centerY + fontSize * 0.35}"
            font-family="Georgia, serif" font-size="${fontSize}" fill="#ffffff" opacity="0.9"
            text-anchor="end">${label}</text>
    </svg>
  `;

  return image
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .jpeg({ quality: 92 })
    .toBuffer();
}
