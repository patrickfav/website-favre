import { getRenderer } from '/Users/pfavrebulle/workspaces/codedocdemo/.codedoc/node_modules/@codedoc/core/dist/es6/transport/renderer.js';
import { initJssCs } from '/Users/pfavrebulle/workspaces/codedocdemo/.codedoc/node_modules/@codedoc/core/dist/es6/transport/setup-jss.js';initJssCs();
import { installTheme } from '/Users/pfavrebulle/workspaces/codedocdemo/.codedoc/content/theme.ts';installTheme();
import { codeSelection } from '/Users/pfavrebulle/workspaces/codedocdemo/.codedoc/node_modules/@codedoc/core/dist/es6/components/code/selection.js';codeSelection();
import { sameLineLengthInCodes } from '/Users/pfavrebulle/workspaces/codedocdemo/.codedoc/node_modules/@codedoc/core/dist/es6/components/code/same-line-length.js';sameLineLengthInCodes();
import { initHintBox } from '/Users/pfavrebulle/workspaces/codedocdemo/.codedoc/node_modules/@codedoc/core/dist/es6/components/code/line-hint/index.js';initHintBox();
import { initCodeLineRef } from '/Users/pfavrebulle/workspaces/codedocdemo/.codedoc/node_modules/@codedoc/core/dist/es6/components/code/line-ref/index.js';initCodeLineRef();
import { initSmartCopy } from '/Users/pfavrebulle/workspaces/codedocdemo/.codedoc/node_modules/@codedoc/core/dist/es6/components/code/smart-copy.js';initSmartCopy();
import { copyHeadings } from '/Users/pfavrebulle/workspaces/codedocdemo/.codedoc/node_modules/@codedoc/core/dist/es6/components/heading/copy-headings.js';copyHeadings();
import { contentNavHighlight } from '/Users/pfavrebulle/workspaces/codedocdemo/.codedoc/node_modules/@codedoc/core/dist/es6/components/page/contentnav/highlight.js';contentNavHighlight();
import { loadDeferredIFrames } from '/Users/pfavrebulle/workspaces/codedocdemo/.codedoc/node_modules/@codedoc/core/dist/es6/transport/deferred-iframe.js';loadDeferredIFrames();
import { smoothLoading } from '/Users/pfavrebulle/workspaces/codedocdemo/.codedoc/node_modules/@codedoc/core/dist/es6/transport/smooth-loading.js';smoothLoading();
import { tocHighlight } from '/Users/pfavrebulle/workspaces/codedocdemo/.codedoc/node_modules/@codedoc/core/dist/es6/components/page/toc/toc-highlight.js';tocHighlight();
import { postNavSearch } from '/Users/pfavrebulle/workspaces/codedocdemo/.codedoc/node_modules/@codedoc/core/dist/es6/components/page/toc/search/post-nav/index.js';postNavSearch();
import { zoomOnFormula } from '/Users/pfavrebulle/workspaces/codedocdemo/.codedoc/node_modules/@codedoc/core/dist/es6/components/formula/zoom-on-formula.js';zoomOnFormula();
import { reloadOnChange } from '/Users/pfavrebulle/workspaces/codedocdemo/.codedoc/node_modules/@codedoc/core/dist/es6/serve/reload.js';reloadOnChange();
import { ToCPrevNext } from '/Users/pfavrebulle/workspaces/codedocdemo/.codedoc/node_modules/@codedoc/core/dist/es6/components/page/toc/prevnext/index.js';
import { ToCToggle } from '/Users/pfavrebulle/workspaces/codedocdemo/.codedoc/node_modules/@codedoc/core/dist/es6/components/page/toc/toggle/index.js';
import { DarkModeSwitch } from '/Users/pfavrebulle/workspaces/codedocdemo/.codedoc/node_modules/@codedoc/core/dist/es6/components/darkmode/index.js';
import { ConfigTransport } from '/Users/pfavrebulle/workspaces/codedocdemo/.codedoc/node_modules/@codedoc/core/dist/es6/transport/config.js';

const components = {
  'UqEz/Oq4Bwmruy27/b+z2Q==': ToCPrevNext,
  '1WFA4jEfU27/YHA2HF0bIQ==': ToCToggle,
  '1kSPn65S/b/lcL61A7jnhg==': DarkModeSwitch,
  '2OPYhWLZ9GyW6zvtRtS60Q==': ConfigTransport
};

const renderer = getRenderer();
const ogtransport = window.__sdh_transport;
window.__sdh_transport = function(id, hash, props) {
  if (hash in components) {
    const target = document.getElementById(id);
    renderer.render(renderer.create(components[hash], props)).after(target);
    target.remove();
  }
  else if (ogtransport) ogtransport(id, hash, props);
}
