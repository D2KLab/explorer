import { Children, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import SwipeableViews from 'react-swipeable-views';

import breakpoints from '@styles/breakpoints';

const TabsWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const TabButton = styled.button`
  flex: 1;
  min-height: 44px;
  padding: 0px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: default;
  color: #fff;
  outline: none;
  border: none;
  width: 100%;

  ${({ selected, theme }) => `
    background-color: ${selected ? '#fff' : theme.colors.primary};
    color: ${selected ? theme.colors.primary : '#fff'};
    border: ${selected ? '1px solid #dcdcdc' : 'none'};
  `}

  ${breakpoints.mobile`
    width: initial;
  `}
`;

const TabList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 100%;
  & > div,
  & > div > button {
    width: 100%;
  }
  background-color: ${({ theme }) => theme.colors.primary};

  ${breakpoints.mobile`
    flex-direction: row;
    & > div, & > div > button {
      width: initial;
    }
  `}
`;

const TabContent = styled.div`
  flex: 1;
  width: 100%;
  padding: 24px;
  background-color: #eee;
  border: 1px solid #dcdcdc;
`;

export const Tab = styled.div``;

const Tabs = ({ className, children }) => {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <TabsWrapper className={className}>
      <TabList role="tablist">
        {Children.map(children, ({ props: { label } }, index) => (
          <TabButton
            role="tab"
            selected={selectedTab === index}
            aria-selected={selectedTab === index ? 'true' : 'false'}
            onClick={() => setSelectedTab(index)}
          >
            {label}
          </TabButton>
        ))}
      </TabList>

      <TabContent>
        <SwipeableViews index={selectedTab} onChangeIndex={(index) => setSelectedTab(index)}>
          {Children.map(children, (comp, index) => (
            <div value={selectedTab} index={index}>
              {comp}
            </div>
          ))}
        </SwipeableViews>
      </TabContent>
    </TabsWrapper>
  );
};

Tabs.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Tabs;
