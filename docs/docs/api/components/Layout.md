# Layout

Main layout container. Contains global styles and the burger menu.

## Props

* `children = {React.ReactNode}`
  * React children prop

## Example with code

```jsx
// highlight-start
import Layout from '@components/Layout';
// highlight-end

const MyComponent = () => {
  return (
    // highlight-start
    <Layout>
    // highlight-end
      <Header />
      <Body>
        Your content
      </Body>
      <Footer />
    // highlight-start
    </Layout>
    // highlight-end
  );
};
```
