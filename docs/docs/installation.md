---
slug: /installation
sidebar_position: 0
---

# Installation

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
```

D2KLab Explorer is essentially a set of Docker containers.

## Requirements {#requirements}

- [Docker](https://docs.docker.com/get-docker/) version 1.13.0 or above (which can be checked by running `docker -v`).
- [Node.js](https://nodejs.org/en/download/) version 16 or above (which can be checked by running `node -v`). You can use [nvm](https://github.com/nvm-sh/nvm) for managing multiple Node versions on a single machine installed.

## Scaffold project website {#scaffold-project-website}

The easiest way to install D2KLab Explorer is to clone the boilerplate repository, which contains all the necessary files for starting a basic version of D2KLab Explorer.

```bash npm2yarn
git clone https://github.com/D2KLab/explorer-boilerplate
cd explorer-boilerplate/
npm install
```

## Project structure {#project-structure}

Assuming you used the boilerplate project, you will see the following files under the directory `explorer-boilerplate/`:

```bash
explorer-boilerplate
├── public
│   ├── fonts
│   ├── images
│   └── static
│      └── locales
│         ├── home.json
│         └── project.json
├── config.js
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── LICENSE
├── package-lock.json
├── package.json
├── README.md
└── theme.js
```

### Project structure rundown {#project-structure-rundown}

- `/public/` - Public directory. Any contents inside here will be copied into the root of the website.
  - `/public/fonts/` - Contains fonts assets for the project.
  - `/public/images/` - Contains images assets for the project.
  - `/public/static/locales/` - Contains the translation files specific to the project.
- `/src/` - Files like pages or custom React components.
  - `/src/pages` - Any JSX file within this directory will be converted into a website page. More details can be found in the [pages guide](guides/creating-pages.md).
- `/config.js` - A config file containing the site configuration.
- `/package.json` - A D2KLab Explorer website is a React app. You can install and use any npm packages you like in them.
- `/docker-compose.dev.yml` and `/docker-compose.prod.yml` - These files are used to deploy the website into a running application.
- `/theme.js` - Used to change the global appearance and colors of the website.

## Running the development server {#running-the-development-server}

To preview your changes as you edit the files, you can run a local development server that will serve your website and reflect the latest changes.

```bash npm2yarn
cd explorer-boilerplate/
docker compose -f docker-compose.dev.yml up
```

By default, the site will be accessible at [http://localhost:3000](http://localhost:3000).

Congratulations! You have just created your first D2KLab Explorer site!

## Deploying to production {#deploying-to-production}

You can deploy the website into production mode by using the following command:

:::info
Notice how the command is using `docker-compose.prod.yml` for production.
:::

```bash npm2yarn
cd explorer-boilerplate/
docker compose -f docker-compose.prod.yml up
```

By default, the site will be accessible at [http://localhost:3000](http://localhost:3000).

## Problems? {#problems}

Ask for help on our [GitHub repository](https://github.com/D2KLab/explorer).
