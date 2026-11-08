const core = {
  package: { debian: "coreutils", redhat: "coreutils", suse: "coreutils", arch: "coreutils", alpine: "busybox" },
  tags: ["coreutils"],
  overrides: {
    alpine: { note: "Applet BusyBox. Le paquet coreutils apporte les options GNU." },
  },
};

export const fiches = [
  {
    name: "grep",
    themes: ["texte"],
    package: { debian: "grep", redhat: "grep", suse: "grep", arch: "grep", alpine: "busybox" },
    overrides: {
      alpine: { note: "Applet BusyBox. Le paquet grep apporte la version GNU, y compris -P si elle est compilée." },
    },
    summary: "Affiche les lignes qui correspondent à un motif.",
    explanation: "grep motif fichier écrit les lignes qui contiennent le motif. Sans fichier, grep lit l’entrée standard. -n ajoute le numéro de ligne, -i ignore la casse, -v inverse la sélection, -R parcourt un répertoire. -F cherche une chaîne fixe, -E une expression rationnelle étendue. Depuis GNU grep 3.8, les commandes egrep et fgrep ne sont plus que des rappels obsolètes de ces deux options. -w limite aux mots entiers, -l ne garde que les noms de fichiers.",
    see_also: ["egrep", "fgrep", "sed", "find"],
    examples: [
      { title: "Lignes qui contiennent un mot", command: "grep -n root /etc/passwd", comment: "Affiche chaque ligne de passwd qui contient root, avec son numéro." },
      { title: "Expression étendue", command: "grep -E '^(root|daemon):' /etc/passwd", comment: "Le | et les parenthèses sont actifs grâce à -E. C’est le remplaçant d’egrep." },
    ],
  },
  {
    name: "egrep",
    themes: ["texte"],
    status: "obsolète",
    package: { debian: "grep", redhat: "grep", suse: "grep", arch: "grep", alpine: "grep" },
    replaced_by: "grep",
    summary: "Ancien nom de grep -E. GNU grep le signale comme obsolète depuis la version 3.8.",
    explanation: "egrep motif fichier fait la même chose que grep -E. Depuis GNU grep 3.8, la commande écrit un avertissement « obsolescent » sur l’erreur, ce qui pollue les courriels de cron et les journaux. Les versions actuelles des familles GNU livrent encore le nom pour ne pas casser les vieux scripts, et il faut le remplacer. BusyBox n’a en général pas de commande egrep séparée : installez le paquet grep ou écrivez grep -E.",
    overrides: {
      alpine: { note: "Pas dans BusyBox. Le paquet grep peut encore fournir le nom, avec le même avertissement GNU." },
    },
    see_also: ["grep", "fgrep"],
    examples: [
      { title: "Forme actuelle", command: "grep -E 'error|fail' journal.txt", comment: "Expression rationnelle étendue, sans avertissement." },
      { title: "Ancienne forme", command: "egrep 'error|fail' journal.txt", comment: "Fonctionne encore sur GNU grep et écrit un avertissement sur la sortie d’erreur." },
    ],
  },
  {
    name: "fgrep",
    themes: ["texte"],
    status: "obsolète",
    package: { debian: "grep", redhat: "grep", suse: "grep", arch: "grep", alpine: "grep" },
    replaced_by: "grep",
    summary: "Ancien nom de grep -F. GNU grep le signale comme obsolète depuis la version 3.8.",
    explanation: "fgrep cherche une chaîne fixe, pas une expression rationnelle. C’est grep -F. Le nom est obsolète depuis GNU grep 3.8 et produit un avertissement. -F est le bon choix quand le motif vient d’une donnée et peut contenir des points ou des crochets : ils restent des caractères ordinaires.",
    overrides: {
      alpine: { note: "Pas dans BusyBox. Le paquet grep GNU peut fournir le nom, avec avertissement." },
    },
    see_also: ["grep", "egrep"],
    examples: [
      { title: "Chaîne fixe", command: "grep -F '[ERROR]' application.log", comment: "Les crochets ne forment pas une classe de caractères. Ils sont cherchés tels quels." },
      { title: "Ancienne forme", command: "fgrep '[ERROR]' application.log", comment: "Même recherche, plus un avertissement « obsolescent » sur GNU grep." },
    ],
  },
  {
    name: "sed",
    themes: ["texte"],
    package: { debian: "sed", redhat: "sed", suse: "sed", arch: "sed", alpine: "busybox" },
    overrides: {
      alpine: { note: "Applet BusyBox. Le paquet sed apporte la version GNU." },
    },
    summary: "Transforme un flux de texte ligne à ligne.",
    explanation: "sed lit chaque ligne, y applique un script, et écrit le résultat. s/ancien/nouveau/ remplace la première occurrence, s/ancien/nouveau/g les remplace toutes. -n coupe la sortie automatique, et p ne garde que les lignes demandées. -i modifie le fichier en place : sur GNU sed, -i.bak sauve une copie, et la syntaxe -i '' de BSD n’est pas celle de GNU. Une expression avec des slashs se délimite autrement : s|/var|/srv|.",
    pitfalls: ["sed -i sans copie de secours réécrit le fichier tout de suite. Sur un fichier précieux, gardez -i.bak ou travaillez sur une copie."],
    see_also: ["awk", "grep", "tr"],
    examples: [
      { title: "Remplacer sur la sortie", command: "sed 's/root/administrateur/' /etc/passwd", comment: "Écrit passwd en changeant la première occurrence de root sur chaque ligne. Le fichier d’origine n’est pas modifié." },
      { title: "Garder un intervalle", command: "sed -n '1,5p' /etc/passwd", comment: "N’écrit que les lignes 1 à 5." },
    ],
  },
  {
    name: "awk",
    themes: ["texte"],
    package: { debian: "mawk", redhat: "gawk", suse: "gawk", arch: "gawk", alpine: "busybox" },
    summary: "Découpe des lignes en champs et calcule dessus.",
    explanation: "awk lit des lignes, les coupe selon FS (espaces et tabulations par défaut) et exécute un programme. $1 est le premier champ, $0 la ligne entière. NR est le numéro de ligne. Un motif avant l’accolade sélectionne les lignes. Sur Debian et Ubuntu, la commande awk pointe vers mawk, plus petit que gawk. Les extensions GNU (gensub, IGNORECASE, certains tableaux) demandent le paquet gawk. Alpine fournit un awk BusyBox ; gawk s’installe à part.",
    overrides: {
      debian: { note: "awk est mawk par défaut. Installez gawk pour les scripts qui exigent les extensions GNU." },
      alpine: { note: "Applet BusyBox. Le paquet gawk apporte les extensions GNU." },
    },
    see_also: ["sed", "cut", "sort"],
    examples: [
      { title: "Premier et troisième champ", command: "awk -F: '{ print $1, $3 }' /etc/passwd", comment: "Le séparateur est le deux-points. Affiche le nom du compte et son UID." },
      { title: "Filtrer puis afficher", command: "awk -F: '$3 >= 1000 { print $1 }' /etc/passwd", comment: "Ne garde que les comptes dont l’UID est au moins 1000." },
    ],
  },
  {
    name: "cut",
    themes: ["texte"],
    ...core,
    summary: "Extrait des champs ou des colonnes de caractères.",
    explanation: "cut -d: -f1 prend le premier champ séparé par un deux-points. -f1,3 prend le premier et le troisième. -c1-8 prend les caractères 1 à 8, pas les colonnes visuelles d’un texte large. cut ne regroupe pas les séparateurs répétés comme awk. Une ligne sans séparateur est recopiée entière, sauf avec -s.",
    see_also: ["awk", "paste", "sort"],
    examples: [
      { title: "Noms de comptes", command: "cut -d: -f1 /etc/passwd", comment: "Écrit le premier champ de chaque ligne." },
      { title: "Deux champs", command: "cut -d: -f1,3 /etc/passwd", comment: "Nom et UID, séparés par le même deux-points." },
    ],
  },
  {
    name: "paste",
    themes: ["texte"],
    ...core,
    summary: "Juxtapose les lignes de plusieurs fichiers.",
    explanation: "paste fichier1 fichier2 écrit la ligne 1 des deux fichiers sur une même ligne, séparées par une tabulation. -d, change le séparateur. paste -s met toutes les lignes d’un fichier sur une seule ligne. Ce n’est pas une jointure par clé : pour cela, join exige des fichiers triés.",
    see_also: ["cut", "join"],
    examples: [
      { title: "Côte à côte", command: "paste -d, <(printf '%s\\n' a b) <(printf '%s\\n' 1 2)", comment: "Écrit a,1 puis b,2. La substitution <() est une extension bash, absente de dash." },
      { title: "Une seule ligne", command: "printf '%s\\n' un deux | paste -sd,", comment: "Écrit un,deux." },
    ],
  },
  {
    name: "sort",
    themes: ["texte"],
    ...core,
    summary: "Trie des lignes.",
    explanation: "sort fichier trie selon la locale, ce qui peut mélanger chiffres et ponctuation. LC_ALL=C sort impose l’ordre des octets, stable d’une machine à l’autre. -n trie numériquement, -h comprend les tailles 1K et 2M sur GNU, -u retire les doublons une fois trié, -k2 trie sur le deuxième champ, -t: fixe le séparateur. -r inverse. sort -c se contente de vérifier qu’un fichier est déjà trié.",
    see_also: ["uniq", "join", "comm"],
    examples: [
      { title: "Ordre des octets", command: "LC_ALL=C sort /etc/passwd", comment: "Trie indépendamment de la langue du compte. Utile avant join ou comm." },
      { title: "Par UID", command: "sort -t: -k3,3n /etc/passwd", comment: "Trie numériquement sur le troisième champ." },
    ],
  },
  {
    name: "uniq",
    themes: ["texte"],
    ...core,
    summary: "Retire les lignes répétées consécutives.",
    explanation: "uniq ne regarde que les voisines. Deux lignes identiques séparées par une autre restent. On trie d’abord, ou l’on utilise sort -u. uniq -c préfixe le nombre de répétitions, -d ne garde que les lignes qui étaient en double, -u ne garde que celles qui étaient uniques. -i ignore la casse sur GNU.",
    see_also: ["sort", "comm"],
    examples: [
      { title: "Doublons voisins", command: "printf '%s\\n' a a b a | uniq", comment: "Écrit a, b, a. Le dernier a n’est pas collé au premier, il reste." },
      { title: "Compter après un tri", command: "sort /etc/shells | uniq -c", comment: "Compte les lignes identiques une fois qu’elles sont regroupées." },
    ],
  },
  {
    name: "tr",
    themes: ["texte"],
    ...core,
    summary: "Remplace ou supprime des caractères dans un flux.",
    explanation: "tr lit l’entrée standard, pas un fichier en argument. tr a-z A-Z passe en majuscules sur l’alphabet ASCII. tr -d ' ' retire les espaces. tr -s réduit les répétitions à un seul caractère. Pour remplacer un mot par un autre mot de longueur différente, sed ou awk sont les bons outils : tr travaille caractère par caractère.",
    see_also: ["sed", "cut"],
    examples: [
      { title: "Majuscules ASCII", command: "printf '%s' 'Abcz' | tr a-z A-Z", comment: "Écrit ABCZ. Les lettres accentuées ne sont pas dans cette plage." },
      { title: "Retirer des caractères", command: "printf '%s\\n' 'a  b' | tr -d ' '", comment: "Écrit ab sans les espaces." },
    ],
  },
  {
    name: "diff",
    themes: ["texte"],
    package: { debian: "diffutils", redhat: "diffutils", suse: "diffutils", arch: "diffutils", alpine: "busybox" },
    overrides: {
      alpine: { note: "Applet BusyBox courte. Le paquet diffutils apporte la version GNU, dont -u et -r complets." },
    },
    summary: "Compare deux fichiers et décrit leurs différences.",
    explanation: "diff ancien nouveau écrit les changements qui font passer de l’un à l’autre. -u produit le format unifié, celui que patch sait relire et que les revues de code montrent. -r compare des répertoires. Un code de retour 0 signifie identique, 1 différent, 2 une erreur. diff -q se contente de dire si les fichiers diffèrent, sans le détail.",
    see_also: ["cmp", "patch", "comm"],
    examples: [
      { title: "Différence unifiée", command: "diff -u /etc/hosts /etc/hosts", comment: "Aucune sortie et un code 0 : les deux fichiers sont le même." },
      { title: "Juste oui ou non", command: "diff -q /etc/hostname /etc/hosts", comment: "Dit que les fichiers diffèrent, sans lister les lignes." },
    ],
  },
  {
    name: "cmp",
    themes: ["texte"],
    package: { debian: "diffutils", redhat: "diffutils", suse: "diffutils", arch: "diffutils", alpine: "busybox" },
    overrides: {
      alpine: { note: "Présent dans BusyBox. diffutils apporte la version GNU." },
    },
    summary: "Compare deux fichiers octet par octet.",
    explanation: "cmp s’arrête au premier octet différent et dit à quel endroit. Sans différence, il n’écrit rien et renvoie 0. -s ne écrit rien du tout et ne laisse que le code de retour. Contrairement à diff, cmp convient aux binaires. Il ne produit pas un patch.",
    see_also: ["diff", "comm"],
    examples: [
      { title: "Deux fichiers identiques", command: "cmp /etc/hostname /etc/hostname", comment: "Silence et code 0 : rien ne diffère." },
      { title: "Test silencieux", command: "cmp -s a.bin b.bin", comment: "Code 0 si identiques, 1 si différents. Aucune sortie." },
    ],
  },
  {
    name: "comm",
    themes: ["texte"],
    ...core,
    overrides: {
      alpine: { package: "coreutils", note: "Pas dans l’applet BusyBox habituelle. Le paquet coreutils le fournit." },
    },
    summary: "Compare deux fichiers déjà triés, ligne par ligne.",
    explanation: "comm fichier1 fichier2 écrit trois colonnes : lignes seulement dans le premier, seulement dans le second, dans les deux. Les fichiers doivent être triés selon le même ordre, en pratique LC_ALL=C sort. -12 retire les deux premières colonnes et ne garde que les lignes communes. comm ne comprend pas un fichier non trié : le résultat a l’air plausible et il est faux.",
    see_also: ["sort", "diff", "join"],
    examples: [
      { title: "Lignes communes", command: "comm -12 <(printf '%s\\n' a b | sort) <(printf '%s\\n' b c | sort)", comment: "Écrit b. La substitution de processus est bash, pas dash." },
      { title: "Préparer les fichiers", command: "LC_ALL=C sort -o gauche.trie gauche.txt", comment: "Trie en place logique dans un nouveau fichier, dans l’ordre des octets, avant comm." },
    ],
  },
  {
    name: "patch",
    themes: ["texte"],
    package: { debian: "patch", redhat: "patch", suse: "patch", arch: "patch", alpine: "patch" },
    summary: "Applique un diff unifié à des fichiers.",
    explanation: "patch lit un diff, en général produit par diff -u, et modifie les fichiers qu’il désigne. -p1 retire le premier niveau de répertoire du chemin, ce que font presque tous les projets. --dry-run montre ce qui se passerait sans écrire. -R tente d’inverser le correctif. Un rejet est laissé dans un fichier .rej quand le contexte ne correspond plus.",
    see_also: ["diff"],
    examples: [
      { title: "Essai sans écriture", command: "patch --dry-run -p1 < correctif.diff", comment: "Dit si le correctif s’applique. Les sources ne changent pas." },
      { title: "Appliquer", command: "patch -p1 < correctif.diff", comment: "Modifie les fichiers. À lancer depuis la racine que le diff attend." },
    ],
  },
  {
    name: "column",
    themes: ["texte"],
    package: { debian: "bsdextrautils", redhat: "util-linux", suse: "util-linux", arch: "util-linux", alpine: "util-linux" },
    summary: "Aligne du texte en colonnes.",
    explanation: "column -t lit une table séparée par des espaces et aligne les colonnes. -s: fixe un autre séparateur. Sur Debian et Ubuntu, la commande est dans le paquet bsdextrautils, pas dans l’installation minimale de tous les conteneurs. La commande reste courante. Deux options ont été renommées dans util-linux et ne doivent plus servir dans un script nouveau.",
    deprecated_options: [
      { option: "--table-empty-lines", since: "util-linux 2.37", replacement: "--keep-empty-lines", why: "Le nom a été clarifié. L’ancienne option reste acceptée pour les scripts existants." },
      { option: "--columns", since: "util-linux 2.30", replacement: "--output-width", why: "Renommée pour ne plus être confondue avec le nombre de colonnes du tableau." },
    ],
    see_also: ["paste", "ls"],
    overrides: {
      alpine: { note: "Paquet util-linux, pas dans BusyBox." },
    },
    examples: [
      { title: "Aligner les champs", command: "printf '%s\\n' 'nom uid' 'root 0' | column -t", comment: "Aligne nom au-dessus de root et uid au-dessus de 0." },
      { title: "Séparateur deux-points", command: "cut -d: -f1,3 /etc/passwd | column -s: -t", comment: "Présente le nom et l’UID en deux colonnes lisibles." },
    ],
  },
  {
    name: "nl",
    themes: ["texte"],
    ...core,
    overrides: {
      alpine: { package: "coreutils", note: "Pas dans BusyBox. Le paquet coreutils le fournit. cat -n couvre le cas simple." },
    },
    summary: "Numérote les lignes d’un fichier.",
    explanation: "nl fichier écrit chaque ligne précédée de son numéro. -ba numérote aussi les lignes vides, ce que le défaut ne fait pas. -n rz cadre le numéro à droite avec des zéros. cat -n est plus direct quand il suffit d’un numéro devant chaque ligne, vide ou non.",
    see_also: ["cat", "wc"],
    examples: [
      { title: "Numéroter", command: "nl /etc/hostname", comment: "Écrit le numéro puis le contenu." },
      { title: "Y compris les lignes vides", command: "nl -ba fichier.txt", comment: "Compte aussi les lignes qui ne contiennent rien." },
    ],
  },
  {
    name: "od",
    themes: ["texte"],
    ...core,
    summary: "Vide un fichier en octal, hexadécimal ou caractères.",
    explanation: "od -An -tx1 fichier écrit les octets en hexadécimal, sans la colonne d’adresse si -An est accepté. -c montre les caractères. od est POSIX et présent dans les coreutils. Pour un vidage hexadécimal plus lisible, hexdump -C est courant mais vient d’util-linux, pas de POSIX. od convient aux binaires que cat afficherait mal dans un terminal.",
    see_also: ["hexdump", "strings"],
    examples: [
      { title: "Octets en hexadécimal", command: "od -An -tx1 /etc/hostname", comment: "Une ligne d’octets, sans adresse à gauche sur les coreutils GNU." },
      { title: "Caractères visibles", command: "od -c /etc/hostname", comment: "Montre les lettres et le saut de ligne comme \\n." },
    ],
  },
  {
    name: "hexdump",
    themes: ["texte"],
    package: { debian: "bsdextrautils", redhat: "util-linux", suse: "util-linux", arch: "util-linux", alpine: "hexdump" },
    summary: "Vide un fichier en hexadécimal, avec le texte à côté.",
    explanation: "hexdump -C fichier est le format canonique : décalage, seize octets, puis la colonne texte. Sur Debian et Ubuntu il est dans bsdextrautils. hd est souvent un synonyme. Pour un outil POSIX déjà là, od fait le vidage avec une syntaxe différente. hexdump ne modifie pas le fichier.",
    see_also: ["od", "strings"],
    overrides: {
      alpine: { note: "Paquet hexdump ou util-linux selon l’image. Pas une applet BusyBox de base." },
    },
    examples: [
      { title: "Format canonique", command: "hexdump -C /etc/hostname", comment: "Seize octets par ligne, avec les caractères imprimables à droite." },
      { title: "Vingt octets", command: "hexdump -C -n 20 /bin/ls", comment: "Ne lit que le début du binaire, assez pour reconnaître un en-tête ELF." },
    ],
  },
  {
    name: "strings",
    themes: ["texte"],
    package: { debian: "binutils", redhat: "binutils", suse: "binutils", arch: "binutils", alpine: "binutils" },
    summary: "Extrait les suites de caractères lisibles d’un binaire.",
    explanation: "strings fichier écrit les séquences d’au moins quatre caractères imprimables. On repère ainsi une version, une URL ou un message d’erreur dans un exécutable sans le désassembler. -n 8 relève le minimum. Ce n’est pas une analyse : beaucoup de chaînes sont des restes, et un binaire peut n’en avoir presque pas s’il est compressé.",
    see_also: ["hexdump", "file"],
    examples: [
      { title: "Chaînes d’un binaire", command: "strings /bin/ls | head", comment: "Montre le début des textes embarqués. head limite l’affichage." },
      { title: "Suites plus longues", command: "strings -n 8 /bin/ls", comment: "Ignore les suites de moins de huit caractères." },
    ],
  },
  {
    name: "split",
    themes: ["texte"],
    ...core,
    summary: "Découpe un fichier en plusieurs morceaux.",
    explanation: "split -l 1000 fichier écrit des morceaux de mille lignes, nommés xaa, xab, et ainsi de suite. -b 10M découpe par taille. -d numérote au lieu d’utiliser des lettres. La sortie se place dans le répertoire courant, sauf si un préfixe est donné en dernier argument. Pour réassembler, cat dans l’ordre des noms suffit.",
    see_also: ["cat", "csplit"],
    examples: [
      { title: "Par lignes", command: "split -l 2 -d /etc/passwd /tmp/passe-", comment: "Crée /tmp/passe-00, /tmp/passe-01, etc., deux lignes chacun." },
      { title: "Réassembler", command: "cat /tmp/passe-* > /tmp/passe-tout", comment: "L’ordre lexicographique des noms numérotés reconstitue le fichier." },
    ],
  },
  {
    name: "csplit",
    themes: ["texte"],
    package: { debian: "coreutils", redhat: "coreutils", suse: "coreutils", arch: "coreutils", alpine: "coreutils" },
    tags: ["coreutils"],
    overrides: {
      alpine: { note: "Pas dans BusyBox. Le paquet coreutils le fournit." },
    },
    summary: "Découpe un fichier à des lignes qui correspondent à un motif.",
    explanation: "csplit coupe là où une expression apparaît, pas à un nombre de lignes fixe. csplit fichier '/^#/' '{*}' découpe à chaque ligne qui commence par #. Les morceaux s’appellent xx00, xx01, sauf changement de préfixe. C’est un outil GNU du paquet coreutils, absent de BusyBox.",
    see_also: ["split", "sed"],
    examples: [
      { title: "Couper au motif", command: "csplit -f /tmp/part- -n 2 /etc/passwd '/^bin/' '{*}'", comment: "Crée des morceaux à partir de chaque ligne qui commence par bin, si elle existe." },
      { title: "Préfixe explicite", command: "csplit -f /tmp/h- /etc/hosts '/^#/' '{*}'", comment: "Les fichiers commencent par /tmp/h-. '{*}' répète la coupe autant de fois que possible." },
    ],
  },
  {
    name: "join",
    themes: ["texte"],
    ...core,
    overrides: {
      alpine: { package: "coreutils", note: "Pas dans BusyBox. Le paquet coreutils le fournit." },
    },
    summary: "Joint deux fichiers triés sur un champ commun.",
    explanation: "join fichier1 fichier2 écrit les lignes dont le premier champ est commun. Les deux fichiers doivent être triés sur ce champ, dans le même ordre d’octets. -1 2 -2 1 choisit d’autres colonnes, -t: change le séparateur. Ce n’est pas un tableur : un fichier non trié produit des trous silencieux.",
    see_also: ["sort", "paste", "comm"],
    examples: [
      { title: "Champ commun", command: "join <(printf '%s\\n' 'a 1' 'b 2') <(printf '%s\\n' 'a x' 'c y')", comment: "Écrit « a 1 x ». b et c n’ont pas de correspondance. Nécessite bash pour <()." },
      { title: "Préparer le tri", command: "LC_ALL=C sort -k1,1 fichier.tsv", comment: "Trie sur le premier champ avant de passer le fichier à join." },
    ],
  },
];
