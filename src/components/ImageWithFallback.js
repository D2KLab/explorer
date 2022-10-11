import React, { useState } from 'react';

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
