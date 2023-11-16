import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const folders = [
  'guide',
  'api',
  'community',
]

const config: Config = {
  title: 'Slim',
  tagline: "A mirco web framework for Golang",
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: "https://slim.zestack.dev",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'zestack', // Usually your GitHub org/user name.
  projectName: 'zestack', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  customFields: {
    description: "A mirco web framework for Golang",
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  presets: [
    [
      'classic',
      {
        // docs: {
        //   sidebarPath: './sidebars-doc.ts',
        //   // Please change this to your repo.
        //   // Remove this to remove the "edit this page" links.
        //   // editUrl: 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        // },
        docs: false,
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl: 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    ...folders.map(name => [
      '@docusaurus/plugin-content-docs',
      {
        id: name,
        path: name,
        routeBasePath: name,
        sidebarPath: `./sidebars-${name}.ts`
      }
    ]),
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'Slim',
      logo: {
        alt: 'slim framework',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'guideSidebar',
          position: 'left',
          label: '文档',
          docsPluginId: 'guide',
        },
        {
          type: 'docSidebar',
          sidebarId: 'apiSidebar',
          position: 'left',
          label: 'API',
          docsPluginId: "api"
        },
        // {
        //   type: 'docSidebar',
        //   sidebarId: 'communitySidebar',
        //   position: 'left',
        //   label: '社区',
        //   docsPluginId: "community"
        // },
        // {to: '/blog', label: '博客', position: 'left'},
        {
          href: 'https://github.com/zestack/zestack',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      // links: [
      //   {
      //     title: 'Docs',
      //     items: [
      //       {
      //         label: 'Guide',
      //         to: '/guide/intro',
      //       },
      //       {
      //         label: 'API',
      //         to: '/api',
      //       },
      //     ],
      //   },
      //   {
      //     title: 'Community',
      //     items: [
      //       {
      //         label: 'Stack Overflow',
      //         href: 'https://stackoverflow.com/questions/tagged/zestack',
      //       },
      //       {
      //         label: 'Discord',
      //         href: 'https://discordapp.com/invite/zestack',
      //       },
      //     ],
      //   },
      //   {
      //     title: 'More',
      //     items: [
      //       {
      //         label: 'Blog',
      //         to: '/blog',
      //       },
      //       {
      //         label: 'GitHub',
      //         href: 'https://github.com/zestack/slim',
      //       },
      //     ],
      //   },
      // ],
      copyright: `Copyright © ${new Date().getFullYear()} the Zestack authors.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    algolia: {
      appId: "SY7QS25M83",
      apiKey: "c9c1669a4c5f1fe90b66c53baeb832ef",
      indexName: "slim_zestack_dev",
      contextualSearch: true,
      externalUrlRegex: "developer\\.mozilla\\.org|www\\.w3\\.org|www\\.rfc-editor\\.org｜golang\\.org",
      // replaceSearchResultPathname: {
      //   from: "/docs/", // or as RegExp: /\/docs\//
      //   to: "/",
      // },
      // searchParameters: {},
      searchPagePath: "search",
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
