// Downloads one Wikimedia Commons photo for a place and prints the `image`
// entry (credit, licence, file page) to paste into data/places.json.
//
//   node scripts/fetch-commons-image.mjs <placeId> "File:Some title.jpg" "Alt text"
//
// Only freely licensed files are accepted (CC BY, CC BY-SA, CC0, public domain).
import { mkdirSync, writeFileSync } from "node:fs";

const [placeId, title, alt] = process.argv.slice(2);
if (!placeId || !title || !alt) {
  console.error('Usage: fetch-commons-image.mjs <placeId> "File:Title.jpg" "Alt text"');
  process.exit(1);
}

const UA = "OutbackSafeSchoolProject/1.0 (school project, non-commercial)";
const api =
  "https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo" +
  "&iiprop=url|extmetadata&iiurlwidth=900&titles=" +
  encodeURIComponent(title);

// Wikimedia rate-limits bursts, so retry politely with growing pauses.
async function politeFetch(url, parse) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.ok) {
      try {
        return await parse(res);
      } catch {
        // Rate-limit pages come back as plain text instead of JSON.
      }
    }
    await new Promise((r) => setTimeout(r, attempt * 10_000));
  }
  console.error("Giving up on", url);
  process.exit(1);
}

const data = await politeFetch(api, (r) => r.json());
const page = Object.values(data.query.pages)[0];
const info = page?.imageinfo?.[0];
if (!info) {
  console.error("File not found:", title);
  process.exit(1);
}

const meta = info.extmetadata;
const licence = meta.LicenseShortName?.value ?? "";
if (!/^(CC BY|CC0|Public domain|PD)/i.test(licence)) {
  console.error("Licence not accepted:", licence);
  process.exit(1);
}
const credit = (meta.Artist?.value ?? "Unknown author")
  .replace(/<[^>]+>/g, "")
  .replace(/\s+/g, " ")
  .trim();

const bytes = await politeFetch(info.thumburl, async (r) => Buffer.from(await r.arrayBuffer()));
mkdirSync("public/places", { recursive: true });
writeFileSync(`public/places/${placeId}.jpg`, bytes);

console.log(
  JSON.stringify(
    {
      src: `/places/${placeId}.jpg`,
      alt,
      credit: `${credit} / Wikimedia Commons`,
      licence,
      url: info.descriptionurl,
    },
    null,
    2,
  ),
);
