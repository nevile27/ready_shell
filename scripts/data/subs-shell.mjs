const ex = (title, command, comment) => ({ title, command, comment });
const sub = (name, summary, explanation, examples) => ({ name, summary, explanation, examples });

export const patches = {
  declare: {
    subcommands: [
      sub("-a", "Crée un tableau indexé.", "`declare -a` réserve un tableau bash. `ports[0]` est le premier élément. Dans une fonction, `declare` rend la variable locale. Dash n’a ni `declare` ni les tableaux.", [ex("Tableau", "declare -a ports=(22 80 443)", "ports[0] vaut 22.")]),
      sub("-A", "Crée un tableau associatif.", "`declare -A` indexe par des chaînes, pas par des nombres. C’est du bash. `declare -p nom` montre le type et la valeur.", [ex("Associatif", "declare -A couleur=([ok]=vert [err]=rouge)", "couleur[ok] vaut vert.")]),
      sub("-r", "Rend la variable constante.", "`-r` interdit la réaffectation. `-x` exporte en même temps si on l’ajoute. `declare -p` relit la déclaration.", [ex("Constante", "declare -rx APP_ENV=production", "Empêche la réaffectation et publie la variable.")]),
    ],
  },
  bash: {
    subcommands: [
      sub("--version", "Affiche la version de bash.", "`bash --version` écrit la version et la licence. Cela ne dit pas ce que pointe `/bin/sh`. Sur Debian et Ubuntu, `/bin/sh` est dash.", [ex("Version", "bash --version", "La première ligne porte le numéro de version.")]),
      sub("-c", "Exécute une chaîne, puis quitte.", "`bash -c` lance les commandes passées en argument dans un bash, même si le shell courant est un autre. Les quotes simples empêchent le shell actuel de les interpréter.", [ex("Une commande", "bash -c 'printf \"%s\\n\" \"$BASH_VERSION\"'", "Affiche la version du bash lancé, pas celle du shell parent.")]),
      sub("-l", "Démarre un shell de connexion.", "`bash -l` lit les fichiers de connexion, `/etc/profile` puis `~/.bash_profile`. Un shell ordinaire lit plutôt `~/.bashrc`. Utile pour vérifier ce qu’une nouvelle session charge.", [ex("Connexion", "bash -l", "Ouvre un bash de connexion. exit revient au shell précédent.")]),
      sub("-x", "Trace chaque commande avant de l’exécuter.", "`bash -x script` écrit les commandes développées sur l’erreur. On voit les valeurs des variables. Le script s’exécute vraiment.", [ex("Tracer un script", "bash -x script.sh", "Chaque ligne précède son exécution, avec un signe +.")]),
    ],
  },
  sh: {
    subcommands: [
      sub("-c", "Exécute une chaîne avec le /bin/sh du système.", "`sh -c` passe par le shell POSIX de la famille : dash sur Debian et Ubuntu, bash sur Red Hat, SUSE et Arch, ash sur Alpine.", [ex("Fragment POSIX", "sh -c 'printf \"%s\\n\" \"$HOME\"'", "Utilise /bin/sh, pas forcément bash.")]),
      sub("-n", "Vérifie la syntaxe sans exécuter.", "`sh -n fichier` refuse les constructions que ce shell ne connaît pas. Sur Debian, cela détecte ce qui casserait dans un script `#!/bin/sh`.", [ex("Contrôle", "sh -n script.sh", "Aucune sortie et un code 0 si la syntaxe est acceptable.")]),
    ],
  },
  dash: {
    subcommands: [
      sub("-n", "Vérifie un script comme le ferait /bin/sh Debian.", "`dash -n` contrôle la syntaxe POSIX sans lancer le script. C’est le test utile avant un shebang `#!/bin/sh` sur Debian ou Ubuntu.", [ex("Syntaxe", "dash -n script.sh", "Signale les constructions que dash refuse.")]),
      sub("-c", "Exécute une chaîne avec dash.", "`dash -c` ne charge pas les extensions de bash. Un tableau ou `[[` y échoue.", [ex("Chaîne", "dash -c 'echo ok'", "Écrit ok. Les options de echo restent celles de dash.")]),
    ],
  },
  ash: {
    subcommands: [
      sub("-n", "Vérifie la syntaxe sans lancer le script.", "`ash -n` est le contrôle du `/bin/sh` d’Alpine. Les constructions propres à bash sont refusées.", [ex("Contrôle", "ash -n script.sh", "Code 0 si ash accepterait le fichier.")]),
      sub("-c", "Exécute une chaîne dans ash.", "`ash -c` lance BusyBox ash, le shell des images Alpine minimales.", [ex("Chaîne", "ash -c 'echo ok'", "Écrit ok via l’applet ash.")]),
    ],
  },
  zsh: {
    subcommands: [
      sub("--version", "Affiche la version de zsh.", "`zsh --version` échoue si le paquet n’est pas installé. zsh n’est le shell par défaut d’aucune des cinq familles.", [ex("Version", "zsh --version", "Une ligne avec le numéro.")]),
      sub("-c", "Exécute une chaîne zsh.", "`zsh -c` interprète le langage zsh, pas celui de sh. Le shebang d’un script zsh doit demander zsh explicitement.", [ex("Chaîne", "zsh -c 'print -l $ZSH_VERSION'", "Écrit la version de ce zsh.")]),
      sub("-l", "Ouvre un zsh de connexion.", "`zsh -l` lit les fichiers de connexion zsh. Le shell déjà ouvert ne change pas : il faut une nouvelle session, ou `chsh`.", [ex("Connexion", "zsh -l", "exit revient au shell précédent.")]),
    ],
  },
  cd: {
    subcommands: [
      sub("-", "Revient au répertoire précédent.", "`cd -` échange le répertoire courant et l’ancien, puis affiche le nouveau chemin. `OLDPWD` mémorise cet ancien chemin.", [ex("Aller-retour", "cd /tmp && cd -", "Revient au répertoire d’où vous veniez et l’affiche.")]),
      sub("-P", "Résout les liens symboliques.", "`cd -P` entre dans le répertoire réel. `-L`, le défaut, conserve le chemin logique. `pwd -P` montre ensuite le chemin physique.", [ex("Chemin physique", "cd -P /bin", "Si /bin est un lien, le shell se place sur la cible.")]),
    ],
  },
  pwd: {
    subcommands: [
      sub("-L", "Affiche le chemin logique, liens compris.", "`pwd -L` est le défaut : le chemin tel que les `cd` successifs l’ont construit, sans résoudre les liens.", [ex("Chemin logique", "pwd -L", "Le chemin que le shell retient.")]),
      sub("-P", "Affiche le chemin physique.", "`pwd -P` résout tous les liens symboliques. Utile pour savoir sur quel répertoire réel on écrit.", [ex("Chemin réel", "pwd -P", "Plus aucun lien dans le résultat.")]),
    ],
  },
  echo: {
    subcommands: [
      sub("-n", "N’ajoute pas de saut de ligne.", "`echo -n` laisse le curseur en fin de texte. Dash, bash et ash ne traitent pas `-n` de la même façon. Pour un script, `printf` est fiable.", [ex("Sans saut", "printf '%s' \"suite\"", "Forme portable. echo -n n’est pas identique partout.")]),
      sub("-e", "Interprète les séquences chez certains bash.", "`echo -e` comprend `\\n` dans bash, pas dans dash. Un script POSIX utilise `printf '%s\\n'`.", [ex("Saut de ligne fiable", "printf '%s\\n' \"une\" \"deux\"", "Deux lignes, quel que soit le /bin/sh.")]),
    ],
  },
  printf: {
    subcommands: [
      sub("%s", "Écrit une chaîne telle quelle.", "`%s` ne donne aucun sens spécial aux caractères du texte. `\\n` dans le format, entre quotes simples, ajoute un saut de ligne.", [ex("Une ligne", "printf '%s\\n' \"$USER\"", "Le nom d’utilisateur, puis un saut de ligne.")]),
      sub("%d", "Écrit un entier.", "`%d` formate un nombre. Un texte non numérique vaut souvent 0, avec un message sur l’erreur selon le shell.", [ex("Entier", "printf '%d\\n' 42", "Écrit 42.")]),
      sub("%q", "Échappe une chaîne pour la relire dans bash.", "`%q` est une extension bash. Elle produit une forme que le shell peut relire. Dash ne la connaît pas.", [ex("Échappement bash", "printf '%q\\n' \"a b\"", "Écrit une forme quotée, par exemple a\\ b.")]),
    ],
  },
  read: {
    subcommands: [
      sub("-r", "Ne touche pas aux contre-obliques.", "`read -r` range la ligne telle qu’elle est tapée. Sans `-r`, une contre-oblique mange le caractère suivant, y compris le saut de ligne.", [ex("Ligne brute", "read -r ligne", "Attend une ligne et la range dans ligne.")]),
      sub("-p", "Affiche une invite, en bash.", "`read -p` écrit le texte avant de lire. C’est du bash : dash et ash n’ont pas `-p`. L’invite portable s’écrit avec `printf`, puis `read -r`.", [ex("Invite bash", "read -r -p \"Nom : \" nom", "Affiche Nom : et range la réponse dans nom.")]),
      sub("-s", "Ne montre pas la frappe.", "`read -s` coupe l’écho, pour un mot de passe. C’est une extension bash. Le secret reste dans la variable du shell : ne l’exportez pas.", [ex("Secret", "read -r -s -p \"Mot de passe : \" secret", "La frappe n’apparaît pas. Le shell garde secret.")]),
    ],
  },
  export: {
    subcommands: [
      sub("-p", "Liste les variables déjà publiées.", "`export -p` écrit des déclarations que l’on peut relire. Chaque ligne est une variable que les commandes suivantes héritent.", [ex("Lister", "export -p", "Une déclaration export par variable publiée.")]),
      sub("-n", "Retire une variable de l’environnement.", "`export -n` garde la variable dans le shell mais ne la transmet plus aux enfants. `unset` la supprime complètement.", [ex("Ne plus transmettre", "export -n http_proxy", "Les prochaines commandes ne voient plus http_proxy.")]),
    ],
  },
  unset: {
    subcommands: [
      sub("-v", "Efface une variable.", "`unset -v` vise une variable, même si une fonction porte le même nom. Une variable exportée disparaît aussi de l’environnement.", [ex("Variable", "unset -v http_proxy", "http_proxy n’existe plus dans ce shell.")]),
      sub("-f", "Efface une fonction.", "`unset -f` retire une fonction définie dans le shell. Un alias du même nom n’est pas concerné : c’est `unalias`.", [ex("Fonction", "unset -f ll", "La fonction ll disparaît.")]),
    ],
  },
  alias: {
    subcommands: [
      sub("liste", "Affiche les alias du shell.", "Sans argument, `alias` écrit les raccourcis déjà définis. Un script ne les développe pas, sauf option explicite du shell.", [ex("Voir", "alias", "Une ligne nom=valeur par raccourci.")]),
      sub("définition", "Crée un raccourci de session.", "`alias nom='commande'` remplace nom par commande au prompt. Pour quelque chose qui doit exister dans les scripts, une fonction est plus claire.", [ex("Raccourci", "alias ll='ls -la'", "Au prompt, ll se développe en ls -la.")]),
    ],
  },
  type: {
    subcommands: [
      sub("-t", "Répond par un seul mot : alias, function, builtin ou file.", "`type -t` est fait pour un script bash. Dash, le `/bin/sh` de Debian, n’a pas `type` : utilisez `command -v`.", [ex("Sorte", "type -t ls", "Écrit file si ls est un binaire.")]),
      sub("-a", "Montre toutes les définitions, dans l’ordre de recherche.", "`type -a` révèle un alias qui cache un binaire, ou un builtin et un fichier du même nom.", [ex("Toutes", "type -a time", "Peut montrer le mot réservé du shell et /usr/bin/time.")]),
    ],
  },
  command: {
    subcommands: [
      sub("-v", "Écrit le chemin ou le type retenu.", "`command -v` est le test portable, y compris sous dash et ash. Un code non nul signifie que le nom est introuvable.", [ex("Localiser", "command -v grep", "Écrit /usr/bin/grep, ou le builtin, et renvoie 0 s’il existe.")]),
      sub("-V", "Décrit le nom plus longuement.", "`command -V` ressemble à `type`. Il ignore les alias et les fonctions quand on lance ensuite `command ls`.", [ex("Description", "command -V cd", "Dit que cd est une commande interne.")]),
    ],
  },
  source: {
    subcommands: [
      sub("fichier", "Exécute le fichier dans le shell courant.", "`source fichier` et `. fichier` laissent les variables et les `cd` en place. `source` est un mot de bash. Le point est la forme que dash et ash acceptent.", [ex("Forme portable", ". \"$HOME/.profile\"", "Charge le fichier dans le shell actuel.")]),
    ],
  },
  set: {
    subcommands: [
      sub("-e", "Arrête le script à la première commande en échec.", "`set -e` ne sort pas sur l’échec d’une commande dans un `if`, ni toujours au milieu d’un pipeline. En bash, `set -o pipefail` compte aussi cet échec.", [ex("Mode strict bash", "set -euo pipefail", "Échec immédiat, variable non définie interdite, pipeline strict.")]),
      sub("-u", "Rend une variable non définie fatale.", "`set -u` fait échouer l’expansion d’un nom qui n’existe pas. Cela attrape une faute de frappe avant qu’elle ne devienne une chaîne vide.", [ex("Variable obligatoire", "set -u", "echo \"$inconnue\" échoue ensuite au lieu d’écrire une ligne vide.")]),
      sub("-x", "Trace les commandes de ce shell.", "`set -x` écrit chaque commande développée sur l’erreur. `set +x` arrête la trace.", [ex("Tracer", "set -x", "Les commandes suivantes sont recopiées avant d’être lancées.")]),
      sub("-o", "Active une option nommée.", "`set -o pipefail` fait échouer un pipeline si un maillon échoue. `set -o` sans nom liste les options. `pipefail` n’existe pas dans dash.", [ex("Pipeline strict", "set -o pipefail", "false | true renvoie ensuite un échec.")]),
    ],
  },
  shopt: {
    subcommands: [
      sub("-s", "Active une option bash.", "`shopt -s nullglob` retire les motifs sans correspondance au lieu de les laisser tels quels. `globstar` permet à `**` de descendre dans les sous-répertoires.", [ex("Motif vide", "shopt -s nullglob", "Un *.log qui ne trouve rien devient une liste vide.")]),
      sub("-u", "Désactive une option.", "`shopt -u` remet le comportement précédent. `shopt -p` affiche l’état sous une forme que l’on peut relire.", [ex("État", "shopt -p nullglob", "Écrit shopt -s ou shopt -u selon que l’option est active.")]),
    ],
  },
  history: {
    subcommands: [
      sub("nombre", "Affiche les dernières commandes.", "`history 20` écrit vingt numéros. `!!` répète la précédente, seulement dans un shell interactif.", [ex("Vingt lignes", "history 20", "Les dernières entrées, avec leur numéro.")]),
      sub("-d", "Retire une entrée de la liste en mémoire.", "`history -d numéro` oublie une ligne, par exemple un secret. `history -w` réécrit ensuite le fichier.", [ex("Oublier la dernière", "history -d -1", "Retire la dernière entrée. history -w l’oublie aussi sur disque.")]),
      sub("-w", "Écrit l’historique sur disque.", "`history -w` remplace le fichier `HISTFILE`, en général `~/.bash_history`, par la liste en mémoire.", [ex("Enregistrer", "history -w", "Le fichier d’historique reflète la session.")]),
    ],
  },
  jobs: {
    subcommands: [
      sub("-l", "Ajoute le PID de chaque tâche.", "`jobs -l` montre le numéro de job du shell et le PID. Un autre terminal ne connaît pas ces numéros : ce ne sont pas des identifiants globaux.", [ex("Avec PID", "jobs -l", "Numéro entre crochets, état, PID et commande.")]),
      sub("-p", "N’écrit que les PID.", "`jobs -p` est la forme à passer à une autre commande. Les numéros `%1` restent ceux de `fg` et `bg`.", [ex("PID seuls", "jobs -p", "Un PID par ligne, ou rien s’il n’y a pas de tâche.")]),
    ],
  },
  fg: {
    subcommands: [
      sub("%", "Ramène un numéro de job au premier plan.", "`fg` sans argument reprend la dernière tâche. `fg %2` vise le job 2 de `jobs`. La tâche retrouve le terminal.", [ex("Dernière tâche", "fg", "Rend le terminal à la tâche suspendue ou en arrière-plan.")]),
    ],
  },
  bg: {
    subcommands: [
      sub("%", "Continue en arrière-plan une tâche suspendue.", "Après Ctrl+Z, `bg` relance la tâche sans lui rendre le terminal. `bg %1` vise un numéro. Pour survivre à la fermeture du terminal, `nohup` ou un service conviennent mieux.", [ex("Relancer", "bg", "La tâche suspendue continue. Le prompt revient.")]),
    ],
  },
  wait: {
    subcommands: [
      sub("pid", "Attend un enfant précis.", "`wait` sans argument attend tous les enfants. `wait $!` attend le dernier lancé en arrière-plan. Un PID qui n’est pas un enfant de ce shell ne peut pas être attendu ainsi.", [ex("Dernier arrière-plan", "sleep 1 & wait $!", "Revient quand sleep se termine, avec son code.")]),
      sub("-n", "Revient dès qu’un enfant se termine.", "`wait -n` est du bash. Il est utile quand plusieurs tâches tournent et que l’on veut traiter la première qui finit.", [ex("Le premier fini", "wait -n", "Bloque jusqu’à la fin d’un seul enfant, pas de tous.")]),
    ],
  },
  trap: {
    subcommands: [
      sub("EXIT", "Lance une commande à la fin du shell.", "`trap '…' EXIT` sert à effacer un fichier temporaire quoi qu’il arrive. Le piège vit dans le shell qui l’a posé.", [ex("Nettoyer", "tmp=$(mktemp) && trap 'rm -f \"$tmp\"' EXIT", "Le fichier disparaît quand le shell se termine.")]),
      sub("INT", "Réagit à Ctrl+C.", "`trap '' INT` ignore l’interruption. `trap - INT` rétablit le comportement habituel. `trap 'commande' INT` lance cette commande à la place.", [ex("Ignorer", "trap '' INT", "Ctrl+C ne coupe plus ce shell. trap - INT annule cela.")]),
    ],
  },
  exec: {
    subcommands: [
      sub("commande", "Remplace le shell par un autre programme.", "`exec commande` ne revient pas : le processus du shell devient cette commande. Les scripts s’en servent pour ne pas laisser un shell attendre.", [ex("Devenir un programme", "exec /usr/bin/top", "Quitter top ferme la session s’il n’y avait plus de shell derrière.")]),
      sub("redirection", "Redirige la suite du shell lui-même.", "`exec > fichier` sans commande envoie la sortie du shell courant vers le fichier, pour le reste de la session ou du script.", [ex("Vers un fichier", "exec > \"$HOME/sortie.log\" 2>&1", "La sortie et l’erreur suivantes vont dans le fichier.")]),
    ],
  },
  eval: {
    subcommands: [
      sub("chaîne", "Réinterprète le texte comme du code.", "`eval` exécute ses arguments. Toute donnée reçue qui y passe devient du code. On s’en passe presque toujours.", [ex("Affectation contrôlée", "eval \"$(printf '%s' 'msg=bonjour')\"", "Uniquement si la chaîne est produite par vous et ne contient qu’une affectation.")]),
    ],
  },
  exit: {
    subcommands: [
      sub("code", "Termine le shell avec un code de retour.", "`exit 0` annonce la réussite, `exit 1` un échec. Sans nombre, `exit` reprend le code de la dernière commande. Dans une fonction sourcée, `exit` quitte aussi le shell appelant.", [ex("Échec", "exit 1", "Le script ou le shell s’arrête avec le code 1.")]),
    ],
  },
  test: {
    subcommands: [
      sub("-f", "Vrai si le chemin est un fichier régulier.", "`test -f` et `[ -f fichier ]` sont la même commande. Les espaces autour des crochets sont obligatoires. Le nom se met entre guillemets.", [ex("Fichier", "[ -f /etc/os-release ] && printf '%s\\n' présent", "Le message n’apparaît que si le fichier existe.")]),
      sub("-d", "Vrai si le chemin est un répertoire.", "`-d` sert avant un `cd` ou un parcours. `-e` se contente de l’existence, quel que soit le type. `-L` reconnaît un lien symbolique.", [ex("Répertoire", "[ -d /tmp ]", "Code 0 si /tmp est un répertoire. Rien ne s’affiche.")]),
      sub("-n", "Vrai si la chaîne n’est pas vide.", "`-n` teste le contenu. `-z` teste le vide. Sans guillemets, une valeur qui contient des espaces casse le test.", [ex("Chaîne", "test -n \"$USER\"", "Réussit si USER contient quelque chose.")]),
    ],
  },
  ulimit: {
    subcommands: [
      sub("-a", "Affiche toutes les limites du shell.", "`ulimit -a` liste fichiers ouverts, processus, taille des fichiers et mémoire. `-H` est le plafond dur, `-S` la limite souple.", [ex("Tout voir", "ulimit -a", "Une limite par ligne, pour ce shell.")]),
      sub("-n", "Nombre de fichiers ouverts.", "`ulimit -n` lit la limite. `ulimit -n 4096` la relève pour les commandes suivantes, sans dépasser le plafond dur. Ce n’est pas un réglage permanent.", [ex("Lire", "ulimit -n", "Le nombre de descripteurs autorisés.")]),
      sub("-u", "Nombre de processus.", "`ulimit -u` borne combien de processus l’utilisateur peut lancer depuis ce shell. Les enfants héritent de la limite.", [ex("Lire", "ulimit -u", "Le plafond de processus de cet utilisateur.")]),
    ],
  },
  umask: {
    subcommands: [
      sub("-S", "Affiche le masque en droits accordés.", "`umask -S` écrit une forme `u=rwx,g=rx,o=rx`. Sans `-S`, la sortie est l’octal des droits retirés, souvent 0022.", [ex("Forme lisible", "umask -S", "Les droits que recevront les nouveaux fichiers et répertoires.")]),
      sub("octal", "Pose le masque pour la suite du shell.", "`umask 022` retire l’écriture au groupe et aux autres. `umask 077` ne laisse les nouveaux fichiers qu’au propriétaire. Les fichiers déjà là ne changent pas.", [ex("Fichiers privés", "umask 077", "Jusqu’à la fin du shell, les créations sont privées.")]),
    ],
  },
  pushd: {
    subcommands: [
      sub("répertoire", "Empile le répertoire courant et s’y déplace.", "`pushd /tmp` enregistre l’ancien chemin. `popd` revient. `dirs -v` montre la pile. Dash et ash n’ont pas `pushd`.", [ex("Aller voir", "pushd /var/log", "Affiche la pile. popd revient.")]),
      sub("+N", "Fait tourner la pile.", "`pushd +1` ramène le premier répertoire empilé en haut et s’y place. `dirs -c` vide la pile.", [ex("Voir la pile", "dirs -v", "Numérote les répertoires empilés.")]),
    ],
  },
  popd: {
    subcommands: [
      sub("sommet", "Revient au répertoire empilé dessous.", "`popd` retire le sommet et s’y place. Sans `pushd` préalable, il échoue.", [ex("Revenir", "popd", "Quitte le répertoire courant pour celui d’en dessous.")]),
      sub("+N", "Retire une entrée sans forcément s’y déplacer.", "`popd +N` enlève l’entrée N de la pile. Les numéros sont ceux de `dirs -v`.", [ex("Retirer une entrée", "popd +1", "La pile perd cet étage. Le répertoire courant peut rester le même.")]),
    ],
  },
  help: {
    subcommands: [
      sub("nom", "Aide de bash sur une commande interne.", "`help cd` décrit le builtin. `man cd` peut montrer autre chose, ou rien. Dash n’a pas `help`.", [ex("Aide sur cd", "help cd", "Les options de la commande interne cd.")]),
      sub("-d", "Une seule ligne de description.", "`help -d nom` tient en une ligne. `help -s` ne garde que la syntaxe. Sans argument, `help` liste les sujets.", [ex("Résumé", "help -d cd", "Une phrase, pas le texte complet.")]),
    ],
  },
  env: {
    subcommands: [
      sub("liste", "Écrit l’environnement du processus.", "Sans argument, `env` montre une variable par ligne, sous la forme NOM=valeur. Ce sont celles que les commandes lancées ensuite héritent.", [ex("Lister", "env", "NOM=valeur, une par ligne.")]),
      sub("-u", "Retire une variable pour une seule commande.", "`env -u VAR commande` lance commande sans cette variable. Le shell, lui, la garde.", [ex("Sans proxy", "env -u http_proxy curl https://example.com", "curl ne voit pas http_proxy. Le shell le garde.")]),
      sub("-i", "Démarre avec un environnement vide.", "`env -i commande` ne transmet rien, sauf ce que l’on redonne ensuite sous la forme NOM=valeur.", [ex("Environnement minimal", "env -i PATH=/usr/bin ls", "ls ne voit que PATH, pas le reste de la session.")]),
    ],
  },
  timeout: {
    subcommands: [
      sub("durée", "Envoie SIGTERM si la commande dépasse le délai.", "`timeout 10s commande` s’arrête au bout de dix secondes. Le code 124 signifie que le délai a été atteint. Un nombre seul est lu en secondes.", [ex("Borner", "timeout 5s ping -c 10 127.0.0.1", "ping s’arrête à cinq secondes même s’il n’a pas fini.")]),
      sub("--kill-after", "Ajoute un SIGKILL si le processus ignore le premier signal.", "`--kill-after` attend encore après le SIGTERM. Utile pour une commande qui attrape le premier signal et ne sort pas.", [ex("Forcer ensuite", "timeout --kill-after=3s 10s sleep 30", "SIGTERM à dix secondes, puis SIGKILL trois secondes plus tard.")]),
      sub("--signal", "Choisit le signal envoyé au délai.", "Par défaut c’est TERM. `--signal=HUP` en envoie un autre. Le nom se donne sans le préfixe SIG.", [ex("SIGHUP", "timeout --signal=HUP 5s sleep 30", "Au bout de cinq secondes, sleep reçoit HUP.")]),
    ],
  },
  watch: {
    subcommands: [
      sub("-n", "Répète la commande à cet intervalle, en secondes.", "`watch -n 2 commande` rafraîchit l’écran toutes les deux secondes. Ctrl+C arrête. La commande est relue par un shell à chaque tour.", [ex("Espace disque", "watch -n 5 df -h", "Réaffiche df toutes les cinq secondes.")]),
      sub("-d", "Surligne ce qui a changé depuis le tour précédent.", "`-d` met en évidence les différences. `-g` quitte dès que la sortie change, au lieu de continuer.", [ex("Différences", "watch -d -n 1 'ss -s'", "Surligne les compteurs de sockets qui bougent.")]),
    ],
  },
  nohup: {
    subcommands: [
      sub("commande", "Ignore la fermeture du terminal.", "`nohup commande &` lance en arrière-plan et ignore SIGHUP. Sans redirection, la sortie va dans `nohup.out`. Un service systemd ou OpenRC est plus durable qu’un nohup.", [ex("Avec journal", "nohup ./long.sh > long.log 2>&1 &", "Sortie dans long.log. Le processus survit à la fermeture du terminal.")]),
    ],
  },
  time: {
    subcommands: [
      sub("builtin", "Mesure avec le mot réservé du shell.", "Dans bash, `time commande` mesure même un pipeline. Le temps se sépare en réel, utilisateur et système. `type -a time` dit si le builtin cache le binaire.", [ex("Mesure", "time sleep 1", "Affiche le temps réel, proche d’une seconde.")]),
      sub("-v", "Rapport détaillé du binaire /usr/bin/time.", "`/usr/bin/time -v` ajoute mémoire et changements de contexte. Le paquet `time` doit être installé. Ce n’est pas le même programme que le mot réservé.", [ex("Détail", "/usr/bin/time -v sleep 1", "Plusieurs lignes de statistiques, pas seulement trois temps.")]),
    ],
  },
  xargs: {
    subcommands: [
      sub("-0", "Lit des noms séparés par un octet nul.", "`xargs -0` se couple à `find -print0`. Sans `-0`, un espace dans un nom coupe la liste.", [ex("Noms sûrs", "find /tmp -name '*.bak' -print0 | xargs -0 rm -f", "Les espaces ne sont plus des séparateurs.")]),
      sub("-n", "Limite le nombre d’arguments par lancement.", "`-n 1` lance la commande une fois par mot. Sans `-n`, xargs groupe autant d’arguments que la ligne le permet.", [ex("Un par un", "printf '%s\\n' a b | xargs -n 1 printf 'élément %s\\n'", "Deux lancements de printf.")]),
      sub("-P", "Lance plusieurs processus en parallèle.", "`-P` est la version GNU. `-P 4` autorise quatre commandes à la fois. L’ordre des sorties n’est plus celui de l’entrée.", [ex("Quatre à la fois", "printf '%s\\n' a b c d | xargs -P 4 -n 1 sleep", "Jusqu’à quatre sleep simultanés. Chacun reçoit un argument.")]),
    ],
  },
  which: {
    subcommands: [
      sub("-a", "Montre tous les exécutables de ce nom dans PATH.", "`which -a` ne voit pas toujours les alias. Dans un script, `command -v` est le test portable. Sur Arch, `which` n’est pas dans le groupe base.", [ex("Toutes les correspondances", "which -a grep", "Un chemin par ligne, dans l’ordre de PATH.")]),
    ],
  },
  whereis: {
    subcommands: [
      sub("-b", "Ne cherche que le binaire.", "`whereis` regarde une liste de répertoires connus, pas tout PATH. `-b` ignore les pages de manuel et les sources.", [ex("Binaire", "whereis -b ls", "Le chemin du programme, s’il est dans les répertoires prévus.")]),
      sub("-m", "Ne cherche que le manuel.", "`-m` dit si une page de manuel est installée à côté du nom. `-s` vise les sources.", [ex("Manuel", "whereis -m ls", "Le chemin de la page, par exemple dans /usr/share/man.")]),
    ],
  },
  clear: {
    subcommands: [
      sub("écran", "Vide la zone visible du terminal.", "`clear` envoie la séquence qui efface l’affichage. L’historique de défilement de l’émulateur peut garder les lignes plus haut. `reset` va plus loin si le terminal est déréglé.", [ex("Effacer", "clear", "Le prompt revient en haut de la zone visible.")]),
    ],
  },
  tput: {
    subcommands: [
      sub("cols", "Écrit le nombre de colonnes.", "`tput cols` et `tput lines` lisent la taille du terminal. Les scripts s’en servent au lieu d’envoyer des séquences brutes.", [ex("Largeur", "tput cols", "Un nombre, par exemple 120.")]),
      sub("setaf", "Choisit une couleur d’avant-plan.", "`tput setaf 2` passe au vert sur beaucoup de terminaux. `tput sgr0` revient au style normal. `tput reset` réinitialise un terminal illisible.", [ex("Remettre à zéro", "tput sgr0", "Annule couleur et gras pour la suite.")]),
    ],
  },
  stty: {
    subcommands: [
      sub("-a", "Affiche les réglages de la ligne.", "`stty -a` montre taille, vitesse et caractères de contrôle : interruption, effacement, suspension.", [ex("Réglages", "stty -a", "Une description du terminal attaché à ce processus.")]),
      sub("sane", "Remet des réglages utilisables.", "`stty sane` répare une ligne sans écho ou sans retour chariot. On peut le taper à l’aveugle. `reset` est plus complet.", [ex("Réparer", "stty sane", "Le terminal redevient utilisable.")]),
    ],
  },
  reset: {
    subcommands: [
      sub("terminal", "Réinitialise complètement le terminal.", "`reset` envoie une initialisation complète, après un programme qui a laissé le terminal en mode brut. C’est plus énergique que `clear`.", [ex("Réinitialiser", "reset", "Le prompt revient dans un mode normal.")]),
    ],
  },
  uname: {
    subcommands: [
      sub("-r", "Version du noyau en cours d’exécution.", "`uname -r` n’est pas la version de la distribution. Celle-ci est dans `/etc/os-release`.", [ex("Noyau", "uname -r", "Par exemple 7.0.0, le noyau qui tourne.")]),
      sub("-m", "Architecture matérielle.", "`uname -m` écrit x86_64 ou aarch64. `-s` est le nom du système, en pratique Linux. `-a` rassemble le tout.", [ex("Architecture", "uname -m", "L’architecture pour laquelle les paquets doivent être construits.")]),
    ],
  },
  date: {
    subcommands: [
      sub("+format", "Écrit la date selon un format.", "Le format suit un `+`. `%Y-%m-%d` est l’année, le mois et le jour. `%H:%M:%S` est l’heure. Les quotes protègent les espaces.", [ex("Jour", "date +%F", "Écrit 2026-11-08, ou la date du jour.")]),
      sub("-u", "Affiche l’heure UTC.", "`date -u` ignore le fuseau local. On l’associe à un format pour un horodatage d’échange.", [ex("UTC", "date -u +%Y-%m-%dT%H:%M:%SZ", "Un instant en UTC, avec le suffixe Z.")]),
      sub("-d", "Calcule une date, version GNU.", "`date -d yesterday` est une extension GNU. L’applet BusyBox d’Alpine ne l’a pas sans le paquet coreutils. `-s` règle l’horloge et demande l’administrateur.", [ex("Veille", "date -d yesterday +%F", "La date de la veille. Réservé aux coreutils GNU.")]),
    ],
  },
  sleep: {
    subcommands: [
      sub("secondes", "Attend un nombre de secondes.", "`sleep 5` bloque cinq secondes. Un suffixe `s`, `m`, `h` ou `d` précise l’unité sur coreutils et sur la plupart des BusyBox.", [ex("Deux secondes", "sleep 2", "Rend la main ensuite. Le code est 0.")]),
      sub("durée", "Attend avec une unité explicite.", "`sleep 1m` attend une minute. `sleep 0.5` demande une demi-seconde là où l’implémentation accepte les décimales.", [ex("Une minute", "sleep 1m", "Le suffixe m est accepté par coreutils et par BusyBox.")]),
    ],
  },
};
