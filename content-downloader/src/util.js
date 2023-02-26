import crypto from 'crypto'

export function escapeFrontMatterText (title) {
  return title.replace(/'/g, '`').replace(/\n/g, ' ').replace(/\r/g, '')
}
export function escapeForFileName (name, date, stableId) {
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
  return {
    safeName: escaped,
    safeNameWithDate: date.toISOString().split('T')[0] + '-' + escaped,
    yearSlashSafeName: date.getFullYear() + '/' + escaped,
    permalink: '/l/' + crypto.createHash('sha256')
      .update(date.toISOString() + '_' + stableId)
      .digest('hex')
      .substring(0, 12)
  }
}

export function customTurnDownPlugin (turndownService) {
  turndownService.use([
    stackOverflowHighlightedCodeBlock,
    codeBlockFormat
  ])
}

function codeBlockFormat (turndownService) {
  turndownService.addRule('codeBlockFormat', {
    filter: ['pre'],
    replacement: function (content, node, options) {
      return '\n' + options.fence + '\n' + deEscape(content) + '\n' + options.fence + '\n'
    }
  }).addRule('codeFormat', {
    filter: ['code'],
    replacement: function (content) {
      return ' `' + content + '` '
    }
  })
}

function stackOverflowHighlightedCodeBlock (turndownService) {
  const highlightRegExp = /lang-([a-z0-9]+)/

  turndownService.addRule('stackOverflowHighlightedCodeBlock', {
    filter: function (node) {
      const firstChild = node.firstChild
      return (
        node.nodeName === 'PRE' &&
                highlightRegExp.test(node.className) &&
                firstChild &&
                firstChild.nodeName === 'CODE'
      )
    },
    replacement: function (content, node, options) {
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

function deEscape (content) {
  const escapes = [
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

export function shortenToTitle (description) {
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
