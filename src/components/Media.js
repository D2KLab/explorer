import Link from 'next/link';
import styled from 'styled-components';
import Img from 'react-image';

import config from '~/config';

/**
 * Media card with title, subtitle, thumbnail, link
 */

const ThumbnailContainer = styled.div`
  border: 1px solid #dcdcdc;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 150px;
  height: 150px;
`;

const Thumbnail = styled.img`
  max-width: 100%;
  max-height: 100%;
  height: auto;
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
  color: #aaa;
`;

const Container = styled.div`
  display: flex;
  flex-direction: ${({ direction }) => direction};
  max-width: 150px;
  margin-bottom: 24px;

  a {
    text-decoration: none;
  }

  ${ThumbnailContainer} {
    max-width: ${({ direction }) => (direction === 'row' ? '50%' : '100%')};
    margin-right: ${({ direction }) => (direction === 'row' ? '8px' : 0)};
    margin-bottom: ${({ direction }) => (direction === 'row' ? 0 : '8px')};
    height: 150px;
  }
`;

const Media = ({ className, thumbnail, title, subtitle, link = '', direction = 'column' }) => {
  return (
    <Container className={className} direction={direction}>
      <Link href={link} passHref>
        <a>
          <ThumbnailContainer>
            <Thumbnail
              as={Img}
              src={thumbnail}
              alt={title}
              loader={<Thumbnail src={config.search.placeholderImage} alt={title} />}
              unloader={<Thumbnail src={config.search.placeholderImage} alt={title} />}
            />
          </ThumbnailContainer>
          <TextContainer>
            <Title>{title}</Title>
            <Subtitle>{subtitle}</Subtitle>
          </TextContainer>
        </a>
      </Link>
    </Container>
  );
};

export default Media;
