import Link from 'next/link';
import { useRouter } from 'next/router';

import { uriToId } from '@helpers/utils';
import config from '~/config';

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
