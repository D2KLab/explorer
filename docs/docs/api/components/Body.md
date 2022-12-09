# Body

Flex body container. Usually placed inside a [Layout](Layout) element.

## Props

* `hasSidebar = {boolean | default: false}`
* `children = {React.ReactNode}`
  * React children prop

## Example with code

```jsx
import Layout from '@components/Layout';
// highlight-start
import Body from '@components/Body';
// highlight-end

const MyComponent = () => {
  return (
    <Layout>
      // highlight-start
      <Body hasSidebar>
        Your content
      </Body>
      // highlight-end
    </Layout>
  );
};
```
