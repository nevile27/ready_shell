import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { fiches as shell } from "./data/shell.mjs";
import { fiches as fichiers } from "./data/fichiers.mjs";
import { fiches as texte } from "./data/texte.mjs";
import { fiches as processus } from "./data/processus.mjs";
import { fiches as utilisateurs } from "./data/utilisateurs.mjs";
import { fiches as disques } from "./data/disques.mjs";
import { fiches as reseau } from "./data/reseau.mjs";
import { fiches as services } from "./data/services.mjs";
import { fiches as paquets } from "./data/paquets.mjs";
import { fiches as archives } from "./data/archives.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "catalog/commands");
fs.mkdirSync(out, { recursive: true });

const order = ["name", "themes", "tags", "summary", "explanation", "pitfalls", "see_also", "replaced_by", "deprecated_options", "status", "package", "overrides", "examples"];
const all = [shell, fichiers, texte, processus, utilisateurs, disques, reseau, services, paquets, archives].flat();
const seen = new Set();

for (const fiche of all) {
  if (seen.has(fiche.name)) {
    console.error(`Doublon : ${fiche.name}`);
    process.exit(1);
  }
  seen.add(fiche.name);
  if (!fiche.status && !fiche.availability) fiche.status = "courante";
  const ordered = {};
  for (const key of order) {
    if (fiche[key] !== undefined && fiche[key] !== null) ordered[key] = fiche[key];
  }
  const file = path.join(out, `${fiche.name}.yaml`);
  fs.writeFileSync(file, yaml.dump(ordered, { lineWidth: 88, noRefs: true, quotingType: '"' }));
}

console.log(`${all.length} fiches écrites dans catalog/commands/`);
