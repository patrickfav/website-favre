// @ts-ignore
import base32 from 'base32-encoding';
import TurndownService, {Filter, Node, Options, ReplacementFunction} from "turndown";
import fs from "node:fs";
import * as crypto from 'node:crypto';
import got from 'got';
import { promisify } from 'node:util';
import * as stream from 'node:stream';

const pipeline = promisify(stream.pipeline);

export interface Slug {
    id: string,
    safeName: string,
    safeNameWithDate: string,
    stableName: string,
    yearSlashSafeName: string,
    permalink: string
}

export function generateSlug(name: string, type: string, date: Date, stableId: string): Slug {
    const escaped = encodeURI(
        name
            .replaceAll('&#x2026;', '_') // Horizontal Ellipsis
            .replaceAll('&#39;', '') // Apostroph
            .replaceAll('!', '')
            .replaceAll('$', '')
            .replaceAll(',', '')
            .replaceAll(';', '')
            .replaceAll('*', '')
            .replaceAll('\'', '')
            .replaceAll('.', '')
            .replaceAll('?', '')
            .replaceAll('/', '_')
            .replaceAll(':', '_')
            .replaceAll('…', '_')
            .replaceAll('[', '_')
            .replaceAll(']', '_')
            .replaceAll('#', '_')
            .replaceAll('%', '_')
            .replaceAll('&', '_')
            .replaceAll(/_+/g, '_')
            .replaceAll(/\s+/g, '-')
            .replaceAll('+', '-')
            .replaceAll('_-', '-')
            .replaceAll('-_', '-')
            .replaceAll(/-+/g, '-')
    ).toLowerCase()

    const shortLinkPath = 'link'
    const dayMonthYear = date.toISOString().split('T')[0]
    const hash = base32.stringify(
        crypto.createHash('sha512')
            .update(date.toISOString() + '_' + stableId)
            .digest()
    )

    const id = hash.substring(0, 16)
    const shortId = hash.substring(0, 8)

    return {
        id,
        safeName: escaped,
        safeNameWithDate: `${dayMonthYear}-${escaped}`,
        stableName: `${dayMonthYear}-${type}-${id}`,
        yearSlashSafeName: `${date.getFullYear()}/${escaped}`,
        permalink: `/${shortLinkPath}/${shortId}`
    }
}

export function removeBrokenMarkdownParts(markdown: string): string {
    return markdown
        .replaceAll('```\n```', '') // remove empty code blocks
        .replaceAll(' ', ' ') // remove non-breaking spaces
        .replaceAll(/(?<!!)\[(\s*?)]\((.*?)\)/g, '') // remove empty links
}

export const codeBlockFormat = function (service: TurndownService): void {
    service.addRule('codeBlockFormat', {
        filter: ['pre'],
        replacement: function (content: string, node: Node, options: Options): string {
            return '\n' + options.fence + '\n' + deEscape(content) + '\n' + options.fence + '\n';
        }
    }).addRule('codeFormat', {
        filter: ['code'],
        replacement: function (content: string): string {
            return '`' + content + '`';
        }
    })
} as TurndownService.Plugin

export const stackExchangeHighlightedCodeBlock = function (service: TurndownService): void {
    const highlightRegExp = /lang-([a-z0-9]+)/

    service.addRule('stackExchangeHighlightedCodeBlock', {
        filter: function (node: HTMLElement): boolean | null {
            const firstChild = node.firstChild
            return (
                node.nodeName === 'PRE' &&
                firstChild?.nodeName === 'CODE'
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

export const figureCaption = function (service: TurndownService): void {
    service.addRule('stackOverflowHighlightedCodeBlock', {
        filter: function (node: HTMLElement): boolean | null {
            const firstChild = node.firstChild
            const lastChild = node.lastChild
            return (
                node.nodeName === 'FIGURE' &&
                firstChild?.nodeName === 'IMG' &&
                lastChild?.nodeName === 'FIGCAPTION'
            )
        } as Filter,
        replacement: function (content: string, node: HTMLElement): string {
            const imgNode = node.firstChild as HTMLImageElement;
            const captionNode = node.lastChild

            const altText = imgNode.alt
            const imgSrc = imgNode.src
            const caption = captionNode!.textContent

            return (
                `![${altText}](${imgSrc + ' '}"${caption}")\n`
            )
        } as ReplacementFunction
    })
} as TurndownService.Plugin

export const supportedHtml = function (service: TurndownService): void {
    service.addRule('supportedHtml', {
        filter: function (node: HTMLElement): boolean | null {
            return (
                node.nodeName === 'SUP' ||
                node.nodeName === 'SUB' ||
                node.nodeName === 'KBD' ||
                node.nodeName === 'MARK'
            )
        } as Filter,
        replacement: function (content: string, node: HTMLElement): string {
            const nodeName = node.nodeName.toLowerCase();
            const text = node.textContent ? node.textContent : ''

            return (
                `<${nodeName}>${text}</${nodeName}>`
            )
        } as ReplacementFunction
    })
} as TurndownService.Plugin

function deEscape(content: string): string {
    const escapes: [RegExp, string][] = [
        [/\\`/g, '`'],
        [/\\\[/g, '['],
        [/\\]/g, ']'],
        [/\\>/g, '>'],
        [/\\_/g, '_']
    ]

    for (const escapeRuleArrayIndex in escapes) {
        content = content.replace(escapes[escapeRuleArrayIndex][0], escapes[escapeRuleArrayIndex][1])
    }
    return content
}

export function shortenToTitle(description: string): string {
    const maxLength = 80

    if (description.length <= maxLength) {
        return description
    }

    const indexCut = [
        description.indexOf(': '),
        description.indexOf('. '),
        description.indexOf('; '),
        description.indexOf(' ('),
        description.indexOf(' - ')
    ]
        .filter(foundIndex => foundIndex > 0)
        .reduce((a, b) => Math.min(a, b), maxLength + 1)

    if (indexCut <= maxLength) {
        return description.substring(0, indexCut)
    } else {
        return description.substring(0, maxLength) + '...'
    }
}

export function getExtension(url: string): string {
    const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/)

    if (!match?.[1]) {
        return "png"
    } else {
        return match[1]
    }
}

export function getExtensionFromMimeType(mimeType: string | undefined): string | undefined {
    if (!mimeType) {
        return undefined
    }

    const cleanMimeType = mimeType.toLowerCase().split(';')[0].trim()

    const mimeTypeMap: { [key: string]: string } = {
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
        "image/avif": "avif",
        "image/heif": "heif",
        "image/heic": "heic",
        "image/svg+xml": "svg"
    }

    return mimeTypeMap[cleanMimeType] ?? undefined;
}

export async function getExtensionFromFileContent(filePath: string): Promise<string | undefined> {
    try {
        const { fileTypeFromFile } = await import('file-type');
        const fileType = await fileTypeFromFile(filePath);
        if (fileType?.mime.startsWith('image/')) {
            return getExtensionFromMimeType(fileType.mime);
        }
    } catch (error) {
        console.warn(`Could not detect file type from ${filePath}:`, error);
    }
    return undefined
}

export function regexQuote(unquoted: string): string {
    return unquoted.replaceAll(/([.?*+^$[\]\\(){}|-])/g, '\\$1')
}

export function calculateFileSha256(filePath: string): string {
    const buff = fs.readFileSync(filePath);
    return crypto
        .createHash("sha256")
        .update(new Uint8Array(buff))
        .digest("hex");
}

export function renameFile(oldPath: string, newPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.rename(oldPath, newPath, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

export function generateRandomFilename(): string {
    return `temp_${crypto.createHash('sha256').update(Math.random().toString()).digest('hex').substring(0, 20)}.tmp`
}

export function findAllHtmlImages(markdown: string): ImageMeta[] {
    return [...markdown.matchAll(/<img[^>]+src\s*=\s*["']([^"']+)["'](?:[^>]*alt\s*=\s*["']([^"']+)["'])?[^>]*>/g)].map(match => {
        return {
            raw: match[0],
            src: match[1],
            altText: match[2] ? match[2] : '',
            caption: undefined
        }
    })
}

export function findAllMarkdownImages(markdown: string): ImageMeta[] {
    return [...markdown.matchAll(/!\[(?<alttext>[^\]]*)]\((?<filename>\S*?)(?=\s*[")])\s*(?<optionalpart>".*")?\)/g)].map(match => {
        return {
            raw: match[0],
            altText: match[1] ? match[1] : '',
            src: match[2],
            caption: match[3] ? match[3] : undefined
        }
    })
}


export interface ImageMeta {
    altText: string
    src: string
    caption: string | undefined
    raw: string
}


export async function downloadAndSaveImage(
    url: string,
    prefix: string,
    folder: string,
    appendSha256: boolean
): Promise<string> {
    const tempFileName = `${folder}/${generateRandomFilename()}`;

    let mimeType: string | undefined;

    // Download the image and capture MIME type
    const downloadStream = got.stream(url);
    downloadStream.on('response', (response) => {
        mimeType = response.headers['content-type'];
    });

    await pipeline(
        downloadStream,
        fs.createWriteStream(tempFileName)
    );

    // Determine file extension
    let extension = getExtensionFromMimeType(mimeType);

    if (!extension) {
        // No extension inferred, try to detect from file content
        extension = await getExtensionFromFileContent(tempFileName) ?? "png";
    }

    // Calculate hash if needed
    let finalFileName: string;
    if (appendSha256) {
        const contentHash = calculateFileSha256(tempFileName);
        finalFileName = `${prefix}${contentHash.substring(0, 16)}.${extension}`;
    } else {
        finalFileName = `${prefix}.${extension}`;
    }

    const finalPath = `${folder}/${finalFileName}`;

    // Move from temp to final location
    await renameFile(tempFileName, finalPath);

    return finalFileName;
}