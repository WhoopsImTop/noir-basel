/**
 * Erzeugt PNG-Icons aus public/favicon.svg (iOS/PWA/OG brauchen Rastergrafiken).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const svg = readFileSync(join(publicDir, "favicon.svg"));

for (const size of [32, 180, 192, 512]) {
  const name =
    size === 32 ? "favicon.png" : size === 180 ? "apple-touch-icon.png" : `pwa-${size}.png`;
  await sharp(svg).resize(size, size).png().toFile(join(publicDir, name));
  console.log(`✓ ${name} (${size}×${size})`);
}

const maskableSize = 512;
const logoOnMaskable = Math.round(maskableSize * 0.82);
await sharp({
  create: {
    width: maskableSize,
    height: maskableSize,
    channels: 4,
    background: { r: 23, g: 23, b: 23, alpha: 1 },
  },
})
  .composite([
    {
      input: await sharp(svg).resize(logoOnMaskable, logoOnMaskable).png().toBuffer(),
      gravity: "center",
    },
  ])
  .png()
  .toFile(join(publicDir, "pwa-maskable-512.png"));
console.log("✓ pwa-maskable-512.png (512×512)");

const ogWidth = 1200;
const ogHeight = 630;
const logoBuffer = await sharp(svg).resize(280, 280).png().toBuffer();
await sharp({
  create: {
    width: ogWidth,
    height: ogHeight,
    channels: 4,
    background: { r: 23, g: 23, b: 23, alpha: 1 },
  },
})
  .composite([{ input: logoBuffer, gravity: "center" }])
  .png()
  .toFile(join(publicDir, "og-image.png"));
console.log("✓ og-image.png (1200×630)");
