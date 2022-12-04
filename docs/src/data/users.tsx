/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable global-require */

import { sortBy } from '@site/src/utils/jsUtils';

// Add sites to this list
// prettier-ignore
const Users: User[] = [
  {
    title: 'ADASilk',
    description: 'SILKNOW is a research project that improves the understanding, conservation and dissemination of European silk heritage from the 15th to the 19th century.',
    preview: require('./showcase/adasilk.png'),
    website: 'https://ada.silknow.org/',
    source: 'https://github.com/silknow/adasilk',
  },
  {
    title: 'MeMAD Explorer',
    description: 'MeMAD is an EU funded H2020 research project (2018-2020) that delivered methods for efficient re-use and re-purposing of multilingual audiovisual content, with a particular emphasis on video management and digital storytelling.',
    preview: require('./showcase/memad.png'),
    website: 'https://explorer.memad.eu/',
    source: 'https://github.com/MeMAD-Project/explorer',
  },
  {
    title: 'Odeuropa Explorer',
    description: 'Odeuropa is an European research project which bundles expertise in sensory mining and olfactory heritage in order to develop novel methods to collect information about smell from (digital) text and image collections.',
    preview: require('./showcase/odeuropa.png'),
    website: 'https://explorer.odeuropa.eu/',
    source: 'https://github.com/Odeuropa/explorer',
  },
];

export type User = {
  title: string;
  description: string;
  preview: string | null;
  website: string;
  source: string | null;
};

function sortUsers() {
  let result = Users;
  result = sortBy(result, (user) => user.title.toLowerCase());
  return result;
}

export const sortedUsers = sortUsers();
