const ex = (title, command, comment) => ({ title, command, comment });
const sub = (name, summary, explanation, examples, pitfalls) => ({
  name, summary, explanation, examples, ...(pitfalls ? { pitfalls } : {}),
});

export const patches = {
  lsblk: { subcommands: [
    sub("-f", "Ajoute système de fichiers et UUID.", "`lsblk` lit sysfs et ne modifie rien. `-f` montre le type, le label et l’UUID. `-o` choisit les colonnes.", [ex("Identifiants", "lsblk -f", "Nom, type, UUID et point de montage.")]),
    sub("-o", "Choisit les colonnes.", "`NAME,SIZE,TYPE,MOUNTPOINTS` suffit souvent. `-J` écrit du JSON sur les versions récentes, plus stable pour un script que le texte aligné.", [ex("Colonnes", "lsblk -o NAME,SIZE,TYPE,MOUNTPOINTS", "La taille et l’endroit où c’est monté.")]),
  ]},
  blkid: { subcommands: [
    sub("tous", "UUID et type de chaque périphérique.", "`blkid` demande souvent l’administrateur pour lire les disques. On copie l’UUID dans fstab plutôt que `/dev/sda1`, qui peut changer de nom.", [ex("Tout", "sudo blkid", "TYPE et UUID, une ligne par périphérique.")]),
    sub("-o", "Change le format de sortie.", "`-o value -s UUID` n’écrit que l’UUID. `-o export` produit des affectations. `-t TYPE=ext4` filtre.", [ex("Un seul", "sudo blkid /dev/sda1", "Remplacez sda1 par un nom vu dans lsblk.")]),
  ]},
  fdisk: { subcommands: [
    sub("-l", "Lit les tables sans ouvrir le menu.", "`fdisk -l` n’écrit rien sur le disque. Les versions actuelles savent lire le GPT, pas seulement le MBR.", [ex("Lire", "sudo fdisk -l", "Disques et partitions.")]),
    sub("menu", "Ouvre l’éditeur de la table.", "Dans le menu, `p` affiche, `n` crée, `g` prépare un GPT, `w` écrit, `q` sort sans écrire. `w` est immédiat.", [ex("Ouvrir un disque de test", "sudo fdisk /dev/sdb", "Uniquement si sdb peut être repartitionné. q sort sans écrire.")], ["w enregistre tout de suite. Tant que w n’est pas tapé, q n’écrit rien."]),
  ]},
  cfdisk: { subcommands: [
    sub("écran", "Édite la table en plein écran.", "`cfdisk` écrit quand vous demandez l’enregistrement. Pour un script, `sfdisk` est plus prévisible. Pour seulement voir, `lsblk` ne risque rien.", [ex("Ouvrir", "sudo cfdisk /dev/sdb", "Ne le lancez pas sur le disque du système si vous ne savez pas quelle partition retirer.")]),
  ]},
  sfdisk: { subcommands: [
    sub("-d", "Écrit une description réutilisable de la table.", "`sfdisk -d` produit un texte que l’on peut renvoyer plus tard à `sfdisk`. Ce n’est pas une sauvegarde des données.", [ex("Sauver", "sudo sfdisk -d /dev/sdb > /root/sdb.sfdisk", "Le fichier décrit la table, pas le contenu des partitions.")]),
    sub("--list", "Affiche la table sans la modifier.", "`--list` se contente de lire. `--show-size` est déprécié : la taille se demande à `blockdev --getsz`.", [ex("Lire", "sudo sfdisk --list /dev/sdb", "La table, sans écriture.")]),
  ]},
  parted: { subcommands: [
    sub("-l", "Liste les disques et leurs tables.", "`parted -l` ne modifie rien. `print` dans une session montre une table. `-s` évite les questions, ce qui est pratique et dangereux.", [ex("Inventaire", "sudo parted -l", "Tables et tailles.")]),
    sub("print", "Montre une table.", "`unit GiB print` affiche en gibioctets dans la session interactive. `mklabel`, `mkpart` et `rm` modifient. Parted ne redimensionne pas à lui seul le système de fichiers.", [ex("Une table", "sudo parted /dev/sdb print", "N’écrit rien.")]),
  ]},
  mkfs: { subcommands: [
    sub("-t", "Choisit le type, forme dépréciée.", "util-linux demande d’appeler `mkfs.ext4`, `mkfs.xfs` ou `mkfs.btrfs` directement. `mkfs -t ext4` fait encore le même travail. Créer un système de fichiers efface la partition.", [ex("Forme explicite", "sudo mkfs.ext4 /dev/sdb1", "À lancer sur une partition vide, jamais sur le disque du système.")], ["Le mauvais nom de partition détruit les données. Il n’y a pas d’annulation."]),
  ]},
  "mkfs.ext4": { subcommands: [
    sub("-L", "Pose un label en créant le système.", "`mkfs.ext4` écrit les structures ext4. `-m` réserve un pourcentage à root, 5 % par défaut. La partition ne doit pas être montée.", [ex("Label", "sudo mkfs.ext4 -L donnees /dev/sdb1", "TYPE ext4 et LABEL donnees, visibles ensuite avec blkid.")]),
  ]},
  "mkfs.xfs": { subcommands: [
    sub("-L", "Crée un XFS avec un label.", "On ne rétrécit pas un XFS. `-f` force la création par-dessus une signature déjà là, et l’efface. La réparation se fait avec `xfs_repair`.", [ex("Créer", "sudo mkfs.xfs -L donnees /dev/sdb1", "Sur une partition que vous acceptez d’effacer.")]),
  ]},
  xfs_repair: { subcommands: [
    sub("-n", "Diagnostic sans écrire.", "`xfs_repair` exige un système démonté. `-n` dit ce qui serait corrigé. Sans `-n`, les corrections sont écrites.", [ex("Lire", "sudo xfs_repair -n /dev/sdb1", "Ne modifie rien.")]),
  ]},
  btrfs: { subcommands: [
    sub("filesystem", "Montre les systèmes Btrfs vus par le noyau.", "`btrfs filesystem show` liste les systèmes. `mkfs.btrfs`, du même paquet, crée le système. Le statut de Btrfs comme système racine dépend de la famille.", [ex("Voir", "sudo btrfs filesystem show", "Vide s’il n’y a pas de Btrfs.")]),
    sub("subvolume", "Crée ou liste des sous-volumes et des instantanés.", "`subvolume list` montre les sous-volumes d’un montage. `subvolume snapshot` prend un instantané. Ce n’est pas une sauvegarde sur un autre disque.", [ex("Lister", "sudo btrfs subvolume list /", "Les sous-volumes, si la racine est en Btrfs.")]),
  ]},
  mkswap: { subcommands: [
    sub("-L", "Prépare une zone d’échange avec un label.", "`mkswap` écrit une signature et efface l’usage précédent. Il n’active rien : `swapon` le fait ensuite.", [ex("Préparer", "sudo mkswap -L swap /dev/sdb2", "Uniquement si sdb2 est destinée au swap.")]),
  ]},
  swapon: { subcommands: [
    sub("--show", "Liste les zones actives.", "`swapon /dev/sdb2` active une zone préparée. `-a` active tout ce que fstab marque comme swap.", [ex("Actives", "swapon --show", "Nom, taille et priorité. Rien si aucun swap n’est actif.")]),
  ]},
  swapoff: { subcommands: [
    sub("-a", "Désactive toutes les zones.", "`swapoff` ramène les pages en RAM. S’il n’y a pas assez de mémoire, la commande échoue ou le système devient très lent. La signature reste jusqu’à ce qu’on réécrive le périphérique.", [ex("Une zone", "sudo swapoff /dev/sdb2", "Vérifiez free avant sur une machine chargée.")]),
  ]},
  umount: { subcommands: [
    sub("point", "Détache un montage.", "Le nom est `umount`, avec un seul u. La commande échoue si un processus a encore un fichier ouvert ou son répertoire courant dessous. `fuser -vm` montre qui.", [ex("Démonter", "sudo umount /mnt", "Échoue avec target is busy si quelqu’un est encore dedans.")]),
    sub("-l", "Détache dès que possible, même si c’est occupé.", "`-l` vide le point de montage pour les nouveaux accès. Les anciens finissent plus tard. Ce n’est pas un substitut à trouver le processus.", [ex("Paresseux", "sudo umount -l /mnt", "Le chemin se libère. Les processus encore dedans gardent leurs fichiers.")]),
  ]},
  findmnt: { subcommands: [
    sub("chemin", "Dit quel montage contient un chemin.", "`findmnt /var` montre la source, le type et les options. `-T fichier` répond pour un fichier. `-S UUID=…` cherche une source.", [ex("Où est /var", "findmnt /var", "La ligne du montage qui porte /var.")]),
    sub("--verify", "Contrôle fstab sans monter.", "`--verify` signale les lignes incohérentes. Il ne les applique pas.", [ex("Contrôle", "sudo findmnt --verify", "Les erreurs de fstab, s’il y en a.")]),
  ]},
  fstab: { subcommands: [
    sub("UUID", "Désigne le système de fichiers par son identifiant.", "Une ligne de `/etc/fstab` porte la source, le point de montage, le type, les options, puis deux chiffres. `UUID=` reste valable si le nom `/dev/sda1` change. `blkid` donne l’UUID.", [ex("Lire", "cat /etc/fstab", "Les lignes # sont des commentaires.")]),
    sub("options", "Règle le montage : defaults, noatime, ro.", "`defaults` est le socle. `noatime` évite d’écrire la date d’accès. `nofail` n’empêche pas le démarrage si le disque est absent. `findmnt --verify` contrôle le fichier.", [ex("Vérifier", "sudo findmnt --verify", "Signale une ligne fausse avant le prochain démarrage.")]),
  ]},
  fsck: { subcommands: [
    sub("-N", "Montre l’outil qui serait appelé, sans l’appeler.", "`fsck` délègue à `e2fsck` ou `xfs_repair` selon le type. On ne vérifie pas un système monté en écriture.", [ex("Voir", "sudo fsck -N /dev/sdb1", "Affiche la commande réelle.")]),
    sub("-A", "Parcourt les systèmes listés dans fstab.", "`-A` suit l’ordre du sixième champ. `-y` répond oui à tout et peut donc effacer. Une réparation peut supprimer des données abîmées.", [ex("Un périphérique démonté", "sudo fsck /dev/sdb1", "Peut poser des questions. Le système ne doit pas être monté en écriture.")]),
  ]},
  e2fsck: { subcommands: [
    sub("-n", "Diagnostic en répondant non à tout.", "`-n` ne modifie rien. `-p` répare sans questions ce qui est sans ambiguïté. `-f` force la vérification même si le système est marqué propre.", [ex("Lire", "sudo e2fsck -n /dev/sdb1", "Ce qui serait réparé, sans l’écrire.")]),
  ]},
  tune2fs: { subcommands: [
    sub("-l", "Affiche label, UUID et paramètres.", "`tune2fs -l` ne modifie rien. `-L` change le label, `-m` le pourcentage réservé à root. Le redimensionnement, c’est `resize2fs`.", [ex("Lire", "sudo tune2fs -l /dev/sdb1", "La fiche technique ext4.")]),
    sub("-L", "Change le label.", "Le label se retrouve avec `blkid`. `-c` règle la fréquence des vérifications. Certaines options acceptent un système monté, pas toutes.", [ex("Label", "sudo tune2fs -L archives /dev/sdb1", "blkid montrera LABEL archives.")]),
  ]},
  dumpe2fs: { subcommands: [
    sub("-h", "Ne garde que le superbloc.", "Sans `-h`, `dumpe2fs` ajoute la liste des groupes de blocs, longue. La commande ne modifie rien.", [ex("Résumé", "sudo dumpe2fs -h /dev/sdb1", "UUID, état et options, sans les groupes.")]),
  ]},
  resize2fs: { subcommands: [
    sub("agrandir", "Occupe toute la partition déjà élargie.", "`resize2fs` sans taille agrandit le ext jusqu’à la fin de la partition. On élargit d’abord la partition, puis le système de fichiers. Souvent possible à chaud sur ext4.", [ex("Remplir", "sudo resize2fs /dev/sdb1", "Le ext grandit. La partition doit déjà être plus grande.")]),
    sub("rétrécir", "Réduit le système à une taille donnée.", "On démonte, on rétrécit le système, puis seulement ensuite la partition. L’ordre inverse coupe des données. `resize2fs` ne sait pas parler XFS.", [ex("Taille", "sudo resize2fs /dev/sdb1 20G", "Le système est démonté. 20G doit tenir dans la partition.")], ["Rétrécir la partition avant le système de fichiers détruit la fin du système."]),
  ]},
  blockdev: { subcommands: [
    sub("--getsize64", "Taille du périphérique en octets.", "`--getsz` donne les secteurs de 512 octets et remplace les anciennes options `fdisk -s` et `sfdisk --show-size`.", [ex("Octets", "sudo blockdev --getsize64 /dev/sdb", "Un entier.")]),
    sub("--getro", "Dit si le périphérique est marqué en lecture seule.", "`--getro` écrit 1 ou 0. `--flushbufs` pousse les tampons. Ce n’est pas un outil de partitionnement.", [ex("Lecture seule", "sudo blockdev --getro /dev/sdb", "1 si le disque est marqué en lecture seule.")]),
  ]},
  wipefs: { subcommands: [
    sub("lire", "Liste les signatures sans les effacer.", "`wipefs` sans `-a` est une lecture. On l’utilise quand un ancien système de fichiers empêche un nouveau `mkfs`.", [ex("Voir", "sudo wipefs /dev/sdb1", "Type et décalage de chaque signature.")]),
    sub("-a", "Retire les signatures.", "`-a` rend le système de fichiers invisible. Ce n’est pas un effacement sécurisé du contenu. Vérifiez le nom dans `lsblk`.", [ex("Effacer les en-têtes", "sudo wipefs -a /dev/sdb1", "À réserver à un périphérique que vous réinitialisez.")], ["Sans sauvegarde, considérez les données comme perdues."]),
  ]},
  losetup: { subcommands: [
    sub("-f", "Branche un fichier sur le premier périphérique libre.", "`-f --show` écrit le nom, par exemple /dev/loop0. `-P` fait apparaître les partitions de l’image. `-d` détache, après un `umount`.", [ex("Brancher", "sudo losetup -f --show image.img", "Écrit /dev/loopN. Le fichier image doit exister.")]),
    sub("-d", "Détache un périphérique boucle.", "On démonte d’abord ce qui était monté dessus. Oublier `-d` laisse l’image occupée.", [ex("Détacher", "sudo losetup -d /dev/loop0", "Libère loop0.")]),
  ]},
  sync: { subcommands: [
    sub("caches", "Demande d’écrire les données encore en mémoire.", "`sync` revient quand le noyau a accepté les écritures. Pour une clé, `umount` synchronise et détache, ce qui est le geste utile.", [ex("Pousser", "sync", "Peut prendre plusieurs secondes.")]),
  ]},
  hwclock: { subcommands: [
    sub("--show", "Lit l’horloge de la carte mère.", "`hwclock` n’est pas `date`. `--systohc` copie l’heure du système vers la carte. `--hctosys` fait l’inverse. Les machines actuelles laissent systemd ou chrony s’en charger.", [ex("Lire", "sudo hwclock --show", "L’heure matérielle.")]),
    sub("--systohc", "Copie l’heure système vers l’horloge matérielle.", "`--verbose` a remplacé `--debug` depuis util-linux 2.32. La version se demande avec `-V`, pas `-v`.", [ex("Écrire", "sudo hwclock --systohc", "L’horloge matérielle reçoit l’heure actuelle du système.")]),
  ]},
  lsmod: { subcommands: [
    sub("liste", "Nom, taille et utilisateurs de chaque module.", "`lsmod` lit /proc/modules. Un compteur non nul signifie qu’un autre module ou un périphérique s’en sert. Il ne charge rien.", [ex("Modules", "lsmod", "Trois colonnes.")]),
  ]},
  modprobe: { subcommands: [
    sub("charger", "Charge un module et ses dépendances.", "`modprobe nom` lit /lib/modules. Les options durables se posent dans /etc/modprobe.d. `insmod` ne gère pas les dépendances.", [ex("Charger", "sudo modprobe loop", "Charge loop s’il n’est pas déjà dans le noyau.")]),
    sub("-r", "Retire un module s’il n’est plus utilisé.", "`-r` échoue si un périphérique s’en sert encore. Pour loop, `losetup -d` d’abord.", [ex("Retirer", "sudo modprobe -r loop", "Échoue si un loop est encore ouvert.")]),
  ]},
  sysctl: { subcommands: [
    sub("-a", "Liste les paramètres du noyau.", "`sysctl clé` lit une valeur. `-w clé=valeur` la change jusqu’au prochain démarrage. Le fichier durable est dans /etc/sysctl.d.", [ex("Routage", "sysctl net.ipv4.ip_forward", "0 si la machine ne route pas IPv4.")]),
    sub("--system", "Relit les fichiers de configuration.", "`--system` applique /etc/sysctl.conf et /etc/sysctl.d. Les clés invalides sont signalées.", [ex("Recharger", "sudo sysctl --system", "Les réglages des fichiers deviennent actifs.")]),
  ]},
};
