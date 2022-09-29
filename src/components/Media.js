import { useState } from 'react';
import styled from 'styled-components';
import Image from 'next/image';

import GraphIcon from '@components/GraphIcon';
import config from '~/config';

/**
 * Media card with title, subtitle, thumbnail, link
 */

export const ThumbnailContainer = styled.div`
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
  position: relative;
`;

export const Thumbnail = styled(Image)`
  max-width: 100%;
  max-height: 100%;
  height: auto;
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
          <Thumbnail src={config.search.placeholderImage} alt="" layout="fill" />
        )}
        {thumbnail && imageVisible && (
          <Thumbnail
            src={thumbnail}
            alt=""
            layout="fill"
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
