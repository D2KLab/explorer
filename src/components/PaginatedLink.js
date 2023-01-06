import Link from 'next/link';
import { useRouter } from 'next/router';

import { uriToId } from '@helpers/utils';
import config from '~/config';

/**
 * A PaginatedLink component that takes in a type and id and creates a link to the
 * page that the id is on.
 * @param {string} id - the id of the item that the link is for.
 * @param {string} type - the type of the item that the link is for.
 * @param {number} [page] - the page that the link is for.
 * @param {string} [searchApi] - the search api that the link is for.
 * @param {React.ReactNode} children - the content of the link.
 * @param {object} props - the props of
 */
const PaginatedLink = ({ id, type, page, searchApi, children, ...props }) => {
  const router = useRouter();
  const route = config.routes[type];

  const [spath, sparams] = router.asPath.split('?');
  const searchParams = new URLSearchParams(sparams);
  if (typeof page !== 'undefined' && page !== null) {
    searchParams.set('page', page);
  }
  if (searchParams.get('id') !== null) {
    searchParams.set('sid', searchParams.get('id'));
  }
  if (searchParams.get('type') !== null) {
    searchParams.set('stype', searchParams.get('type'));
  } else {
    searchParams.set('stype', router.query.type);
  }
  searchParams.delete('id');
  searchParams.delete('type');
  searchParams.set('sapi', searchApi);
  searchParams.set('spath', spath);

  const href = `/${type}/${encodeURI(uriToId(id, { base: route.uriBase }))}?${searchParams}`;

  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
};

export default PaginatedLink;
