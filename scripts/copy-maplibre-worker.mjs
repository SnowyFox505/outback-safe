// Copies the MapLibre worker files into /public so the bundler never has to
// resolve them. Runs after install so they always match the installed version.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";

mkdirSync("public", { recursive: true });
const dist = "node_modules/maplibre-gl/dist";
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  if (existsSync(`${dist}/${file}`)) copyFileSync(`${dist}/${file}`, `public/${file}`);
}
console.log("Copied MapLibre worker files to public/");
