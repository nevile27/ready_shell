const ex = (title, command, comment) => ({ title, command, comment });
const sub = (name, summary, explanation, examples) => ({ name, summary, explanation, examples });

export const patches = {
  ps: { subcommands: [
    sub("aux", "Liste tout le monde, syntaxe BSD.", "`ps aux` montre l’utilisateur, le CPU, la mémoire et la commande. La sortie n’est pas un format stable pour un script.", [ex("Tout voir", "ps aux", "Une ligne par processus.")]),
    sub("-ef", "Liste tout le monde, syntaxe System V.", "`ps -ef` montre le PID, le PPID et l’heure de départ. `-o` choisit les colonnes : `ps -eo pid,user,cmd`.", [ex("Colonnes", "ps -eo pid,user,ni,cmd", "PID, utilisateur, politesse et commande.")]),
  ]},
  top: { subcommands: [
    sub("-b", "Un instantané en texte, sans l’écran interactif.", "`-b -n 1` écrit une fois et s’arrête. Dans l’écran, `P` trie par CPU, `M` par mémoire, `q` quitte.", [ex("Une passe", "top -b -n 1 | head -n 20", "Les premières lignes, puis la commande s’arrête.")]),
    sub("-p", "Ne suit qu’un PID.", "`-p` répète le PID pour en suivre plusieurs. `-u` limite à un utilisateur. `-d` change le délai entre deux rafraîchissements.", [ex("Un processus", "top -p 1", "Suit PID 1. q quitte.")]),
  ]},
  kill: { subcommands: [
    sub("TERM", "Demande l’arrêt propre.", "`kill PID` envoie SIGTERM. On commence par là. `-l` liste les noms. Le shell a aussi un kill interne, capable de viser `%1`.", [ex("Demander", "kill 1234", "Remplacez 1234 par un PID vu dans ps.")]),
    sub("-9", "SIGKILL, que le processus ne peut pas ignorer.", "`kill -9` ne laisse pas le temps de fermer les fichiers. C’est un dernier recours, après un TERM resté sans effet.", [ex("Forcer", "kill -9 1234", "Le processus disparaît sans nettoyage.")]),
  ]},
  killall: { subcommands: [
    sub("nom", "Envoie SIGTERM à tous les processus de ce nom.", "`killall` vise le nom de commande, pas un motif. `-u` limite à un utilisateur. Vérifiez avec `pgrep` avant.", [ex("Arrêter sleep", "killall sleep", "SIGTERM à chaque processus nommé sleep.")]),
    sub("-i", "Demande confirmation, version GNU.", "`-i` interroge pour chaque processus. `-s` choisit le signal. Le killall de certains Unix arrêtait tout : ce n’est pas celui-ci.", [ex("Confirmer", "killall -i sleep", "Demande avant d’envoyer le signal.")]),
  ]},
  pkill: { subcommands: [
    sub("-x", "Exige le nom exact.", "`pkill` envoie SIGTERM aux processus choisis comme `pgrep`. `-x` évite qu’un préfixe ne suffise. `-u` limite à un utilisateur.", [ex("Nom exact", "pkill -x sleep", "Seulement les processus qui s’appellent sleep.")]),
    sub("-f", "Compare à la ligne de commande complète.", "Sans `-f`, seul le nom court est vu. Le motif est une expression rationnelle.", [ex("Ligne complète", "pkill -f 'sleep 30'", "Vise les commandes dont la ligne contient sleep 30.")]),
  ]},
  pgrep: { subcommands: [
    sub("-a", "Ajoute la ligne de commande au PID.", "`pgrep` écrit un PID par ligne. Le code 0 signifie qu’au moins un processus correspond. `-u` filtre, `-x` exige l’égalité.", [ex("Avec la commande", "pgrep -a sshd", "PID et ligne de commande.")]),
    sub("-f", "Cherche dans la ligne complète.", "`-f` voit les arguments, pas seulement le nom du binaire. `-c` ne garde que le nombre.", [ex("Compter", "pgrep -c sshd", "Un nombre, ou 0 si personne ne correspond.")]),
  ]},
  pidof: { subcommands: [
    sub("nom", "Écrit les PID sur une seule ligne.", "`pidof` n’interprète pas le nom comme une expression, contrairement à `pgrep`. `-s` n’en garde qu’un.", [ex("Une ligne", "pidof sshd", "Plusieurs numéros séparés par des espaces, ou rien.")]),
  ]},
  pstree: { subcommands: [
    sub("-p", "Ajoute les PID dans l’arbre.", "`pstree` part de PID 1 et montre qui a lancé qui. `-u` ajoute les utilisateurs. `-s PID` ne garde que les ancêtres.", [ex("Avec PID", "pstree -p", "Les numéros entre parenthèses.")]),
  ]},
  uptime: { subcommands: [
    sub("charge", "Durée depuis le démarrage et charge moyenne.", "La charge compte les processus prêts ou bloqués sur le disque, sur 1, 5 et 15 minutes. Ce n’est pas un pourcentage de CPU.", [ex("Résumé", "uptime", "Heure, durée, utilisateurs et charge.")]),
    sub("-p", "Écrit la durée en mots, version procps.", "`-p` donne « up 3 days ». BusyBox peut ignorer cette option. `-s` écrit la date de démarrage.", [ex("En mots", "uptime -p", "La durée seulement, si procps fournit -p.")]),
  ]},
  free: { subcommands: [
    sub("-h", "Mémoire et swap en unités lisibles.", "La colonne available, sur procps, dit ce qui peut encore servir. Le cache n’est pas de la mémoire perdue.", [ex("Lisible", "free -h", "Regardez available plutôt que la seule colonne free.")]),
    sub("-m", "Nombres entiers en mébioctets.", "`-g` arrondit en gibioctets, trop gros pour comparer. `-s 2` répète la mesure toutes les deux secondes.", [ex("Mégioctets", "free -m", "Des entiers, plus stables à comparer.")]),
  ]},
  vmstat: { subcommands: [
    sub("intervalle", "Une ligne de compteurs à chaque intervalle.", "La première ligne est une moyenne depuis le démarrage. `si` et `so` sont les échanges avec le swap. `wa` est l’attente des disques.", [ex("Trois mesures", "vmstat 2 3", "Une moyenne, puis deux intervalles de deux secondes.")]),
    sub("-s", "Compteurs cumulés depuis le démarrage.", "`-s` écrit une liste, pas un tableau. `-d` détaille les disques. Le nom des processus, c’est `ps` ou `top`.", [ex("Liste", "vmstat -s", "Mémoire, swap et CPU depuis le boot.")]),
  ]},
  iostat: { subcommands: [
    sub("-x", "Statistiques étendues des disques.", "`iostat -xz 2` répète toutes les deux secondes. La première mesure est une moyenne depuis le démarrage : regardez la suivante. Le paquet est sysstat.", [ex("Deux échantillons", "iostat -xz 2 2", "La seconde ligne porte sur les deux dernières secondes.")]),
  ]},
  lsof: { subcommands: [
    sub("-i", "Qui utilise un port.", "`lsof -i :22` montre les processus sur le port 22. `-p PID` limite à un processus. Un fichier supprimé encore ouvert apparaît avec (deleted).", [ex("Port 22", "sudo lsof -i :22", "Les processus SSH liés à ce port.")]),
    sub("+D", "Qui a un fichier ouvert sous un répertoire.", "`+D` parcourt le répertoire. `fuser` est plus direct pour un point de montage occupé.", [ex("Un PID", "sudo lsof -p 1", "Tout ce que le processus 1 garde ouvert.")]),
  ]},
  fuser: { subcommands: [
    sub("-v", "Détaille qui utilise un fichier ou un montage.", "`fuser -vm /mnt` liste les PID. `-k` leur envoie SIGKILL : on regarde d’abord sans `-k`. Utile quand `umount` dit que la cible est occupée.", [ex("Qui bloque", "sudo fuser -vm /mnt", "Les PID. Ne tue rien.")]),
    sub("-k", "Envoie un signal aux processus trouvés.", "Le signal par défaut de `-k` est SIGKILL. `-TERM` est plus doux si la version l’accepte. Identifiez les PID avant.", [ex("Port", "sudo fuser -v 22/tcp", "Montre le processus. ss -lpt fait le même travail.")]),
  ]},
  nice: { subcommands: [
    sub("-n", "Lance une commande avec une autre politesse CPU.", "Le nombre va de -20, le plus favorisé, à 19, le plus effacé. Sans `-n`, `nice` ajoute 10. Un utilisateur ordinaire ne peut que s’effacer.", [ex("Discret", "nice -n 19 ./index.sh", "Ne prend du CPU que si personne d’autre n’en veut.")]),
  ]},
  renice: { subcommands: [
    sub("-n", "Change la politesse d’un PID déjà lancé.", "`-p` désigne le PID, `-u` un utilisateur. Le changement dure jusqu’à la fin du processus. On ne peut pas se favoriser sans être administrateur.", [ex("Un PID", "renice -n 10 -p 1234", "Remplacez 1234 par un PID à vous.")]),
  ]},
  pmap: { subcommands: [
    sub("-x", "Ajoute la taille résidente de chaque zone.", "`pmap` lit `/proc/PID/maps`. Il faut le droit de lire ce fichier. Relancez-le pour comparer : ce n’est pas un suivi continu.", [ex("PID 1", "sudo pmap -x 1", "Code, bibliothèques, tas et pile.")]),
  ]},
  id: { subcommands: [
    sub("-u", "N’écrit que l’UID effectif.", "`id` sans option montre utilisateur et groupes. `-u` ne garde que le nombre. `-un` écrit le nom. `-G` liste tous les groupes.", [ex("UID", "id -u", "0 pour root, un autre nombre sinon.")]),
    sub("-n", "Préfère les noms aux numéros.", "`-n` s’associe à `-u`, `-g` ou `-G`. `id user` interroge un autre compte.", [ex("Nom", "id -un", "Le nom du compte effectif.")]),
  ]},
  whoami: { subcommands: [
    sub("nom", "Écrit le nom d’utilisateur effectif.", "`whoami` est un raccourci de `id -un`. Après `sudo whoami`, la réponse est root. Pour l’auteur de la connexion, `logname`.", [ex("Effectif", "whoami", "Le compte sous lequel la commande tourne.")]),
  ]},
  logname: { subcommands: [
    sub("session", "Nom de l’utilisateur connecté sur ce terminal.", "`logname` ne suit pas l’UID effectif. Après sudo, il reste l’utilisateur de la connexion. Sans terminal, il échoue.", [ex("Connexion", "logname", "Le compte qui a ouvert le terminal, quand il est connu.")]),
  ]},
  who: { subcommands: [
    sub("sessions", "Liste les connexions en cours.", "`who` lit utmp. Un compte sans session n’apparaît pas. `who am i` désigne ce terminal.", [ex("Toutes", "who", "Utilisateur, terminal et heure.")]),
    sub("-b", "Date du dernier démarrage.", "`-b` ne garde que le boot. `-q` ne garde que les noms et le nombre. `last` voit l’historique.", [ex("Démarrage", "who -b", "Quand le système a été démarré.")]),
  ]},
  w: { subcommands: [
    sub("sessions", "Sessions et commande en cours.", "`w` reprend `who` et ajoute la charge ainsi que ce que chaque terminal exécute. `-h` retire l’en-tête. `-s` raccourcit.", [ex("Détail", "w", "Charge, puis une ligne par session.")]),
  ]},
  users: { subcommands: [
    sub("noms", "Les connectés, sur une ligne.", "`users` ne montre ni l’heure ni le terminal. Un compte avec deux sessions apparaît deux fois.", [ex("Noms", "users", "Des noms séparés par des espaces.")]),
  ]},
  last: { subcommands: [
    sub("-n", "Limite le nombre de connexions affichées.", "`last` lit wtmp. Un conteneur sans ce journal n’a rien à montrer. Les échecs de connexion sont dans le journal d’authentification, pas ici.", [ex("Dix", "last -n 10", "Les sessions les plus récentes.")]),
    sub("reboot", "Ne garde que les démarrages.", "`last reboot` liste les boots. `last user` ne garde qu’un compte.", [ex("Boots", "last reboot", "Quand la machine a été démarrée.")]),
  ]},
  lastlog: { subcommands: [
    sub("-u", "Dernière connexion réussie d’un compte.", "`lastlog` parcourt les comptes. `-u` n’en interroge qu’un. « Never » signifie qu’aucune connexion n’est enregistrée.", [ex("root", "lastlog -u root", "La dernière réussite, ou jamais.")]),
  ]},
  userdel: { subcommands: [
    sub("-r", "Supprime aussi le répertoire personnel.", "Sans `-r`, `/home/ada` reste. `-r` ne parcourt pas le reste du disque : des fichiers ailleurs gardent l’ancien UID. `-f` force même si l’utilisateur est connecté.", [ex("Compte et maison", "sudo userdel -r ada", "Retire le compte et /home/ada.")]),
  ]},
  adduser: { subcommands: [
    sub("compte", "Crée un compte, avec un programme différent selon la famille.", "Sur Debian, `adduser` pose les questions. Sur Alpine, c’est l’applet BusyBox : `adduser -D` crée sans mot de passe interactif. Red Hat, SUSE et Arch utilisent `useradd`.", [ex("Debian", "sudo adduser ada", "Questions, groupe, répertoire et mot de passe.")]),
  ]},
  groupadd: { subcommands: [
    sub("nom", "Crée un groupe.", "`groupadd dev` prend le prochain GID. `-g` impose le numéro. `-r` choisit un GID système. Le groupe ne devient utile qu’une fois des membres ajoutés avec `usermod -aG`.", [ex("Groupe", "sudo groupadd dev", "Le nom dev peut ensuite servir à chown et usermod.")]),
  ]},
  groupdel: { subcommands: [
    sub("nom", "Supprime un groupe qui n’est le groupe principal de personne.", "`groupdel` refuse si un compte a encore ce groupe comme groupe principal. Les fichiers qui portaient ce GID gardent le numéro.", [ex("Supprimer", "sudo groupdel dev", "Échoue avec un message clair si le groupe est encore principal.")]),
  ]},
  addgroup: { subcommands: [
    sub("groupe", "Crée un groupe, ou y ajoute un utilisateur sur Debian.", "Sur Debian, `addgroup dev` crée le groupe et `addgroup ada dev` ajoute ada. Sur Alpine, l’applet n’a pas la même syntaxe. Ailleurs, `groupadd` et `usermod -aG`.", [ex("Créer, Debian", "sudo addgroup dev", "Un groupe, avec les conventions Debian de GID.")]),
  ]},
  passwd: { subcommands: [
    sub("compte", "Change un mot de passe.", "`passwd` sans argument vise votre compte et demande l’ancien. `passwd user`, par l’administrateur, n’a pas besoin de l’ancien.", [ex("Le sien", "passwd", "Interactif. Rien n’est écrit pendant la frappe.")]),
    sub("-l", "Verrouille le mot de passe.", "`-l` empêche la connexion par mot de passe. `-u` déverrouille. `-S` résume l’état. Une clé SSH peut encore fonctionner.", [ex("Verrou", "sudo passwd -l ada", "Le mot de passe ne permet plus d’entrer.")]),
  ]},
  chage: { subcommands: [
    sub("-l", "Affiche les dates d’expiration.", "`chage -l` montre le dernier changement, l’expiration du mot de passe et celle du compte.", [ex("État", "sudo chage -l ada", "Les dates, ou never.")]),
    sub("-d", "Force un changement à la prochaine connexion.", "`-d 0` marque le mot de passe comme périmé. `-M 90` impose un changement tous les 90 jours. `-E` ferme le compte à une date.", [ex("Forcer", "sudo chage -d 0 ada", "La prochaine connexion par mot de passe devra en choisir un nouveau.")]),
  ]},
  su: { subcommands: [
    sub("-", "Ouvre un shell de connexion.", "`su -` vise root et charge son environnement. `su - ada` vise ada. Sans le tiret, une partie de votre environnement reste, ce qui surprend les chemins.", [ex("Root", "su -", "Demande le mot de passe de root.")]),
    sub("-c", "Lance une commande puis revient.", "`su - ada -c 'id'` n’ouvre pas de shell durable. Le mot de passe demandé est celui de la cible, sauf si vous êtes déjà root.", [ex("Une commande", "su - ada -c 'id'", "Affiche l’identité d’ada, puis revient.")]),
  ]},
  sudo: { subcommands: [
    sub("-u", "Exécute en tant qu’un autre compte.", "Sans `-u`, la cible est root. `sudo -u ada commande` change d’utilisateur. La politique est dans sudoers, éditée avec `visudo`.", [ex("Un autre compte", "sudo -u ada id", "Doit afficher l’UID d’ada si la politique l’autorise.")]),
    sub("-l", "Montre ce que votre compte a le droit de faire.", "`-l` liste les commandes autorisées. `-n` échoue au lieu d’attendre un mot de passe, pour un script.", [ex("Droits", "sudo -l", "Les règles qui vous concernent sur cette machine.")]),
  ]},
  doas: { subcommands: [
    sub("commande", "Exécute en root selon /etc/doas.conf.", "`doas commande` ressemble à sudo, avec un fichier de règles plus court. `permit persist :wheel` autorise le groupe wheel et mémorise l’authentification.", [ex("Identité", "doas id", "uid=0 si la règle vous y autorise.")]),
  ]},
  visudo: { subcommands: [
    sub("-c", "Vérifie la syntaxe sans éditer.", "`visudo -c` dit si sudoers est valide. Une erreur dans ce fichier peut interdire toute élévation.", [ex("Contrôle", "sudo visudo -c", "Annonce que le fichier est correct, ou désigne la ligne.")]),
    sub("-f", "Édite un fragment de sudoers.d.", "`visudo -f` ouvre un seul fichier et refuse de l’enregistrer s’il est invalide. On ne modifie pas sudoers avec un éditeur ordinaire.", [ex("Fragment", "sudo visudo -f /etc/sudoers.d/dev", "Ouvre ce fichier, pas le sudoers principal.")]),
  ]},
  groups: { subcommands: [
    sub("user", "Liste les groupes d’un compte.", "Sans argument, `groups` vise le compte courant. Un groupe ajouté par `usermod` n’apparaît dans la session ouverte qu’après une nouvelle connexion.", [ex("Les siens", "groups", "Des noms séparés par des espaces.")]),
  ]},
  getent: { subcommands: [
    sub("passwd", "Lit un compte via le Name Service Switch.", "`getent passwd ada` voit /etc/passwd et un annuaire si la machine en a un. Découper /etc/passwd rate les comptes qui viennent d’ailleurs.", [ex("root", "getent passwd root", "La ligne du compte, d’où qu’elle vienne.")]),
    sub("group", "Lit un groupe.", "`getent group dev` écrit le nom, le GID et les membres. Rien et un code non nul si le groupe n’existe pas.", [ex("Groupe", "getent group sudo", "Les membres, sur Debian et Ubuntu où ce groupe existe.")]),
    sub("hosts", "Résout un nom comme la machine le fait.", "`getent hosts` passe par nsswitch, fichiers hosts et DNS compris. `dig` interroge le DNS seul.", [ex("localhost", "getent hosts localhost", "L’adresse que cette machine utilise vraiment.")]),
  ]},
  chsh: { subcommands: [
    sub("-s", "Change le shell de connexion.", "Le chemin doit figurer dans `/etc/shells`. Le shell déjà ouvert ne change pas. `chsh -l` liste les shells acceptés sur certaines versions.", [ex("Bash", "chsh -s /bin/bash", "Les prochaines connexions démarrent bash.")]),
  ]},
  newgrp: { subcommands: [
    sub("groupe", "Ouvre un shell avec un autre groupe principal.", "`newgrp dev` exige d’être membre, ou le mot de passe du groupe. Les fichiers créés ensuite prennent ce groupe. `exit` revient. `sg` lance une seule commande.", [ex("Changer", "newgrp dev", "id montre dev comme gid. exit quitte ce shell.")]),
  ]},
};
