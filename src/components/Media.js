import styled from 'styled-components';
import { Img } from 'react-image';
import GraphIcon from '@components/GraphIcon';

import config from '~/config';

/**
 * Media card with title, subtitle, thumbnail, link
 */

const ThumbnailContainer = styled.div`
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 150px;
  max-height: 150px;
  position: relative;
`;

const Thumbnail = styled.img`
  max-width: 100%;
  max-height: 100%;
  height: auto;
`;

const GraphIconContainer = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: #d9d9db;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.span`
  color: #000;
  font-weight: bold;
`;

const Subtitle = styled.span`
  color: #666;
`;

const Container = styled.div`
  display: flex;
  flex-direction: ${({ direction }) => direction};

  ${ThumbnailContainer} {
    max-width: 100%;
    height: 150px;
    margin-right: ${({ direction }) => (direction === 'row' ? '8px' : 0)};
    margin-bottom: ${({ direction }) => (direction === 'row' ? 0 : '8px')};
  }
`;

const Media = ({ className, thumbnail, title, subtitle, graphUri, direction = 'column' }) => {
  const Placeholder = <Thumbnail src={config.search.placeholderImage} alt={title} />;

  return (
    <Container className={className} direction={direction}>
      <ThumbnailContainer>
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
