import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv/dist/2020.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const families = ["debian", "redhat", "suse", "arch", "alpine"];

const distros = yaml.load(fs.readFileSync(path.join(root, "catalog/distros.yaml"), "utf8"));
const themeFile = yaml.load(fs.readFileSync(path.join(root, "catalog/themes.yaml"), "utf8"));
const schema = JSON.parse(fs.readFileSync(path.join(root, "catalog/schema.json"), "utf8"));
const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

const notesByTag = new Map(
  (distros.implementation_notes ?? []).map((note) => [note.tag, note.text.trim()]),
);

function packageFor(pkg, family) {
  if (!pkg) return undefined;
  if (typeof pkg === "string") return pkg;
  return pkg[family];
}

function cleanExample(example) {
  return {
    title: example.title.trim(),
    command: example.command.trim(),
    comment: example.comment.trim(),
    ...(example.families ? { families: example.families } : {}),
  };
}

function expand(raw) {
  let availability;
  if (raw.availability) {
    availability = structuredClone(raw.availability);
  } else {
    availability = {};
    for (const id of families) {
      const slot = { status: raw.status };
      const pkg = packageFor(raw.package, id);
      if (pkg) slot.package = pkg;
      availability[id] = slot;
    }
  }
  for (const [id, over] of Object.entries(raw.overrides ?? {})) {
    availability[id] = { ...availability[id], ...over };
    if (!availability[id].package) delete availability[id].package;
  }
  const command = {
    name: raw.name,
    themes: raw.themes,
    summary: raw.summary.trim(),
    explanation: raw.explanation.trim(),
    examples: raw.examples.map(cleanExample),
    availability,
  };
  if (raw.subcommands?.length) {
    command.subcommands = raw.subcommands.map((sub) => ({
      name: sub.name.trim(),
      ...(sub.label ? { label: sub.label.trim() } : {}),
      summary: sub.summary.trim(),
      explanation: sub.explanation.trim(),
      examples: sub.examples.map(cleanExample),
      ...(sub.pitfalls?.length ? { pitfalls: sub.pitfalls.map((item) => item.trim()) } : {}),
    }));
  }
  if (raw.tags?.length) command.tags = raw.tags;
  if (raw.pitfalls?.length) command.pitfalls = raw.pitfalls.map((item) => item.trim());
  if (raw.see_also?.length) command.see_also = raw.see_also;
  if (raw.replaced_by) command.replaced_by = raw.replaced_by;
  if (raw.deprecated_options?.length) command.deprecated_options = raw.deprecated_options;
  const notes = (raw.tags ?? [])
    .map((tag) => notesByTag.get(tag))
    .filter(Boolean);
  if (notes.length) command.context_notes = notes;
  return command;
}

const dir = path.join(root, "catalog/commands");
const files = fs.readdirSync(dir).filter((name) => name.endsWith(".yaml")).sort();
if (files.length === 0) {
  console.error("Aucune fiche dans catalog/commands/");
  process.exit(1);
}

const errors = [];
const commands = [];
const seen = new Set();

for (const file of files) {
  const raw = yaml.load(fs.readFileSync(path.join(dir, file), "utf8"));
  if (!validate(raw)) {
    errors.push(`${file}: ${ajv.errorsText(validate.errors, { separator: "\n  " })}`);
    continue;
  }
  if (`${raw.name}.yaml` !== file) {
    errors.push(`${file}: le fichier doit s'appeler ${raw.name}.yaml`);
  }
  if (seen.has(raw.name)) errors.push(`${file}: nom en double ${raw.name}`);
  seen.add(raw.name);
  commands.push(expand(raw));
}

const byName = new Map(commands.map((command) => [command.name, command]));
for (const command of commands) {
  for (const other of command.see_also ?? []) {
    if (!byName.has(other)) errors.push(`${command.name}: voir aussi « ${other} » introuvable`);
  }
  if (command.replaced_by && !byName.has(command.replaced_by)) {
    errors.push(`${command.name}: remplaçant « ${command.replaced_by} » introuvable`);
  }
  for (const id of families) {
    const slot = command.availability[id];
    if (!slot?.status) errors.push(`${command.name}: statut manquant pour ${id}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

commands.sort((a, b) => a.name.localeCompare(b.name, "fr"));

const catalog = {
  title: distros.title,
  updated: distros.updated,
  preface: distros.preface.trim(),
  statuses: distros.statuses,
  families: distros.families,
  themes: themeFile.themes,
  commands,
};

const outDir = path.join(root, "web/public");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "catalog.json"), JSON.stringify(catalog));
const enSource = path.join(root, "catalog/i18n/en.json");
if (fs.existsSync(enSource)) {
  fs.mkdirSync(path.join(outDir, "i18n"), { recursive: true });
  fs.copyFileSync(enSource, path.join(outDir, "i18n/en.json"));
}

const deprecated = commands.filter((command) => {
  const retired = Object.values(command.availability).some((slot) =>
    slot.status === "obsolète" || slot.status === "retirée",
  );
  return retired || (command.deprecated_options?.length ?? 0) > 0;
});

console.log(
  `${commands.length} fiches, ${deprecated.length} dans le registre d’obsolescence.`,
);
