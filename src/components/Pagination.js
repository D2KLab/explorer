import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import Element from '@components/Element';
import { start, done } from '@components/NProgress';
import PaginatedLink from '@components/PaginatedLink';
import Spinner from '@components/Spinner';
import { uriToId } from '@helpers/utils';
import config from '~/config';

function buildParams(data) {
  const params = new URLSearchParams();

  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((value) => params.append(key, value.toString()));
    } else {
      params.append(key, value.toString());
    }
  });

  return params;
}

const getLinkParams = (params) => {
  const linkParams = new URLSearchParams(params);
  const sid = linkParams.get('sid');
  linkParams.delete('id');
  if (sid !== null) {
    linkParams.set('id', sid);
  }
  const stype = linkParams.get('stype');
  linkParams.delete('type');
  if (stype !== null) {
    linkParams.set('type', stype);
  }
  linkParams.delete('sid');
  linkParams.delete('stype');
  linkParams.delete('spath');
  linkParams.delete('sapi');
  return linkParams;
};

/**
 * Renders the pagination component.
 * @param {SearchData} searchData - The search data object.
 * @param {number} totalResults - The total number of results.
 * @param {number} pageSize - The number of results per page.
 * @param {object} props - The props to pass to the component.
 * @returns The pagination component.
 */
function Pagination({ searchData, result, pageSize = 20, ...props }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const { query } = router;
  const route = config.routes[query.type];

  if (!searchData) return null;

  const results = searchData.results || [];
  const totalResults = searchData.totalResults || 0;

  const i = results.findIndex((item) => item['@id'] === result['@id']);

  const nextItem = results[i + 1];
  const previousItem = results[i - 1];

  const searchParams = buildParams(query);

  const page = parseInt(searchParams.get('page'), 10) || 1;
  const currentIndex = (page - 1) * pageSize + i + 1;

  const loader = (
    <>
      <Spinner size="20" style={{ marginRight: '0.5em' }} /> {t('common:pagination.loading')}
    </>
  );

  const renderDisabled = (children) => (
    <span style={{ color: '#aaa', cursor: 'not-allowed' }}>{children}</span>
  );

  const renderDetailsLink = (id, children) => (
    <PaginatedLink key={id} id={id} type={query.type} searchParams={searchParams}>
      {children}
    </PaginatedLink>
  );

  const renderBrowseLink = (params, idFunc, children) => {
    const linkParams = getLinkParams(params);
    return (
      <Link
        href={`${query.spath}?${linkParams}`}
        onClick={(e) => {
          e.preventDefault();
          if (isLoadingResults) return;

          const linkParams = getLinkParams(params);

          setIsLoadingResults(true);

          (async () => {
            let newData;
            start();
            try {
              newData = await (await fetch(`/api/${query.sapi}?${linkParams}`)).json();
            } finally {
              done();
            }

            setIsLoadingResults(false);

            const { results } = newData;
            const id = await idFunc(results);

            const entries = {};
            for (const [key, value] of params) {
              if (entries[key]) {
                entries[key] = [].concat(entries[key], value);
              } else {
                entries[key] = value;
              }
            }

            const routeParams = new URLSearchParams(params);
            routeParams.delete('id');
            routeParams.delete('type');
            router.push(
              `/${searchParams.get('stype')}/${encodeURI(
                uriToId(id, { base: route.uriBase }),
              )}?${routeParams}`,
            );
          })();
        }}
      >
        {children}
      </Link>
    );
  };

  const renderPrevious = () => {
    const prevLabel = <>&laquo; {t('common:pagination.previous')}</>;
    if (previousItem) {
      return renderDetailsLink(previousItem['@id'], prevLabel);
    }

    if (currentIndex <= 1) {
      return renderDisabled(prevLabel);
    }

    if (isLoadingResults) return loader;

    const prevParams = new URLSearchParams(searchParams);
    prevParams.set('page', (parseInt(prevParams.get('page'), 10) || 1) - 1);
    return renderBrowseLink(
      prevParams,
      (results) => results[results.length - 1]?.['@id'],
      prevLabel,
    );
  };

  const renderNext = () => {
    const nextLabel = <>{t('common:pagination.next')} &raquo;</>;
    if (nextItem) {
      return renderDetailsLink(nextItem['@id'], nextLabel);
    }

    if (totalResults > -1 && totalResults <= currentIndex) {
      return renderDisabled(nextLabel);
    }

    if (isLoadingResults) return loader;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', (parseInt(nextParams.get('page'), 10) || 1) + 1);
    return renderBrowseLink(nextParams, (results) => results[0]?.['@id'], nextLabel);
  };

  const hasMoreResults = totalResults === -1 || totalResults > 0;

  return (
    <Element
      display="flex"
      justifyContent="space-between"
      paddingTop={12}
      paddingBottom={12}
      {...props}
      style={{ borderBottom: '1px solid #e7e7e7', ...props.style }}
    >
      {hasMoreResults > 0 && (
        <Element display="flex" alignItems="center" paddingLeft={48}>
          {renderPrevious()}
        </Element>
      )}
      <Element display="flex" alignItems="center" flexDirection="column" margin="0 auto">
        <Element alignSelf="center">
          <Link href={`${query.spath}?${getLinkParams(searchParams)}`}>
            {t('common:pagination.back')}
          </Link>
        </Element>
        {hasMoreResults && (
          <Element>
            {currentIndex}
            {totalResults > 0 && ` / ${totalResults}`}
          </Element>
        )}
      </Element>
      {hasMoreResults && (
        <Element display="flex" alignItems="center" justifyContent="flex-end" paddingRight={48}>
          {renderNext()}
        </Element>
      )}
    </Element>
  );
}

export default Pagination;
