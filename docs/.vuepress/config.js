const { description } = require('../../package');

module.exports = {
  base: '/documents/',
  locales: {
    '/': {
      lang: 'ko-KR',
      title: 'Documents',
      description: description
    }
  },
  head: [
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    [
      'meta',
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }
    ]
  ],
  themeConfig: {
    repo: '',
    editLinks: false,
    docsDir: '',
    editLinkText: '',
    activeHeaderLinks: false,
    lastUpdated: false,
    nav: [],
    sidebar: [
      {
        title: '브라우저는 어떻게 동작하는가?',
        path: '/how-browsers-work/'
      },
      {
        title: '최신 브라우저의 내부 살펴보기',
        path: '/inside-look-at-modern-web-browser/'
      }
    ]
  },
  plugins: ['@vuepress/plugin-back-to-top', '@vuepress/plugin-medium-zoom']
};
