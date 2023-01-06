import React, { useState } from 'react';

/**
 * A component that renders an image with a fallback image if the first image fails to load.
 * @param {Object} props - the props to pass to the image component.
 * @returns {React.ReactElement} - the image component.
 */
function ImageWithFallback(props) {
  const { src, fallbackSrc, ...rest } = props;
  const [imgSrc, setImgSrc] = useState(src);
  const [error, setError] = useState(false);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt=""
      {...rest}
      src={imgSrc}
      onError={() => {
        if (!error) {
          setError(true);
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}

export default ImageWithFallback;
