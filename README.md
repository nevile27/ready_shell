# Catalogue des commandes Linux

Catalogue local des commandes d’administration, rangées par famille de système (Debian, Red Hat, SUSE, Arch, Alpine) et par thème. Les fiches donnent le rôle de la commande, des exemples, et le statut sur les versions retenues en novembre 2026. Le site se consulte ensuite sans réseau.

Le français est la langue d’origine. L’anglais est proposé dans le menu Langue.

## Prérequis

- Node.js 20 ou 22 (Node 18 convient aussi). [Vite 6](https://vite.dev) refuse les autres versions.
- npm, livré avec Node.
- Python 3, uniquement pour ouvrir le site déjà construit. Aucun paquet Python à installer.

La construction télécharge les outils npm une fois. Après `npm run build`, la consultation ne contacte plus le réseau.

## Installer et ouvrir

Depuis la racine du dépôt :

```sh
npm install
npm run build
./serve
```

Le catalogue s’ouvre sur [http://127.0.0.1:8765/](http://127.0.0.1:8765/). Le serveur n’écoute que sur la machine locale. Un autre port se donne en argument : `./serve 9000`.

`npm run build` produit `web/dist/`. Ce dossier, `node_modules/` et le `catalog.json` intermédiaire sont absents du dépôt : chaque machine les reconstruit.

Pour modifier le site et le recharger au fil de l’eau : `npm run dev`, puis l’adresse affichée par Vite.

## Ce qui est dans le dépôt

- `catalog/commands/` : une fiche YAML par commande. C’est le texte de référence.
- `catalog/i18n/en.json` : les phrases anglaises. Une phrase absente de ce fichier reste affichée en français.
- `catalog/distros.yaml`, `catalog/themes.yaml` : familles, versions, thèmes.
- `scripts/build-catalog.mjs` : valide les fiches et écrit le catalogue lu par le site.
- `web/` : l’interface. La recherche tourne dans le navigateur.

## Licence

Le catalogue, le site et les scripts sont sous [MIT](LICENSE), copyright 2026 nevile27. Chacun peut les utiliser, les modifier et les redistribuer, y compris dans un projet commercial, à condition de conserver le texte de la licence.

Les outils de construction restent sous leur propre licence. Ils sont permissifs, du même ordre que la MIT :

| Outil | Rôle | Licence |
| --- | --- | --- |
| [MiniSearch](https://github.com/lucaong/minisearch) 7.2.0 | recherche dans la page | MIT, Luca Ongaro |
| Vite 6.4.5, Rollup, esbuild | construction du site | MIT |
| Ajv 8.20.0 | validation des fiches | MIT |
| js-yaml 4.3.2 | lecture des YAML | MIT |

Quelques dépendances de construction, absentes de la page servie, sont en ISC, BSD-3-Clause ou licence Python Software Foundation 2.0.

MiniSearch est le seul de ces programmes recopié dans `web/dist/`. Le source du dépôt ne le contient pas : `npm install` le récupère. Si le dossier construit est publié, sa notice MIT reste à conserver à côté de `LICENSE`.
