import {generateSlug, getExtension, regexQuote, shortenToTitle} from './util';

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
    it('should return the correct file extension', () => {
        const url = 'https://example.com/image.png?raw=true';

        const extension = getExtension(url);

        expect(extension).toBe('png');
    });

    it('should return "png" when no extension is found', () => {
        const url = 'https://example.com/image';

        const extension = getExtension(url);

        expect(extension).toBe('png');
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
