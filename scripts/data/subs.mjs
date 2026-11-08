const ex = (title, command, comment, families) => ({
  title,
  command,
  comment,
  ...(families ? { families } : {}),
});

export const patches = {
  ip: {
    summary: "Affiche et règle les adresses, les liens, les routes et le voisinage.",
    explanation: "`ip` remplace `ifconfig`, `route` et `arp`. Chaque objet a sa sous-commande : on ne mélange pas les adresses et les routes dans la même forme. `-br` tient l’affichage sur une ligne, `-4` et `-6` choisissent la famille, `-s` ajoute les compteurs, `-c` colore. Rien de ce que `ip` modifie n’est repris au démarrage : la configuration durable est NetworkManager, systemd-networkd ou le fichier d’interfaces. Sur Alpine, ces formes viennent du paquet iproute2.",
    subcommands: [
      {
        name: "addr",
        summary: "Affiche, ajoute ou retire les adresses d’une interface.",
        explanation: "`ip addr` s’abrège en `ip a` et s’écrit aussi `ip address`. `show` liste les adresses. Avec `-br`, une interface tient sur une ligne : état, nom, adresses. Une adresse se note avec son préfixe, `192.0.2.10/24`, pas avec un masque séparé. `add` ajoute sans effacer les autres. `replace` pose cette adresse à la place de celles du même préfixe. `del` en retire une. `flush` vide l’interface. `scope global` est une adresse routable, `scope link` reste sur le lien, `scope host` reste sur la machine. Le nom d’interface vient de `ip link` : ce n’est plus forcément eth0.",
        pitfalls: ["`ip addr flush dev eth0` retire toutes les adresses de l’interface, y compris celle par laquelle vous êtes connecté."],
        examples: [
          ex("Vue courte", "ip -br addr", "Une ligne par interface, avec l’état et les adresses."),
          ex("Ajouter une adresse", "sudo ip addr add 192.0.2.10/24 dev eth0", "S’ajoute aux adresses déjà présentes. Remplacez eth0 par un nom vu dans ip link."),
          ex("Retirer cette adresse", "sudo ip addr del 192.0.2.10/24 dev eth0", "Le préfixe doit être le même que lors de l’ajout."),
        ],
      },
      {
        name: "link",
        summary: "Liste les interfaces et change leur état, leur MTU ou leur MAC.",
        explanation: "`ip link` montre les interfaces, qu’elles aient une adresse ou non. `show` les liste, `show dev eth0` n’en garde qu’une. `set eth0 up` active le lien, `set eth0 down` le coupe. `set eth0 mtu 9000` change la taille de trame. `set eth0 address 02:00:00:00:00:01` change l’adresse MAC. `set eth0 master br0` attache l’interface à un pont, `set eth0 nomaster` l’en détache. `add name br0 type bridge` crée une interface virtuelle. `delete` la retire. `-s` ajoute les compteurs d’erreurs et d’octets, ce qui remplace l’ancien `netstat -i`.",
        examples: [
          ex("Interfaces et état", "ip -br link", "UP ou DOWN, et l’adresse MAC, sur une ligne."),
          ex("Activer un lien", "sudo ip link set eth0 up", "Le lien passe à UP. L’adresse, elle, se pose avec ip addr."),
          ex("Compteurs", "ip -s link show dev eth0", "Erreurs, paquets perdus et octets, en plus de l’état."),
        ],
      },
      {
        name: "route",
        summary: "Affiche ou modifie la table de routage.",
        explanation: "`ip route` remplace `route`. Sans argument, `show` écrit la table principale. `show default` ne garde que la passerelle. `get 192.0.2.1` dit quelle route la machine utiliserait pour joindre cette adresse, sans envoyer de paquet. `add default via 192.0.2.1 dev eth0` pose la route par défaut. Une route de réseau s’écrit `add 192.0.2.0/24 dev eth0`. `replace` change une route existante sans échouer si elle est déjà là. `del` la retire. `metric` départage deux routes vers la même destination : la plus petite l’emporte. `table 100` vise une table autre que main, celle qu’une règle de `ip rule` peut choisir. `blackhole` jette le trafic correspondant.",
        pitfalls: ["Remplacer la route par défaut coupe la session si la nouvelle passerelle ne répond pas. Gardez un accès console."],
        examples: [
          ex("Route par défaut", "ip route show default", "La passerelle et l’interface utilisées pour le reste du réseau."),
          ex("Quelle route pour une adresse", "ip route get 192.0.2.1", "Affiche l’interface et la passerelle choisies, sans rien modifier."),
          ex("Poser une route de réseau", "sudo ip route add 192.0.2.0/24 dev eth0", "Les adresses de ce préfixe sortent par eth0, sans passerelle."),
        ],
      },
      {
        name: "neigh",
        summary: "Montre ou vide le cache des voisins, adresses MAC et NDP.",
        explanation: "`ip neigh` remplace `arp`, et couvre IPv4 comme IPv6. `show` liste les voisins connus : adresse, MAC, interface, état. `REACHABLE` vient d’être confirmé, `STALE` est encore utilisable, `FAILED` n’a pas répondu. `flush dev eth0` oublie le cache de cette interface, utile quand une machine a changé de carte. `replace 192.0.2.1 lladdr 02:00:00:00:00:0a dev eth0` force une entrée. On ne s’en sert pas pour configurer sa propre adresse : ça, c’est `ip addr`.",
        examples: [
          ex("Voisinage", "ip neigh", "Adresses, MAC et interface. Remplace arp -n."),
          ex("Oublier une interface", "sudo ip neigh flush dev eth0", "Le cache se reconstruira au prochain trafic."),
        ],
      },
      {
        name: "rule",
        summary: "Choisit quelle table de routage utiliser selon la source ou la marque.",
        explanation: "`ip rule` décide de la table consultée avant `ip route`. La règle par défaut envoie tout vers la table main. `add from 192.0.2.10/32 table 100` fait sortir ce qui vient de cette adresse par la table 100. `priority` fixe l’ordre : la plus petite valeur est essayée d’abord. `del` retire une règle en répétant les mêmes sélecteurs. Sans règle supplémentaire, cette sous-commande ne sert pas au quotidien. Elle devient nécessaire dès qu’une machine a deux accès réseau et doit répondre par celui qui a reçu la demande.",
        examples: [
          ex("Règles en place", "ip rule", "Les priorités 0, 32766 et 32767 sont celles d’un système ordinaire."),
          ex("Envoyer une source vers une autre table", "sudo ip rule add from 192.0.2.10/32 table 100", "Le trafic de cette adresse consulte la table 100, à remplir avec ip route."),
        ],
      },
      {
        name: "monitor",
        summary: "Affiche les changements d’adresses, de liens et de routes au fil de l’eau.",
        explanation: "`ip monitor` reste ouvert et écrit chaque modification. Sans argument, il suit tout. `ip monitor link` ne garde que les interfaces, `ip monitor address` les adresses, `ip monitor route` les routes. Ctrl+C arrête. C’est le moyen de voir ce que NetworkManager ou un script vient de changer, sans relancer `ip addr` en boucle.",
        examples: [
          ex("Tout suivre", "ip monitor", "Une ligne à chaque changement. Ctrl+C quitte."),
          ex("Seulement les adresses", "ip monitor address", "N’affiche pas les routes ni les changements d’état du lien."),
        ],
      },
      {
        name: "netns",
        summary: "Crée et utilise un espace de noms réseau isolé.",
        explanation: "`ip netns` donne à un groupe de processus ses propres interfaces, adresses et routes. `list` montre les espaces existants. `add demo` en crée un, avec la boucle down tant qu’on ne l’a pas activée. `exec demo commande` lance la commande dedans. `delete demo` le retire. Les interfaces s’y déplacent avec `ip link set eth0 netns demo`. C’est l’outil des conteneurs et des maquettes, pas celui d’une adresse sur la machine hôte.",
        examples: [
          ex("Créer un espace", "sudo ip netns add demo", "L’espace existe. ip netns list l’affiche."),
          ex("Y lancer une commande", "sudo ip netns exec demo ip -br addr", "Montre les adresses vues depuis demo, pas celles de l’hôte."),
        ],
      },
      {
        name: "tunnel",
        summary: "Crée un tunnel IP dans IP, GRE ou SIT.",
        explanation: "`ip tunnel` encapsule un paquet IP dans un autre. `add tun0 mode gre local 192.0.2.10 remote 198.51.100.20` crée un tunnel GRE. `mode ipip` encapsule IPv4 dans IPv4, `mode sit` porte IPv6 sur IPv4. Ensuite l’interface se traite comme une autre : `ip link set tun0 up`, puis `ip addr add` pour son adresse interne. `show` liste les tunnels. `delete` en retire un. Le pare-feu doit laisser passer le protocole du tunnel, sinon le lien est up et rien ne passe.",
        examples: [
          ex("Lister", "ip tunnel show", "Les tunnels configurés dans le noyau. Vide s’il n’y en a pas."),
          ex("Créer un GRE", "sudo ip tunnel add tun0 mode gre local 192.0.2.10 remote 198.51.100.20", "Crée l’interface. Elle reste down tant que ip link set tun0 up n’est pas lancé."),
        ],
      },
      {
        name: "vrf",
        summary: "Isole une table de routage derrière une interface VRF.",
        explanation: "`ip vrf` attache des interfaces à une table de routage nommée. `add vrf-bleu table 10` crée l’interface VRF liée à la table 10. `ip link set eth0 master vrf-bleu` y place une interface réelle. Le trafic de eth0 consulte alors cette table, pas la table principale. `show` liste les VRF. On s’en sert quand plusieurs réseaux doivent cohabiter sur la même machine sans se mélanger. La table elle-même se remplit avec `ip route`.",
        examples: [
          ex("Créer une VRF", "sudo ip link add vrf-bleu type vrf table 10", "L’interface vrf-bleu représente la table 10."),
          ex("Voir les VRF", "ip vrf show", "Nom et table. Rien ne s’affiche s’il n’y en a pas."),
        ],
      },
    ],
  },
  ss: {
    explanation: "`ss` lit les sockets dans le noyau. Il remplace `netstat`. Les lettres se combinent : `-t` TCP, `-u` UDP, `-l` l’écoute, `-p` le processus, `-n` sans DNS. `-s` résume les compteurs. Un filtre `state` choisit l’état des connexions.",
    subcommands: [
      {
        name: "-tulpn",
        summary: "Liste les ports en écoute, TCP et UDP, avec le processus.",
        explanation: "Chaque lettre est une option. `-t` garde TCP, `-u` garde UDP, `-l` ne montre que l’écoute, `-p` ajoute le processus, `-n` n’interroge pas le DNS. Ensemble, `ss -tulpn` répond à la question « qui écoute, et sur quel port ». Sans les droits d’administration, la colonne processus reste vide pour les services des autres. Le nom du service n’est pas traduit : vous voyez 22, pas ssh.",
        examples: [
          ex("Ports en écoute", "sudo ss -tulpn", "TCP et UDP, numéros de port, et le PID quand le droit de le lire est là."),
          ex("Seulement TCP", "sudo ss -tlnp", "Retire UDP. Utile quand la liste est longue."),
        ],
      },
      {
        name: "state",
        summary: "Filtre les connexions selon leur état.",
        explanation: "`state established` ne garde que les sessions en cours. `state time-wait` montre celles qui finissent de se fermer. `state syn-sent` montre les connexions pas encore abouties. On le combine avec `-t` pour TCP. `-p` ajoute le processus. Ce n’est pas un suivi continu : la commande affiche l’instant, puis revient.",
        examples: [
          ex("Sessions en cours", "ss -tp state established", "Connexions TCP établies, avec le nom du processus si les droits le permettent."),
          ex("En attente de fermeture", "ss -tan state time-wait", "Beaucoup de lignes ici signalent souvent des connexions très courtes et nombreuses."),
        ],
      },
      {
        name: "-s",
        summary: "Résume le nombre de sockets par type.",
        explanation: "`ss -s` écrit les totaux : TCP, UDP, paires de sockets locales, compteurs d’états. Ce n’est pas la liste des ports. On s’en sert pour voir d’un coup si la machine accumule des connexions, avant de détailler avec `-tulpn` ou `state`.",
        examples: [
          ex("Totaux", "ss -s", "Quelques lignes de compteurs, sans la liste des sockets."),
        ],
      },
    ],
  },
  systemctl: {
    explanation: "`systemctl` pilote les unités systemd : services, sockets, minuteurs, cibles. L’action est le premier mot. L’unité SSH s’appelle `ssh.service` sur Debian et Ubuntu, `sshd.service` sur Red Hat, SUSE et Arch. Alpine n’utilise pas cette commande.",
    subcommands: [
      {
        name: "status",
        summary: "Dit si l’unité tourne, et montre les dernières lignes de journal.",
        explanation: "`status` n’a pas besoin des droits d’administration pour lire. Il écrit l’état, le PID, le démarrage automatique, puis un extrait du journal. `active (running)` signifie que le processus est là. `inactive (dead)` signifie qu’il est arrêté. `failed` signifie que le dernier démarrage n’a pas abouti. Ajoutez `--no-pager` dans un script pour éviter que `less` bloque la sortie.",
        examples: [
          ex("SSH Debian et Ubuntu", "systemctl status ssh.service", "L’unité s’appelle ssh.", ["debian"]),
          ex("SSH Red Hat, SUSE et Arch", "systemctl status sshd.service", "L’unité s’appelle sshd.", ["redhat", "suse", "arch"]),
        ],
      },
      {
        name: "start",
        summary: "Démarre l’unité maintenant, sans la rendre permanente.",
        explanation: "`start` lance le service pour cette session de fonctionnement. Au prochain démarrage, il ne reviendra que s’il est aussi activé avec `enable`. Un échec se lit avec `status` et `journalctl`, pas seulement avec le code de retour.",
        examples: [
          ex("Démarrer", "sudo systemctl start ssh.service", "Sur Red Hat, SUSE et Arch, remplacez ssh.service par sshd.service.", ["debian"]),
        ],
      },
      {
        name: "stop",
        summary: "Arrête l’unité maintenant.",
        explanation: "`stop` demande l’arrêt propre du service. Il ne retire pas le lien de démarrage : au prochain boot, un service activé repartira. Pour qu’il ne reparte pas non plus tout de suite si une socket ou une dépendance le réveille, voyez `mask`.",
        examples: [
          ex("Arrêter", "sudo systemctl stop ssh.service", "Le processus s’arrête. enable, lui, n’est pas modifié.", ["debian"]),
        ],
      },
      {
        name: "restart",
        summary: "Arrête puis relance l’unité.",
        explanation: "`restart` coupe le service et le démarre à nouveau. La coupure est réelle : les connexions en cours tombent. Si l’unité sait recharger sa configuration sans s’arrêter, `reload` est plus doux. `try-restart` ne fait rien quand le service est déjà arrêté.",
        examples: [
          ex("Relancer", "sudo systemctl restart ssh.service", "Les sessions SSH en cours sont coupées.", ["debian"]),
        ],
      },
      {
        name: "reload",
        summary: "Demande à l’unité de relire sa configuration sans s’arrêter.",
        explanation: "`reload` n’existe que si le service l’a prévu. Sinon systemd répond que l’action n’est pas supportée. `reload-or-restart` recharge quand c’est possible et redémarre sinon. C’est souvent le bon geste après avoir modifié un fichier de configuration.",
        examples: [
          ex("Recharger ou redémarrer", "sudo systemctl reload-or-restart ssh.service", "Recharge si l’unité le permet, sinon la redémarre.", ["debian"]),
        ],
      },
      {
        name: "enable",
        summary: "Relance l’unité aux prochains démarrages.",
        explanation: "`enable` crée le lien qui fait démarrer l’unité avec sa cible, en général multi-user. Il ne la lance pas tout de suite : ajoutez `--now` pour l’activer et la démarrer dans la même commande. `is-enabled` répond `enabled` ou `disabled`, en un mot, ce qui se teste dans un script.",
        examples: [
          ex("Activer et démarrer", "sudo systemctl enable --now ssh.service", "Le service tourne maintenant et reviendra au prochain boot.", ["debian"]),
          ex("Voir si c’est activé", "systemctl is-enabled ssh.service", "Écrit enabled, disabled, ou un autre état, puis revient.", ["debian"]),
        ],
      },
      {
        name: "disable",
        summary: "Retire le démarrage automatique.",
        explanation: "`disable` retire le lien de démarrage. Le service en cours continue jusqu’à un `stop` ou un redémarrage de la machine. `--now` le désactive et l’arrête ensemble.",
        examples: [
          ex("Désactiver et arrêter", "sudo systemctl disable --now ssh.service", "Plus de démarrage automatique, et le processus s’arrête.", ["debian"]),
        ],
      },
      {
        name: "mask",
        summary: "Interdit le démarrage de l’unité, même à la main.",
        explanation: "`mask` pointe l’unité vers /dev/null. `start` échoue ensuite, et une dépendance ne peut plus la réveiller. `unmask` rend l’unité démarrable. On s’en sert pour un service qu’il ne faut vraiment plus lancer, pas pour un simple arrêt.",
        examples: [
          ex("Interdire", "sudo systemctl mask ssh.service", "systemctl start échoue tant que unmask n’a pas été lancé.", ["debian"]),
          ex("Autoriser de nouveau", "sudo systemctl unmask ssh.service", "L’unité redevient démarrable. Elle n’est pas lancée pour autant."),
        ],
      },
      {
        name: "list-units",
        summary: "Liste les unités chargées, ou seulement celles en échec.",
        explanation: "`list-units` montre ce qui est en mémoire. `--type=service` ne garde que les services, `--state=failed` ne garde que les échecs. `--all` inclut les unités inactives. `list-unit-files` est l’autre liste : elle dit si chaque fichier est enabled, disabled ou static, que l’unité tourne ou non.",
        examples: [
          ex("Services en échec", "systemctl list-units --type=service --state=failed", "Vide si rien n’a échoué. Sinon, le nom de l’unité à lire avec status."),
          ex("Fichiers activés", "systemctl list-unit-files --type=service --state=enabled", "Ce qui est prévu au démarrage, pas ce qui tourne à cet instant."),
        ],
      },
      {
        name: "cat",
        summary: "Affiche le fichier d’unité réellement utilisé.",
        explanation: "`cat` écrit le contenu de l’unité et signale les surcharges dans /etc. C’est le texte que systemd lit, pas une copie que vous auriez ouverte au mauvais endroit. `edit` ouvre ensuite un fragment dans /etc/systemd/system pour surcharger une directive sans modifier le fichier du paquet. `daemon-reload` est obligatoire après un changement de fichier d’unité.",
        examples: [
          ex("Lire l’unité", "systemctl cat ssh.service", "Le fichier, et les drop-in s’il y en a.", ["debian"]),
          ex("Prendre en compte un fichier modifié", "sudo systemctl daemon-reload", "Relit les unités. Ne redémarre pas les services."),
        ],
      },
    ],
  },
  journalctl: {
    explanation: "`journalctl` lit le journal de systemd. Sans option, c’est tout le journal, du plus ancien au plus récent. Les options croisent une unité, un démarrage, une priorité ou une période. Sans droits, vous ne voyez que votre propre journal.",
    subcommands: [
      {
        name: "-u",
        summary: "Limite le journal à une unité.",
        explanation: "`-u` choisit le service. On peut le répéter pour en suivre plusieurs. Le nom est le même que pour `systemctl` : `ssh.service` sur Debian et Ubuntu, `sshd.service` ailleurs. `-e` saute à la fin, ce qui évite de parcourir des mois de lignes.",
        examples: [
          ex("Journal du SSH", "journalctl -u ssh.service -e", "Place la fin du journal à l’écran. q quitte le visualiseur.", ["debian"]),
          ex("Deux unités", "journalctl -u ssh.service -u ssh.socket", "Les lignes des deux unités, dans l’ordre du temps.", ["debian"]),
        ],
      },
      {
        name: "-b",
        summary: "Limite au démarrage en cours, ou à un démarrage précédent.",
        explanation: "`-b` ne garde que le boot actuel. `-b -1` est le démarrage précédent, utile après un plantage. `-b -2` remonte d’un cran de plus. `journalctl --list-boots` numérote les démarrages encore conservés.",
        examples: [
          ex("Ce démarrage", "journalctl -b -p err", "Erreurs et priorités plus graves depuis le boot."),
          ex("Le démarrage d’avant", "journalctl -b -1 -p err", "Même filtre, sur le boot précédent, s’il est encore dans le journal."),
        ],
      },
      {
        name: "-f",
        summary: "Suit les lignes nouvelles, comme tail -f.",
        explanation: "`-f` reste ouvert et affiche ce qui arrive. Ctrl+C arrête. On le combine avec `-u` pour ne suivre qu’un service. Ce n’est pas un enregistrement : fermer le terminal arrête la lecture, pas le journal.",
        examples: [
          ex("Suivre un service", "journalctl -u ssh.service -f", "Les nouvelles lignes du SSH. Ctrl+C quitte.", ["debian"]),
        ],
      },
      {
        name: "-p",
        summary: "Filtre par priorité : err, warning, info.",
        explanation: "`-p err` garde la priorité erreur et tout ce qui est plus grave. `-p warning` inclut aussi les avertissements. Les noms vont de emerg à debug. Sans `-p`, le journal mélange le bruit et les pannes.",
        examples: [
          ex("Erreurs seulement", "journalctl -b -p err", "Depuis ce démarrage. Ajoutez -u pour un seul service."),
        ],
      },
      {
        name: "--since",
        summary: "Borne le journal dans le temps.",
        explanation: "`--since today` part de minuit. `--since '1 hour ago'` et `--until '10 min ago'` acceptent une date ou une durée relative. `--since` et `--until` se combinent. Le format d’affichage se change avec `-o short-iso` quand un script doit relire l’heure.",
        examples: [
          ex("Depuis ce matin", "journalctl --since today -p warning", "Avertissements et erreurs depuis minuit."),
          ex("Heure stable", "journalctl -u ssh.service -o short-iso --since today", "Horodatage ISO, plus simple à recopier qu’une heure locale.", ["debian"]),
        ],
      },
      {
        name: "-k",
        summary: "Ne garde que les messages du noyau.",
        explanation: "`-k` est le journal du noyau vu par systemd, proche de `dmesg`, avec les mêmes filtres de temps et de priorité. `-k -b -1` relit le noyau du démarrage précédent, ce que le tampon de `dmesg` ne peut plus faire une fois écrasé.",
        examples: [
          ex("Noyau de ce boot", "journalctl -k -b -p err", "Erreurs noyau depuis le démarrage."),
        ],
      },
      {
        name: "--disk-usage",
        summary: "Dit combien de place le journal occupe, et permet d’en rendre.",
        explanation: "`--disk-usage` écrit la taille conservée. `--vacuum-time=14d` efface ce qui est plus vieux que quatorze jours. `--vacuum-size=200M` borne la taille. Ce sont des nettoyages immédiats. La limite durable se règle dans /etc/systemd/journald.conf, pas seulement avec ces options.",
        examples: [
          ex("Place utilisée", "journalctl --disk-usage", "Une ligne avec la taille du journal."),
          ex("Garder deux semaines", "sudo journalctl --vacuum-time=14d", "Supprime les archives plus anciennes. Le journal en cours reste."),
        ],
      },
    ],
  },
  apt: {
    explanation: "`apt` est le frontal des paquets Debian et Ubuntu. L’index se rafraîchit avec `update`. Les paquets se mettent à jour avec `upgrade`. `apt-get` reste la forme stable des scripts. `apt-key` n’existe plus : une clé de dépôt se dépose à part et se cite avec Signed-By.",
    subcommands: [
      {
        name: "update",
        summary: "Rafraîchit la liste des paquets disponibles. N’installe rien.",
        explanation: "`update` télécharge les index des dépôts. Il ne met pas les paquets à jour. Sans lui, `install` et `upgrade` raisonnent sur une liste périmée. Un dépôt dont la clé ou l’adresse est fausse s’affiche ici, avant toute installation.",
        examples: [
          ex("Rafraîchir les index", "sudo apt update", "Lit les dépôts. Les paquets déjà installés ne changent pas.", ["debian"]),
        ],
      },
      {
        name: "upgrade",
        summary: "Installe les mises à jour sans retirer de paquet.",
        explanation: "`upgrade` applique les nouvelles versions. S’il faut retirer un paquet pour y arriver, il s’abstient et le signale. `full-upgrade` accepte ces retraits : on le réserve à une mise à jour que l’on a lue. Aucun des deux ne rafraîchit l’index. Enchaînez `update` puis `upgrade`.",
        examples: [
          ex("Mettre à jour", "sudo apt update && sudo apt upgrade", "D’abord les listes, ensuite les paquets. La question se confirme.", ["debian"]),
        ],
      },
      {
        name: "install",
        summary: "Installe un paquet et ce dont il a besoin.",
        explanation: "`install` résout les dépendances et propose le téléchargement. Plusieurs noms se donnent à la suite. `./paquet.deb` installe un fichier local en tirant quand même les dépendances depuis les dépôts, ce que `dpkg -i` ne fait pas. `-y` répond oui : à réserver à un script dont vous assumez la liste.",
        examples: [
          ex("Un paquet", "sudo apt install curl", "Affiche la taille et attend la confirmation.", ["debian"]),
          ex("Un fichier local", "sudo apt install ./outil.deb", "Installe le fichier et les dépendances manquantes.", ["debian"]),
        ],
      },
      {
        name: "remove",
        summary: "Retire un paquet et laisse ses fichiers de configuration.",
        explanation: "`remove` désinstalle le programme et garde /etc. `purge` retire aussi ces fichiers. `autoremove` enlève les dépendances qui ne servent plus à personne. Aucune de ces formes ne touche aux données que vous auriez mises ailleurs que dans les fichiers du paquet.",
        examples: [
          ex("Retirer en gardant la configuration", "sudo apt remove curl", "Le paquet part. Une configuration dans /etc peut rester.", ["debian"]),
          ex("Retirer aussi la configuration", "sudo apt purge curl", "Efface les fichiers de configuration du paquet.", ["debian"]),
        ],
      },
      {
        name: "search",
        summary: "Cherche un mot dans les noms et les descriptions.",
        explanation: "`search` interroge l’index local. Il ne télécharge rien si `update` a déjà été lancé. La recherche n’est pas un nom exact : `show` affiche la fiche d’un paquet précis, avec la version et les dépendances.",
        examples: [
          ex("Chercher", "apt search curl", "Noms et descriptions qui contiennent le mot. Rien n’est installé.", ["debian"]),
          ex("Fiche", "apt show curl", "Version, taille, dépendances et description.", ["debian"]),
        ],
      },
      {
        name: "list",
        summary: "Liste les paquets installés ou disponibles.",
        explanation: "`list --installed` ne garde que ce qui est installé. `--upgradable` ne garde que ce qu’un `upgrade` changerait. Un motif comme `linux-image*` filtre les noms.",
        examples: [
          ex("Installés", "apt list --installed", "La liste peut être longue. Le visualiseur se quitte avec q.", ["debian"]),
          ex("À mettre à jour", "apt list --upgradable", "Ce que upgrade proposerait.", ["debian"]),
        ],
      },
    ],
  },
  dnf: {
    explanation: "`dnf` installe et met à jour les paquets de RHEL et de Fedora. L’index se rafraîchit tout seul au besoin. `yum` n’est plus qu’un renvoi vers `dnf`. SUSE utilise `zypper`.",
    subcommands: [
      {
        name: "upgrade",
        summary: "Met à jour les paquets installés.",
        explanation: "`upgrade` calcule les nouvelles versions et les propose. `-y` confirme. `check-update` se contente de lister, sans installer. Le cache se reconstruit si les métadonnées sont trop vieilles.",
        examples: [
          ex("Mettre à jour", "sudo dnf upgrade", "Liste les paquets et attend la confirmation.", ["redhat"]),
          ex("Seulement voir", "dnf check-update", "N’installe rien. Un code de retour non nul peut simplement signifier qu’il y a des mises à jour.", ["redhat"]),
        ],
      },
      {
        name: "install",
        summary: "Installe un paquet et ses dépendances.",
        explanation: "`install` accepte un nom, un fichier .rpm local, ou un chemin fourni par un dépôt. Il retire aussi, dans la même transaction, ce qui entrerait en conflit. La transaction se revoit ensuite avec `history`.",
        examples: [
          ex("Installer", "sudo dnf install curl", "Résout les dépendances avant de télécharger.", ["redhat"]),
        ],
      },
      {
        name: "remove",
        summary: "Retire un paquet et ce qui ne sert plus qu’à lui.",
        explanation: "`remove` propose aussi le retrait des dépendances devenues inutiles. Lisez la liste avant de confirmer : elle peut être plus large que le seul nom demandé.",
        examples: [
          ex("Retirer", "sudo dnf remove curl", "Affiche ce qui partirait avec le paquet.", ["redhat"]),
        ],
      },
      {
        name: "search",
        summary: "Cherche dans les noms et les résumés.",
        explanation: "`search` trouve un mot. `info` affiche la fiche d’un paquet précis. `list installed` ne garde que ce qui est déjà là. `provides` dit quel paquet livre un fichier, même s’il n’est pas installé.",
        examples: [
          ex("Chercher", "dnf search curl", "Ne demande pas les droits d’administration.", ["redhat"]),
          ex("Qui fournit un fichier", "dnf provides /usr/bin/curl", "Le paquet qui contient ce chemin.", ["redhat"]),
        ],
      },
      {
        name: "history",
        summary: "Liste les transactions et peut en annuler une.",
        explanation: "`history` numérote ce que `dnf` a installé, mis à jour ou retiré. `history undo identifiant` tente de revenir à l’état d’avant cette transaction. Ce n’est pas toujours possible si une transaction plus récente a modifié les mêmes paquets.",
        examples: [
          ex("Transactions", "dnf history", "Date, action et nombre de paquets.", ["redhat"]),
          ex("Annuler la dernière", "sudo dnf history undo last", "Revient en arrière si les paquets le permettent.", ["redhat"]),
        ],
      },
    ],
  },
  pacman: {
    explanation: "`pacman` est le gestionnaire d’Arch. La mise à jour complète est `-Syu`. `-Sy` seul, sans `-u`, mélange des versions et casse des dépendances. Les opérations se lisent par famille : `-S` installe, `-R` retire, `-Q` interroge ce qui est là, `-F` cherche un fichier dans les dépôts.",
    subcommands: [
      {
        name: "-Syu",
        summary: "Synchronise les dépôts et met tout le système à jour.",
        explanation: "`-S` est la famille installation, `-y` télécharge les bases fraîches, `-u` met à jour les paquets installés. Les trois ensemble sont la commande habituelle. Un paquet ignoré dans /etc/pacman.conf ne bougera pas. Lisez les messages en fin de transaction : un paquet peut demander une action manuelle.",
        pitfalls: ["`pacman -Sy` sans mise à jour du reste désynchronise les versions. La forme complète est pacman -Syu."],
        examples: [
          ex("Mettre à jour", "sudo pacman -Syu", "Base des dépôts, puis paquets installés.", ["arch"]),
        ],
      },
      {
        name: "-S",
        summary: "Installe un paquet depuis les dépôts.",
        explanation: "`-S` installe le nom demandé et ses dépendances. Plusieurs noms se donnent à la suite. `-Ss` cherche dans les dépôts sans installer. `-Si` affiche la fiche distante. Le paquet doit être dans un dépôt activé de /etc/pacman.conf.",
        examples: [
          ex("Installer", "sudo pacman -S curl", "Confirme la taille avant de télécharger.", ["arch"]),
          ex("Chercher", "pacman -Ss curl", "Noms et descriptions dans les dépôts. Rien n’est installé.", ["arch"]),
        ],
      },
      {
        name: "-Rns",
        summary: "Retire un paquet, ses dépendances devenues inutiles et ses fichiers de configuration.",
        explanation: "`-R` retire, `-n` efface les fichiers de configuration sauvegardés, `-s` retire les dépendances qui n’étaient tirées que par lui. `-R` seul laisse la configuration. Regardez la liste : `-s` peut remonter plus haut que le paquet nommé.",
        examples: [
          ex("Retirer complètement", "sudo pacman -Rns curl", "Paquet, configuration et dépendances orphelines.", ["arch"]),
        ],
      },
      {
        name: "-Q",
        summary: "Interroge les paquets installés.",
        explanation: "`-Q` liste ce qui est installé. `-Qo /usr/bin/ls` dit quel paquet possède ce fichier. `-Qi` détaille un paquet installé. `-Qe` ne garde que les paquets explicitement demandés, pas les dépendances. `-Qu` liste ce qu’une mise à jour changerait, sans la lancer.",
        examples: [
          ex("Propriétaire d’un fichier", "pacman -Qo /usr/bin/ls", "Le paquet installé qui fournit ce chemin.", ["arch"]),
          ex("Ce qui serait mis à jour", "pacman -Qu", "Nécessite une base récente. pacman -Syu fait la mise à jour elle-même.", ["arch"]),
        ],
      },
    ],
  },
  zypper: {
    explanation: "`zypper` pilote les paquets d’openSUSE et de SLES. `refresh` met les dépôts à jour, `update` applique les correctifs de la même version. `dup` change de distribution : ce n’est pas la commande du mardi matin.",
    subcommands: [
      {
        name: "refresh",
        summary: "Rafraîchit les index des dépôts.",
        explanation: "`refresh` télécharge les métadonnées. Il n’installe rien. `repos` ou `lr` liste les dépôts connus. Un dépôt en erreur s’affiche ici.",
        examples: [
          ex("Rafraîchir", "sudo zypper refresh", "Met les index à jour.", ["suse"]),
        ],
      },
      {
        name: "update",
        summary: "Installe les mises à jour de la version en cours.",
        explanation: "`update` applique correctifs et nouvelles versions sans changer d’édition de Leap ou de SLES. Il suppose des index récents : enchaînez `refresh`. `patch` ne prend que les correctifs marqués comme tels, plus étroit que `update`.",
        examples: [
          ex("Mettre à jour", "sudo zypper refresh && sudo zypper update", "Index, puis paquets.", ["suse"]),
        ],
      },
      {
        name: "install",
        summary: "Installe un paquet et ses dépendances.",
        explanation: "`install` accepte un nom ou un chemin. `remove` retire. La résolution se confirme avant téléchargement. `info` affiche la fiche sans installer.",
        examples: [
          ex("Installer", "sudo zypper install curl", "Affiche ce qui sera ajouté.", ["suse"]),
          ex("Fiche", "zypper info curl", "Version et dépôt, sans installation.", ["suse"]),
        ],
      },
      {
        name: "search",
        summary: "Cherche un paquet dans les dépôts.",
        explanation: "`search` interroge les noms et les résumés. `--installed-only` ne regarde que la machine. La recherche ne modifie rien.",
        examples: [
          ex("Chercher", "zypper search curl", "Tableau des paquets correspondants.", ["suse"]),
        ],
      },
    ],
  },
  apk: {
    explanation: "`apk` est le gestionnaire d’Alpine. `update` rafraîchit l’index, `upgrade` met à jour, `add` installe, `del` retire. Dans une image, `--no-cache` évite de conserver l’index.",
    subcommands: [
      {
        name: "update",
        summary: "Rafraîchit l’index des dépôts.",
        explanation: "`update` lit /etc/apk/repositories et télécharge les index. Il n’installe pas les mises à jour : c’est `upgrade`. Dans un script d’image, on préfère souvent `add --no-cache`, qui rafraîchit et n’écrit pas l’index dans le système.",
        examples: [
          ex("Rafraîchir", "doas apk update", "Met les index à jour. doas est l’élévation habituelle.", ["alpine"]),
        ],
      },
      {
        name: "upgrade",
        summary: "Met à jour les paquets installés.",
        explanation: "`upgrade` applique les versions des index. `-a` inclut aussi les changements de dépendances plus larges. Sans `update` récent, la commande ne voit pas les nouveautés.",
        examples: [
          ex("Mettre à jour", "doas apk update && doas apk upgrade", "Index, puis paquets.", ["alpine"]),
        ],
      },
      {
        name: "add",
        summary: "Installe un paquet.",
        explanation: "`add` installe le nom demandé. `--no-cache` met l’index à jour pour cette commande et ne le laisse pas sur le disque. Plusieurs noms se donnent à la suite. `del` retire un paquet.",
        examples: [
          ex("Installer sans garder l’index", "doas apk add --no-cache curl", "Habituel dans une image minimale.", ["alpine"]),
          ex("Retirer", "doas apk del curl", "Désinstalle le paquet.", ["alpine"]),
        ],
      },
      {
        name: "search",
        summary: "Cherche un paquet, ou liste les fichiers d’un paquet installé.",
        explanation: "`search` interroge les index. `info` décrit un paquet. `info -L` liste les fichiers qu’il a installés. `search -e` exige le nom exact plutôt qu’un fragment.",
        examples: [
          ex("Chercher", "apk search curl", "Noms qui correspondent.", ["alpine"]),
          ex("Fichiers installés", "apk info -L busybox", "Chemins fournis par le paquet.", ["alpine"]),
        ],
      },
    ],
  },
  find: {
    explanation: "`find` part d’un répertoire, applique des tests, puis une action. L’action par défaut est d’écrire le nom. Les tests se combinent de gauche à droite. `-delete` et `-exec` agissent vraiment : on vérifie d’abord avec `-print`.",
    subcommands: [
      {
        name: "-name",
        summary: "Garde les fichiers dont le nom correspond au motif.",
        explanation: "Le motif est celui du shell, mais il doit être cité pour que `find` le lise, pas le shell. `-name '*.log'` est sensible à la casse. `-iname` ne l’est pas. Le motif ne porte que sur le nom, pas sur le chemin : pour le chemin entier, c’est `-path`.",
        examples: [
          ex("Par le nom", "find /var/log -name '*.gz'", "Fichiers dont le nom se termine par .gz."),
          ex("Sans tenir compte de la casse", "find . -iname 'lisezmoi*'", "Lisezmoi, LISEZMOI et les variantes."),
        ],
      },
      {
        name: "-type",
        summary: "Garde un type : fichier, répertoire, lien.",
        explanation: "`-type f` est un fichier régulier, `-type d` un répertoire, `-type l` un lien symbolique. Sans ce test, `find` rend aussi les répertoires dont le nom correspond. On le place avant une action destructive.",
        examples: [
          ex("Fichiers seulement", "find /etc -type f -name '*.conf'", "Ignore les répertoires qui s’appelleraient aussi .conf."),
        ],
      },
      {
        name: "-mtime",
        summary: "Garde les fichiers selon leur âge, en jours.",
        explanation: "`-mtime -7` a été modifié il y a moins de sept jours. `+7` a été modifié il y a plus de sept jours. `-mmin` compte en minutes. `-size +10M` filtre par taille. Ces tests se chaînent : un fichier doit tous les satisfaire.",
        examples: [
          ex("Modifiés depuis hier", "find /etc -type f -mtime -1", "Moins d’un jour, fichiers réguliers."),
          ex("Plus gros que dix mégaoctets", "find /var -type f -size +10M", "La taille est celle du fichier, pas l’espace du disque entier."),
        ],
      },
      {
        name: "-print0",
        summary: "Sépare les noms par un octet nul, pour les passer à xargs.",
        explanation: "Un nom peut contenir un espace ou un saut de ligne. `-print` les écrit tels quels et le lecteur suivant les découpe mal. `-print0` termine chaque nom par un octet nul. `xargs -0` relit ce format. C’est la forme à utiliser dès que les noms ne sont pas les vôtres.",
        examples: [
          ex("Liste sûre", "find /var/log -name '*.gz' -print0 | xargs -0 ls -l", "Les espaces dans les noms ne coupent pas la commande."),
        ],
      },
      {
        name: "-delete",
        summary: "Supprime ce qui a passé les tests.",
        explanation: "`-delete` retire les fichiers correspondants, sans corbeille. Il se place après les tests, jamais avant : `find` évalue de gauche à droite. On lance d’abord la même commande avec `-print` pour voir ce qui partirait. `-delete` ne demande pas de confirmation.",
        pitfalls: ["`find . -delete` sans test préalable efface tout ce que find peut parcourir depuis le point de départ."],
        examples: [
          ex("Voir d’abord", "find /tmp/demo -type f -name '*.bak' -print", "La liste. Remplacez -print par -delete seulement quand elle est la bonne."),
        ],
      },
      {
        name: "-exec",
        summary: "Lance une commande pour chaque fichier trouvé.",
        explanation: "`-exec commande {} ;` remplace `{}` par le fichier et lance la commande une fois par fichier. Le point-virgule se cite. `-exec commande {} +` groupe plusieurs fichiers dans un seul lancement, comme `xargs`. `-execdir` se place d’abord dans le répertoire du fichier, ce qui évite qu’un nom piégé soit lu depuis le répertoire de départ.",
        examples: [
          ex("Une commande par fichier", "find /tmp/demo -type f -name '*.log' -exec ls -l {} \\;", "Le ; est cité pour que le shell le laisse à find."),
          ex("Groupé", "find /tmp/demo -type f -name '*.log' -exec ls -l {} +", "Moins de processus : ls reçoit plusieurs noms à la fois."),
        ],
      },
    ],
  },
  tar: {
    explanation: "`tar` réunit des fichiers dans une archive. `-c` crée, `-x` extrait, `-t` liste, `-f` donne le nom du fichier. La compression se choisit avec `-z` pour gzip, `-J` pour xz, `-j` pour bzip2, `--zstd` pour zstd. On regarde `-t` avant d’extraire.",
    subcommands: [
      {
        name: "-c",
        summary: "Crée une archive.",
        explanation: "`-c` lit les chemins donnés ensuite et les range dans l’archive. `-f` doit nommer le fichier de sortie. `-v` liste ce qui est pris. `-C` change de répertoire avant d’ajouter les noms, ce qui évite de stocker un préfixe absolu. L’ordre lisible est `tar -czf archive.tar.gz -C source .`",
        examples: [
          ex("Archive gzip d’un répertoire", "tar -czf /tmp/etc-ssh.tar.gz -C /etc ssh", "Stocke ssh/…, pas /etc/ssh. -z compresse avec gzip."),
        ],
      },
      {
        name: "-x",
        summary: "Extrait une archive.",
        explanation: "`-x` recrée les fichiers. `-C /tmp/dest` choisit le répertoire de destination, qui doit exister. Sans `-C`, l’extraction part du répertoire courant. Une archive qui contient des chemins absolus ou `..` peut écrire hors de l’endroit prévu : on liste avant.",
        pitfalls: ["Extraire à la racine d’un projet peut écraser des fichiers du même nom. Créez un répertoire vide et utilisez -C."],
        examples: [
          ex("Extraire à part", "mkdir -p /tmp/out && tar -xzf /tmp/etc-ssh.tar.gz -C /tmp/out", "Le contenu apparaît dans /tmp/out."),
        ],
      },
      {
        name: "-t",
        summary: "Liste le contenu sans l’extraire.",
        explanation: "`-t` écrit les noms stockés. La lettre de compression doit être la bonne, ou `tar` la devine sur les versions récentes à partir du suffixe. Un nom qui commence par `/` ou qui contient `..` est une raison de ne pas extraire tel quel.",
        examples: [
          ex("Lister", "tar -tzf /tmp/etc-ssh.tar.gz", "Les chemins, un par ligne. Rien n’est écrit sur le disque."),
        ],
      },
      {
        name: "-C",
        summary: "Change de répertoire pour la suite des arguments.",
        explanation: "`-C` s’applique à ce qui suit, pas à toute la commande. On peut en mettre plusieurs : `-C /etc ssh -C /var log` prend ssh dans /etc puis log dans /var. À l’extraction, un seul `-C` vers un répertoire vide suffit presque toujours.",
        examples: [
          ex("Deux origines", "tar -cf /tmp/melange.tar -C /etc hostname -C /var log", "L’archive contient hostname et le répertoire log, sans leurs préfixes."),
        ],
      },
    ],
  },
  grep: {
    explanation: "`grep` écrit les lignes qui correspondent à un motif. Sans fichier, il lit l’entrée standard. `-E` et `-F` remplacent les commandes obsolètes `egrep` et `fgrep`. Le motif se cite pour que le shell ne l’interprète pas.",
    subcommands: [
      {
        name: "-n",
        summary: "Ajoute le numéro de ligne.",
        explanation: "`-n` préfixe chaque ligne retenue par son numéro dans le fichier. `-H` force aussi le nom du fichier, utile quand on n’en donne qu’un. `-c` ne garde que le nombre de lignes, sans les afficher.",
        examples: [
          ex("Avec les numéros", "grep -n root /etc/passwd", "Chaque ligne qui contient root, précédée de son numéro."),
        ],
      },
      {
        name: "-E",
        summary: "Motif étendu : parenthèses, alternative, quantifieurs.",
        explanation: "`-E` active les expressions rationnelles étendues. `|` sépare des alternatives, les parenthèses groupent, `+` et `?` comptent. C’est le remplaçant d’`egrep`, qui avertit depuis GNU grep 3.8. Le motif reste entre quotes simples.",
        examples: [
          ex("Une alternative", "grep -E '^(root|daemon):' /etc/passwd", "Lignes qui commencent par root: ou daemon:."),
        ],
      },
      {
        name: "-F",
        summary: "Cherche une chaîne fixe, pas une expression.",
        explanation: "`-F` ne donne aucun sens spécial au point, à l’étoile ou aux crochets. C’est le remplaçant de `fgrep`. On l’utilise dès que le motif vient d’une donnée : un message d’erreur entre crochets resterait sinon une classe de caractères.",
        examples: [
          ex("Crochets littéraux", "grep -F '[ERROR]' journal.txt", "Cherche les huit caractères, crochets compris."),
        ],
      },
      {
        name: "-R",
        summary: "Parcourt un répertoire.",
        explanation: "`-R` descend dans les sous-répertoires et suit les liens. `-r` descend aussi, sans suivre tous les liens selon les versions. `--include='*.conf'` limite les noms. `-l` n’écrit que les fichiers qui ont au moins une ligne, pas les lignes elles-mêmes. Pour choisir les fichiers avant de chercher, `find` puis `xargs` reste plus précis.",
        examples: [
          ex("Dans les fichiers de configuration", "grep -R --include='*.conf' -n Listen /etc", "Numéro de ligne, seulement dans les noms qui finissent par .conf."),
        ],
      },
      {
        name: "-v",
        summary: "Garde les lignes qui ne correspondent pas.",
        explanation: "`-v` inverse la sélection. `-i` ignore la casse, et se combine avec `-v`. `-w` exige un mot entier, pour ne pas prendre un motif au milieu d’un autre mot.",
        examples: [
          ex("Tout sauf les commentaires", "grep -v '^#' /etc/fstab", "Retire les lignes qui commencent par #. Les lignes vides restent."),
        ],
      },
    ],
  },
  mount: {
    explanation: "`mount` attache un système de fichiers à un répertoire, ou liste les montages. Un montage lancé à la main disparaît au redémarrage : la ligne durable est dans `fstab`. `findmnt` relit la situation plus clairement que `mount` sans argument.",
    subcommands: [
      {
        name: "-o",
        summary: "Monte un périphérique, avec des options.",
        explanation: "`mount /dev/sdb1 /mnt` attache la partition. Le répertoire doit exister. Le type se devine souvent tout seul. `-t ext4` l’impose. `-o ro` monte en lecture seule, `-o noexec` interdit d’y lancer des programmes. Il faut en pratique les droits d’administration, sauf ligne `user` dans fstab.",
        examples: [
          ex("Monter", "sudo mount /dev/sdb1 /mnt", "Le contenu est ensuite visible dans /mnt."),
          ex("Lecture seule", "sudo mount -o ro /dev/sdb1 /mnt", "Les écritures sont refusées."),
        ],
      },
      {
        name: "-a",
        summary: "Applique les lignes de fstab qui ne sont pas encore montées.",
        explanation: "`-a` lit /etc/fstab et monte ce qui manque. `-t ext4` ne traite que ce type. Une ligne fausse s’arrête ou s’affiche selon l’option. On vérifie le fichier avec `findmnt --verify` avant de compter dessus au démarrage.",
        examples: [
          ex("Tout fstab", "sudo mount -a", "Monte les entrées absentes. Celles déjà en place ne bougent pas."),
        ],
      },
      {
        name: "--bind",
        summary: "Fait apparaître un répertoire à un second endroit.",
        explanation: "`--bind` ne monte pas un disque : il donne un deuxième chemin au même répertoire. `--rbind` inclut les montages déjà présents dessous. Utile dans un chroot ou pour exposer un dossier sans le copier. `umount` sur le second chemin détache le lien, pas les données.",
        examples: [
          ex("Second chemin", "sudo mount --bind /var/log /mnt", "Lire /mnt lit /var/log. umount /mnt retire ce second chemin."),
        ],
      },
    ],
  },
  ssh: {
    explanation: "`ssh` ouvre une session ou lance une commande sur une autre machine. La première connexion demande de vérifier l’empreinte du serveur. La configuration durable est dans ~/.ssh/config. `scp` et `sftp` utilisent le même service.",
    subcommands: [
      {
        name: "session",
        label: "ssh utilisateur@hôte",
        summary: "Ouvre un shell distant.",
        explanation: "`ssh utilisateur@hôte` connecte et lance le shell de connexion du compte distant. `exit` revient. Un nom défini dans ~/.ssh/config permet d’écrire seulement `ssh nom`. L’empreinte annoncée à la première visite se compare à celle que l’administrateur du serveur a publiée.",
        examples: [
          ex("Session", "ssh user@hote", "Remplacez user et hote. exit quitte la session distante."),
        ],
      },
      {
        name: "commande",
        label: "ssh utilisateur@hôte commande",
        summary: "Lance une commande distante et revient.",
        explanation: "La commande se cite en un seul argument pour que le shell local ne l’interprète pas. Le code de retour est celui de la commande distante. Il n’y a pas de shell interactif : les alias du compte distant ne sont en général pas là.",
        examples: [
          ex("Noyau distant", "ssh user@hote 'uname -r'", "Affiche la version du noyau de l’autre machine."),
        ],
      },
      {
        name: "-i",
        summary: "Choisit le fichier de clé privée.",
        explanation: "`-i` désigne la clé à présenter. Sans cette option, le client essaie les clés par défaut de ~/.ssh. `-o IdentitiesOnly=yes` évite d’en proposer d’autres. La clé publique correspondante doit être dans authorized_keys du compte distant.",
        examples: [
          ex("Une clé précise", "ssh -i ~/.ssh/id_ed25519 user@hote", "N’utilise que cette clé pour cette connexion."),
        ],
      },
      {
        name: "-p",
        summary: "Change le port du serveur.",
        explanation: "`-p` est le port SSH, 22 s’il n’est pas dit. Ce n’est pas la même lettre que pour `scp`, qui utilise `-P` majuscule. Le port durable se pose avec `Port` dans ~/.ssh/config.",
        examples: [
          ex("Port 2222", "ssh -p 2222 user@hote", "Connecte le serveur qui écoute sur 2222."),
        ],
      },
      {
        name: "-L",
        summary: "Ouvre un tunnel du local vers un port atteint par le serveur.",
        explanation: "`-L 8080:127.0.0.1:80` fait écouter votre machine sur 8080 et renvoie ces connexions vers le port 80 vu par le serveur SSH. `-N` n’ouvre pas de shell, seulement le tunnel. `-J bastion` passe d’abord par une machine relais.",
        examples: [
          ex("Tunnel local", "ssh -N -L 8080:127.0.0.1:80 user@hote", "http://127.0.0.1:8080 sur votre machine arrive au port 80 du serveur. Ctrl+C ferme le tunnel."),
        ],
      },
    ],
  },
  nmcli: {
    explanation: "`nmcli` parle à NetworkManager. `device` voit les interfaces, `connection` voit les profils enregistrés. Si la machine est réglée seulement par systemd-networkd, ces profils n’existent pas : `networkctl` et `ip` sont alors les outils.",
    subcommands: [
      {
        name: "device",
        summary: "Montre les interfaces et qui les gère.",
        explanation: "`device status` résume l’état. `device show` détaille adresses et DNS d’une interface. `device disconnect` coupe sans effacer le profil. Ce n’est pas `ip link` : NetworkManager peut remettre l’état qu’il a enregistré.",
        examples: [
          ex("État", "nmcli device status", "TYPE, STATE et le profil actif. Échoue si NetworkManager n’est pas lancé."),
        ],
      },
      {
        name: "connection",
        summary: "Liste, active ou modifie un profil.",
        explanation: "`connection show` liste les profils. `connection up nom` active celui-ci, `down` le coupe. `connection modify` change une propriété durable, par exemple l’adresse ou la passerelle. Le nom du profil n’est pas toujours le nom de l’interface.",
        examples: [
          ex("Profils", "nmcli -t -f NAME,DEVICE connection show", "Liste courte, un profil par ligne."),
          ex("Activer", "nmcli connection up nom-du-profil", "Applique le profil. Le nom vient de connection show."),
        ],
      },
    ],
  },
  nft: {
    explanation: "`nft` administre nftables, le filtre de paquets du noyau. On écrit les règles dans un fichier et on le charge, plutôt que d’empiler des commandes. `iptables` sur les systèmes actuels n’est souvent qu’une traduction vers ce filtre.",
    subcommands: [
      {
        name: "list ruleset",
        summary: "Affiche toutes les tables, chaînes et règles chargées.",
        explanation: "`list ruleset` écrit l’ensemble actif. `list table inet filter` n’en montre qu’une. La lecture ne modifie rien. Une sortie vide signifie qu’aucun service n’a chargé de règles, pas que le noyau est incapable d’en avoir.",
        examples: [
          ex("Tout voir", "sudo nft list ruleset", "Le jeu chargé. Peut être long si un frontal a beaucoup écrit."),
        ],
      },
      {
        name: "-f",
        summary: "Charge un fichier de règles.",
        explanation: "`-f` remplace ou ajoute selon ce que le fichier contient. `-c -f` vérifie la syntaxe sans charger. On vérifie d’abord, on charge ensuite. Un fichier qui vide la table peut couper l’accès à une machine distante : on le prépare depuis la console.",
        examples: [
          ex("Vérifier", "sudo nft -c -f /etc/nftables.conf", "Contrôle le fichier. Les règles actives ne changent pas."),
          ex("Charger", "sudo nft -f /etc/nftables.conf", "Applique le fichier. Le chemin exact dépend de la famille."),
        ],
      },
    ],
  },
  "firewall-cmd": {
    explanation: "`firewall-cmd` pilote firewalld, le pare-feu habituel de Red Hat et de SUSE. Un changement sans `--permanent` disparaît au rechargement. `--reload` applique ce qui a été enregistré.",
    subcommands: [
      {
        name: "--list-all",
        summary: "Montre la zone active, ses services et ses ports.",
        explanation: "La zone par défaut rassemble ce qui est ouvert. `--get-active-zones` dit quelle zone protège quelle interface. `--list-all-zones` détaille chacune. La lecture ne change rien.",
        examples: [
          ex("Zone en service", "sudo firewall-cmd --list-all", "Services, ports et interfaces de la zone par défaut.", ["redhat", "suse"]),
        ],
      },
      {
        name: "--add-service",
        summary: "Ouvre un service connu, pour cette fois ou de façon durable.",
        explanation: "`--add-service=ssh` ouvre le SSH dans la zone en cours, jusqu’au prochain rechargement. `--permanent` l’enregistre. Il faut ensuite `--reload` pour que la règle permanente devienne celle qui s’applique. `--remove-service=ssh --permanent` puis `--reload` referme. `--get-services` liste les noms connus.",
        examples: [
          ex("Ouvrir le SSH durablement", "sudo firewall-cmd --add-service=ssh --permanent && sudo firewall-cmd --reload", "Sans reload, la règle enregistrée n’est pas encore active.", ["redhat", "suse"]),
        ],
      },
    ],
  },
  ufw: {
    explanation: "`ufw` est le frontal de pare-feu habituel d’Ubuntu. Il écrit les règles nftables ou iptables à votre place. On ouvre le SSH avant d’activer, sinon une session distante se coupe.",
    subcommands: [
      {
        name: "status",
        summary: "Dit si le pare-feu est actif et quelles règles sont posées.",
        explanation: "`status` répond active ou inactive. `status verbose` ajoute la politique par défaut. `status numbered` numérote les règles pour pouvoir en supprimer une.",
        examples: [
          ex("État", "sudo ufw status verbose", "Politique par défaut et règles.", ["debian"]),
        ],
      },
      {
        name: "allow",
        summary: "Autorise un port ou un service.",
        explanation: "`allow 22/tcp` ouvre le TCP 22. `allow OpenSSH` utilise le profil du service quand il existe. `deny` fait l’inverse. `delete` retire une règle, plus simplement avec le numéro de `status numbered`.",
        examples: [
          ex("Ouvrir le SSH", "sudo ufw allow 22/tcp", "À faire avant ufw enable sur une machine distante.", ["debian"]),
        ],
      },
      {
        name: "enable",
        summary: "Active le pare-feu.",
        explanation: "`enable` commence à appliquer les règles. `disable` arrête le filtrage. L’activation survit au redémarrage. Sans règle SSH préalable, une connexion distante peut tomber au moment du enable.",
        examples: [
          ex("Activer", "sudo ufw enable", "Demande confirmation. Les règles déjà ajoutées s’appliquent.", ["debian"]),
        ],
      },
    ],
  },
  useradd: {
    explanation: "`useradd` crée un compte. C’est l’outil commun aux familles, celui des scripts. Sur Debian, `adduser` pose les questions à votre place. Sans `-m`, le répertoire personnel n’est pas créé. Le mot de passe se pose ensuite avec `passwd`.",
    subcommands: [
      {
        name: "-m",
        summary: "Crée le répertoire personnel en même temps que le compte.",
        explanation: "`-m` copie le squelette, en général /etc/skel, vers /home/nom. Sans cette option, le compte existe et n’a pas de répertoire. `-d` choisit un autre chemin. `-M` interdit explicitement la création du répertoire.",
        examples: [
          ex("Compte et répertoire", "sudo useradd -m ada", "Crée ada et /home/ada. Le mot de passe n’est pas encore posé."),
        ],
      },
      {
        name: "-s",
        summary: "Choisit le shell de connexion.",
        explanation: "`-s /bin/bash` fixe le shell. Le chemin doit exister. Sur Debian et Ubuntu, le shell des scripts système reste dash : ce choix ne concerne que le compte. `-s /usr/sbin/nologin` crée un compte qui ne peut pas ouvrir de session.",
        examples: [
          ex("Shell bash", "sudo useradd -m -s /bin/bash ada", "Les prochaines connexions de ada démarrent bash."),
        ],
      },
      {
        name: "-G",
        summary: "Ajoute des groupes supplémentaires dès la création.",
        explanation: "`-G` prend une liste séparée par des virgules. Ce ne sont pas le groupe principal : celui-ci se crée souvent au nom de l’utilisateur, ou se choisit avec `-g`. Sur Debian et Ubuntu, le groupe qui donne `sudo` s’appelle sudo. Sur Red Hat, il s’appelle souvent wheel.",
        examples: [
          ex("Groupe d’administration", "sudo useradd -m -G sudo -s /bin/bash ada", "ada peut utiliser sudo, selon la politique de la famille.", ["debian"]),
        ],
      },
    ],
  },
  usermod: {
    explanation: "`usermod` modifie un compte déjà créé. `-aG` ajoute un groupe. Sans `-a`, `-G` remplace toute la liste des groupes supplémentaires.",
    subcommands: [
      {
        name: "-aG",
        summary: "Ajoute des groupes sans retirer ceux qui sont déjà là.",
        explanation: "`-a` signifie append, `-G` la liste. Les deux vont ensemble pour un ajout. La session déjà ouverte ne voit le nouveau groupe qu’après une nouvelle connexion. `groups` et `id` montrent ce qui est enregistré.",
        pitfalls: ["`usermod -G groupe user` sans -a retire tous les autres groupes supplémentaires."],
        examples: [
          ex("Ajouter un groupe", "sudo usermod -aG sudo ada", "ada garde ses groupes et gagne sudo.", ["debian"]),
        ],
      },
      {
        name: "-s",
        summary: "Change le shell de connexion.",
        explanation: "`-s` remplace le shell pour les prochaines connexions. Le shell déjà ouvert ne change pas. Le chemin doit être acceptable par le système. `chsh` fait le même changement en consultant /etc/shells de façon plus stricte.",
        examples: [
          ex("Passer à bash", "sudo usermod -s /bin/bash ada", "Les nouvelles sessions de ada utilisent bash."),
        ],
      },
      {
        name: "-L",
        summary: "Verrouille ou déverrouille le mot de passe.",
        explanation: "`-L` empêche la connexion par mot de passe. `-U` la rend de nouveau possible. Une clé SSH déjà autorisée peut encore fonctionner après `-L`. `passwd -l` est l’autre façon d’écrire le même verrou.",
        examples: [
          ex("Verrouiller", "sudo usermod -L ada", "Le mot de passe ne permet plus d’entrer."),
        ],
      },
    ],
  },
  crontab: {
    explanation: "Une ligne de crontab est « minute heure jour mois jour-semaine commande ». L’environnement est pauvre : les chemins se donnent en absolu. `-r` efface toute la table.",
    subcommands: [
      {
        name: "-l",
        summary: "Affiche la table sans la modifier.",
        explanation: "`-l` écrit les lignes du compte, ou dit qu’il n’y en a pas. `-u ada` vise un autre compte et demande les droits d’administration. On sauvegarde avec une redirection avant une édition risquée.",
        examples: [
          ex("Lire", "crontab -l", "N’ouvre pas l’éditeur."),
        ],
      },
      {
        name: "-e",
        summary: "Ouvre la table dans l’éditeur.",
        explanation: "`-e` lance l’éditeur désigné par VISUAL ou EDITOR. À l’enregistrement, le démon est prévenu. Une ligne fausse est refusée. L’exemple d’horaire se vérifie avant : `15 3 * * *` est tous les jours à 03:15.",
        examples: [
          ex("Éditer", "crontab -e", "Ouvre la table du compte. Enregistrez pour appliquer."),
        ],
      },
      {
        name: "-r",
        summary: "Supprime toute la table.",
        explanation: "`-r` efface toutes les lignes, souvent sans confirmation. `-i` demande avant, quand la version l’a. Il n’y a pas de corbeille : `crontab -l` redirigé vers un fichier est la sauvegarde.",
        pitfalls: ["`crontab -r` retire toutes les tâches du compte, pas une seule ligne."],
        examples: [
          ex("Sauvegarder d’abord", "crontab -l > \"$HOME/crontab.bak\"", "Le fichier contient la table. crontab fichier la réinstallerait."),
        ],
      },
    ],
  },
  timedatectl: {
    explanation: "`timedatectl` montre l’heure, le fuseau et si la synchronisation réseau est active. Le client derrière est chrony sur Ubuntu 26.04, RHEL et Fedora. Debian peut encore utiliser systemd-timesyncd. Alpine n’a pas cette commande.",
    subcommands: [
      {
        name: "status",
        summary: "Résume l’horloge.",
        explanation: "`status` écrit l’heure locale, l’heure UTC, le fuseau, et si NTP est actif. « System clock synchronized: yes » signifie qu’un service a calé l’horloge. Le détail des serveurs se lit avec `chronyc` quand chrony est ce service.",
        examples: [
          ex("État", "timedatectl status", "Heure, fuseau et synchronisation.", ["debian", "redhat", "suse", "arch"]),
        ],
      },
      {
        name: "set-timezone",
        summary: "Change le fuseau de façon durable.",
        explanation: "Le nom est celui de la base tz, par exemple Europe/Paris. `list-timezones` les énumère. Le changement vaut pour le système, pas pour une seule session. Les processus déjà lancés peuvent garder l’ancien fuseau jusqu’à leur redémarrage.",
        examples: [
          ex("Fuseau", "sudo timedatectl set-timezone Europe/Paris", "Les prochaines lectures de la date locale utilisent ce fuseau.", ["debian", "redhat", "suse", "arch"]),
        ],
      },
      {
        name: "set-ntp",
        summary: "Active ou coupe la synchronisation réseau.",
        explanation: "`set-ntp true` laisse le service d’heure démarrer. `false` l’arrête. Ce n’est pas le choix du serveur NTP : ça, c’est la configuration de chrony ou de timesyncd.",
        examples: [
          ex("Activer", "sudo timedatectl set-ntp true", "Démarre le service d’heure de la famille.", ["debian", "redhat", "suse", "arch"]),
        ],
      },
    ],
  },
  resolvectl: {
    explanation: "`resolvectl` interroge systemd-resolved. `query` résout comme la machine, cache compris. `status` montre les résolveurs par interface. C’est le successeur de `systemd-resolve`. Alpine n’a pas cette commande.",
    subcommands: [
      {
        name: "status",
        summary: "Montre les résolveurs et le domaine de recherche.",
        explanation: "`status` détaille chaque interface gérée par resolved : DNS, domaine, et si le DNSSEC est actif. Ce n’est pas /etc/resolv.conf brut : ce fichier ne fait souvent que renvoyer vers resolved.",
        examples: [
          ex("Résolveurs", "resolvectl status", "Une section par interface.", ["debian", "redhat", "suse", "arch"]),
        ],
      },
      {
        name: "query",
        summary: "Résout un nom en passant par le cache du système.",
        explanation: "`query` utilise les résolveurs de la machine, pas un serveur imposé. La réponse peut donc différer d’un `dig @` direct. `query` montre aussi l’interface qui a répondu. Pour un enregistrement précis, le type se donne en second argument.",
        examples: [
          ex("Résoudre", "resolvectl query exemple.fr", "Adresses vues par resolved.", ["debian", "redhat", "suse", "arch"]),
          ex("Seulement le courrier", "resolvectl query exemple.fr MX", "Enregistrements MX.", ["debian", "redhat", "suse", "arch"]),
        ],
      },
      {
        name: "flush-caches",
        summary: "Vide le cache de resolved.",
        explanation: "`flush-caches` oublie les réponses mémorisées. La prochaine résolution redemande aux serveurs. On s’en sert après un changement de DNS qui semble ne pas être pris en compte. Les applications peuvent avoir leur propre cache en plus.",
        examples: [
          ex("Vider", "sudo resolvectl flush-caches", "Le cache système est vide. Les résolveurs ne changent pas.", ["debian", "redhat", "suse", "arch"]),
        ],
      },
    ],
  },
};
