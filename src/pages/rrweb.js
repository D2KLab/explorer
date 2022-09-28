import { useRef, useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import Router, { useRouter } from 'next/router';
import rrwebPlayer from 'rrweb-player';
import 'rrweb-player/dist/style.css';

import StickyBox from '@components/StickyBox';
import Layout from '@components/Layout';
import Header from '@components/Header';
import Body from '@components/Body';
import Content from '@components/Content';
import PageTitle from '@components/PageTitle';
import Button from '@components/Button';
import { getCaptures, getCaptureEvents } from '@helpers/database';
import breakpoints from '@styles/breakpoints';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const Container = styled.div`
  display: flex;
  align-items: baseline;
`;

const StyledStickyBox = styled(StickyBox)`
  display: none;
  ${breakpoints.weirdMedium`
    display: block;
  `}
`;

const Navigation = styled.nav`
  max-width: 240px;
`;

const Results = styled.div`
  flex: 1;
  margin: 1rem 0;

  ${breakpoints.weirdMedium`
    margin-left: 120px;
  `}
`;

const Anchor = styled.div`
  line-height: 2em;
  padding-left: 10px;
  border-left: 2px solid #666;

  a {
    text-decoration: none;
    color: #666;

    transition: color 0.3s ease-in-out, border-left-color 0.3s ease-in-out;

    &:hover {
      color: ${({ theme }) => theme.colors.secondary};
      border-left-color: ${({ theme }) => theme.colors.secondary};
    }
  }

  ${(props) =>
    props.selected
      ? css`
          font-weight: bold;
        `
      : null};
`;

const Player = styled.div`
  &:before,
  &:after {
    content: '';
    display: table;
  }
  &:after {
    clear: both;
  }
`;

function RRWebPage({ captures, selectedCapture, events }) {
  const refPlayer = useRef();
  const { query } = useRouter();
  const [isDeletingCapture, setIsDeletingCapture] = useState(false);

  useEffect(() => {
    if (Array.isArray(events) && events.length > 1) {
      // eslint-disable-next-line no-new, new-cap
      const replayer = new rrwebPlayer({
        target: refPlayer.current,
        props: {
          events,
        },
      });

      return () => {
        if (replayer) {
          replayer.pause();
        }
      };
    }
  }, events);

  const deleteCapture = async (id) => {
    setIsDeletingCapture(true);
    await fetch(`/api/rrweb`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        delete: id,
      }),
    });
    Router.reload();
  };

  const renderNavigation = () => captures.map((capture) => (
      <Anchor selected={capture.capture_session_id === query.id}>
        <a href={`/rrweb?id=${encodeURIComponent(capture.capture_session_id)}`}>
          {capture.capture_session_id}
        </a>
      </Anchor>
    ));

  return (
    <Layout>
      <PageTitle title="RRWeb Replay" />
      <Header />
      <Body>
        <Content>
          <Container>
            <StyledStickyBox offsetTop={20} offsetBottom={20}>
              <Navigation>{renderNavigation()}</Navigation>
            </StyledStickyBox>
            <Results>
              {(selectedCapture && (
                <>
                  <h2>RRWeb Replay</h2>
                  <p>
                    Created:{' '}
                    <time
                      dateTime={new Date(selectedCapture.created_at).toISOString()}
                      title={new Date(selectedCapture.created_at).toString()}
                    >
                      {new Date(selectedCapture.created_at).toLocaleString()}
                    </time>
                    <br />
                    Updated:{' '}
                    <time
                      dateTime={new Date(selectedCapture.updated_at).toISOString()}
                      title={new Date(selectedCapture.updated_at).toString()}
                    >
                      {new Date(selectedCapture.updated_at).toLocaleString()}
                    </time>
                  </p>
                  <Player ref={refPlayer} />
                  <br />
                  <Button
                    type="button"
                    bg="#dc3545"
                    text="#fff"
                    loading={isDeletingCapture}
                    onClick={() => deleteCapture(selectedCapture.capture_session_id)}
                  >
                    Delete this capture
                  </Button>
                </>
              )) || <>No selected capture</>}
            </Results>
          </Container>
        </Content>
      </Body>
    </Layout>
  );
}

export async function getServerSideProps({ query, locale }) {
  const captures = await getCaptures();
  const events = query.id ? await getCaptureEvents(query.id) : [];

  return {
    props: {
      ...await serverSideTranslations(locale, ['common', 'project', 'search']),
      captures: JSON.parse(JSON.stringify(captures)), // serialize captures list
      selectedCapture: JSON.parse(
        JSON.stringify(captures.find((capture) => capture.capture_session_id === query.id) || null)
      ),
      events,
    },
  };
}

export default RRWebPage;
