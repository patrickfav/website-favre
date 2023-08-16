---
title: 'Snippet: A Turndown Plugin parsing Stack Overflow HTML answers'
date: 2023-03-29
lastmod: 2023-05-27
description: 'A Turndown Plugin parsing Stack Overflow HTML answers; converts it to GitHub-Flavored-Markdown (GFM) with correct language. Turndown is a JS Markdown Parser'
summary: 'A Turndown Plugin parsing Stack Overflow HTML answers; converts it to GitHub-Flavored-Markdown (GFM) with correct language. Turndown is a JS Markdown Parser'
aliases: [/link/jw8w6svp]
slug: 2023/a-turndown-plugin-parsing-stack-overflow-html-answers
tags: ["TypeScript"]
keywords: ["TypeScript"]
alltags: ["TypeScript"]
categories: ["opensource"]
type: gist
showTableOfContents: false
showTaxonomies: false
thumbnail: 'gistbanner*'
editURL: https://gist.github.com/patrickfav/0ca9cae68a3e363f87755e1d87fd6160
deeplink: /link/jw8w6svp
originalContentLink: https://gist.github.com/patrickfav/0ca9cae68a3e363f87755e1d87fd6160
originalContentType: gist
originalContentId: 0ca9cae68a3e363f87755e1d87fd6160
gistLanguage: TypeScript
gistFileCount: 2
gistRevisions: 11
gistForks: 0
gistComments: 0
---

### plugin-so-turndown.ts

```TypeScript
import TurndownService from "turndown";

export const stackOverflowHighlightedCodeBlock = function (service: TurndownService): void {
    const highlightRegExp = /lang-([a-z0-9]+)/

    service.addRule('stackOverflowHighlightedCodeBlock', {
        filter: function (node: HTMLElement, options: Options): boolean | null {
            const firstChild = node.firstChild
            return (
                node.nodeName === 'PRE' &&
                firstChild &&
                firstChild.nodeName === 'CODE'
            )
        } as Filter,
        replacement: function (content: string, node: HTMLElement, options: Options): string {
            const className = node.className || ''
            const matches = (className.match(highlightRegExp) || [null, ''])

            return (
                `\n\n${options.fence}${matches.length > 0 ? matches[1] : ''}\n` +
                `${deEscape(node.firstChild!.textContent!)}` +
                `\n${options.fence}\n\n`
            )
        } as ReplacementFunction
    })
} as TurndownService.Plugin
```

### test.ts

```TypeScript
import TurndownService from "turndown";

describe('stackOverflowHighlightedCodeBlock', () => {
    it('should correctly format a code block with a language', () => {
        const turndownService = new TurndownService();
        stackOverflowHighlightedCodeBlock(turndownService);

        const html = `
            <pre class="lang-javascript"><code>const a = 10;
console.log(a);</code></pre>
        `;

        const expectedResult = `
\`\`\`javascript
const a = 10;
console.log(a);
\`\`\`
        `;

        const markdown = turndownService.turndown(html).trim();
        expect(markdown).toBe(expectedResult.trim());
    });

    it('should correctly format a code block without a language', () => {
        const turndownService = new TurndownService();
        stackOverflowHighlightedCodeBlock(turndownService);

        const html = `
            <pre><code>const a = 10;
console.log(a);</code></pre>
        `;

        const expectedResult = `
\`\`\`
const a = 10;
console.log(a);
\`\`\`
        `;

        const markdown = turndownService.turndown(html).trim();
        expect(markdown).toBe(expectedResult.trim());
    });
});
```

