import * as crypto from 'crypto';
// @ts-ignore
import base32 from 'base32-encoding';
import * as TurndownService from "turndown";
import {Filter, Options, ReplacementFunction} from "turndown";

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

export const codeBlockFormat = function (service: TurndownService): void {
    service.addRule('codeBlockFormat', {
        filter: ['pre'],
        replacement: function (content: any, node: any, options: any): string {
            return '\n' + options.fence + '\n' + deEscape(content) + '\n' + options.fence + '\n';
        }
    }).addRule('codeFormat', {
        filter: ['code'],
        replacement: function (content: string): string {
            return '`' + content + '`';
        }
    })
} as TurndownService.Plugin

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

            if (matches.length > 0) {
                const language = matches[1]
                return (
                    '\n\n' + options.fence + language + '\n' +
                    deEscape(node.firstChild!.textContent!) +
                    '\n' + options.fence + '\n\n'
                )
            } else {
                return (
                    '\n\n' + options.fence + '\n' +
                    deEscape(node.firstChild!.textContent!) +
                    '\n' + options.fence + '\n\n'
                )
            }
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
    if (url === null || !url.includes(".")) {
        return "png";
    }

    const stringAfterDot = url.split('.').pop()!.replace(/\?raw=true/g, '');

    if (stringAfterDot.length > 5) {
        return "png"
    }

    return stringAfterDot
}

export function regexQuote(unquoted: string): string {
    return unquoted.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1')
}
