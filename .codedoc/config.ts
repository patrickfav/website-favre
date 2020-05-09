
import {configuration, DefaultMarkdownCustomComponents} from '@codedoc/core';

import { theme } from './theme';
import {GithubBtn} from './components/github-btn';


export const config = /*#__PURE__*/configuration({
  theme,                                  // --> add the theme. modify `./theme.ts` for chaning the theme.
  
  page: {
    title: {
      base: 'Patrick Favre-Bulle'                 // --> the base title of your doc pages
    },
    favicon: '/favicon.ico'
  },
  dest: {
    html: 'dist',                           // --> the base folder for HTML files
    assets: 'dist',                         // --> the base folder for assets
    bundle: 'assets',               // --> where to store codedoc's bundle (relative to `assets`)
    styles: 'assets',               // --> where to store codedoc's styles (relative to `assets`)
    namespace: '',                       // --> project namespace
  },
  misc: {
  },
  markdown: {                                  // --> update markdown config
    customComponents: {                        // --> add to custom components
      ...DefaultMarkdownCustomComponents,      // --> make sure to add default markdown components. otherwise the default components will not work!
      GithubBtn,                                    // --> add our own component
    }
  },
});
