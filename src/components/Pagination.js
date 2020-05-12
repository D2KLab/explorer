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

const Pagination = ({ totalPages, currentPage }) => {
  const { pathname, query } = useRouter();
  const { type, ...queryWithoutType } = query;

  const links = [];
  for (let i = 1; i <= totalPages; i += 1) {
    links.push(
      <Link
        key={i}
        href={{ pathname, query: { ...query, page: i } }}
        as={{ pathname: `/${query.type}`, query: { ...queryWithoutType, page: i } }}
      >
        <a>
          <PageButton>{i}</PageButton>
        </a>
      </Link>
    );
  }

  return <Container>{links}</Container>;
};

export default Pagination;
