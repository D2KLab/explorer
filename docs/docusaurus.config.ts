import type * as Preset from '@docusaurus/preset-classic';
import { Config } from '@docusaurus/types';
import {themes as prismThemes} from 'prism-react-renderer';

const config: Config = {
  title: 'D2KLab Explorer',
  url: 'https://d2klab.github.io',
  baseUrl: '/explorer',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'D2KLab', // Usually your GitHub org/user name.
  projectName: 'explorer', // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/D2KLab/explorer/tree/master/docs/',
          remarkPlugins: [[require('@docusaurus/remark-plugin-npm2yarn'), { sync: true }]],
        },
        blog: false,
        pages: {
          remarkPlugins: [[require('@docusaurus/remark-plugin-npm2yarn'), { sync: true }]],
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: ['@docusaurus/plugin-ideal-image'],

  themeConfig:
    {
      navbar: {
        title: 'D2KLab Explorer',
        logo: {
          alt: 'D2KLab Explorer',
          src: 'img/logo.svg',
        },
        items: [
          { to: '/', label: 'Docs', position: 'left' },
          { to: 'api/config', label: 'API', position: 'left' },
          { to: 'showcase', label: 'Showcase', position: 'left' },
          { href: 'https://github.com/D2KLab/explorer', label: 'GitHub', position: 'right' },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Introduction',
                to: '/',
              },
              {
                label: 'Installation',
                to: 'installation',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/D2KLab/explorer',
              },
              {
                label: 'D2KLab',
                href: 'https://github.com/D2KLab',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} EURECOM. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    } satisfies Preset.ThemeConfig,
};

module.exports = config;
