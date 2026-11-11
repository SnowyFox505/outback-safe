// Generates the PWA icons from one SVG. Run with: node scripts/generate-icons.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const contours = Array.from({ length: 6 }, (_, i) => {
  const y = 70 + i * 74;
  return `<path d="M0 ${y} C 110 ${y - 34}, 190 ${y + 40}, 300 ${y - 6} S 450 ${y - 30}, 512 ${y + 10}" fill="none" stroke="#ede6da" stroke-opacity="0.07" stroke-width="3"/>`;
}).join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0d0c0b"/>
  ${contours}
  <path d="M118 392 C 170 250, 262 336, 392 146" fill="none" stroke="#d9a441"
        stroke-width="15" stroke-linecap="round" stroke-dasharray="0.1 31"/>
  <circle cx="118" cy="392" r="17" fill="#d9a441"/>
  <circle cx="392" cy="146" r="36" fill="#0d0c0b" stroke="#d9a441" stroke-width="11"/>
  <circle cx="392" cy="146" r="11" fill="#d9a441"/>
</svg>`;

mkdirSync("public/icons", { recursive: true });
writeFileSync("public/icons/icon.svg", svg);

const targets = [
  ["public/icons/icon-192.png", 192],
  ["public/icons/icon-512.png", 512],
  // The art already keeps to the central 80%, so it works as a maskable icon.
  ["public/icons/icon-maskable-512.png", 512],
  ["public/icons/apple-touch-icon.png", 180],
  ["public/icons/favicon-32.png", 32],
];

for (const [file, size] of targets) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(file);
  console.log("wrote", file);
}
