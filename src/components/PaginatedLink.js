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
 * @param {string} [searchParams] - the search params that the link is for.
 * @param {React.ReactNode} children - the content of the link.
 * @param {object} props - the props of
 */
const PaginatedLink = ({ id, type, page, searchApi, searchParams, children, ...props }) => {
  const router = useRouter();
  const route = config.routes[type];

  const [spath, sparams] = router.asPath.split('?');
  const newSearchParams = new URLSearchParams(searchParams || sparams);
  if (typeof page !== 'undefined' && page !== null) {
    newSearchParams.set('page', page);
  }
  if (newSearchParams.get('id') !== null) {
    newSearchParams.set('sid', newSearchParams.get('id'));
  }
  if (newSearchParams.get('type') !== null) {
    newSearchParams.set('stype', newSearchParams.get('type'));
  } else {
    newSearchParams.set('stype', router.query.type);
  }
  newSearchParams.delete('id');
  newSearchParams.delete('type');
  if (searchApi) {
    newSearchParams.set('sapi', searchApi);
  }
  if (newSearchParams.get('spath') === null) {
    newSearchParams.set('spath', spath);
  }

  const href = `/${type}/${encodeURI(uriToId(id, { base: route.uriBase }))}?${newSearchParams}`;

  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
};

export default PaginatedLink;
