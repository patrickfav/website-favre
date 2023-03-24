import got from 'got'
import {stackoverflowEnabled, stackoverflowUserId} from '../confg'
import fs from 'fs'
import {StringStream} from 'scramjet'
import TurndownService from 'turndown'
import {customTurnDownPlugin, generateSlug, getExtension, regexQuote, Slug} from '../util'
import wordsCount from 'words-count'
import crypto from 'crypto'
import {sobannerSvg} from '../svg'
// @ts-ignore
import {strikethrough, tables, taskListItems} from 'turndown-plugin-gfm'
import {Downloader} from "./downloader";
import {ContentStat} from "./models";

export class StackOverflowDownloader extends Downloader {
    private readonly config: StackOverflowConfig

    constructor(rootOutDir: string, contentOutDir: string, config: StackOverflowConfig) {
        super("StackOverflow", stackoverflowEnabled, rootOutDir, contentOutDir);
        this.config = config
    }

    protected async downloadLogic(): Promise<ContentStat[]> {
        const soAnswers = await this.fetchAllSoAnswers(this.config.stackOverflowUserId)
        const soQuestions = await this.fetchAllQuestions(soAnswers)
        const contentStats: ContentStat[] = []

        for (const answer of soAnswers) {
            const question = soQuestions[answer.question_id]

            console.log(`\tProcessing stack overflow post '${question.title}' (${answer.answer_id}) ${answer.score} upvotes`)

            if (answer.score <= 10) {
                console.log('\t\t--> skipping due to low score')
                continue
            }

            const slug = generateSlug(question.title, 'so', new Date(answer.creation_date * 1000), answer.answer_id.toString())
            const answerLink = `https://stackoverflow.com/a/${answer.answer_id}/${stackoverflowUserId}`
            const targetProjectDir = this.getTargetOutDir() + '/' + slug.stableName
            const summary = this.createSummary(answer, question)
            const frontMatter = this.createStackOverflowFrontMatter(answer, question, summary, slug, answerLink)
            const markdown = this.createMarkdown(answer.body)

            const wordCount = wordsCount(markdown)
            if (wordCount <= 200) {
                console.log(`\t\t--> skipping due to low word count ${wordCount}`)
                continue
            }

            Downloader.prepareFolder(targetProjectDir)

            const targetProjectFile = targetProjectDir + '/index.md'
            const targetProjectFileBanner = targetProjectDir + '/sobanner.svg'

            this.copyBannerImage(sobannerSvg, targetProjectFileBanner)

            const finalMarkdown = await this.fetchAndReplaceImages(markdown, targetProjectDir)

            contentStats.push(this.createContentStat(question, answer, finalMarkdown.length))

            StringStream.from(frontMatter + finalMarkdown)
                .pipe(fs.createWriteStream(targetProjectFile))
        }

        return contentStats
    }

    private createContentStat(question: Question, answer: Answer, contentLength: number): ContentStat {
        return {
            type: "so",
            user: this.config.stackOverflowUserId.toString(),
            subjectId: answer.answer_id.toString(),
            date: this.downloadDate,
            values: {
                contentLength: contentLength,
                score: answer.score,
                views: question.view_count
            }
        }
    }

    private async fetchAllSoAnswers(soUser: number): Promise<Answer[]> {
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

    private async fetchAllQuestions(soAnswers: Answer[]): Promise<{ [key: number]: Question }> {
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

    private copyBannerImage(svg: string, targetProjectFileBanner: string): void {
        fs.writeFile(targetProjectFileBanner, svg, (err) => {
            if (err) {
                console.error(`Error writing file: ${err}`)
                throw err
            }
        })
    }

    private createMarkdown(body: string): string {
        function correctHtml(body: string) {
            return body.replace(/<pre[^>]*>\s*<code>/g, '<pre>').replace(/<\/code>\s*<\/pre>/g, '</pre>')
        }

        const turndownService = new TurndownService()
        turndownService.use(strikethrough)
        turndownService.use(tables)
        turndownService.use(taskListItems)
        turndownService.use(customTurnDownPlugin)

        body = correctHtml(body)
        return turndownService.turndown(body)
    }

    private createSummary(answer: Answer, question: Question): string {
        return `This was originally posted as ${answer.is_accepted ? 'the accepted' : 'an'} answer to the question "${question.title}" on stackoverflow.com.`
    }

    private createStackOverflowFrontMatter(soAnswers: Answer, soQuestion: Question, summary: string, slug: Slug, answerLink: string): string {
        let meta = '---\n'
        meta += `title: 'Q: ${Downloader.escapeFrontMatterText(soQuestion.title)}'\n`
        meta += `date: ${new Date(soAnswers.creation_date * 1000).toISOString().split('T')[0]}\n`

        if (soAnswers.last_edit_date) {
            meta += `lastmod: ${new Date(soAnswers.last_edit_date * 1000).toISOString().split('T')[0]}\n`
        } else {
            meta += `lastmod: ${new Date(soAnswers.creation_date * 1000).toISOString().split('T')[0]}\n`
        }

        meta += `description: '${Downloader.escapeFrontMatterText(soQuestion.title)}'\n`
        meta += `summary: '${Downloader.escapeFrontMatterText(summary)}'\n`
        meta += `aliases: [${slug.permalink}]\n`
        meta += `slug: ${slug.yearSlashSafeName}\n`
        meta += `tags: [${soQuestion.tags.map(m => '"' + m + '"').join(', ')}]\n`
        meta += `keywords: [${soQuestion.tags.map(m => '"' + m + '"').join(', ')}]\n`
        meta += `alltags: [${soQuestion.tags.map(m => '"' + m + '"').join(', ')}]\n`
        meta += 'categories: ["stackoverflow"]\n'
        meta += 'showEdit: false\n'
        meta += 'showSummary: true\n'
        meta += 'type: stackoverflow\n'
        meta += `thumbnail: 'sobanner*'\n`
        meta += `deeplink: ${slug.permalink}\n`
        meta += `originalContentLink: ${soQuestion.link}\n`
        meta += 'originalContentType: stackoverflow\n'
        meta += `originalContentId: ${soAnswers.answer_id}\n`
        meta += `soScore: ${soAnswers.score}\n`
        meta += `soViews: ${soQuestion.view_count}\n`
        meta += `soIsAccepted: ${soAnswers.is_accepted}\n`
        meta += `soQuestionId: ${soAnswers.question_id}\n`
        meta += `soAnswerLicense: ${soAnswers.content_license}\n`
        meta += `soAnswerLink: ${answerLink}\n`
        meta += '---\n'
        return meta
    }

    private async fetchAndReplaceImages(markdownContent: string, targetProjectDir: string): Promise<string> {
        const matches = [...markdownContent.matchAll(/!\[[^\]]*]\((?<filename>.*?)(?=[")])(?<optionalpart>".*")?\)/g)]

        for (const i in matches) {
            const imageUrl = matches[i][1]

            const imageFileName = 'so_' + crypto.createHash('sha256').update(imageUrl).digest('hex').substring(0, 24) + '.' + getExtension(imageUrl)

            console.log('\t\tDownloading post image: ' + imageUrl + ' to ' + imageFileName)

            got.stream(imageUrl).pipe(fs.createWriteStream(targetProjectDir + '/' + imageFileName))

            markdownContent = markdownContent.replace(new RegExp(regexQuote(imageUrl), 'g'), imageFileName)
        }

        return markdownContent
    }
}

interface StackOverflowConfig {
    stackOverflowUserId: number
}


interface Answer {
    question_id: number
    answer_id: number
    creation_date: number
    last_edit_date?: number
    score: number
    is_accepted: boolean
    body: string
    content_license: string
}

interface Question {
    question_id: number
    title: string
    link: string
    view_count: number
    tags: string[]
    body: string
}
