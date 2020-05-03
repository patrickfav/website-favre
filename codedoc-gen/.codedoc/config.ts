
import { configuration } from '@codedoc/core';

import { theme } from './theme';


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
  }
});
