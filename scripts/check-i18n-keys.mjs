import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function getByPath(obj, dotted) {
  const parts = dotted.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur === undefined || cur === null) return undefined;
    cur = cur[p];
  }
  return cur;
}

function walkDir(dir, ext, files = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) {
      if (name.name === "node_modules" || name.name === ".nuxt" || name.name === ".output") continue;
      walkDir(full, ext, files);
    } else if (name.isFile() && ext.some((e) => full.endsWith(e))) files.push(full);
  }
  return files;
}

const de = JSON.parse(fs.readFileSync(path.join(root, "locales/de.json"), "utf8"));
const en = JSON.parse(fs.readFileSync(path.join(root, "locales/en.json"), "utf8"));
const fr = JSON.parse(fs.readFileSync(path.join(root, "locales/fr.json"), "utf8"));
const it = JSON.parse(fs.readFileSync(path.join(root, "locales/it.json"), "utf8"));

const localeFiles = { de, en, fr, it };

const files = walkDir(path.join(root, "app"), [".vue", ".ts", ".js"]);

/** Static keys from t("...") tm("...") $t('...') — keine Template-Interpolation */
const re = /\b(?:t|tm)\(\s*["']([^"'`]+)["']\s*\)|\$t\(\s*["']([^"'`]+)["']\s*\)/g;

const used = new Set();
for (const file of files) {
  const s = fs.readFileSync(file, "utf8");
  let m;
  while ((m = re.exec(s)) !== null) {
    const key = m[1] || m[2];
    if (key) used.add(key);
  }
}

const missingByLocale = Object.fromEntries(Object.keys(localeFiles).map((code) => [code, []]));

for (const key of [...used].sort()) {
  for (const [code, data] of Object.entries(localeFiles)) {
    if (getByPath(data, key) === undefined) {
      missingByLocale[code].push(key);
    }
  }
}

console.log("Static i18n keys used in app/ (t/tm/$t with string literal):", used.size);
for (const [code, missing] of Object.entries(missingByLocale)) {
  if (missing.length) {
    console.log(`\nMissing in locales/${code}.json:`);
    missing.forEach((k) => console.log(" ", k));
  } else {
    console.log(`\nAll used keys exist in ${code}.json.`);
  }
}

/** Bekannte dynamische Muster manuell prüfen */
const dynamicChecks = [
  "services.items.essential.kicker",
  "services.items.essential.title",
  "services.items.essential.duration",
  "services.items.essential.copy",
  "services.items.essential.price",
  "services.items.signature.kicker",
  "services.items.signature.title",
  "services.items.signature.duration",
  "services.items.signature.copy",
  "services.items.signature.price",
  "services.items.color.kicker",
  "services.items.color.title",
  "services.items.color.duration",
  "services.items.color.copy",
  "services.items.color.price",
  "services.items.consultation.kicker",
  "services.items.consultation.title",
  "services.items.consultation.duration",
  "services.items.consultation.copy",
  "services.items.consultation.price",
  "gallery.alt1",
  "gallery.alt2",
  "gallery.alt3",
  "gallery.alt4",
];

console.log("\nDynamic key paths (sample) — all locales:");
let dynMissing = false;
for (const key of dynamicChecks) {
  for (const [code, data] of Object.entries(localeFiles)) {
    if (getByPath(data, key) === undefined) {
      console.log(` MISSING (${code}):`, key);
      dynMissing = true;
    }
  }
}
if (!dynMissing) console.log(" OK (all sample paths exist).");
