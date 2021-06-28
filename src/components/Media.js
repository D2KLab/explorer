import styled from 'styled-components';
import { Img } from 'react-image';

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
  width: ${({ width }) => width};
  max-height: ${({ height }) => height};
  position: relative;
`;

export const Thumbnail = styled.img`
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
    height: 150px;
    margin-right: ${({ direction }) => (direction === 'row' ? '8px' : 0)};
    margin-bottom: ${({ direction }) => (direction === 'row' ? 0 : '8px')};
  }
`;

const Media = ({
  className,
  thumbnail,
  title,
  subtitle,
  graphUri,
  width = '150px',
  height = '150px',
  direction = 'column',
}) => {
  const Placeholder = <Thumbnail src={config.search.placeholderImage} alt={title} />;

  return (
    <Container className={className} direction={direction}>
      <ThumbnailContainer width={width} height={height}>
        <Thumbnail
          as={Img}
          src={thumbnail}
          alt={title}
          loader={Placeholder}
          unloader={Placeholder}
        />
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
};

export default Media;
