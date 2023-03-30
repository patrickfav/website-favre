import {
    figureCaption, findAllHtmlImages, findAllMarkdownImages,
    generateRandomFilename,
    generateSlug,
    getExtension, ImageMeta,
    regexQuote, removeBrokenMarkdownParts,
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

describe('removeBrokenMarkdownParts', () => {
    it('should replace non-breaking spaces with regular spaces', () => {
        const input = 'Some text with non-breaking spaces';
        const expected = 'Some text with non-breaking spaces';
        const result = removeBrokenMarkdownParts(input);
        expect(result).toBe(expected);
    });

    it('should remove empty links', () => {
        const input = 'Some text [ ](https://example.com) with an empty link';
        const expected = 'Some text  with an empty link';
        const result = removeBrokenMarkdownParts(input);
        expect(result).toBe(expected);
    });

    it('should not remove image links', () => {
        const input = 'Some text ![](https://example.com/image.png) with an image link';
        const expected = 'Some text ![](https://example.com/image.png) with an image link';
        const result = removeBrokenMarkdownParts(input);
        expect(result).toBe(expected);
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

describe('findAllHtmlImages', () => {
    it('should find images with src and alt attributes', () => {
        const input = `
            <p>
                <img src="https://example.com/image1.png" style="align-content: center">
                <img src="https://example.com/image2.jpg" alt="Image 2">
            </p>
        `;

        const expected: ImageMeta[] = [
            {
                raw: '<img src="https://example.com/image1.png" style="align-content: center">',
                src: 'https://example.com/image1.png',
                altText: '',
                caption: undefined
            },
            {
                raw: '<img src="https://example.com/image2.jpg" alt="Image 2">',
                src: 'https://example.com/image2.jpg',
                altText: 'Image 2',
                caption: undefined
            }
        ];

        expect(findAllHtmlImages(input)).toEqual(expected);
    });

    it('should return an empty array if no images are found', () => {
        const input = `
            <p>
                This is a paragraph without any images.
            </p>
        `;

        expect(findAllHtmlImages(input)).toEqual([]);
    });
});

describe('findAllMarkdownImages', () => {
    it('should find images with alt text and optional captions', () => {
        const input = `
            ![Image 1](https://example.com/image1.png "Caption 1")
            ![Image 2](https://example.com/image2.jpg "Caption 2")
            ![](https://example.com/image3.jpg "Caption 3")
            ![Image 4](https://example.com/image4.jpg)
        `;

        const expected: ImageMeta[] = [
            {
                raw: '![Image 1](https://example.com/image1.png "Caption 1")',
                src: 'https://example.com/image1.png',
                altText: 'Image 1',
                caption: '"Caption 1"'
            },
            {
                raw: '![Image 2](https://example.com/image2.jpg "Caption 2")',
                src: 'https://example.com/image2.jpg',
                altText: 'Image 2',
                caption: '"Caption 2"'
            },
            {
                raw: '![](https://example.com/image3.jpg "Caption 3")',
                src: 'https://example.com/image3.jpg',
                altText: '',
                caption: '"Caption 3"'
            },
            {
                raw: '![Image 4](https://example.com/image4.jpg)',
                src: 'https://example.com/image4.jpg',
                altText: 'Image 4',
                caption: undefined
            }
        ];

        expect(findAllMarkdownImages(input)).toEqual(expected);
    });

    it('should return an empty array if no images are found', () => {
        const input = `
            This is a paragraph without any images.
        `;

        expect(findAllMarkdownImages(input)).toEqual([]);
    });
});