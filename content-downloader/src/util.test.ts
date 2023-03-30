import {
    figureCaption,
    generateRandomFilename,
    generateSlug,
    getExtension,
    regexQuote,
    shortenToTitle,
    stackOverflowHighlightedCodeBlock
} from './util';
import TurndownService from "turndown";

describe('generateSlug', () => {
    it('should generate a valid slug', () => {
        const name = 'Example Article Title!';
        const type = 'article';
        const date = new Date('2022-01-01T00:00:00.000Z');
        const stableId = 'stable-id';

        const slug = generateSlug(name, type, date, stableId);

        expect(slug.id).toHaveLength(16);
        expect(slug.safeName).toBe('example-article-title');
        expect(slug.safeNameWithDate).toBe('2022-01-01-example-article-title');
        expect(slug.stableName).toMatch(/2022-01-01-article-[a-z0-9]{16}/);
        expect(slug.yearSlashSafeName).toBe('2022/example-article-title');
        expect(slug.permalink).toMatch(/\/link\/[a-z0-9]{8}/);
    });
});

describe('shortenToTitle', () => {
    it('should shorten the description to a title', () => {
        const description = 'This is a very long description that goes beyond the maxLength and should be shortened to a title.';

        const shortenedTitle = shortenToTitle(description);

        expect(shortenedTitle).toBe('This is a very long description that goes beyond the maxLength and should be sho...');
    });
});

describe('getExtension', () => {
    test('should return png for empty or null input', () => {
        expect(getExtension('')).toBe('png');
    });

    test('should return the correct file extension', () => {
        expect(getExtension('https://example.com/image.jpg')).toBe('jpg');
        expect(getExtension('https://example.com/image.jpeg')).toBe('jpeg');
        expect(getExtension('https://example.com/image.png')).toBe('png');
    });

    test('should return png when no extension is present', () => {
        expect(getExtension('https://example.com/image')).toBe('png');
    });

    test('should return extension without the query string', () => {
        expect(getExtension('https://example.com/image.jpg?raw=true')).toBe('jpg');
        expect(getExtension('https://example.com/image.jpeg?version=2')).toBe('jpeg');
        expect(getExtension('https://example.com/image.png?param=value')).toBe('png');
    });
});

describe('regexQuote', () => {
    it('should escape regex special characters', () => {
        const unquoted = 'some-string([.*+?^${}()|[]\\])';
        const expected = 'some\\-string\\(\\[\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\\\]\\)';

        const escaped = regexQuote(unquoted);

        expect(escaped).toBe(expected);
    });
});

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

describe('figureCaption', () => {
    let turndownService: TurndownService;

    beforeEach(() => {
        turndownService = new TurndownService();
        turndownService.use(figureCaption);
    });

    it('should convert figure with img and figcaption to markdown', () => {
        const inputHTML = `
      <figure>
        <img src="example.png" alt="Example image">
        <figcaption>Example caption</figcaption>
      </figure>
    `;
        const expectedMarkdown = '![Example image](/example.png "Example caption")';
        const result = turndownService.turndown(inputHTML);

        expect(result).toEqual(expectedMarkdown);
    });

    it('should not affect other elements', () => {
        const inputHTML = `
      <p>Some text</p>
      <img src="another-example.png" alt="Another example">
    `;

        const expectedMarkdown = 'Some text\n\n![Another example](another-example.png)';
        const result = turndownService.turndown(inputHTML);

        expect(result).toEqual(expectedMarkdown);
    });
});

describe('generateRandomFilename', () => {
    it('should generate a random filename with correct format', () => {
        const filename = generateRandomFilename();
        expect(filename).toMatch(/^temp_[0-9a-f]{20}\.tmp$/);
    });

    it('should generate unique filenames', () => {
        const filename1 = generateRandomFilename();
        const filename2 = generateRandomFilename();
        const filename3 = generateRandomFilename();

        expect(filename1).not.toEqual(filename2);
        expect(filename1).not.toEqual(filename3);
        expect(filename2).not.toEqual(filename3);
    });
});
