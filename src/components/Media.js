import { useState } from 'react';
import styled from 'styled-components';
import Image from 'next/image';

import GraphIcon from '@components/GraphIcon';
import config from '~/config';

export const ThumbnailContainer = styled.div`
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
  position: relative;
`;

export const GraphIconContainer = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: #d9d9db;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  ${({ theme }) => theme?.components?.Media?.GraphIconContainer};
`;

export const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Title = styled.span`
  color: #000;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;

  /* Clamp text to 3 lines for Webkit browsers */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

export const Subtitle = styled.span`
  color: #666;
`;

export const Container = styled.div`
  display: flex;
  flex-direction: ${({ direction }) => direction};
  align-items: center;

  ${ThumbnailContainer} {
    max-width: 100%;
    margin-right: ${({ direction }) => (direction === 'row' ? '8px' : 0)};
    margin-bottom: ${({ direction }) => (direction === 'row' ? 0 : '8px')};
  }
`;

/**
 * A component that renders a media card with a thumbnail.
 * @param {string} className - The class name to apply to the component.
 * @param {string} thumbnail - The URL of the thumbnail to render.
 * @param {string} title - The title of the media object.
 * @param {string} subtitle - The subtitle of the media object.
 * @param {string} graphUri - The URI of the graph to render.
 * @param {number} [width=150] - The width of the thumbnail.
 * @param {number} [height=150] - The height of the thumbnail.
 * @param {string} direction - The display direction ('row' or 'column')
 * @param {object} props - The props to pass to the component.
 * @returns A component that renders a media card with a thumbnail.
 */
function Media({
  className,
  thumbnail,
  title,
  subtitle,
  graphUri,
  width = 150,
  height = 150,
  direction = 'column',
  ...props
}) {
  const [imageVisible, setImageVisible] = useState(true);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);

  return (
    <Container className={className} direction={direction} {...props}>
      <ThumbnailContainer width={width} height={height}>
        {config.search?.placeholderImage && placeholderVisible && (
          <Image src={config.search.placeholderImage} alt="" fill sizes="100vw, 100vw" />
        )}
        {thumbnail && imageVisible && (
          <Image
            src={thumbnail}
            alt=""
            fill
            sizes="100vw, 100vw"
            onLoadingComplete={() => {
              setImageVisible(true);
              setPlaceholderVisible(false);
            }}
            onError={() => {
              setImageVisible(false);
              setPlaceholderVisible(true);
            }}
          />
        )}
        {graphUri && (
          <GraphIconContainer>
            <GraphIcon uri={graphUri} />
          </GraphIconContainer>
        )}
      </ThumbnailContainer>
      <TextContainer>
        <Title>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
      </TextContainer>
    </Container>
  );
}

export default Media;
