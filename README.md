# Projet epidemium CancerViz : 2ème prix

* [Medium](https://medium.com/epidemium/annexe-3-epidemium-les-résultats-du-challenge4cancer-7bbd5c7d647c)
* [Twitter](https://twitter.com/hashtag/cancerviz)
* [Les Echos](https://www.lesechos.fr/2017/02/cancer-roche-va-financer-trois-projets-de-recherche-collaboratifs-en-france-160646)

* http://www.epidemium.cc/project/38/view
* http://wiki.epidemium.cc/wiki/CancerViz
* http://cancerviz.weareopensource.me/

## Description
Les projets de recherche dans le monde médical basés sur l'analyse de données peuvent s'appuyer sur de nombreux jeux de données (notamment Open Data), souvent hétérogènes et de qualités variables.

Dans ces projets et plus généralement dans les initiatives de Data Science, une partie importante du temps et des efforts (en particulier au début) est consacrée à la phase d’analyse de données exploratoire (Data Discovery), et plus particulièrement au travail d'acquisition des données, en particulier :

* recherche et sélection de jeux de données pertinents à analyser,
* qualification des jeux de données sélectionnés, notamment en termes de périmètre couvert et qualité des données,
* agrégation et croisement des jeux de données, et plus particulièrement des analyses comparatives (e.g. les jeux de données ont-ils la même couverture géographique ? la décomposition en pays est-elle la même ?)

Nous proposons ici un outil de Data Visualization :

* facilitant la phase d’acquisition des données (en particulier les problématiques 2 & 3 ci-dessus), grâce à des visualisations interactives multicritères, selon les différents axes d’analyses disponibles dans les jeux de données,
* permettant par ailleurs d’initier des premières analyses exploratoires grâce à ces visualisations interactives multicritères, afin accélérer la phase d’analyse de données exploratoire (Data Discovery), souvent très chronophage et laborieuse
* Présenter des données déjà travaillées pour les rendre accessible et lisible au grand public

L’outil présenté ici est une version « prototype » : nous avons en effet pris connaissance de ce challenge il y a seulement quelques jours. Nous nous sommes donc concentrés à mettre en œuvre rapidement :

* une « technology full-stack », basée exclusivement sur des technologies open-source, couvrant toute la chaîne de valeur, de l’acquisition des données à la publication des visualisations sur un site internet dédié, sans oublier les analyses de données intermédiaires,
* un prototype opérationnel pour ce challenge concernant la recherche sur le cancer, présentant différentes fonctionnalités possibles avec quelques exemples illustratifs.

## Nex Step
Le prototype présenté pourra être amélioré, après la fin du challenge Challenge4Cancer, selon les deux axes suivants :

Analyses et visualisations complémentaires dans le cadre de la recherche pour le cancer :
* Analyses d'indicateurs supplémentaires (e.g. données d'incidences de cancer) et croisement entre indicateurs (e.g. analyse comparative entre les évolutions relatives du nombre de décès et du nombre d'incidences)
* Extension des visualisations actuelles pour inclure des axes d'analyses complémentaires (e.g. analyse par tranche d'âge ET par localisation de cancers)
* Format de visualisations supplémentaires (e.g. heatmaps pour représenter visuellement le degré de couverture / disponibilité des données)
* Cartes régionales (e.g. Europe) et/ou nationales (e.g. France par région et/ou département)
Réutilisation du moteur "end-to-end" open-source pour d'autres projets de recherche.

Nous devons aussi mettre en place les tests unitaires, la version actuelle a été réalisée en deux jours, et donc sans tests.

## DataSet
Jeux de données
Le projet utilise le [jeu de données principal](http://data.epidemium.cc/files/core) mis à disposition par l’équipe Epidemium, et plus précisément le dataset [dataset_simply.zip](http://data.epidemium.cc/files/core/dataset_simply.zip). Nous nous sommes concentrés pour ce prototype sur les données de mortalité issues de la World Health Organisation couvrant 76 pays sur la période 1950-2012, avec le niveau de granularité suivant :
* par pays,
* par année,
* par sexe,
* par tranche d’âge,
* par localisation de cancers.

## Tools
* Slack
* Gitlab
* Trello

## Author
* Pierre Brisorgueil
* Thiên-Lôc Nguyên

# Deployment

## Before You Begin


**Warning This project doesn't work with NodeJs 6.0 for the moment, please use 5.7.0**

Before you begin we recommend you read about the basic building blocks that assemble a MEAN.JS application:
* MongoDB - Go through [MongoDB Official Website](http://mongodb.org/) and proceed to their [Official Manual](http://docs.mongodb.org/manual/), which should help you understand NoSQL and MongoDB better.
* Express - The best way to understand express is through its [Official Website](http://expressjs.com/), which has a [Getting Started](http://expressjs.com/starter/installing.html) guide, as well as an [ExpressJS](http://expressjs.com/en/guide/routing.html) guide for general express topics. You can also go through this [StackOverflow Thread](http://stackoverflow.com/questions/8144214/learning-express-for-node-js) for more resources.
* AngularJS - Angular's [Official Website](http://angularjs.org/) is a great starting point. You can also use [Thinkster Popular Guide](http://www.thinkster.io/), and [Egghead Videos](https://egghead.io/).
* Node.js - Start by going through [Node.js Official Website](http://nodejs.org/) and this [StackOverflow Thread](http://stackoverflow.com/questions/2353818/how-do-i-get-started-with-node-js), which should get you going with the Node.js platform in no time.


## Prerequisites
Make sure you have installed all of the following prerequisites on your development machine:
* Git - [Download & Install Git](https://git-scm.com/downloads). OSX and Linux machines typically have this already installed.
* Node.js - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager. If you encounter any problems, you can also use this [GitHub Gist](https://gist.github.com/isaacs/579814) to install Node.js.
  * Node v5 IS NOT SUPPORTED AT THIS TIME!
* MongoDB - [Download & Install MongoDB](http://www.mongodb.org/downloads), and make sure it's running on the default port (27017).
* Ruby - [Download & Install Ruby](https://www.ruby-lang.org/en/documentation/installation/)
* Bower - You're going to use the [Bower Package Manager](http://bower.io/) to manage your front-end packages. Make sure you've installed Node.js and npm first, then install bower globally using npm:
* Clone the project

```bash
$ npm install -g bower
```

* Grunt - You're going to use the [Grunt Task Runner](http://gruntjs.com/) to automate your development process. Make sure you've installed Node.js and npm first, then install grunt globally using npm:

```bash
$ npm install -g grunt-cli
```

* Sass - You're going to use [Sass](http://sass-lang.com/) to compile CSS during your grunt task. Make sure you have ruby installed, and then install Sass using gem install:

```bash
$ gem install sass
```

* Gulp - (Optional) You may use Gulp for Live Reload, Linting, and SASS or LESS.

```bash
$ npm install gulp -g
```

## Prerequisites

Import Data to mongo
* Unzip test.csv.zip
* import in mongo, in collection explores in db pcancer-*(dev ...), with mongo csv import

```bash
$ mongoimport --db pcancer-dev --collection explores --type csv --headerline --file /link_to_file_unzip
```

## Running Your Application
After the install process is over, you'll be able to run your application using Grunt, just run grunt default task:

```bash
$ gulp
```
or

```bash
$ gulp default
```

The server is now running on http://localhost:3000 if you are using the default settings.

### Running Gulp Development Environment

Start the development environment with:

```bash
$ gulp dev
```

### Running in Production mode
To run your application with *production* environment configuration, execute gulp as follows:

```bash
$ gulp prod
```

### Testing Your Application with Gulp
Using the full test suite included with MEAN.JS with the test task:

### Run all tests
```bash
$ gulp test
```

### Run server tests
```bash
gulp test:server
```

### Run client tests
```bash
gulp test:client
```

### Run e2e tests
```bash
gulp test:e2e
```

## Development and deployment With Docker

* Install [Docker](https://docs.docker.com/installation/#installation)
* Install [Compose](https://docs.docker.com/compose/install/)

* Local development and testing with compose:
```bash
$ docker-compose up
```

* Local development and testing with just Docker:
```bash
$ docker build -t mean .
$ docker run -p 27017:27017 -d --name db mongo
$ docker run -p 3000:3000 --link db:db_1 mean
$
```

* To enable live reload, forward port 35729 and mount /app and /public as volumes:
```bash
$ docker run -p 3000:3000 -p 35729:35729 -v /Users/mdl/workspace/mean-stack/mean/public:/home/mean/public -v /Users/mdl/workspace/mean-stack/mean/app:/home/mean/app --link db:db_1 mean
```

# Credits
* [MeanJS](http://wiki.epidemium.cc/index.php?title=Meanjs&action=edit&redlink=1) : Inspired by the great work of [Madhusudhan Srinivasa](https://github.com/madhums/)
* The MEAN name was coined by [Valeri Karpov](http://blog.mongodb.org/post/49262866911/the-mean-stack-mongodb-expressjs-angularjs-and)
* Librairie JavaScript [dc.js](https://dc-js.github.io/dc.js/) pour les graphiques interactifs, s'appuyant sur les librairies JavaScript [d3.js](https://d3js.org/) (pour les graphiques dynamiques) et [Crossfilter](http://square.github.io/crossfilter/) (pour la gestion de l'interactivité entre graphiques)
* Carte des pays du monde au format GeoJSON fournie par le site internet [GeoJSON Maps of the globe](https://geojson-maps.kyd.com.au/), basé sur les bases de données géographiques de [Natural Earth](http://www.naturalearthdata.com/)
* Libraire JavaScript spécialisée [d3 Geo](https://github.com/mbostock/d3/wiki/Geo) (inclue dans la librairie JavaScript [d3.js](https://d3js.org/)) pour la gesion des cartes géographiques + les fonctionnalités spécifiques de [Geo Projections](https://github.com/mbostock/d3/wiki/Geo-Projections) (extension de [d3 Geo](https://github.com/mbostock/d3/wiki/Geo))
* Libraire Javascript [NVD3](http://wiki.epidemium.cc/index.php?title=NVD3&action=edit&redlink=1) couplé à Angular-NVD3

# License

(The MIT License)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
