---
slug: /creating-pages
sidebar_label: Pages
---

# Creating Pages

In this section, we will learn about creating pages in D2KLab Explorer.

Pages are basically React components, and can include other components or even custom ones.

## Add a page {#add-a-react-page}

React is used as the UI library to create pages. Every page component should export a React component, and you can leverage the expressiveness of React to build rich and interactive content.

Create a file `/src/pages/hello.js`:

```jsx title="/src/pages/hello.js"
import Layout from '@components/Layout';
import PageTitle from '@components/PageTitle';
import Header from '@components/Header';
import Body from '@components/Body';
import Footer from '@components/Footer';

const Hello = () => {
  return (
    <Layout>
      <PageTitle title="Hello!" />
      <Header />
      <Body>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
            fontSize: '20px',
          }}
        >
          <p>
            Edit <code>pages/hello.js</code> and save to reload.
          </p>
        </div>
      </Body>
      <Footer />
    </Layout>
  );
}

export default Hello;
```

Once you save the file, the development server will automatically reload the changes. Now open [http://localhost:3000/hello](http://localhost:3000/hello) and you will see the new page you just created.

Each page doesn't come with any styling. You will need to import the `Layout` component from `@components/Layout` and use `@components/Header` and `@components/Footer` if you want the navbar and/or footer to appear. You can use [styled-components](https://styled-components.com/) to style your components.

## Routing {#routing}

Any JavaScript file you create under `/src/pages/` directory will be automatically converted to a website page, following the `/src/pages/` directory hierarchy. For example:

- `/src/pages/index.js` → `[baseUrl]`
- `/src/pages/foo.js` → `[baseUrl]/foo`
- `/src/pages/foo/test.js` → `[baseUrl]/foo/test`
- `/src/pages/foo/index.js` → `[baseUrl]/foo/`
