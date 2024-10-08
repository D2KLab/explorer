# Exploratory Search Engine

## About

Repository for Exploratory Search Engine, made with Next.js and React.

## Stack

- [React](https://facebook.github.io/react) rendering
- [styled-components](https://styled-components.com/) scoped CSS as React components
- [Next.js](https://zeit.co/blog/next) webapp framework (server side rendering, single-page experience)
- [next-auth](https://github.com/iaincollins/next-auth) OAuth authentication for Next.js
- [next-i18next](https://github.com/isaachinman/next-i18next) internationalization based on i18next
- [sparql-transformer](https://github.com/D2KLab/sparql-transformer) JSON based SPARQL requests

## How to run

- Download this repository:

```bash
git clone https://github.com/D2KLab/explorer
cd explorer
```

- Copy the file `.env.default` into a new file called `.env` and edit the variables based on your environment.

- Install the dependencies:

```bash
npm install
```

- Run in development mode:

```bash
npm run dev
```

- Run in production mode:

```bash
npm run build
npm run start
```

## Docker

- Build for development

```bash
docker compose -f docker-compose.dev.yml up
```

- Build for production

```bash
docker compose -f docker-compose.prod.yml up
```

## License

Exploratory Search Engine is [Apache licensed](https://github.com/D2KLab/explorer/blob/master/LICENSE).
