import * as crypto from 'crypto';
// @ts-ignore
import base32 from 'base32-encoding';
import * as fs from 'fs'
import * as TurndownService from "turndown";

export function escapeFrontMatterText(title: string): string {
    return title.replace(/'/g, '`').replace(/\n/g, ' ').replace(/\r/g, '');
}

export interface Slug {
    id: string,
    safeName: string,
    safeNameWithDate: string,
    stableName: string,
    yearSlashSafeName: string,
    permalink: string
}

export function escapeForFileName(name: string, type: string, date: Date, stableId: string): Slug {
    const escaped = encodeURI(
        name
            .replace(/&#x2026;/g, '_') // Horizontal Ellipsis
            .replace(/&#39;/g, '') // Apostroph
            .replace(/!/g, '')
            .replace(/\$/g, '')
            .replace(/,/g, '')
            .replace(/;/g, '')
            .replace(/\*/g, '')
            .replace(/'/g, '')
            .replace(/\./g, '')
            .replace(/\?/g, '')
            .replace(/\//g, '_')
            .replace(/:/g, '_')
            .replace(/…/g, '_')
            .replace(/\[/g, '_')
            .replace(/]/g, '_')
            .replace(/#/g, '_')
            .replace(/%/g, '_')
            .replace(/&/g, '_')
            .replace(/_+/g, '_')
            .replace(/\s+/g, '-')
            .replace(/\+/g, '-')
            .replace(/_-/g, '-')
            .replace(/-_/g, '-')
            .replace(/-+/g, '-')
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

export function customTurnDownPlugin(turndownService: any): void {
    turndownService.use([
        stackOverflowHighlightedCodeBlock,
        codeBlockFormat
    ]);
}

function codeBlockFormat(turndownService: TurndownService): void {
    turndownService.addRule('codeBlockFormat', {
        filter: ['pre'],
        replacement: function (content: any, node: any, options: any): string {
            return '\n' + options.fence + '\n' + deEscape(content) + '\n' + options.fence + '\n';
        }
    }).addRule('codeFormat', {
        filter: ['code'],
        replacement: function (content: any): string {
            return ' `' + content + '` ';
        }
    })
}

function stackOverflowHighlightedCodeBlock(turndownService: TurndownService): void {
    const highlightRegExp = /lang-([a-z0-9]+)/

    turndownService.addRule('stackOverflowHighlightedCodeBlock', {
        filter: function (node: any) {
            const firstChild = node.firstChild
            return (
                node.nodeName === 'PRE' &&
                highlightRegExp.test(node.className) &&
                firstChild &&
                firstChild.nodeName === 'CODE'
            )
        },
        replacement: function (content: string, node: any, options: any) {
            const className = node.className || ''
            const language = (className.match(highlightRegExp) || [null, ''])[1]

            return (
                '\n\n' + options.fence + language + '\n' +
                deEscape(node.firstChild.textContent) +
                '\n' + options.fence + '\n\n'
            )
        }
    })
}

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

export function prepareFolder(folderPath: string): void {
    if (fs.existsSync(folderPath)) {
        fs.rmSync(folderPath, {
            recursive: true,
            force: true
        })
    }

    fs.mkdirSync(folderPath, { recursive: true })
}
