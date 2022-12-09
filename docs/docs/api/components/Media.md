# Media

Media card with title, subtitle, thumbnail, link

## Props

* `thumbnail = {string}`
  * Thumbnail image URL.
* `title = {string}`
  * Title.
* `subtitle = {string}`
  * Subtitle.
* `graphUri = {string}`
  * Graph URI.
* `width = {number | default: 150}`
  * Container width.
* `height = {string | default: 150}`
  * Container height.
* `direction = {string | default: "column"}`
  * Flex direction.

## Example with code

```jsx
// highlight-start
import Media from '@components/Media';
// highlight-end

const MyComponent = () => {
  return (
    // highlight-start
    <Media
      title="France"
      subtitle="Country"
      thumbnail="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Flag_of_France.svg/300px-Flag_of_France.svg.png"
      direction="column"
      graphUri="http://dbpedia.org"
    />
    // highlight-end
  );
};
```
