# Exploratory Search Engine

## About

Repository for Exploratory Search Engine, made with Next.js and React.

## Stack

- [React](https://facebook.github.io/react) rendering
- [styled-components](https://styled-components.com/) scoped CSS as React components
- [Next.js](https://zeit.co/blog/next) webapp framework (server side rendering, single-page experience)
- [next-i18next](https://github.com/isaachinman/next-i18next) internationalization based on i18next
- [sparql-transformer](https://github.com/D2KLab/sparql-transformer) JSON based SPARQL requests

## How to run

- Download this repository:

```bash
git clone https://github.com/silknow/explorer
cd explorer
```

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

- Build the container:

```bash
docker build -t silknow/explorer .
```

- Run the container:

```bash
docker run -d -p 3000:3000 silknow/explorer:latest
```

## License

Exploratory Search Engine is [Apache licensed](https://github.com/silknow/explorer/blob/master/LICENSE).
