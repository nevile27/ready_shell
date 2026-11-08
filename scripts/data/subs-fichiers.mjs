const ex = (title, command, comment) => ({ title, command, comment });
const sub = (name, summary, explanation, examples, pitfalls) => ({
  name, summary, explanation, examples, ...(pitfalls ? { pitfalls } : {}),
});

export const patches = {
  ls: { subcommands: [
    sub("-l", "Liste longue : droits, propriétaire, taille et date.", "`ls -l` écrit une ligne par nom. `-h` rend les tailles lisibles. `-a` ajoute les noms qui commencent par un point.", [ex("Longue, avec les cachés", "ls -la", "Droits, propriétaire, taille et date, y compris les fichiers cachés.")]),
    sub("-t", "Trie par date de modification.", "`-t` met le plus récent en premier. `-r` inverse. `-S` trie par taille. `-u` utilise la date d’accès.", [ex("Plus récents", "ls -lt", "Le fichier modifié en dernier apparaît en haut.")]),
    sub("-d", "Ne descend pas dans un répertoire donné en argument.", "`ls -ld répertoire` décrit le répertoire lui-même au lieu de son contenu. Utile avec un glob de répertoires.", [ex("Le répertoire, pas son contenu", "ls -ld /tmp", "Une seule ligne, celle de /tmp.")]),
  ]},
  cp: { subcommands: [
    sub("-a", "Copie une arborescence en conservant droits et dates.", "`cp -a` récuse, garde les liens, les droits et les dates. C’est la forme d’administration. `-r` descend aussi, sans tout préserver.", [ex("Copie fidèle", "cp -a /etc/ssh /root/ssh.bak", "Recopie l’arborescence avec droits et dates.")]),
    sub("-i", "Demande avant d’écraser.", "`-i` interroge si la destination existe. Beaucoup de comptes ont un alias `cp -i`. `-n` n’écrase pas, sans poser de question. `-u` n’écrase que si la source est plus récente.", [ex("Confirmation", "cp -i rapport.txt /tmp/rapport.txt", "Demande si /tmp/rapport.txt existe déjà.")]),
  ]},
  mv: { subcommands: [
    sub("renommer", "Change le nom dans le même répertoire.", "`mv ancien nouveau` renomme sans recopier les données quand la destination est sur le même système de fichiers. `--` protège un nom qui commence par un tiret.", [ex("Renommer", "mv brouillon.txt note.txt", "Le fichier change de nom.")]),
    sub("-i", "Demande avant d’écraser la cible.", "`-n` refuse d’écraser. `-t répertoire` déplace tous les fichiers suivants dans ce répertoire, ce qui clarifie une longue liste.", [ex("Sans écraser", "mv -n note.txt /tmp/", "Ne remplace pas /tmp/note.txt s’il existe.")]),
  ]},
  rm: { subcommands: [
    sub("-r", "Supprime un répertoire et son contenu.", "`rm -r` descend. Il n’y a pas de corbeille. `-f` ne demande rien et ignore les noms déjà absents. `--preserve-root` refuse `rm -r /` sur les coreutils GNU.", [ex("Répertoire d’essai", "mkdir -p /tmp/demo-rm && rm -r /tmp/demo-rm", "Supprime l’arborescence créée pour l’exemple.")], ["Une variable vide devant rm -rf peut viser le mauvais endroit. Testez-la avant."]),
    sub("-i", "Demande pour chaque nom.", "`-I` demande une seule fois s’il y a plus de trois fichiers, ou si l’on descend. `-d` retire un répertoire vide, comme `rmdir`.", [ex("Confirmation", "rm -i /tmp/inutile.txt", "Demande avant de supprimer ce fichier.")]),
  ]},
  mkdir: { subcommands: [
    sub("-p", "Crée les parents manquants et n’échoue pas s’ils existent.", "`mkdir -p` est la forme des scripts. Relancer la commande ne produit pas d’erreur.", [ex("Toute la chaîne", "mkdir -p \"$HOME/travail/2026/11\"", "Crée travail, 2026 et 11 si besoin.")]),
    sub("-m", "Pose les droits au moment de la création.", "`-m 700` ne dépend pas seulement du umask. Les droits s’appliquent au répertoire créé, pas aux parents déjà là.", [ex("Répertoire privé", "mkdir -m 700 \"$HOME/prive\"", "Accessible seulement à son propriétaire.")]),
  ]},
  rmdir: { subcommands: [
    sub("vide", "Supprime un répertoire qui ne contient plus rien.", "`rmdir` refuse un répertoire qui a encore un nom, y compris un fichier caché. C’est le garde-fou quand on ne veut pas de `rm -r`.", [ex("Un vide", "rmdir /tmp/vide", "Échoue si /tmp/vide contient encore quelque chose.")]),
    sub("-p", "Retire aussi les parents devenus vides.", "`rmdir -p a/b/c` retire c, puis b, puis a, tant que chacun est vide. Il s’arrête au premier qui ne l’est pas.", [ex("Parents", "rmdir -p /tmp/a/b/c", "Remonte tant que les répertoires sont vides.")]),
  ]},
  touch: { subcommands: [
    sub("créer", "Crée un fichier vide ou rafraîchit sa date.", "`touch fichier` ne modifie pas le contenu s’il existe. Il ne crée pas les répertoires parents.", [ex("Fichier vide", "touch \"$HOME/nouveau.txt\"", "Crée le fichier ou met à jour sa date.")]),
    sub("-r", "Reprend la date d’un autre fichier.", "`-d` fixe une date donnée sur les coreutils GNU. BusyBox n’a pas toujours `-d`. `-t` utilise le format [[CC]AA]MMJJhhmm[.ss].", [ex("Même date", "touch -r /etc/hostname note.txt", "note.txt reçoit les dates de /etc/hostname.")]),
  ]},
  ln: { subcommands: [
    sub("-s", "Crée un lien symbolique.", "`ln -s cible lien` stocke un chemin. Une cible relative se résout depuis le répertoire du lien, pas depuis l’endroit où vous tapez la commande. `-f` remplace un lien déjà là.", [ex("Lien", "ln -s /etc/os-release \"$HOME/os\"", "Lire ~/os affiche /etc/os-release.")], ["Une cible relative casse si le lien est déplacé. Préférez un chemin absolu quand il doit rester valable."]),
    sub("-r", "Calcule une cible relative, version GNU.", "`ln -sr` écrit une cible relative entre le lien et la source. Pratique dans une arborescence que l’on déplace en bloc.", [ex("Relatif", "ln -sr /etc/hostname /tmp/h", "Le lien /tmp/h contient un chemin relatif vers hostname.")]),
  ]},
  readlink: { subcommands: [
    sub("cible", "Écrit la cible telle qu’elle est stockée.", "`readlink lien` ne suit pas une chaîne de liens. La cible peut être relative.", [ex("Cible brute", "readlink /bin/sh", "Le texte du lien : dash, bash ou busybox.")]),
    sub("-f", "Suit toute la chaîne et écrit un chemin absolu.", "`readlink -f` résout les liens. `realpath` fait le même travail avec un vocabulaire plus clair sur les coreutils récents.", [ex("Chemin final", "readlink -f /bin/sh", "Le chemin canonique du binaire.")]),
  ]},
  realpath: { subcommands: [
    sub("canonique", "Résout ., .. et les liens.", "`realpath fichier` écrit un chemin absolu. Le dernier élément doit exister, sauf avec `-m`.", [ex("Parent", "realpath ..", "Le répertoire parent, liens résolus.")]),
    sub("-m", "Normalise même si le fichier n’existe pas encore.", "`-e` exige que tous les composants existent. `-m` accepte une destination à créer.", [ex("Chemin futur", "realpath -m \"$HOME/futur/note.txt\"", "Normalise le chemin sans exiger que note.txt existe.")]),
  ]},
  stat: { subcommands: [
    sub("fiche", "Affiche taille, droits, propriétaire, dates et inode.", "`stat` est plus stable à lire qu’un découpage de `ls -l`. `-f` interroge le système de fichiers, pas le fichier.", [ex("Métadonnées", "stat /etc/os-release", "Taille, droits, dates et inode.")]),
    sub("-c", "N’écrit que le format demandé, version GNU.", "`%a` est l’octal des droits, `%s` la taille, `%n` le nom, `%U` le propriétaire. BusyBox a un stat plus court.", [ex("Droits octaux", "stat -c '%a' /etc/os-release", "Par exemple 644.")]),
  ]},
  file: { subcommands: [
    sub("-b", "N’écrit pas le nom avant le type.", "`file` regarde le contenu, pas l’extension. `-b` ne garde que la réponse, plus simple dans un script.", [ex("Type seul", "file -b /bin/ls", "Exécutable ELF, et l’architecture, sans répéter le chemin.")]),
    sub("-L", "Suit les liens symboliques.", "Sans `-L`, un lien est annoncé comme un lien. `-z` regarde à l’intérieur d’un fichier compressé. `-i` répond par un type MIME.", [ex("MIME", "file -bi /etc/os-release", "Un type MIME, par exemple text/plain.")]),
  ]},
  basename: { subcommands: [
    sub("nom", "Retire le répertoire.", "`basename /var/log/syslog` écrit syslog. Dans bash, `${chemin##*/}` fait le même travail sans processus.", [ex("Nom seul", "basename /etc/os-release", "Écrit os-release.")]),
    sub("suffixe", "Retire aussi une terminaison.", "Le second argument n’est retiré que s’il est exactement à la fin. `dirname` donne le répertoire parent.", [ex("Sans .log", "basename /var/log/syslog.log .log", "Écrit syslog.")]),
  ]},
  dirname: { subcommands: [
    sub("parent", "Retire le dernier élément du chemin.", "`dirname` n’exige pas que le chemin existe. Sur un nom sans slash, il écrit un point.", [ex("Répertoire", "dirname /etc/ssh/sshd_config", "Écrit /etc/ssh.")]),
  ]},
  mktemp: { subcommands: [
    sub("fichier", "Crée un fichier vide au nom imprévisible.", "`mktemp` écrit le chemin créé. Les droits sont restreints. On l’associe à `trap` pour le supprimer à la sortie.", [ex("Fichier", "tmp=$(mktemp) && printf '%s\\n' \"$tmp\"", "Crée le fichier et montre son chemin.")]),
    sub("-d", "Crée un répertoire temporaire.", "Le modèle se termine par au moins trois X. `-p` choisit le répertoire parent au lieu de /tmp.", [ex("Répertoire", "dir=$(mktemp -d) && printf '%s\\n' \"$dir\"", "Un répertoire vide au nom imprévisible.")]),
  ]},
  install: { subcommands: [
    sub("-m", "Copie et pose les droits dans la même opération.", "`install -m 644` évite l’instant où le fichier aurait les droits du umask. `-o` et `-g` règlent propriétaire et groupe, ce qui demande l’administrateur.", [ex("Fichier privé", "install -m 600 \"$HOME/.ssh/id_ed25519\" /tmp/cle-demo", "Copie la clé en lecture pour le seul propriétaire, si elle existe.")]),
    sub("-D", "Crée les répertoires parents de la destination.", "`-D` évite un `mkdir -p` séparé. `-t répertoire` copie plusieurs sources dans un répertoire.", [ex("Avec les parents", "install -m 644 -D /etc/hostname /tmp/demo-install/h", "Crée /tmp/demo-install si besoin.")]),
  ]},
  dd: { subcommands: [
    sub("if", "Choisit la source des blocs.", "`if=` est l’entrée, `of=` la sortie. `bs=` la taille de bloc. `status=progress` montre l’avancement sur les coreutils GNU. Pour un fichier ordinaire, `cp` se trompe moins.", [ex("Petite copie", "dd if=/etc/hostname of=/tmp/hostname.copy status=progress", "Copie ce fichier et affiche la progression.")], ["Une erreur dans of= écrase le périphérique visé. Vérifiez le nom deux fois."]),
    sub("conv", "Transforme les blocs pendant la copie.", "`conv=fsync` force l’écriture physique avant de revenir. `conv=sparse` ne écrit pas les blocs entièrement nuls. `count=` limite le nombre de blocs.", [ex("Synchroniser", "dd if=/etc/hostname of=/tmp/hostname.sync conv=fsync", "Ne revient qu’une fois les données poussées.")]),
  ]},
  locate: { subcommands: [
    sub("motif", "Cherche un nom dans l’index, pas sur le disque.", "`locate` peut être périmé : un fichier créé à l’instant n’y est pas. `-i` ignore la casse. `-r` traite le motif comme une expression rationnelle.", [ex("Par le nom", "locate os-release", "Chemins indexés qui contiennent os-release.")]),
    sub("-e", "Ne garde que les chemins qui existent encore.", "`-e` retire les noms que l’index connaît mais que le disque n’a plus. `updatedb` reconstruit l’index.", [ex("Existants", "locate -e sshd_config", "Ignore les chemins déjà supprimés.")]),
  ]},
  updatedb: { subcommands: [
    sub("index", "Reconstruit la base utilisée par locate.", "`updatedb` parcourt les systèmes de fichiers autorisés. Il se lance d’habitude une fois par jour. La base système demande l’administrateur.", [ex("Rafraîchir", "sudo updatedb", "locate voit ensuite les fichiers récents de cet index.")]),
  ]},
  cat: { subcommands: [
    sub("fichier", "Écrit le fichier sur la sortie standard.", "`cat` concatène les fichiers dans l’ordre. Pour un long fichier, `less` est plus confortable. Un binaire envoyé dans le terminal peut y laisser des séquences.", [ex("Court", "cat /etc/os-release", "Le fichier tel quel.")]),
    sub("-n", "Numérote les lignes.", "`-A` montre les caractères non imprimables sur les coreutils GNU. `-s` réduit les suites de lignes vides à une seule.", [ex("Numéros", "cat -n /etc/hostname", "Le numéro devant le nom de la machine.")]),
  ]},
  tac: { subcommands: [
    sub("inverse", "Écrit les lignes en partant de la fin.", "`tac` inverse l’ordre des lignes, pas les caractères dans la ligne. Pour suivre un fichier qui grandit, `tail -f` lit au fur et à mesure.", [ex("À l’envers", "tac /etc/passwd", "La dernière ligne du fichier apparaît en premier.")]),
  ]},
  head: { subcommands: [
    sub("-n", "Limite le nombre de lignes.", "`head` montre dix lignes par défaut. `-n 20` en demande vingt. `-c` limite en octets. `-n -5`, en GNU, montre tout sauf les cinq dernières.", [ex("Vingt lignes", "head -n 20 /etc/passwd", "Le début du fichier, vingt lignes au plus.")]),
  ]},
  tail: { subcommands: [
    sub("-n", "Affiche la fin du fichier.", "`tail -n 30` écrit les trente dernières lignes. `-c` compte en octets.", [ex("Fin", "tail -n 30 /etc/passwd", "Les trente dernières lignes.")]),
    sub("-f", "Suit les lignes ajoutées.", "`-f` reste ouvert jusqu’à Ctrl+C. `-F` rouvre le fichier s’il est remplacé, ce qui arrive quand un journal tourne.", [ex("Suivre", "tail -F /var/log/syslog", "Reste en place même si le fichier est recréé. Le chemin dépend de la famille.")]),
  ]},
  less: { subcommands: [
    sub("lecture", "Ouvre le fichier page par page.", "Espace avance, `b` recule, `/motif` cherche, `n` recommence, `q` quitte. `less` n’a pas besoin de tout lire pour afficher la première page.", [ex("Ouvrir", "less /etc/passwd", "q quitte sans modifier le fichier.")]),
    sub("+motif", "Cherche dès l’ouverture.", "`less +/root fichier` place la première occurrence en haut. `-N` numérote les lignes. `-S` ne replie pas les lignes longues.", [ex("Chercher", "less +/root /etc/passwd", "S’ouvre sur la première ligne qui contient root.")]),
  ]},
  more: { subcommands: [
    sub("pages", "Avance écran par écran.", "`more` est le visualiseur POSIX. Espace avance, `q` quitte. Il remonte moins bien que `less`.", [ex("Lire", "more /etc/passwd", "Une page à la fois. q quitte.")]),
  ]},
  wc: { subcommands: [
    sub("-l", "Compte les lignes.", "`wc` sans option écrit lignes, mots et octets. `-l` ne garde que les lignes. Un fichier sans saut de ligne final peut annoncer une ligne de moins.", [ex("Lignes", "wc -l /etc/passwd", "Le nombre de lignes, donc d’entrées.")]),
    sub("-c", "Compte les octets.", "`-m` compte les caractères, qui diffèrent des octets dans l’UTF-8. `-w` compte les mots.", [ex("Octets", "wc -c /etc/hostname", "La taille en octets.")]),
  ]},
  tee: { subcommands: [
    sub("fichier", "Montre la sortie et l’enregistre.", "`commande | tee fichier` écrit à l’écran et dans le fichier. Avec `sudo`, c’est le moyen d’écrire dans un fichier protégé, là où une redirection est faite par le shell avant sudo.", [ex("Voir et garder", "printf '%s\\n' trace | tee /tmp/trace.txt", "Affiche trace et crée le fichier.")]),
    sub("-a", "Ajoute à la fin du fichier.", "Sans `-a`, `tee` remplace le fichier. On peut donner plusieurs noms : la même entrée est copiée dans chacun.", [ex("Ajouter", "printf '%s\\n' suite | tee -a /tmp/trace.txt", "N’efface pas les lignes déjà là.")]),
  ]},
  chmod: { subcommands: [
    sub("symbolique", "Ajoute ou retire un droit sans toucher aux autres.", "`u` est le propriétaire, `g` le groupe, `o` les autres, `a` tout le monde. `+` ajoute, `-` retire, `=` pose. `-R` descend dans un répertoire.", [ex("Exécutable", "chmod u+x outil.sh", "Le propriétaire peut lancer ./outil.sh.")]),
    sub("octal", "Pose les neuf droits d’un coup.", "`644` est lecture-écriture pour le propriétaire, lecture pour les autres. `755` ajoute l’exécution. `chmod` ne change pas le propriétaire : c’est `chown`.", [ex("Fichier privé", "chmod 600 \"$HOME/.ssh/id_ed25519\"", "Lecture et écriture pour le seul propriétaire, si la clé existe.")], ["chmod -R 777 ouvre un répertoire à tout le monde. Donnez le droit minimal."]),
  ]},
  chown: { subcommands: [
    sub("user", "Donne le fichier à un utilisateur.", "`chown user fichier` demande en pratique l’administrateur. `user:groupe` change les deux. `:groupe` ne change que le groupe.", [ex("Propriétaire", "sudo chown root:root /tmp/demo-chown", "Le fichier doit exister. root en devient le propriétaire.")]),
    sub("-R", "Parcourt un répertoire.", "`--from` ne modifie que si le propriétaire actuel est celui attendu. Les liens symboliques se règlent avec `-h` sur la version GNU, sans suivre la cible.", [ex("Arborescence", "sudo chown -R user:user /srv/données", "À lancer seulement sur le répertoire voulu.")]),
  ]},
  chgrp: { subcommands: [
    sub("groupe", "Change le groupe du fichier.", "`chgrp` équivaut à `chown :groupe`. Un utilisateur peut donner un fichier à un groupe dont il est membre.", [ex("Groupe", "chgrp users notes.txt", "Réussit si vous êtes propriétaire et membre du groupe users.")]),
    sub("-R", "Descend dans les sous-répertoires.", "`-R` applique le groupe à toute l’arborescence. `-h` vise le lien, pas la cible, sur la version GNU.", [ex("Répertoire", "chgrp -R users dossier", "Tous les noms sous dossier, si les droits le permettent.")]),
  ]},
  du: { subcommands: [
    sub("-s", "N’écrit que le total.", "`du -sh répertoire` résume la place utilisée. `-h` rend la taille lisible. `-x` ne traverse pas les autres systèmes de fichiers.", [ex("Total", "du -sh /var", "Une ligne pour tout /var.")]),
    sub("-d", "Limite la profondeur.", "`-d 1` ne montre qu’un niveau. `--apparent-size` compte la taille logique, pas les blocs alloués. Un fichier creux occupe moins que `ls` ne l’annonce.", [ex("Un niveau", "du -h -d 1 /var", "La taille de chaque répertoire directement dans /var.")]),
  ]},
  df: { subcommands: [
    sub("-h", "Tailles lisibles des systèmes montés.", "`df -h` montre taille, utilisé et disponible. `-T` ajoute le type. Un disque ext4 peut réserver des blocs à root : Disponible est alors nul pour les autres avant 100 %.", [ex("Lisible", "df -hT", "Type et tailles de chaque montage.")]),
    sub("-x", "Ignore un type de système de fichiers.", "`-x tmpfs` retire les systèmes en mémoire. `-i` montre les inodes au lieu des blocs. Un chemin en argument ne montre que le montage qui le contient.", [ex("Sans la mémoire", "df -h -x tmpfs -x devtmpfs", "Les disques, pas les systèmes de fichiers virtuels.")]),
  ]},
  rsync: { subcommands: [
    sub("-a", "Archive : récursion, droits, dates et liens.", "`-a` est le socle d’une copie d’administration. `-H` garde les liens durs. `-v` liste les fichiers. Un slash final sur la source copie le contenu, pas le répertoire lui-même.", [ex("Miroir local", "rsync -aH /etc/ssh/ /tmp/ssh-copie/", "Recopie le contenu. Relancer ne transfère que ce qui a changé.")]),
    sub("--delete", "Retire de la destination ce qui n’est plus dans la source.", "`--delete` fait un miroir. Il est destructeur si la source est la mauvaise. `-n` montre ce qui serait fait sans écrire.", [ex("Essai", "rsync -aH -n --delete /etc/ssh/ /tmp/ssh-copie/", "Liste les actions. Rien n’est modifié.")], ["Relisez les deux chemins avant un --delete sans -n."]),
    sub("-e", "Choisit le transport distant.", "Sans `-e`, la forme `user@hôte:` passe déjà par SSH. `-e ssh` le rend explicite. `-z` compresse pendant le transfert.", [ex("Vers une machine", "rsync -aH ./site/ user@hote:/var/www/site/", "Passe par SSH. Le slash final copie le contenu.")]),
  ]},
  tree: { subcommands: [
    sub("-L", "Limite la profondeur.", "`tree` dessine l’arborescence. `-L 2` ne descend pas plus bas. Le paquet n’est pas dans les installations minimales.", [ex("Deux niveaux", "tree -L 2 /etc/ssh", "La structure, sans aller plus loin.")]),
    sub("-d", "Ne montre que les répertoires.", "`-a` ajoute les noms cachés. `-h` ajoute les tailles. `tree` ne modifie rien.", [ex("Répertoires", "tree -d /etc", "La structure, sans les fichiers.")]),
  ]},
  rename: { subcommands: [
    sub("perl", "Expression Perl, sur Debian et Ubuntu.", "Le `rename` du paquet Perl applique `s/ancien/nouveau/`. Ailleurs, `rename` vient d’util-linux et remplace une sous-chaîne. Un script qui appelle `rename` n’est pas portable.", [ex("Suffixe, famille Debian", "rename 's/\\.bak$//' *.bak", "Retire .bak. C’est le rename Perl.")]),
    sub("util-linux", "Remplace une sous-chaîne dans les noms.", "Sur Red Hat, SUSE et Arch, `rename .bak .txt *.bak` remplace la première occurrence. `-n` ou `--dry-run`, selon la version, montre sans renommer : vérifiez `--help`.", [ex("Sous-chaîne", "rename .bak .txt *.bak", "Remplace .bak par .txt dans chaque nom.")]),
  ]},
  shred: { subcommands: [
    sub("-u", "Écrase le contenu puis supprime le nom.", "`shred` réécrit un fichier régulier. Sur un SSD ou un système à copie sur écriture, les blocs réécrits ne sont souvent pas ceux d’origine.", [ex("Écraser et supprimer", "shred -u /tmp/secret.txt", "Le fichier doit exister et être régulier.")], ["shred ne garantit pas l’effacement sur SSD, ni s’il reste un instantané ou un lien dur."]),
    sub("-n", "Choisit le nombre de passages.", "Le défaut est plusieurs passages. `-n 1` n’en fait qu’un. `-z` termine par des zéros pour masquer le fait que le fichier a été broyé.", [ex("Un passage puis des zéros", "shred -n 1 -z /tmp/secret.txt", "Réécrit une fois, puis met des zéros. Le nom reste.")]),
  ]},
};
