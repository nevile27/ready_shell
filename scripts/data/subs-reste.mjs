const ex = (title, command, comment) => ({ title, command, comment });
const sub = (name, summary, explanation, examples) => ({ name, summary, explanation, examples });

export const patches = {
  ping: { subcommands: [
    sub("-c", "S’arrête après un nombre d’essais.", "`ping` envoie des échos ICMP jusqu’à Ctrl+C. `-c 4` en fait quatre. `-W 1` attend au plus une seconde chaque réponse. Une absence de réponse peut venir d’un pare-feu.", [ex("Quatre essais", "ping -c 4 127.0.0.1", "Doit répondre. Le résumé est en bas.")]),
    sub("-4", "Force IPv4 ou IPv6.", "`-4` reste en IPv4, `-6` en IPv6. `ping -c 2 ::1` teste la pile locale.", [ex("IPv6 local", "ping -c 2 ::1", "Échoue si IPv6 est désactivé.")]),
  ]},
  traceroute: { subcommands: [
    sub("-n", "N’interroge pas le DNS.", "`traceroute` envoie des paquets avec un TTL croissant. Les routeurs peuvent ne pas répondre, ce qui laisse des étoiles. `-n` va plus vite.", [ex("Sans noms", "traceroute -n 127.0.0.1", "Un seul saut : la machine elle-même.")]),
  ]},
  tracepath: { subcommands: [
    sub("-n", "Suit le chemin et estime le MTU, sans être root.", "`tracepath` ressemble à traceroute et n’a pas besoin du paquet traceroute. `-6` vise IPv6.", [ex("Local", "tracepath -n 127.0.0.1", "Le saut unique, sans résolution de noms.")]),
  ]},
  dig: { subcommands: [
    sub("+short", "N’écrit que les réponses, sans le préambule.", "`dig nom` montre question, drapeaux et enregistrements. `+short` ne garde que les adresses. Le type se donne après le nom : `A`, `MX`, `NS`.", [ex("Adresses", "dig +short exemple.fr A", "Une adresse par ligne.")]),
    sub("@serveur", "Interroge un résolveur précis.", "Sans `@`, dig utilise le résolveur de la machine. `+trace` suit la délégation depuis la racine. `getent hosts` passe par nsswitch, pas seulement par le DNS.", [ex("Un résolveur", "dig @1.1.1.1 +short exemple.fr", "Comparez avec la même commande sans @.")]),
  ]},
  host: { subcommands: [
    sub("nom", "Résout en quelques lignes.", "`host` est plus court que `dig`. `-t MX` ne demande que le courrier. `-t NS` demande les serveurs de noms.", [ex("Adresses", "host exemple.fr", "Quelques lignes, une par enregistrement utile.")]),
    sub("-t", "Choisit le type d’enregistrement.", "Les types courants sont A, AAAA, MX, NS et TXT. L’inverse, une adresse vers un nom, se demande en donnant l’adresse.", [ex("Serveurs de noms", "host -t NS exemple.fr", "Les NS du domaine.")]),
  ]},
  nslookup: { subcommands: [
    sub("requête", "Interroge le résolveur et écrit l’adresse.", "`nslookup` est toujours livré avec `dig` et `host`. Sa sortie est moins stable dans un script que `dig +short`. Le mode interactif s’ouvre sans argument.", [ex("Une requête", "nslookup exemple.fr", "Le serveur utilisé, puis les adresses.")]),
  ]},
  curl: { subcommands: [
    sub("-I", "Ne demande que les en-têtes.", "`-I` n’écrit pas le corps. `-s` se tait, `-S` montre quand même l’erreur. `-L` suit les redirections. `-f` fait échouer le code sur une erreur HTTP.", [ex("En-têtes", "curl -sI https://example.com", "Le statut et les en-têtes.")]),
    sub("-o", "Enregistre le corps dans un fichier.", "`-O` utilise le nom distant. `-o` choisit le nom. `-k` désactive la vérification du certificat et ne doit pas devenir une habitude.", [ex("Fichier", "curl -fsSL -o /tmp/page.html https://example.com", "Écrit la page. Échoue si le certificat ou le réseau est mauvais.")]),
  ]},
  wget: { subcommands: [
    sub("-O", "Choisit le nom local.", "`wget` enregistre dans le répertoire courant si `-O` est absent. `-q` se tait. `-c` reprend un téléchargement sur la version GNU. Le wget de BusyBox est plus court.", [ex("Nom choisi", "wget -O /tmp/exemple.html https://example.com", "Le corps va dans ce fichier.")]),
    sub("-c", "Reprend un fichier interrompu.", "`-c` continue si le fichier existe. `-r` descend dans un site et peut devenir très large. Pour une API, `curl` est plus à l’aise.", [ex("Reprendre", "wget -c -O /tmp/gros.bin https://example.com/gros.bin", "Continue le fichier. La version GNU sait le faire.")]),
  ]},
  scp: { subcommands: [
    sub("envoi", "Copie un fichier vers une machine, via SSH.", "Les OpenSSH récents font passer `scp` par SFTP. L’ancien protocole se redemande avec `-O`, seulement pour un serveur très vieux. `-r` copie un répertoire, moins finement que `rsync -a`.", [ex("Envoyer", "scp notes.txt user@hote:/tmp/notes.txt", "Le fichier local arrive dans /tmp sur la machine distante.")]),
    sub("-r", "Copie un répertoire.", "`-P` majuscule change le port, contrairement à `ssh -p`. `-i` choisit une clé, comme pour ssh.", [ex("Ramener", "scp -r user@hote:/etc/ssh /tmp/ssh-distant", "Recopie le répertoire distant.")]),
  ]},
  sftp: { subcommands: [
    sub("session", "Ouvre un mini-shell de transfert.", "`get` ramène un fichier, `put` l’envoie, `bye` quitte. Le service est le sous-système sftp de sshd, pas le FTP du port 21.", [ex("Session", "sftp user@hote", "Prompt sftp>. bye quitte.")]),
    sub("-b", "Lit un script de commandes.", "`-b` enchaîne des ordres sans rester en session. On peut aussi donner un chemin distant directement sur la ligne.", [ex("Un fichier", "sftp user@hote:/etc/hostname /tmp/hostname-distant", "Copie ce fichier et revient.")]),
  ]},
  hostname: { subcommands: [
    sub("lire", "Écrit le nom courant du noyau.", "`hostname` sans argument ne dit pas le nom durable. Sur systemd, `hostnamectl` le conserve. Sur Alpine, le fichier est `/etc/hostname`.", [ex("Nom", "hostname", "Une ligne, le nom court.")]),
    sub("-f", "Tente le nom complet.", "`-f` dépend de la résolution. `-s` ne garde que le premier composant. Changer le nom avec `hostname nouveau` ne survit pas au redémarrage.", [ex("Complet", "hostname -f", "Le FQDN, si la résolution le connaît.")]),
  ]},
  hostnamectl: { subcommands: [
    sub("status", "Nom statique, nom joli et système.", "`hostnamectl status` résume l’identité. Alpine n’a pas systemd : on édite `/etc/hostname`.", [ex("État", "hostnamectl status", "Nom, identifiant et système.")]),
    sub("hostname", "Pose le nom de façon durable.", "`hostnamectl hostname nouveau` survit au redémarrage. `--static`, `--transient` et `--pretty` distinguent le nom du noyau, celui du réseau et celui des humains.", [ex("Poser", "sudo hostnamectl hostname serveur-1", "Le nom est conservé.")]),
  ]},
  networkctl: { subcommands: [
    sub("status", "État des liens vus par systemd-networkd.", "`networkctl status` liste les interfaces. Un nom d’interface en argument détaille l’une d’elles. Si NetworkManager gère la machine, `nmcli` est l’outil de configuration.", [ex("Liens", "networkctl status", "L’état de chaque interface.")]),
  ]},
  ethtool: { subcommands: [
    sub("lien", "Vitesse, duplex et détection du câble.", "`ethtool eth0` montre le lien. Le nom vient de `ip link`. « Link detected: yes » dit que le câble est vu.", [ex("État", "ethtool eth0", "Remplacez eth0 par un nom réel.")]),
    sub("-S", "Compteurs d’erreurs du pilote.", "`-i` identifie le pilote. Changer une vitesse à la main est rare : la négociation automatique fait mieux.", [ex("Compteurs", "ethtool -S eth0", "Erreurs et paquets perdus vus par la carte.")]),
  ]},
  iw: { subcommands: [
    sub("dev", "Liste les interfaces sans fil.", "`iw dev` nomme les cartes. `iwconfig` est l’outil WEXT abandonné. Associer un réseau au quotidien se fait plutôt avec NetworkManager.", [ex("Interfaces", "iw dev", "Les cartes Wi-Fi et si elles sont gérées.")]),
    sub("link", "Montre le réseau associé.", "`iw dev wlan0 link` écrit le SSID, la fréquence et le signal. `iw dev wlan0 scan` déclenche un balayage. Le nom wlan0 vient de `iw dev`.", [ex("Lien", "iw dev wlan0 link", "SSID et signal, si une association est en cours.")]),
  ]},
  ifconfig: { subcommands: [
    sub("-a", "Ancienne liste des interfaces, y compris les inactives.", "`ifconfig` vient de net-tools, absent des installations par défaut. `ip -br addr` le remplace. BusyBox sur Alpine a encore un ifconfig court.", [ex("À la place", "ip -br addr", "Adresses et état, avec iproute2.")]),
  ]},
  netstat: { subcommands: [
    sub("-tulpn", "Ancienne liste des ports. La forme actuelle est ss.", "`netstat -tulpn` listait l’écoute. `ss -tulpn` fait ce travail. `netstat -rn` montrait les routes : c’est `ip route`.", [ex("Ports", "sudo ss -tulpn", "Remplace netstat -tulpn.")]),
  ]},
  route: { subcommands: [
    sub("-n", "Ancienne table de routage, sans DNS.", "`route -n` est dans net-tools. `ip route` le remplace. `ip route show default` ne garde que la passerelle.", [ex("Table", "ip route", "Remplace route -n.")]),
  ]},
  arp: { subcommands: [
    sub("-n", "Ancien cache MAC, sans DNS.", "`arp -n` est remplacé par `ip neigh`. `ip neigh flush dev eth0` vide le cache d’une interface.", [ex("Voisinage", "ip neigh", "Adresses, MAC et interface.")]),
  ]},
  brctl: { subcommands: [
    sub("show", "Ancienne liste des ponts.", "`brctl show` vient de bridge-utils. `bridge link` et `ip link add name br0 type bridge` le remplacent.", [ex("Ports", "bridge link", "Les interfaces attachées à un pont.")]),
  ]},
  iwconfig: { subcommands: [
    sub("scan", "Ancien outil Wi-Fi WEXT.", "`iwconfig` ne voit plus grand-chose sur une carte récente. `iw dev wlan0 link` le remplace.", [ex("Lien", "iw dev wlan0 link", "SSID et signal, via nl80211.")]),
  ]},
  bridge: { subcommands: [
    sub("link", "Liste les ports des ponts.", "`bridge link` montre les interfaces attachées. On crée le pont avec `ip link add`, puis on y attache une interface avec `ip link set eth0 master br0`.", [ex("Ports", "bridge link", "Les ports et leur état.")]),
    sub("vlan", "Montre les VLAN des ports.", "`bridge vlan` liste les VLAN. Ce n’est pas l’outil qui crée le pont : ça, c’est `ip link`.", [ex("VLAN", "bridge vlan", "Les VLAN configurés, ou rien.")]),
  ]},
  nc: { subcommands: [
    sub("-l", "Écoute un port.", "`nc -l` attend une connexion. Plusieurs programmes s’appellent nc : OpenBSD, ncat, ou BusyBox. Les options ne sont pas toutes communes. `nc -h` dit lequel vous avez.", [ex("Écouter", "nc -l 127.0.0.1 9000", "Attend une connexion. Un second terminal peut lancer nc 127.0.0.1 9000.")]),
    sub("-v", "Rend la connexion bavarde.", "`-z`, sur le netcat OpenBSD, teste le port sans envoyer de données. ncat n’a pas toujours la même lettre.", [ex("Tester", "nc -vz 127.0.0.1 22", "Dit si quelque chose accepte le port 22.")]),
  ]},
  socat: { subcommands: [
    sub("TCP", "Relie le terminal à un port.", "`socat - TCP:hôte:80` envoie le clavier vers le port et affiche la réponse. La syntaxe est la même d’une famille à l’autre. Le paquet n’est pas dans l’installation minimale.", [ex("Port local", "socat - TCP:127.0.0.1:22", "La bannière SSH. Ctrl+C coupe.")]),
    sub("LISTEN", "Écoute et relaie.", "`TCP-LISTEN` attend. `fork` accepte plusieurs clients. Pour un simple test de port, `nc` ou `ss` suffisent.", [ex("Relais", "socat TCP-LISTEN:9001,fork TCP:127.0.0.1:22", "Le port 9001 renvoie vers le SSH local.")]),
  ]},
  "ssh-keygen": { subcommands: [
    sub("-t", "Crée une paire de clés.", "`-t ed25519` choisit l’algorithme actuel. `-f` fixe le fichier. Une phrase de passe protège la clé privée. La clé publique se copie avec `ssh-copy-id`.", [ex("Créer", "ssh-keygen -t ed25519 -f \"$HOME/.ssh/id_ed25519\"", "Pose la question de la phrase de passe. Ne transmet rien.")]),
    sub("-l", "Affiche l’empreinte d’une clé.", "`-l -f` montre taille, empreinte et commentaire. On compare l’empreinte du serveur à celle publiée par son administrateur.", [ex("Empreinte", "ssh-keygen -l -f \"$HOME/.ssh/id_ed25519.pub\"", "L’empreinte de la clé publique, si elle existe.")]),
  ]},
  "ssh-copy-id": { subcommands: [
    sub("-i", "Installe une clé publique dans authorized_keys.", "`ssh-copy-id` demande encore le mot de passe une fois. `-i` choisit la clé. Ensuite `ssh` passe par elle.", [ex("Installer", "ssh-copy-id -i \"$HOME/.ssh/id_ed25519.pub\" user@hote", "Ajoute cette clé au compte distant.")]),
  ]},
  ftp: { subcommands: [
    sub("session", "Ancien client, trafic en clair.", "`ftp` envoie identifiant et mot de passe sans chiffrement. Pour une machine que vous administrez, `sftp` passe par SSH. `curl` sait encore parler `ftp://` pour un miroir public anonyme.", [ex("À la place", "sftp user@hote", "Session chiffrée. bye quitte.")]),
  ]},
  telnet: { subcommands: [
    sub("hôte", "Ancienne session en clair.", "`telnet` ne sert plus à administrer. Pour sonder un port, `nc` est plus explicite. Une session distante se fait avec `ssh`.", [ex("Session", "ssh user@hote", "Remplace une connexion d’administration.")]),
  ]},
  rsh: { subcommands: [
    sub("commande", "Ancien shell distant sans chiffrement.", "`rsh` faisait confiance à l’adresse source. `ssh user@hôte commande` le remplace. Les installations actuelles ne le mettent pas en place.", [ex("Commande", "ssh user@hote 'uname -r'", "Le noyau distant, via SSH.")]),
  ]},
  rlogin: { subcommands: [
    sub("session", "Ancienne ouverture de session sans chiffrement.", "`rlogin` appartient à la même famille que `rsh`. `ssh` est le remplaçant, avec des clés plutôt qu’un fichier `.rhosts`.", [ex("Session", "ssh user@hote", "Session chiffrée.")]),
  ]},
  rcp: { subcommands: [
    sub("copie", "Ancienne copie distante en clair.", "`rcp` passait par rsh. `scp` copie sur SSH. Pour une arborescence à maintenir, `rsync -aH`.", [ex("Copie", "scp notes.txt user@hote:/tmp/notes.txt", "Le fichier arrive chiffré.")]),
  ]},
  iptables: { subcommands: [
    sub("-L", "Liste les règles sans les modifier.", "`iptables -L -n -v` n’interroge pas le DNS et ajoute les compteurs. Sur les versions actuelles, la commande parle souvent à nftables : `iptables --version` le dit.", [ex("Lire", "sudo iptables -L -n -v", "INPUT, FORWARD et OUTPUT.")], ["iptables -F vide le filtre et peut couper l’accès à une machine distante."]),
    sub("-A", "Ajoute une règle en fin de chaîne.", "Les règles neuves s’écrivent plutôt avec `nft` ou un frontal, `ufw` ou `firewall-cmd`. `iptables-save` écrit le jeu au format historique.", [ex("Version", "iptables --version", "La ligne précise souvent nf_tables ou legacy.")]),
  ]},
  loginctl: { subcommands: [
    sub("list-sessions", "Liste les sessions vues par systemd-logind.", "`loginctl` voit aussi des sessions sans terminal classique. `session-status` en détaille une. Alpine n’a pas logind.", [ex("Sessions", "loginctl list-sessions", "Identifiant, utilisateur et siège.")]),
    sub("terminate-session", "Ferme une session.", "L’identifiant vient de `list-sessions`. Cela déconnecte l’utilisateur. `who` ne voit pas toutes les sessions que logind connaît.", [ex("Utilisateurs", "loginctl list-users", "Les comptes qui ont une session, pas /etc/passwd.")]),
  ]},
  localectl: { subcommands: [
    sub("status", "Locale et clavier du système.", "`localectl status` montre LANG et la carte du clavier. Ce n’est pas la variable d’une seule session.", [ex("Réglage", "localectl status", "Langue et clavier.")]),
    sub("set-locale", "Change la langue par défaut.", "La locale doit déjà être générée. `list-locales` montre celles qui le sont. Sur Debian, `/etc/locale.gen` prépare les autres.", [ex("Lister", "localectl list-locales", "Les locales déjà disponibles.")]),
  ]},
  "systemd-analyze": { subcommands: [
    sub("blame", "Classe les unités par le temps de démarrage.", "`blame` ne compare pas deux machines différentes. `critical-chain` montre le chemin qui retarde le plus.", [ex("Le plus lent", "systemd-analyze blame", "Les unités, de la plus lente à la plus rapide.")]),
    sub("verify", "Contrôle la syntaxe des fichiers d’unité.", "`verify` signale les directives inconnues. Il ne démarre rien. `security` estime la surface d’un service.", [ex("Vérifier", "systemd-analyze verify /etc/systemd/system/*.service", "Les erreurs de syntaxe. Le glob peut être vide.")]),
  ]},
  coredumpctl: { subcommands: [
    sub("list", "Liste les vidages mémoire conservés.", "`list` est vide s’il n’y a pas eu de plantage enregistré. Un core peut contenir des secrets qui étaient en mémoire.", [ex("Liste", "coredumpctl list", "Programme, PID et heure, ou rien.")]),
    sub("info", "Détaille un vidage.", "Sans argument, `info` vise le plus récent. `dump` l’enregistre dans un fichier. Il faut que systemd-coredump soit l’outil de core du noyau.", [ex("Le dernier", "coredumpctl info", "Le détail du vidage le plus récent.")]),
  ]},
  "systemd-run": { subcommands: [
    sub("--user", "Lance dans le systemd de votre session.", "`systemd-run` crée une unité éphémère, avec un journal. `--user` ne demande pas l’administrateur. `--collect` efface l’unité une fois terminée.", [ex("Une commande", "systemd-run --user --collect pwd", "pwd tourne dans une unité. Le journal utilisateur en garde la sortie.")]),
    sub("-p", "Pose une limite, par exemple la mémoire.", "`-p MemoryMax=256M` arrête le processus s’il dépasse. `--on-calendar=` planifie. C’est plus encadré qu’un `nohup`.", [ex("Mémoire", "systemd-run -p MemoryMax=256M -- sleep 1", "sleep est borné en mémoire, puis l’unité se termine.")]),
  ]},
  service: { subcommands: [
    sub("status", "Ancien wrapper, qui appelle systemctl sur Debian.", "`service ssh status` existe encore comme compatibilité. Les scripts neufs appellent `systemctl`. Sur Alpine, la commande est `rc-service`.", [ex("Forme actuelle", "systemctl status ssh.service", "Sur Red Hat, SUSE et Arch, l’unité s’appelle sshd.service.")]),
  ]},
  "rc-service": { subcommands: [
    sub("status", "État d’un service OpenRC.", "`rc-service sshd status` interroge le script dans /etc/init.d. `start`, `stop` et `restart` agissent. Le démarrage automatique se règle avec `rc-update`, pas avec enable.", [ex("État", "rc-service sshd status", "Dit si le service est démarré.")]),
    sub("restart", "Relance le service.", "`restart` enchaîne stop et start. L’élévation habituelle sur Alpine est `doas`.", [ex("Relancer", "doas rc-service sshd restart", "Le démon repart.")]),
  ]},
  "rc-update": { subcommands: [
    sub("add", "Ajoute un service au démarrage.", "`rc-update add sshd default` le lance avec le runlevel default. `show` liste les services par runlevel. `del` retire.", [ex("Activer", "doas rc-update add sshd default", "sshd démarrera avec default.")]),
    sub("show", "Liste les services et leurs runlevels.", "`show` ne modifie rien. `default` est le runlevel habituel d’une machine Alpine.", [ex("Liste", "rc-update show", "Services et runlevels.")]),
  ]},
  logger: { subcommands: [
    sub("-t", "Pose une étiquette retrouvable dans le journal.", "`logger -t sauvegarde \"copie terminée\"` se relit avec `journalctl -t sauvegarde` sur systemd. Sur Alpine, le message va au syslog si un démon écoute.", [ex("Étiquette", "logger -t catalogue \"test du journal\"", "journalctl -t catalogue -n 5 la retrouve sur systemd.")]),
    sub("-p", "Choisit facilité et priorité.", "`-p user.notice` sert aux filtres. `user.warning` est plus visible. La priorité se relit avec `journalctl -p`.", [ex("Notice", "logger -p user.notice -t catalogue \"rien d’urgent\"", "Une ligne de priorité notice.")]),
  ]},
  dmesg: { subcommands: [
    sub("-T", "Convertit les secondes du noyau en heure locale.", "`dmesg` montre disques, pilotes et erreurs depuis le démarrage. `-T` est util-linux. BusyBox a une sortie plus simple. Seul l’administrateur lit souvent le tampon complet.", [ex("Erreurs", "sudo dmesg -l err,warn", "Avertissements et erreurs. -l est util-linux.")]),
    sub("-w", "Suit les nouveaux messages.", "`-w` reste ouvert, comme `tail -f`. `-l` filtre la priorité. Le journal des services, lui, est dans `journalctl`.", [ex("Suivre", "sudo dmesg -w", "Les lignes nouvelles du noyau. Ctrl+C arrête.")]),
  ]},
  chronyc: { subcommands: [
    sub("tracking", "Dit si l’horloge est calée, et sur quelle source.", "`tracking` échoue si chronyd ne tourne pas. Ubuntu 26.04, RHEL et Fedora utilisent chrony. Un Debian minimal peut encore être sur systemd-timesyncd.", [ex("Suivi", "chronyc tracking", "Décalage estimé et serveur suivi.")]),
    sub("sources", "Liste les serveurs NTP.", "L’astérisque marque la source retenue. `-v` détaille les colonnes. `timedatectl` montre le résultat, pas cette liste.", [ex("Sources", "chronyc sources", "Les serveurs, et celui qui est choisi.")]),
  ]},
  ntpdate: { subcommands: [
    sub("serveur", "Ancien réglage ponctuel, retiré.", "`ntpdate` décalait l’horloge d’un coup. Les systèmes actuels utilisent chrony ou systemd-timesyncd. Un grand saut casse des journaux.", [ex("À la place", "chronyc tracking", "Le démon ajuste en continu, s’il tourne.")]),
  ]},
  chkconfig: { subcommands: [
    sub("on", "Ancien lien de démarrage SysV.", "`chkconfig sshd on` est retiré des familles systemd actuelles. `systemctl enable` le remplace. Alpine utilise `rc-update`.", [ex("Activer", "sudo systemctl enable ssh.service", "Remplace chkconfig. Hors Debian, l’unité s’appelle sshd.service.")]),
  ]},
  "systemd-resolve": { subcommands: [
    sub("query", "Ancien nom. La commande actuelle est resolvectl.", "`systemd-resolve` a été remplacé par `resolvectl query`. Sur les versions de novembre 2026, l’ancien nom n’est plus là.", [ex("Forme actuelle", "resolvectl query exemple.fr", "Passe par le cache de systemd-resolved.")]),
  ]},
  "apt-get": { subcommands: [
    sub("update", "Rafraîchit les index, forme stable pour les scripts.", "`apt-get update` ne met pas les paquets à jour. `apt-get install -y` installe sans question. On ne mélange pas `apt` et `apt-get` dans un même script.", [ex("Installer", "sudo apt-get update && sudo apt-get install -y curl", "Index, puis curl, sans confirmation.")]),
    sub("autoremove", "Retire les dépendances devenues inutiles.", "`upgrade` n’enlève pas de paquet. `dist-upgrade` peut le faire pour résoudre les dépendances. `autoremove` nettoie ce que plus personne ne tire.", [ex("Nettoyer", "sudo apt-get autoremove", "Propose les paquets qui ne servent plus.")]),
  ]},
  "apt-cache": { subcommands: [
    sub("show", "Fiche d’un paquet, sans l’installer.", "`show` écrit version, dépendances et description. `policy` dit quelle version serait installée et depuis quel dépôt. L’index se rafraîchit avec `apt update`.", [ex("Fiche", "apt-cache show curl", "Rien n’est installé.")]),
    sub("search", "Cherche dans les descriptions.", "`search` interroge l’index local. `apt search` couvre le même besoin au quotidien.", [ex("Motif", "apt-cache search curl", "Noms et descriptions.")]),
  ]},
  "apt-key": { subcommands: [
    sub("add", "Ancienne commande, retirée.", "`apt-key add` déposait une clé dans un trousseau commun. Debian 13 et Ubuntu 26.04 ne livrent plus la commande. La clé va dans `/etc/apt/keyrings` et le dépôt la cite avec Signed-By.", [ex("Déposer une clé", "curl -fsSL https://exemple.test/cle.gpg | sudo gpg --dearmor -o /etc/apt/keyrings/exemple.gpg", "Le fichier ne sert qu’au dépôt qui le nomme. Vérifiez l’empreinte.")]),
  ]},
  dpkg: { subcommands: [
    sub("-l", "Liste les paquets connus de la base locale.", "`dpkg -l` ne contacte pas les dépôts. `-L nom` liste les fichiers d’un paquet installé. `-S /chemin` dit qui fournit un fichier.", [ex("Qui fournit", "dpkg -S /usr/bin/ls", "Le paquet, par exemple coreutils.")]),
    sub("-i", "Installe un fichier .deb sans résoudre les dépendances.", "`dpkg -i` échoue si une dépendance manque. `apt install ./fichier.deb` les tire. On ne met pas le système à jour avec dpkg.", [ex("Fichiers d’un paquet", "dpkg -L coreutils", "Les chemins installés. Le paquet doit être là.")]),
  ]},
  rpm: { subcommands: [
    sub("-q", "Interroge la base locale.", "`rpm -q nom` dit si le paquet est installé. `-ql` liste ses fichiers. `-qf /chemin` trouve le propriétaire. L’installation avec dépendances se fait par `dnf` ou `zypper`.", [ex("Propriétaire", "rpm -qf /usr/bin/ls", "Nom et version du paquet.")]),
    sub("-V", "Vérifie que les fichiers n’ont pas changé.", "`-V` compare aux métadonnées d’installation. Une ligne vide signifie que rien n’a bougé. `-ivh fichier.rpm` installe un fichier et s’arrête si une dépendance manque.", [ex("Vérifier", "rpm -V coreutils", "Silence si les fichiers sont conformes.")]),
  ]},
  yum: { subcommands: [
    sub("install", "Ancien nom, qui appelle dnf.", "`yum install` fonctionne encore souvent parce qu’il délègue à `dnf`. Les commandes neuves appellent `dnf`. SUSE utilise `zypper`.", [ex("Forme actuelle", "sudo dnf install curl", "Remplace yum install curl.")]),
  ]},
  gpg: { subcommands: [
    sub("--show-keys", "Affiche l’empreinte d’une clé.", "`--show-keys` sert à comparer l’empreinte à celle publiée par l’éditeur, avant d’en faire une clé de dépôt. `--import` ajoute la clé à votre trousseau personnel, ce qui n’autorise pas un dépôt.", [ex("Empreinte", "gpg --show-keys cle.asc", "Comparez-la au site officiel.")]),
    sub("--dearmor", "Passe une clé ASCII en fichier binaire.", "`--dearmor` produit le fichier que apt cite avec Signed-By, ou qu’un rpm peut importer. Ce n’est pas `apt-key add`.", [ex("Binaire", "gpg --dearmor < cle.asc > exemple.gpg", "Le fichier à placer dans /etc/apt/keyrings sur Debian.")]),
  ]},
  gzip: { subcommands: [
    sub("-k", "Compresse et garde l’original.", "`gzip` sans `-k` remplace le fichier par un `.gz`. `-c` écrit sur la sortie. `-l` décrit une archive sans l’extraire.", [ex("Garder", "cp /etc/hostname /tmp/hote && gzip -k /tmp/hote", "Crée /tmp/hote.gz et laisse /tmp/hote.")]),
    sub("-d", "Décompresse.", "`-d` est la même opération que `gunzip`. `zcat` écrit le contenu sans retirer l’archive.", [ex("Vers la sortie", "gzip -c /etc/hostname | gzip -d", "Recompose le texte. Rien n’est écrit sur le disque.")]),
  ]},
  gunzip: { subcommands: [
    sub("-k", "Décompresse et garde le .gz.", "`gunzip` recrée le fichier et retire l’archive, sauf avec `-k`. Il ne sait pas ouvrir un `.tar.gz` comme une arborescence : `tar -xzf` fait les deux.", [ex("Archive tar", "tar -xzf /tmp/etc-ssh.tar.gz -C /tmp", "tar extrait après décompression.")]),
  ]},
  bzip2: { subcommands: [
    sub("-k", "Compresse en .bz2 et garde l’original.", "`bzip2` sans `-k` remplace le fichier. `-d` décompresse. `tar -j` produit un `.tar.bz2`. Le taux est souvent meilleur que gzip, et plus lent.", [ex("Garder", "cp /etc/hostname /tmp/hote && bzip2 -k /tmp/hote", "Crée /tmp/hote.bz2.")]),
    sub("-d", "Décompresse un .bz2.", "`bunzip2` est le même programme. `bzcat` écrit sur la sortie.", [ex("Lister une archive", "tar -tjf archive.tar.bz2", "Liste le contenu. -j dit à tar d’utiliser bzip2.")]),
  ]},
  xz: { subcommands: [
    sub("-k", "Compresse en .xz et garde l’original.", "`xz` vise un meilleur taux que gzip, plus lentement. `tar -J` produit un `.tar.xz`. `-T0` utilise tous les cœurs sur les versions récentes.", [ex("Compresser", "cp /etc/hostname /tmp/hote && xz -k /tmp/hote", "Crée /tmp/hote.xz.")]),
    sub("-d", "Décompresse.", "`unxz` et `xz -d` sont la même opération. `xzcat` écrit sur la sortie.", [ex("Archive", "tar -cJf /tmp/ssh.tar.xz -C /etc ssh", "-J choisit xz.")]),
  ]},
  zstd: { subcommands: [
    sub("-k", "Compresse en .zst et garde l’original.", "`-1` va vite, `-19` pousse le taux. `tar --zstd` crée un `.tar.zst` sur un tar GNU récent. BusyBox ne fournit pas zstd.", [ex("Compresser", "cp /etc/hostname /tmp/hote && zstd -k /tmp/hote", "Crée /tmp/hote.zst.")]),
    sub("-d", "Décompresse un .zst.", "`unzstd` est le même outil. `-c` écrit sur la sortie et ne retire pas l’archive.", [ex("Vers la sortie", "zstd -dc /tmp/hote.zst", "Le contenu, si /tmp/hote.zst existe.")]),
  ]},
  zip: { subcommands: [
    sub("-r", "Range un répertoire dans une archive .zip.", "`zip` s’échange hors du monde Unix. Les droits et les liens ne sont pas tous conservés comme avec `tar`. `unzip` extrait.", [ex("Répertoire", "zip -r /tmp/ssh.zip /etc/ssh", "Crée l’archive. Les chemins commencent en général par etc/ssh.")]),
  ]},
  unzip: { subcommands: [
    sub("-l", "Liste sans extraire.", "`-l` montre chemins et tailles. `-d` choisit la destination. `-n` n’écrase pas un fichier déjà là.", [ex("Lister", "unzip -l /tmp/ssh.zip", "Le contenu, si l’archive existe.")]),
    sub("-d", "Extrait dans un répertoire.", "Une archive peut contenir `..` ou des chemins absolus. `-d` vers un répertoire vide limite la casse.", [ex("À part", "unzip -d /tmp/zip-out /tmp/ssh.zip", "Place les fichiers dans /tmp/zip-out.")]),
  ]},
  cpio: { subcommands: [
    sub("-o", "Crée une archive à partir de noms lus sur l’entrée.", "`find -print0 | cpio -0 -o` accepte les noms avec des espaces. `-H newc` est le format des initramfs. Pour le travail courant, `tar` est plus direct.", [ex("Créer", "find /etc/hostname -print0 | cpio -0 -o > /tmp/hote.cpio", "Archive les chemins produits par find.")]),
    sub("-t", "Liste une archive.", "`-t` écrit les noms. `-i` extrait. `-d` crée les répertoires à l’extraction.", [ex("Lister", "cpio -t < /tmp/hote.cpio", "Les noms, si l’archive existe.")]),
  ]},
  compress: { subcommands: [
    sub("-d", "Ancien format .Z. La forme actuelle est gzip.", "`compress` produisait un `.Z`. Les systèmes actuels ne l’installent pas. `gzip -k` crée un `.gz`. `zcat` lit souvent encore un vieux `.Z`.", [ex("Format actuel", "gzip -c /etc/hostname > /tmp/hote.gz", "Un .gz, pas un .Z.")]),
  ]},
};
