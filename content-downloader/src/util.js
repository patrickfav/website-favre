import {highlightedCodeBlock, strikethrough, tables} from "turndown-plugin-gfm";

export function escapeForFileName(name, date) {
    const escaped = encodeURI(
        name
            .replace(/ /g, '-')
            .replace(/\//g, '_')
            .replace(/:/g, '_')
            .replace(/&#39;/g, '') //Apostroph
            .replace(/'/g, '')
            .replace(/&#x2026;/g, '_') //Horizontal Ellipsis
            .replace(/…/g, '_')
            .replace(/\[/g, '_')
            .replace(/]/g, '_')
            .replace(/\?/g, '')
            .replace(/#/g, '_')
            .replace(/%/g, '_')
            .replace(/&/g, '_')
            .replace(/\*/g, '')
            .replace(/!/g, '')
            .replace(/\$/g, '')
            .replace(/,/g, '')
            .replace(/;/g, '')
            .replace(/___/g, '_')
            .replace(/__/g, '_')
            .replace(/---/g, '-')
            .replace(/--/g, '-')
            .replace(/_-/g, '-')
            .replace(/-_/g, '-')
    ).toLowerCase();
    return {
        safeName: escaped,
        safeNameWithDate: date.toISOString().split("T")[0] + "-" + escaped
    }
}

export function customTurnDownPlugin(turndownService) {
    turndownService.use([
        stackOverflowHighlightedCodeBlock,
        codeBlockFormat
    ]);
}

function codeBlockFormat(turndownService) {
    turndownService.addRule('codeBlockFormat', {
        filter: ['pre'],
        replacement: function (content, node, options) {
            return '\n'+options.fence+'\n' + deEscape(content) + '\n'+options.fence+'\n';
        }
    }).addRule('codeFormat', {
        filter: ['code'],
        replacement: function (content) {
            return ' `' + content + '` '
        }
    });
}

function stackOverflowHighlightedCodeBlock (turndownService) {
    const highlightRegExp = /lang-([a-z0-9]+)/;

    turndownService.addRule('stackOverflowHighlightedCodeBlock', {
        filter: function (node) {
            let firstChild = node.firstChild;
            return (
                node.nodeName === 'PRE' &&
                highlightRegExp.test(node.className) &&
                firstChild &&
                firstChild.nodeName === 'CODE'
            )
        },
        replacement: function (content, node, options) {
            let className = node.className || '';
            let language = (className.match(highlightRegExp) || [null, ''])[1];

            return (
                '\n\n' + options.fence + language + '\n' +
                deEscape(node.firstChild.textContent) +
                '\n' + options.fence + '\n\n'
            )
        }
    });
}

function deEscape(content) {
    const escapes = [
        [/\\`/g, '`'],
        [/\\\[/g, '['],
        [/\\]/g, ']'],
        [/\\>/g, '>'],
        [/\\_/g, '_']
    ];

    for (let escapeRuleArrayIndex in escapes) {
        content = content.replace(escapes[escapeRuleArrayIndex][0], escapes[escapeRuleArrayIndex][1])
    }
    return content;
}

