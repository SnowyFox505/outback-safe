// Builds one overview image of the place photos so they can be checked at a glance.
//   node scripts/contact-sheet.mjs <out.jpg> [id id ...]
import { readdirSync } from "node:fs";
import sharp from "sharp";

const [out, ...ids] = process.argv.slice(2);
const files = readdirSync("public/places")
  .filter((f) => f.endsWith(".jpg"))
  .filter((f) => ids.length === 0 || ids.includes(f.replace(".jpg", "")));

const W = 300;
const H = 200;
const cols = 4;
const rows = Math.ceil(files.length / cols);
const composites = [];
for (let i = 0; i < files.length; i++) {
  const tile = await sharp(`public/places/${files[i]}`).resize(W, H, { fit: "cover" }).toBuffer();
  const label = Buffer.from(
    `<svg width="${W}" height="22"><rect width="${W}" height="22" fill="#000" fill-opacity="0.7"/><text x="6" y="16" font-size="13" fill="#fff" font-family="sans-serif">${files[i].replace(".jpg", "")}</text></svg>`,
  );
  const x = (i % cols) * (W + 4);
  const y = Math.floor(i / cols) * (H + 4);
  composites.push({ input: tile, left: x, top: y }, { input: label, left: x, top: y + H - 22 });
}
await sharp({
  create: { width: cols * (W + 4), height: rows * (H + 4), channels: 3, background: "#111" },
})
  .composite(composites)
  .jpeg({ quality: 80 })
  .toFile(out);
console.log("wrote", out, files.length);
