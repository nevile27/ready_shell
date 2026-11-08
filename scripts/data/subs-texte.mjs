const ex = (title, command, comment) => ({ title, command, comment });
const sub = (name, summary, explanation, examples) => ({ name, summary, explanation, examples });

export const patches = {
  egrep: { subcommands: [
    sub("-E", "La forme actuelle est grep -E.", "`egrep` n’est plus qu’un rappel. Depuis GNU grep 3.8 il écrit un avertissement. `grep -E` active les mêmes expressions étendues, sans le message.", [ex("Forme actuelle", "grep -E 'error|fail' journal.txt", "Le | est actif. Aucun avertissement obsolescent.")]),
  ]},
  fgrep: { subcommands: [
    sub("-F", "La forme actuelle est grep -F.", "`fgrep` cherche une chaîne fixe et avertit. `grep -F` laisse les crochets et les points ordinaires.", [ex("Chaîne fixe", "grep -F '[ERROR]' journal.txt", "Les crochets ne forment pas une classe de caractères.")]),
  ]},
  sed: { subcommands: [
    sub("s", "Remplace du texte, ligne à ligne.", "`s/ancien/nouveau/` ne change que la première occurrence. Le drapeau `g` les change toutes. Un autre délimiteur évite d’échapper les slashs : `s|/var|/srv|`.", [ex("Sur la sortie", "sed 's/root/administrateur/' /etc/passwd", "Le fichier d’origine n’est pas modifié.")]),
    sub("-n", "N’écrit que ce que le script demande.", "`-n` coupe la sortie automatique. `p` réécrit les lignes voulues. `-n '1,5p'` garde un intervalle.", [ex("Cinq lignes", "sed -n '1,5p' /etc/passwd", "Seules les lignes 1 à 5.")]),
    sub("-i", "Réécrit le fichier.", "`-i.bak` garde une copie sur GNU sed. La syntaxe `-i ''` de BSD n’est pas celle de GNU. Sans copie, le fichier est remplacé tout de suite.", [ex("Avec copie", "sed -i.bak 's/ancien/nouveau/' fichier.txt", "fichier.txt change. fichier.txt.bak garde l’original.")]),
  ]},
  awk: { subcommands: [
    sub("-F", "Choisit le séparateur de champs.", "`-F:` coupe sur le deux-points. `$1` est le premier champ, `$0` la ligne. `NR` est le numéro de ligne. Sur Debian, `awk` pointe souvent vers mawk.", [ex("Nom et UID", "awk -F: '{ print $1, $3 }' /etc/passwd", "Le nom du compte et son UID.")]),
    sub("motif", "N’exécute le bloc que sur certaines lignes.", "Un motif avant l’accolade filtre. Les extensions GNU (`gensub`, tableaux à plusieurs dimensions) demandent `gawk`, pas mawk ni BusyBox.", [ex("UID élevés", "awk -F: '$3 >= 1000 { print $1 }' /etc/passwd", "Comptes dont l’UID vaut au moins 1000.")]),
  ]},
  cut: { subcommands: [
    sub("-d", "Choisit le séparateur et les champs.", "`-d: -f1` prend le premier champ. `-f1,3` prend le premier et le troisième. `cut` ne regroupe pas les séparateurs répétés comme `awk`. `-s` retire les lignes sans séparateur.", [ex("Noms", "cut -d: -f1 /etc/passwd", "Le premier champ de chaque ligne.")]),
    sub("-c", "Extrait des caractères, pas des champs.", "`-c1-8` prend les caractères 1 à 8, pas des colonnes visuelles. `--complement` garde le reste, en GNU.", [ex("Huit caractères", "cut -c1-8 /etc/hostname", "Le début du nom, au plus huit caractères.")]),
  ]},
  paste: { subcommands: [
    sub("-d", "Juxtapose les lignes avec ce séparateur.", "`paste f1 f2` met la ligne 1 de chaque fichier sur une même ligne, séparées par une tabulation. `-d,` change le séparateur.", [ex("Virgule", "printf '%s\\n' a b | paste -sd,", "Écrit a,b.")]),
    sub("-s", "Met toutes les lignes d’un fichier sur une seule.", "`-s` est l’opposé de la juxtaposition de fichiers. Pour une jointure par clé, `join` exige des fichiers triés.", [ex("Une ligne", "printf '%s\\n' un deux | paste -sd ' '", "Écrit un deux.")]),
  ]},
  sort: { subcommands: [
    sub("-n", "Trie des nombres, pas du texte.", "Sans `-n`, 10 passe avant 2. `-h` comprend 1K et 2M sur GNU. `-r` inverse. `LC_ALL=C` fixe l’ordre des octets.", [ex("Nombres", "sort -n nombres.txt", "2 avant 10. Le fichier doit exister.")]),
    sub("-k", "Trie sur un champ.", "`-t:` choisit le séparateur. `-k3,3n` trie numériquement sur le troisième champ seulement. `-u` retire les doublons une fois trié. `-c` vérifie qu’un fichier est déjà trié.", [ex("Par UID", "sort -t: -k3,3n /etc/passwd", "Les comptes du plus petit UID au plus grand.")]),
  ]},
  uniq: { subcommands: [
    sub("-c", "Compte les lignes identiques voisines.", "`uniq` ne regarde que les voisines. On trie d’abord, ou l’on utilise `sort -u`. `-c` préfixe le nombre.", [ex("Après un tri", "sort /etc/shells | uniq -c", "Compte les lignes identiques une fois regroupées.")]),
    sub("-d", "Ne garde que les lignes qui étaient en double.", "`-u` ne garde que celles qui n’apparaissaient qu’une fois. `-i` ignore la casse sur GNU.", [ex("Doublons", "printf '%s\\n' a a b | uniq -d", "Écrit a, parce que a était répété.")]),
  ]},
  tr: { subcommands: [
    sub("jeu", "Remplace des caractères, pas des mots.", "`tr` lit l’entrée standard, pas un fichier en argument. `tr a-z A-Z` passe l’ASCII en majuscules. Pour remplacer un mot, `sed` ou `awk`.", [ex("Majuscules", "printf '%s' 'abcz' | tr a-z A-Z", "Écrit ABCZ.")]),
    sub("-d", "Supprime les caractères listés.", "`-s` réduit les répétitions à un seul caractère. `-c` prend le complément du jeu.", [ex("Sans espaces", "printf '%s\\n' 'a  b' | tr -d ' '", "Écrit ab.")]),
  ]},
  diff: { subcommands: [
    sub("-u", "Différence au format unifié.", "`-u` est le format que `patch` relit. `-r` compare des répertoires. Le code 0 signifie identique, 1 différent, 2 une erreur.", [ex("Unifié", "diff -u /etc/hosts /etc/hosts", "Aucune sortie et un code 0 : c’est le même fichier.")]),
    sub("-q", "Dit seulement si les fichiers diffèrent.", "`-q` ne liste pas les lignes. `-N` traite un fichier manquant comme vide, en GNU. `-w` ignore les différences d’espaces.", [ex("Oui ou non", "diff -q /etc/hostname /etc/hosts", "Dit qu’ils diffèrent, sans le détail.")]),
  ]},
  cmp: { subcommands: [
    sub("octets", "S’arrête au premier octet différent.", "`cmp` convient aux binaires. Sans différence, il n’écrit rien et renvoie 0. Il ne produit pas un patch.", [ex("Identiques", "cmp /etc/hostname /etc/hostname", "Silence et code 0.")]),
    sub("-s", "Ne laisse que le code de retour.", "`-l` liste tous les octets différents. `-s` n’écrit rien : 0 identiques, 1 différents.", [ex("Test", "cmp -s /etc/hostname /etc/hosts; printf '%s\\n' $?", "1 si les fichiers diffèrent.")]),
  ]},
  comm: { subcommands: [
    sub("-12", "Ne garde que les lignes communes.", "Les fichiers doivent être triés dans le même ordre. `-1` retire la première colonne, `-2` la deuxième, `-3` la troisième. Un fichier non trié donne un résultat faux.", [ex("Commun", "comm -12 <(printf '%s\\n' a b | sort) <(printf '%s\\n' b c | sort)", "Écrit b. La substitution <() est bash.")]),
  ]},
  patch: { subcommands: [
    sub("-p", "Retire des niveaux de répertoire du diff.", "`-p1` retire le premier composant, ce que font presque tous les projets. On lance `patch` depuis la racine que le diff attend.", [ex("Essai", "patch --dry-run -p1 < correctif.diff", "Dit si le correctif s’applique. Les sources ne changent pas.")]),
    sub("-R", "Tente d’inverser le correctif.", "`-R` défait un patch déjà appliqué. Un rejet est laissé dans un fichier `.rej` quand le contexte ne correspond plus.", [ex("Défaire", "patch -R -p1 < correctif.diff", "Inverse le correctif si les fichiers sont encore dans l’état patché.")]),
  ]},
  column: { subcommands: [
    sub("-t", "Aligne une table sur les espaces.", "`column -t` calcule des colonnes. `-s:` fixe un autre séparateur. Sur Debian, la commande est dans `bsdextrautils`.", [ex("Aligner", "printf '%s\\n' 'nom uid' 'root 0' | column -t", "Aligne les deux colonnes.")]),
    sub("-s", "Choisit le séparateur d’entrée.", "`-s` ne sert qu’avec `-t`. `--keep-empty-lines` a remplacé `--table-empty-lines` depuis util-linux 2.37.", [ex("Deux-points", "cut -d: -f1,3 /etc/passwd | column -s: -t", "Nom et UID en colonnes.")]),
  ]},
  nl: { subcommands: [
    sub("-ba", "Numérote aussi les lignes vides.", "Par défaut, `nl` saute les lignes vides. `-ba` les compte. `cat -n` numérote tout, plus directement.", [ex("Tout", "nl -ba /etc/hostname", "Le numéro, y compris si des lignes sont vides.")]),
    sub("-n", "Choisit le format du numéro.", "`-n rz` cadre à droite avec des zéros. `-w` fixe la largeur. `-s` change le séparateur après le numéro.", [ex("Zéros", "nl -n rz -w 3 /etc/hostname", "Un numéro sur trois caractères, complété par des zéros.")]),
  ]},
  od: { subcommands: [
    sub("-tx1", "Vide les octets en hexadécimal.", "`od` est POSIX. `-An` retire la colonne d’adresse sur les coreutils GNU. `-c` montre les caractères.", [ex("Hexadécimal", "od -An -tx1 /etc/hostname", "Les octets du fichier, sans adresse à gauche.")]),
    sub("-c", "Montre les caractères et les séquences.", "`\\n` apparaît pour le saut de ligne. Pour un format canonique plus lisible, `hexdump -C`.", [ex("Caractères", "od -c /etc/hostname", "Lettres et \\n.")]),
  ]},
  hexdump: { subcommands: [
    sub("-C", "Format canonique : octets et texte.", "`-C` aligne seize octets et la colonne des caractères. `-n` limite la lecture. Sur Debian, le paquet est `bsdextrautils`.", [ex("Canonique", "hexdump -C /etc/hostname", "Décalage, octets et caractères imprimables.")]),
    sub("-n", "Ne lit que les premiers octets.", "`-n 20` suffit souvent à reconnaître un en-tête. `hd` est souvent un synonyme de `hexdump`.", [ex("En-tête", "hexdump -C -n 20 /bin/ls", "Le début du binaire, assez pour voir ELF.")]),
  ]},
  strings: { subcommands: [
    sub("-n", "Ignore les suites plus courtes que N.", "Par défaut, `strings` garde les suites d’au moins quatre caractères imprimables. `-n 8` relève le seuil. `-t x` ajoute le décalage.", [ex("Suites longues", "strings -n 8 /bin/ls", "Moins de bruit que le défaut.")]),
    sub("-a", "Parcourt tout le fichier.", "Selon la version, `strings` ne regarde que les sections de données d’un ELF. `-a` force la lecture de tout le fichier.", [ex("Tout", "strings -a /bin/ls | head", "Le début des textes embarqués.")]),
  ]},
  split: { subcommands: [
    sub("-l", "Découpe en morceaux d’un nombre de lignes.", "Les morceaux s’appellent xaa, xab, sauf si un préfixe est donné. `-d` numérote. `-a` fixe la longueur du suffixe.", [ex("Deux lignes", "split -l 2 -d /etc/passwd /tmp/passe-", "Crée /tmp/passe-00, /tmp/passe-01, et la suite.")]),
    sub("-b", "Découpe par taille.", "`-b 10M` fait des morceaux de dix mégaoctets. `cat` dans l’ordre des noms réassemble.", [ex("Réassembler", "cat /tmp/passe-* > /tmp/passe-tout", "L’ordre lexicographique des noms numérotés reconstitue le fichier.")]),
  ]},
  join: { subcommands: [
    sub("champ", "Joint deux fichiers triés sur le premier champ.", "Les deux fichiers doivent être triés sur la clé, dans le même ordre d’octets. Un fichier non trié produit des trous silencieux.", [ex("Commun", "join <(printf '%s\\n' 'a 1' 'b 2') <(printf '%s\\n' 'a x' 'c y')", "Écrit a 1 x. Nécessite bash pour <().")]),
    sub("-t", "Change le séparateur et les colonnes.", "`-t:` coupe sur le deux-points. `-1 2` prend le deuxième champ du premier fichier. `-a 1` garde aussi les lignes sans correspondance.", [ex("Préparer", "LC_ALL=C sort -k1,1 fichier.txt", "Trie sur le premier champ avant join.")]),
  ]},
  csplit: { subcommands: [
    sub("motif", "Coupe là où une expression apparaît.", "`csplit` n’est pas dans BusyBox. `'{*}'` répète la coupe. Les morceaux s’appellent xx00, xx01, sauf changement de préfixe avec `-f`.", [ex("Sur les commentaires", "csplit -f /tmp/h- /etc/hosts '/^#/' '{*}'", "Un morceau à chaque ligne qui commence par #.")]),
  ]},
};
