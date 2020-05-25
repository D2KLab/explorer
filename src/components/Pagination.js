import styled from 'styled-components';
import { useRouter } from 'next/router';
import Link from 'next/link';

/**
 * Pagination component.
 */

const Container = styled.div`
  margin: 20px 0;
`;

const PageButton = styled.span`
  padding: 0 4px;
`;

const Pagination = ({ totalPages, currentPage, onChange }) => {
  const { pathname, query } = useRouter();
  const { type, ...queryWithoutType } = query;

  const handleClick = (pageIndex, ev) => {
    if (typeof ev !== 'undefined' && typeof ev.preventDefault === 'function') {
      ev.preventDefault();
    }
    if (typeof onChange === 'function') {
      onChange(pageIndex);
    }
  };

  const links = [];
  for (let i = 1; i <= totalPages; i += 1) {
    links.push(
      <Link
        key={i}
        href={{ pathname, query: { ...query, page: i } }}
        as={{ pathname: `/${query.type}`, query: { ...queryWithoutType, page: i } }}
      >
        <a
          role="button"
          tabIndex="0"
          onClick={(e) => handleClick(i, e)}
          onKeyPress={(e) => handleClick(i, e)}
        >
          <PageButton>{i}</PageButton>
        </a>
      </Link>
    );
  }

  return <Container>{links}</Container>;
};

export default Pagination;
