import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { patches as base } from "./data/subs.mjs";
import { patches as shell } from "./data/subs-shell.mjs";
import { patches as fichiers } from "./data/subs-fichiers.mjs";
import { patches as texte } from "./data/subs-texte.mjs";
import { patches as proc } from "./data/subs-proc.mjs";
import { patches as disk } from "./data/subs-disk.mjs";
import { patches as reste } from "./data/subs-reste.mjs";

const patches = { ...base, ...shell, ...fichiers, ...texte, ...proc, ...disk, ...reste };

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const order = [
  "name", "themes", "tags", "summary", "explanation", "pitfalls", "subcommands",
  "see_also", "replaced_by", "deprecated_options", "examples", "status", "package",
  "overrides", "availability",
];

for (const [name, extra] of Object.entries(patches)) {
  const file = path.join(root, "catalog/commands", `${name}.yaml`);
  if (!fs.existsSync(file)) {
    console.error(`Fiche manquante : ${name}`);
    process.exit(1);
  }
  const raw = yaml.load(fs.readFileSync(file, "utf8"));
  if (extra.summary) raw.summary = extra.summary;
  if (extra.explanation) raw.explanation = extra.explanation;
  raw.subcommands = extra.subcommands;
  const ordered = {};
  for (const key of order) {
    if (raw[key] !== undefined && raw[key] !== null) ordered[key] = raw[key];
  }
  for (const key of Object.keys(raw)) {
    if (ordered[key] === undefined) ordered[key] = raw[key];
  }
  fs.writeFileSync(file, yaml.dump(ordered, { lineWidth: 88, noRefs: true, quotingType: '"' }));
  console.log(`${name}: ${extra.subcommands.length} sous-commandes`);
}
