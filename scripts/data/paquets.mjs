export const fiches = [
  {
    name: "apt",
    themes: ["paquets"],
    status: "absente",
    summary: "Installe, met à jour et cherche des paquets Debian et Ubuntu.",
    explanation: "apt update rafraîchit l’index, apt upgrade applique les mises à jour, apt install nom installe, apt remove nom retire le paquet en laissant les fichiers de configuration, apt purge les retire aussi. apt search et apt show remplacent l’usage courant d’apt-cache. apt est le frontal à taper. apt-get reste celui des scripts qui veulent une interface stable. apt-key n’existe plus sur Debian 13 ni sur Ubuntu 26.04.",
    overrides: {
      debian: { status: "spécifique", package: "apt", note: "apt-get reste disponible pour les scripts. apt-key est retiré." },
    },
    see_also: ["apt-get", "apt-cache", "apt-key", "dpkg"],
    examples: [
      { title: "Mettre à jour l’index puis les paquets", command: "sudo apt update && sudo apt upgrade", comment: "update ne met pas les paquets à jour à lui seul : il rafraîchit les listes.", families: ["debian"] },
      { title: "Installer", command: "sudo apt install curl", comment: "Résout les dépendances. -y répond oui, à réserver aux scripts sûrs.", families: ["debian"] },
    ],
  },
  {
    name: "apt-get",
    themes: ["paquets"],
    status: "absente",
    summary: "Interface stable d’apt, préférée dans les scripts.",
    explanation: "apt-get update, install, remove et purge font le même travail qu’apt, avec une sortie et des codes de retour pensés pour les scripts. apt-get dist-upgrade peut retirer des paquets pour résoudre les dépendances ; upgrade refuse ce cas. On ne mélange pas les deux outils dans un même script. Pour une recherche, apt-cache ou apt search. apt-get n’est pas déprécié.",
    overrides: {
      debian: { status: "spécifique", package: "apt", note: "À garder dans les scripts. Le terminal interactif peut utiliser apt." },
    },
    see_also: ["apt", "dpkg", "apt-cache"],
    examples: [
      { title: "Installation non interactive", command: "sudo apt-get update && sudo apt-get install -y curl", comment: "-y ne pose pas la question. Le script doit assumer l’installation.", families: ["debian"] },
      { title: "Nettoyer les paquets devenus inutiles", command: "sudo apt-get autoremove", comment: "Retire les dépendances qui ne sont plus tirées par personne." , families: ["debian"] },
    ],
  },
  {
    name: "apt-cache",
    themes: ["paquets"],
    status: "absente",
    summary: "Interroge l’index des paquets Debian sans rien installer.",
    explanation: "apt-cache search motif cherche dans les descriptions, show nom affiche la fiche, policy nom dit quelle version serait installée et depuis quel dépôt. apt search et apt show couvrent le même besoin au quotidien. apt-cache reste utile dans un script, et il n’est pas retiré. Il ne télécharge rien si l’index local est déjà à jour ; sinon lancez apt update.",
    overrides: {
      debian: { status: "spécifique", package: "apt" },
    },
    see_also: ["apt", "apt-get", "dpkg"],
    examples: [
      { title: "Fiche d’un paquet", command: "apt-cache show curl", comment: "Version, dépendances et description. Rien n’est installé.", families: ["debian"] },
      { title: "Version retenue", command: "apt-cache policy curl", comment: "Version candidate et dépôts qui la proposent.", families: ["debian"] },
    ],
  },
  {
    name: "apt-key",
    themes: ["paquets"],
    status: "retirée",
    summary: "Ajoutait une clé au trousseau global d’apt. Retiré de Debian 13 et d’Ubuntu 26.04.",
    explanation: "apt-key add déposait une clé dans un trousseau commun : n’importe quel dépôt pouvait être signé par n’importe quelle clé de ce trousseau. APT 3, celui de Debian 13 et d’Ubuntu 26.04, ne livre plus la commande. Une clé de dépôt tiers se place dans /etc/apt/keyrings, en fichier à part, et le dépôt la désigne avec Signed-By. /etc/apt/trusted.gpg n’est plus consulté. Ubuntu 24.04 avait encore apt-key, avec un avertissement ; ce n’est plus le cas de la LTS 26.04.",
    see_also: ["apt", "gpg", "dpkg"],
    overrides: {
      redhat: { status: "absente", note: "apt n’est pas le gestionnaire de cette famille." },
      suse: { status: "absente", note: "Les dépôts se signent avec rpm et zypper, pas avec apt-key." },
      arch: { status: "absente", note: "pacman a ses propres trousseaux dans /etc/pacman.d." },
      alpine: { status: "absente", note: "apk utilise ses propres clés, pas apt." },
    },
    examples: [
      { title: "Déposer une clé de dépôt", command: "sudo install -d -m 0755 /etc/apt/keyrings && curl -fsSL https://exemple.test/cle.gpg | sudo gpg --dearmor -o /etc/apt/keyrings/exemple.gpg", comment: "Le fichier ne sert qu’au dépôt qui le cite. Remplacez l’URL par celle du fournisseur, et vérifiez l’empreinte annoncée.", families: ["debian"] },
      { title: "Citer la clé dans le dépôt", command: "printf '%s\\n' 'Types: deb' 'URIs: https://exemple.test/debian' 'Suites: trixie' 'Components: main' 'Signed-By: /etc/apt/keyrings/exemple.gpg' | sudo tee /etc/apt/sources.list.d/exemple.sources", comment: "Format deb822. Un fichier .list avec signed-by= dans les options est l’autre forme acceptée.", families: ["debian"] },
    ],
  },
  {
    name: "dpkg",
    themes: ["paquets"],
    status: "absente",
    summary: "Installe un fichier .deb et interroge la base locale, sans résoudre les dépendances.",
    explanation: "dpkg -i paquet.deb installe ce fichier et échoue si une dépendance manque : apt install ./paquet.deb les résout. dpkg -l liste les paquets connus, dpkg -L nom les fichiers d’un paquet installé, dpkg -S /usr/bin/ls le paquet qui fournit un chemin. dpkg-query est le même fond pour les sélections. On ne met pas à jour le système avec dpkg. C’est l’outil de bas niveau sous apt.",
    overrides: {
      debian: { status: "spécifique", package: "dpkg" },
    },
    see_also: ["apt", "apt-get", "rpm"],
    examples: [
      { title: "Qui fournit un fichier", command: "dpkg -S /usr/bin/ls", comment: "Écrit le paquet, par exemple coreutils.", families: ["debian"] },
      { title: "Fichiers d’un paquet", command: "dpkg -L coreutils", comment: "Liste les chemins installés par coreutils. Le paquet doit être installé.", families: ["debian"] },
    ],
  },
  {
    name: "dnf",
    themes: ["paquets"],
    status: "absente",
    summary: "Installe et met à jour les paquets sur RHEL et Fedora.",
    explanation: "dnf upgrade met à jour, dnf install nom installe, dnf remove nom retire, dnf search motif cherche. dnf history liste les transactions et permet un retour arrière avec history undo. Le cache se rafraîchit tout seul au besoin ; dnf makecache le force. yum, sur ces versions, n’est plus qu’un renvoi vers dnf. rpm interroge la base sans résoudre les dépendances. SUSE utilise zypper, pas dnf.",
    overrides: {
      redhat: { status: "spécifique", package: "dnf", note: "RHEL 10 et Fedora 45. yum est une compatibilité." },
    },
    see_also: ["yum", "rpm", "zypper"],
    examples: [
      { title: "Mettre à jour", command: "sudo dnf upgrade", comment: "Propose les paquets à changer. -y évite la question dans un script.", families: ["redhat"] },
      { title: "Historique", command: "dnf history", comment: "Transactions passées, avec leur identifiant pour un undo.", families: ["redhat"] },
    ],
  },
  {
    name: "yum",
    themes: ["paquets"],
    status: "absente",
    replaced_by: "dnf",
    summary: "Ancien gestionnaire de Red Hat. Sur RHEL 10 et Fedora 45, c’est une compatibilité vers dnf.",
    explanation: "yum install nom fonctionne encore souvent parce que le paquet yum ou un lien appelle dnf. Les options ne sont pas toutes équivalentes, et la documentation actuelle montre dnf. Écrire yum dans un script neuf entretient un nom retiré du rôle principal depuis RHEL 8. SUSE n’utilise pas yum : c’est zypper. Debian, Arch et Alpine n’ont pas cette commande.",
    overrides: {
      redhat: { status: "obsolète", package: "dnf", note: "Le nom peut encore exister et déléguer à dnf. Les commandes neuves appellent dnf." },
    },
    see_also: ["dnf", "rpm"],
    examples: [
      { title: "Forme actuelle", command: "sudo dnf install curl", comment: "Remplace yum install curl.", families: ["redhat"] },
      { title: "Ancien nom", command: "yum --version", comment: "Peut afficher une version DNF, preuve que le nom n’est plus le programme d’origine.", families: ["redhat"] },
    ],
  },
  {
    name: "rpm",
    themes: ["paquets"],
    status: "absente",
    summary: "Interroge ou installe un fichier RPM, sans résoudre les dépendances.",
    explanation: "rpm -q nom dit si le paquet est installé, -ql liste ses fichiers, -qf /usr/bin/ls trouve qui fournit un chemin. rpm -ivh fichier.rpm installe ce fichier et s’arrête si une dépendance manque : dnf ou zypper doivent faire l’installation. rpm -V vérifie que les fichiers n’ont pas changé depuis l’installation. Red Hat et SUSE partagent cet outil de bas niveau. Ce n’est pas le gestionnaire du quotidien.",
    overrides: {
      redhat: { status: "spécifique", package: "rpm", note: "Les installations passent par dnf." },
      suse: { status: "spécifique", package: "rpm", note: "Les installations passent par zypper." },
    },
    see_also: ["dnf", "zypper", "dpkg"],
    examples: [
      { title: "Qui fournit un fichier", command: "rpm -qf /usr/bin/ls", comment: "Écrit le nom et la version du paquet.", families: ["redhat", "suse"] },
      { title: "Fichiers installés", command: "rpm -ql coreutils", comment: "Liste les chemins. Le paquet doit être installé.", families: ["redhat", "suse"] },
    ],
  },
  {
    name: "pacman",
    themes: ["paquets"],
    status: "absente",
    summary: "Installe et met à jour les paquets sur Arch Linux.",
    explanation: "pacman -Syu met à jour la base et le système, et c’est la forme à utiliser : un -Sy seul, sans -u, laisse des mélanges de versions. pacman -S nom installe, -Ss cherche, -Rns retire le paquet et ses dépendances devenues inutiles. -Q liste ce qui est installé, -Qo /usr/bin/ls dit qui fournit un fichier. Arch est une publication continue : on met à jour l’ensemble, pas un paquet isolé pendant des mois.",
    pitfalls: ["pacman -Sy sans mise à jour du système désynchronise les versions. La mise à jour complète est pacman -Syu."],
    overrides: {
      arch: { status: "spécifique", package: "pacman" },
    },
    see_also: ["apt", "dnf", "zypper"],
    examples: [
      { title: "Mettre le système à jour", command: "sudo pacman -Syu", comment: "Synchronise les dépôts et met à jour les paquets installés.", families: ["arch"] },
      { title: "Qui fournit un fichier", command: "pacman -Qo /usr/bin/ls", comment: "Paquet propriétaire du chemin, s’il est installé.", families: ["arch"] },
    ],
  },
  {
    name: "zypper",
    themes: ["paquets"],
    status: "absente",
    summary: "Installe et met à jour les paquets sur openSUSE et SLES.",
    explanation: "zypper refresh rafraîchit les dépôts, zypper update installe les mises à jour sans changer de version de distribution, zypper install nom installe, zypper search motif cherche. zypper remove retire. Les dépôts se listent avec zypper repos. rpm reste l’outil de bas niveau pour un fichier isolé. zypper dup est une migration de distribution, plus lourde qu’update, et ne se lance pas par habitude.",
    overrides: {
      suse: { status: "spécifique", package: "zypper" },
    },
    see_also: ["rpm", "dnf", "apt"],
    examples: [
      { title: "Mettre à jour", command: "sudo zypper refresh && sudo zypper update", comment: "refresh met les index à jour. update applique les correctifs de la même version de Leap ou de SLES.", families: ["suse"] },
      { title: "Chercher", command: "zypper search curl", comment: "Ne demande pas les droits d’administration. Rien n’est installé.", families: ["suse"] },
    ],
  },
  {
    name: "apk",
    themes: ["paquets"],
    status: "absente",
    summary: "Installe et met à jour les paquets sur Alpine.",
    explanation: "apk update rafraîchit l’index, apk upgrade met à jour, apk add nom installe, apk del nom retire. apk search motif cherche, apk info -L nom liste les fichiers d’un paquet. Les dépôts sont dans /etc/apk/repositories. Une image minimale n’a presque rien : la commande elle-même est le socle. apk n’est pas apt. Les scripts Docker commencent souvent par apk add --no-cache pour ne pas garder l’index dans l’image.",
    overrides: {
      alpine: { status: "spécifique", package: "apk-tools" },
    },
    see_also: ["apt", "dnf", "pacman"],
    examples: [
      { title: "Installer sans garder l’index", command: "apk add --no-cache curl", comment: "Met l’index à jour, installe, puis retire l’index. Habituel dans une image. doas ou root selon le contexte.", families: ["alpine"] },
      { title: "Fichiers d’un paquet", command: "apk info -L busybox", comment: "Liste les chemins fournis par busybox.", families: ["alpine"] },
    ],
  },
  {
    name: "gpg",
    themes: ["paquets"],
    package: { debian: "gpg", redhat: "gnupg2", suse: "gpg2", arch: "gnupg", alpine: "gnupg" },
    summary: "Chiffre, signe et vérifie. Ici, surtout pour déposer une clé de dépôt.",
    explanation: "gpg --dearmor transforme une clé ASCII en fichier binaire que apt, rpm ou pacman peuvent citer. gpg --show-keys fichier affiche l’empreinte à comparer avec celle publiée par l’éditeur. --import ajoute une clé à votre trousseau personnel, ce qui n’est pas la même chose que d’autoriser un dépôt. Cette fiche ne couvre pas le chiffrement de courrier : elle fixe le geste qui a remplacé apt-key add. Le nom du paquet varie : gpg, gnupg2 ou gnupg.",
    see_also: ["apt-key", "apt", "rpm"],
    examples: [
      { title: "Voir l’empreinte", command: "gpg --show-keys cle.asc", comment: "Affiche l’empreinte. Comparez-la à celle du site officiel avant d’en faire une clé de dépôt." },
      { title: "Format binaire pour apt", command: "gpg --dearmor < cle.asc > exemple.gpg", comment: "Produit le fichier à placer dans /etc/apt/keyrings. Voir apt-key pour la suite Debian." },
    ],
  },
];
