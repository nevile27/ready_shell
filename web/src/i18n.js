export const LANGS = [
  { id: "fr", label: "Français" },
  { id: "en", label: "English" },
];

const ui = {
  fr: {
    title: "Catalogue des commandes Linux",
    offline: "Hors ligne · novembre 2026",
    searchLabel: "Rechercher une commande, un mot ou un exemple",
    searchPlaceholder: "Rechercher : ip addr, systemctl status…",
    family: "Famille",
    status: "Statut",
    language: "Langue",
    allFamilies: "Toutes les familles",
    allStatuses: "Tous les statuts",
    themes: "Thèmes",
    commands: "Commandes",
    allBook: "Tout le livre",
    allBookSummary: "Les fiches rédigées, sans filtre de thème.",
    noMatch: "Aucune commande ne correspond à cette recherche.",
    howToRead: "Comment lire ce livre",
    pinnedVersions: "Versions figées",
    statusesTitle: "Statuts",
    dotsHint: "fiches. Les cinq points devant chaque nom suivent l’ordre Debian, Red Hat, SUSE, Arch, Alpine. La touche / place le curseur dans la recherche.",
    missing: "Cette fiche n’est pas dans le catalogue.",
    back: "Retour à la liste",
    replaceBy: "Remplacer par",
    subs: "Sous-commandes",
    noExample: "Aucun exemple pour la famille filtrée.",
    familiesLabel: "Familles :",
    availability: "Statut selon la famille",
    deprecatedOptions: "Options dépréciées",
    colOption: "Option",
    colSince: "Depuis",
    colInstead: "À la place",
    colWhy: "Pourquoi",
    colFamily: "Famille",
    colStatus: "Statut",
    colPackage: "Paquet",
    colNote: "Note",
    seeAlso: "Voir aussi",
    examples: "Exemples",
    copy: "Copier",
    copied: "Copié",
    selected: "Sélectionné",
    registry: "Registre",
    registryTitle: "Obsolescence",
    registryMeta: "fiches dans la sélection actuelle. Ouvrez-en une pour voir le statut par version et le remplaçant.",
    catalogMissing: "catalog.json introuvable",
    noscript: "Ce catalogue a besoin de JavaScript, entièrement local, pour la recherche et les filtres.",
  },
  en: {
    title: "Linux command catalogue",
    offline: "Offline · November 2026",
    searchLabel: "Search for a command, a word, or an example",
    searchPlaceholder: "Search: ip addr, systemctl status…",
    family: "Family",
    status: "Status",
    language: "Language",
    allFamilies: "All families",
    allStatuses: "All statuses",
    themes: "Topics",
    commands: "Commands",
    allBook: "Whole book",
    allBookSummary: "Every written entry, with no topic filter.",
    noMatch: "No command matches this search.",
    howToRead: "How to read this book",
    pinnedVersions: "Pinned versions",
    statusesTitle: "Statuses",
    dotsHint: "entries. The five dots before each name follow the order Debian, Red Hat, SUSE, Arch, Alpine. Press / to focus search.",
    missing: "This entry is not in the catalogue.",
    back: "Back to the list",
    replaceBy: "Replace with",
    subs: "Subcommands",
    noExample: "No example for the selected family.",
    familiesLabel: "Families:",
    availability: "Status by family",
    deprecatedOptions: "Deprecated options",
    colOption: "Option",
    colSince: "Since",
    colInstead: "Use instead",
    colWhy: "Why",
    colFamily: "Family",
    colStatus: "Status",
    colPackage: "Package",
    colNote: "Note",
    seeAlso: "See also",
    examples: "Examples",
    copy: "Copy",
    copied: "Copied",
    selected: "Selected",
    registry: "Register",
    registryTitle: "Obsolescence",
    registryMeta: "entries in the current selection. Open one to see the status on each version and the replacement.",
    catalogMissing: "catalog.json was not found",
    noscript: "This catalogue needs JavaScript, entirely local, for search and filters.",
  },
};

const statusText = {
  fr: {
    courante: "courante",
    obsolète: "obsolète",
    retirée: "retirée",
    spécifique: "spécifique",
    absente: "absente",
  },
  en: {
    courante: "current",
    obsolète: "deprecated",
    retirée: "removed",
    spécifique: "specific",
    absente: "absent",
  },
};

const statusHelp = {
  fr: null,
  en: {
    courante: "Still the right tool for this version. The package may not be installed by default; the entry says so.",
    obsolète: "Still shipped, or still runnable, but it should no longer be used. The entry names the replacement.",
    retirée: "Not in the current version. The entry says what to use instead.",
    spécifique: "Belongs to this family, or behaves differently from one family to another.",
    absente: "This family does not provide the command.",
  },
};

const themes = {
  fr: null,
  en: {
    shell: ["Shell and builtins", "bash, dash, ash, zsh, and the builtins used in scripts and at the prompt."],
    fichiers: ["Files and directories", "Copy, move, list, find, and inspect files."],
    texte: ["Text", "Filter, transform, compare, and join text."],
    processus: ["Processes and signals", "See what is running, and stop or limit it."],
    utilisateurs: ["Users and permissions", "Accounts, groups, passwords, and privilege elevation."],
    disques: ["Disks and filesystems", "Partitions, filesystems, mounting, space, and modules."],
    reseau: ["Network", "Interfaces, routes, sockets, names, transfers, and firewalls."],
    services: ["Services and logs", "systemd, OpenRC, scheduled tasks, and logs."],
    paquets: ["Packages", "apt, dnf, pacman, zypper, apk, and the low-level tools."],
    archives: ["Archives and compression", "tar, gzip, bzip2, xz, zstd, zip, and cpio."],
    obsolescence: ["Obsolescence register", "Computed view of deprecated or removed commands, and of commands that are still current but keep a deprecated option. Each line opens the entry and the replacement."],
    tous: ["Whole book", "Every written entry, with no topic filter."],
  },
};

const families = {
  en: {
    debian: "Debian 13.7 “Trixie” and Ubuntu 26.04 LTS “Resolute Raccoon”. /bin/sh is dash. The package manager is apt, and init is systemd. apt-key is gone (APT 3): a third-party key goes in /etc/apt/keyrings and is named with Signed-By. Ubuntu 26.10 is mentioned only when an entry differs.",
    redhat: "RHEL 10.2 and Fedora 45. /bin/sh is bash. Packages go through dnf; rpm queries the local database. yum is only a compatibility path to dnf. RHEL 9 is mentioned only when a command still exists there. The usual firewall is firewalld. Network time is chrony.",
    suse: "openSUSE Leap 16 and SLES 16. /bin/sh is bash. zypper drives packages, rpm queries the database. Init is systemd. The usual firewall on server installs is firewalld.",
    arch: "Rolling snapshot pinned for this catalogue at November 2026. /bin/sh is bash. pacman is the package manager. Init is systemd. Many core tools are in the base group; other entries name the package to install.",
    alpine: "Alpine 3.24, and the BusyBox subset of minimal images. /bin/sh is ash. Packages go through apk. Init is OpenRC: systemctl is not the system’s command. The usual privilege tool is doas. BusyBox applets cover everyday use and often omit GNU long options.",
  },
};

const preface = {
  en: `A local book of the core Linux commands, written to be read offline.
The entries cover the shell, files, text, processes, users, disks, the network, services, packages, and archives. The obsolescence register gathers what is deprecated or removed in the versions pinned below.

A command can be current on one family and absent from another. The status describes the family’s current version, not its history. Derivatives are not tracked one by one: Linux Mint, Pop!_OS, and Kali inherit from Debian or Ubuntu; AlmaLinux, Rocky Linux, and Oracle Linux inherit from Red Hat.

This first book does not list every binary shipped by every package (databases, Kubernetes, compilers, application suites). Those names can be added later, one entry at a time, without changing the format.`,
};

const notes = {
  en: {
    coreutils: `Debian 13 ships GNU coreutils. Ubuntu 26.04 gives most of these commands to rust-coreutils (uutils). cp, mv, and rm stay the GNU binaries. The coreutils-from-gnu package restores the GNU set. When uutils is the provider, the GNU binaries remain available with the gnu prefix, for example gnuls or gnucat.`,
    sudo: `Debian 13 provides classic sudo. On Ubuntu 26.04, the sudo command comes from sudo-rs. The original implementation is still available and is run as sudo.ws.`,
  },
};

export function uiText(lang, key) {
  return ui[lang]?.[key] ?? ui.fr[key] ?? key;
}

export function statusName(lang, id) {
  return statusText[lang]?.[id] ?? statusText.fr[id] ?? id;
}

export function statusDescription(lang, id, french) {
  if (lang === "en" && statusHelp.en[id]) return statusHelp.en[id];
  return french;
}

export function themeCopy(lang, id, frenchTitle, frenchSummary) {
  const row = themes[lang]?.[id];
  if (!row) return { title: frenchTitle, summary: frenchSummary };
  return { title: row[0], summary: row[1] };
}

export function familySummary(lang, id, french) {
  if (lang === "en" && families.en[id]) return families.en[id];
  return french;
}

export function prefaceOf(lang, french) {
  return lang === "en" ? preface.en : french;
}

export function noteOf(lang, tag, french) {
  if (lang === "en" && notes.en[tag]) return notes.en[tag];
  return french;
}

export function initialLang() {
  const saved = localStorage.getItem("ready-shell-lang");
  if (saved === "fr" || saved === "en") return saved;
  return navigator.language?.toLowerCase().startsWith("en") ? "en" : "fr";
}
