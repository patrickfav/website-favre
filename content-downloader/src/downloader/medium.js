import fs from 'fs'
import { StringStream } from 'scramjet'
import axios from 'axios'
import got from 'got'
import crypto from 'crypto'
import Parser from 'rss-parser'
import TurndownService from 'turndown'
import * as cheerio from 'cheerio'
import { mediumDownloaderEnabled } from '../confg'
import { customTurnDownPlugin, escapeForFileName, escapeFrontMatterText } from '../util'
import { strikethrough, tables, taskListItems } from 'turndown-plugin-gfm'

export async function downloadMediumArticles (rootDirMd, relOutDirArticles) {
  if (mediumDownloaderEnabled === false) {
    console.log('Medium Downloader disabled')
    return
  }

  console.log('Start Processing medium articles')

  const targetRootDir = rootDirMd + relOutDirArticles

  const userName = '@patrickfav'

  const postInfoArray = await getAllArticles(userName)

  for (const index in postInfoArray) {
    const post = postInfoArray[index]
    console.log('Processing medium article ' + post.url)

    const articleInfo = await getArticleInfo(post)

    const title = articleInfo.title
    const slug = escapeForFileName(title, new Date(articleInfo.firstPublishedAt), articleInfo.id)

    console.log('\tFound article ' + title + '(' + slug.safeNameWithDate + ') updated at ' + new Date(articleInfo.latestPublishedAt).toISOString())

    const targetProjectDir = targetRootDir + '/' + slug.safeNameWithDate

    if (!fs.existsSync(targetProjectDir)) {
      fs.mkdirSync(targetProjectDir, { recursive: true })
    }

    await downloadProjectImage(articleInfo, slug.safeName, targetProjectDir)

    const targetProjectFile = targetProjectDir + '/index.md'
    const frontMatter = createFrontMatter(articleInfo, slug)
    const markdown = await fetchAndReplaceImages(post.markdown, targetProjectDir)
    await StringStream.from(frontMatter + markdown)
      .pipe(fs.createWriteStream(targetProjectFile))
  }
}

async function downloadProjectImage (articleInfo, safeArticleTitle, targetProjectDir) {
  const imageUrl = 'https://cdn-images-1.medium.com/max/1024/' + articleInfo.previewImage.__ref.replace(/ImageMetadata:/g, '')
  const imageFileName = 'feature_' + safeArticleTitle + '.png'

  if (imageUrl) {
    console.log('\tDownloading social preview image: ' + imageUrl)
    await got.stream(imageUrl).pipe(fs.createWriteStream(targetProjectDir + '/' + imageFileName))
  }
}

async function getAllArticles (mediumUserName) {
  function removeMediumDisclaimer (markdown) {
    if (markdown.includes('on Medium, where people are continuing the conversation by highlighting and responding to this story.')) {
      return markdown.substring(0, markdown.lastIndexOf('* * *\n'))
    }
    return markdown
  }

  function parseAsMarkdown (rssElement) {
    const htmlContent = rssElement['content:encoded']
    const turndownService = new TurndownService({ preformattedCode: false })
    turndownService.use(strikethrough)
    turndownService.use(tables)
    turndownService.use(taskListItems)
    turndownService.use(customTurnDownPlugin)

    return removeMediumDisclaimer(
      turndownService
        .turndown(htmlContent)
        .replace(/```\n```/g, '')
    )
  }

  console.log('\tDownloading content from feed for ' + mediumUserName)
  const parser = new Parser()
  // https://medium.com/feed/@patrickfav
  const rssContent = await axios.request({
    method: 'GET',
    url: 'https://medium.com/feed/' + mediumUserName
  }).then(response => parser.parseString(response.data))

  const postInfo = []
  for (const itemIndex in rssContent.items) {
    postInfo.push({
      markdown: parseAsMarkdown(rssContent.items[itemIndex]),
      url: rssContent.items[itemIndex].guid,
      articleId: rssContent.items[itemIndex].guid.split('/').at(-1)
    })
  }

  return postInfo
}

async function getArticleInfo (post) {
  const mediumArticleDom = await axios.request({
    method: 'GET',
    url: post.url
  })
    .then(response => response.data)
    .then(body => cheerio.load(body, { xmlMode: true }))

  const json = mediumArticleDom('script')
    .map((idx, el) => mediumArticleDom(el).html())
    .toArray()
    .find((element) => element.includes('window.__APOLLO_STATE__'))
    .replace('window.__APOLLO_STATE__ = ', '')
    .replace(/&quot;/g, '"')

  // throttle
  await new Promise(resolve => setTimeout(resolve, 500))

  return JSON.parse(json)[`Post:${post.articleId}`]
}

function createFrontMatter (articleInfo, slug) {
  const dateIso8601 = new Date(articleInfo.firstPublishedAt).toISOString().split('T')[0]

  const articleTags = articleInfo.tags.map(m => m.__ref.replace(/Tag:/g, '')).slice()
  const articleTopics = articleInfo.topics ? articleInfo.topics.map(m => m.name).slice() : []
  const allTags = articleTags.concat(articleTopics).concat(['medium'])

  let meta = '---\n'
  meta += "title: '" + escapeFrontMatterText(articleInfo.title) + "'\n"
  meta += 'date: ' + dateIso8601 + '\n'
  meta += 'lastmod: ' + new Date(articleInfo.latestPublishedAt).toISOString().split('T')[0] + '\n'
  meta += 'lastfetch: ' + new Date().toISOString() + '\n'
  meta += "summary: '" + escapeFrontMatterText(articleInfo.previewContent.subtitle) + "'\n"
  meta += "description: '" + escapeFrontMatterText(articleInfo.previewContent.subtitle) + "'\n"
  meta += 'aliases: [' + slug.permalink + ']\n'
  meta += 'slug: ' + slug.yearSlashSafeName + '\n'
  meta += 'tags: [' + articleTopics.map(m => '"' + m + '"').join(', ') + ']\n'
  meta += 'keywords: [' + articleTags.map(m => '"' + m + '"').join(', ') + ']\n'
  meta += 'alltags: [' + allTags.map(m => '"' + m + '"').join(', ') + ']\n'
  meta += 'categories: ["article", "medium"]\n'
  meta += 'originalContentLink: ' + articleInfo.mediumUrl + '\n'
  meta += 'originalContentType: medium\n'
  meta += 'mediumClaps: ' + articleInfo.clapCount + '\n'
  meta += 'mediumVoters: ' + articleInfo.voterCount + '\n'
  meta += 'mediumArticleId: ' + articleInfo.id + '\n'
  meta += '---\n'
  return meta
}

async function fetchAndReplaceImages (markdownContent, targetProjectDir) {
  function getExtension (imageUrl) {
    return imageUrl.split('.').pop()
  }

  function regExpQuote (str) {
    return str.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1')
  }

  const matches = [...markdownContent.matchAll(/!\[[^\]]*]\((?<filename>.*?)(?=[")])(?<optionalpart>".*")?\)/g)]

  for (const i in matches) {
    const imageUrl = matches[i][1]

    if (imageUrl.startsWith('https://medium.com/_/stat')) {
      markdownContent = markdownContent.replace(new RegExp(regExpQuote(matches[i][0]), 'g'), '\n')
      continue // only the stats tracker from medium, just remove
    }

    const imageFileName = 'article_' + crypto.createHash('sha256').update(imageUrl).digest('hex').substring(0, 24) + '.' + getExtension(imageUrl)

    console.log('\tDownloading article image: ' + imageUrl + ' to ' + imageFileName)

    await got.stream(imageUrl).pipe(fs.createWriteStream(targetProjectDir + '/' + imageFileName))

    markdownContent = markdownContent.replace(new RegExp(regExpQuote(imageUrl), 'g'), imageFileName)
  }

  return markdownContent
}
