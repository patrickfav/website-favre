import got from 'got'
import { stackoverflowEnabled, stackoverflowUserId } from '../confg'
import fs from 'fs'
import { StringStream } from 'scramjet'
import TurndownService from 'turndown'
import { strikethrough, tables, taskListItems } from 'turndown-plugin-gfm'
import { customTurnDownPlugin, escapeForFileName, escapeFrontMatterText } from '../util'
import wordsCount from 'words-count'
import crypto from 'crypto'
import summarize from 'text-summarization'
import { sobannerSvg } from '../svg'

export async function downloadStackOverflowPosts (soUser, rootDirMd, relOutDir) {
  if (stackoverflowEnabled === false) {
    console.log('Stack Overflow Downloader disabled')
    return
  }

  const targetRootDir = rootDirMd + relOutDir

  console.log('Start Processing Stack Overflow posts')

  const soAnswers = await fetchAllSoAnswers(soUser)
  const soQuestions = await fetchAllQuestions(soAnswers)

  for (const answer of soAnswers) {
    const question = soQuestions[answer.question_id]

    console.log(`\tProcessing stack overflow post '${question.title}' (${answer.answer_id}) ${answer.score} upvotes`)

    if (answer.score <= 10) {
      console.log('\tskipping due to low score')
      continue
    }

    const slug = escapeForFileName(question.title, new Date(answer.creation_date * 1000), answer.answer_id)
    const answerLink = `https://stackoverflow.com/a/${answer.answer_id}/${stackoverflowUserId}`
    const targetProjectDir = targetRootDir + '/' + slug.safeNameWithDate
    const summary = await createSummary(answer, question)
    const frontMatter = createStackOverflowFrontMatter(answer, question, summary, slug, answerLink)
    const bannerText = createBannerText(answerLink, question.link)
    const markdown = createMarkdown(answer.body)

    const wordCount = wordsCount(markdown)
    if (wordCount <= 200) {
      console.log(`\tskipping due to low word count ${wordCount}`)
      continue
    }

    if (!fs.existsSync(targetProjectDir)) {
      fs.mkdirSync(targetProjectDir, { recursive: true })
    }

    const targetProjectFile = targetProjectDir + '/index.md'
    const targetProjectFileBanner = targetProjectDir + '/sobanner.svg'

    copyBannerImage(sobannerSvg, targetProjectFileBanner)

    const finalMarkdown = await fetchAndReplaceImages(markdown, targetProjectDir)

    await StringStream.from(frontMatter + bannerText + finalMarkdown)
      .pipe(fs.createWriteStream(targetProjectFile))
  }
}

async function fetchAllSoAnswers (soUser) {
  let hasMore = true
  let page = 1
  const allAnswers = []

  while (hasMore) {
    const soAnswers = await got.get(`https://api.stackexchange.com/2.3/users/${soUser}/answers?page=${page}&pagesize=100&order=desc&sort=votes&site=stackoverflow&filter=withbody`)
      .then((res) => JSON.parse(res.body))
      .catch(err => {
        console.log('Error ' + JSON.stringify(err))
        throw err
      })

    // throttling for api
    await new Promise(resolve => setTimeout(resolve, 1000))

    for (const item of soAnswers.items) {
      allAnswers.push(item)
    }

    hasMore = soAnswers.has_more
    page++
  }

  return allAnswers
}

async function fetchAllQuestions (soAnswers) {
  const chunkSize = 25
  const questionIds = []
  const allQuestions = []

  for (const answer of soAnswers) {
    questionIds.push(answer.question_id)
  }

  for (let i = 0; i < questionIds.length; i += chunkSize) {
    const chunk = questionIds.slice(i, i + chunkSize)
    const soQuestion = await got.get(`https://api.stackexchange.com/2.3/questions/${chunk.join(';')}?order=desc&sort=activity&site=stackoverflow&filter=withbody`)
      .then((res) => JSON.parse(res.body))
      .catch(err => {
        console.log('Error ' + err)
        throw err
      })

    // throttling for api
    await new Promise(resolve => setTimeout(resolve, 1000))

    for (const item of soQuestion.items) {
      allQuestions.push(item)
    }
  }

  return allQuestions.reduce((acc, obj) => {
    acc[obj.question_id] = obj
    return acc
  }, {})
}

function copyBannerImage (svg, targetProjectFileBanner) {
  fs.writeFile(targetProjectFileBanner, svg, (err) => {
    if (err) {
      console.error(`Error writing file: ${err}`)
      throw err
    }
  })
}

function createMarkdown (body) {
  function correctHtml (body) {
    return body.replace(/<pre[^>]*>\s*<code>/g, '<pre>').replace(/<\/code>\s*<\/pre>/g, '</pre>')
  }

  const turndownService = new TurndownService({ preformattedCode: false })
  turndownService.use(strikethrough)
  turndownService.use(tables)
  turndownService.use(taskListItems)
  turndownService.use(customTurnDownPlugin)

  body = correctHtml(body)
  return turndownService.turndown(body)
}

async function createSummary (answer, question) {
  const summaryQuestion = await summarize({ html: question.body })

  // console.log('Q: ' + JSON.stringify(summaryQuestion, null, 2))

  let summary = ''

  if (summaryQuestion.extractive && summaryQuestion.extractive.length > 0) {
    summary += 'Question: ' + summaryQuestion.extractive[0]
  }

  return summary
}

function createStackOverflowFrontMatter (soAnswers, soQuestion, summary, slug, answerLink) {
  let meta = '---\n'
  meta += 'title: \'Q: ' + escapeFrontMatterText(soQuestion.title) + '\'\n'
  meta += 'date: ' + new Date(soAnswers.creation_date * 1000).toISOString().split('T')[0] + '\n'

  if (soAnswers.last_edit_date) {
    meta += 'lastmod: ' + new Date(soAnswers.last_edit_date * 1000).toISOString().split('T')[0] + '\n'
  } else {
    meta += 'lastmod: ' + new Date(soAnswers.creation_date * 1000).toISOString().split('T')[0] + '\n'
  }

  meta += 'lastfetch: ' + new Date().toISOString() + '\n'
  meta += 'description: \'' + escapeFrontMatterText(soQuestion.title) + '\'\n'
  meta += 'summary: \'' + escapeFrontMatterText(summary) + '\'\n'
  meta += 'aliases: [' + slug.permalink + ']\n'
  meta += 'slug: ' + slug.yearSlashSafeName + '\n'
  meta += 'tags: [' + soQuestion.tags.map(m => '"' + m + '"').join(', ') + ']\n'
  meta += 'keywords: [' + soQuestion.tags.map(m => '"' + m + '"').join(', ') + ']\n'
  meta += 'alltags: [' + soQuestion.tags.map(m => '"' + m + '"').join(', ') + ']\n'
  meta += 'categories: ["stackoverflow"]\n'
  meta += 'showEdit: false\n'
  meta += 'showSummary: true\n'
  meta += 'type: stackoverflow\n'
  meta += 'thumbnail: \'sobanner*\' \n'
  meta += 'deeplink: ' + slug.permalink + '\n'
  meta += 'originalContentLink: ' + soQuestion.link + '\n'
  meta += 'originalContentType: stackoverflow\n'
  meta += 'soScore: ' + soAnswers.score + '\n'
  meta += 'soViews: ' + soQuestion.view_count + '\n'
  meta += 'soIsAccepted: ' + soAnswers.is_accepted + '\n'
  meta += 'soQuestionId: ' + soAnswers.question_id + '\n'
  meta += 'soAnswerId: ' + soAnswers.answer_id + '\n'
  meta += 'soAnswerLicense: ' + soAnswers.content_license + '\n'
  meta += 'soAnswerLink: ' + answerLink + '\n'
  meta += '---\n'
  return meta
}

function createBannerText (answerLink, questionLink) {
  return `\n{{< alert "stack-overflow" >}} This was originally posted as an [answer](${answerLink}) to this [question](${questionLink})  on stackoverflow.com{{< /alert >}}\n\n`
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

    const imageFileName = 'so_' + crypto.createHash('sha256').update(imageUrl).digest('hex').substring(0, 24) + '.' + getExtension(imageUrl)

    console.log('\tDownloading post image: ' + imageUrl + ' to ' + imageFileName)

    await got.stream(imageUrl).pipe(fs.createWriteStream(targetProjectDir + '/' + imageFileName))

    markdownContent = markdownContent.replace(new RegExp(regExpQuote(imageUrl), 'g'), imageFileName)
  }

  return markdownContent
}
