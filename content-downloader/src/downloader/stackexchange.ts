import got from 'got'
import fs from 'fs'
import {StringStream} from 'scramjet'
import TurndownService from 'turndown'
import {
    figureCaption,
    generateSlug,
    removeBrokenMarkdownParts,
    Slug,
    stackExchangeHighlightedCodeBlock,
    supportedHtml
} from '../util'
import wordsCount from 'words-count'
// @ts-ignore
import {strikethrough, tables, taskListItems} from 'turndown-plugin-gfm'
import {Downloader} from "./downloader";
import {ContentStat} from "./models";

const stackExchangeUrl = 'https://api.stackexchange.com/2.3'

export class StackExchangeDownloader extends Downloader {
    private readonly config: StackExchangeConfig

    constructor(rootOutDir: string, contentOutDir: string, config: StackExchangeConfig) {
        super(config.url, rootOutDir, contentOutDir);
        this.config = config
    }

    protected async downloadLogic(): Promise<ContentStat[]> {
        const answersByUser = await this.fetchAllAnswersForUser(this.config.userId, this.config.site)
        const questionsByUser = await this.fetchAllQuestionsForUser(this.config.userId, this.config.site)
        const questionsForAnswers = await this.fetchAllQuestions(answersByUser, this.config.site)
        const contentStats: ContentStat[] = []

        await this.addContentStats(this.config.userId, contentStats, answersByUser, questionsByUser, questionsForAnswers)

        let skipDueLowScore = 0
        let skipDueLowWordCount = 0

        for (const answer of answersByUser) {
            const question = questionsForAnswers[answer.question_id]

            const slug = generateSlug(question.title, this.config.acronym, new Date(answer.creation_date * 1000), answer.answer_id.toString())
            const answerLink = `https://${this.config.url}/a/${answer.answer_id}/${this.config.userId}`
            const targetProjectDir = this.getTargetOutDir() + slug.stableName
            const summary = this.createSummary(answer, question)
            const frontMatter = this.createFrontMatter(answer, question, summary, slug, answerLink)
            const markdown = this.createMarkdown(answer.body)

            if ((answer.score <= this.config.minVote && question.view_count < this.config.minViews) || answer.score <= 0) {
                skipDueLowScore++
                continue
            }

            const wordCount = wordsCount(markdown)
            if (wordCount <= this.config.minWords) {
                skipDueLowWordCount++
                continue
            }

            console.log(`\tProcessing ${this.config.site} post '${question.title}' (${answer.answer_id}) ${answer.score} upvotes and ${Math.ceil(question.view_count / 1000)}k views`)

            Downloader.prepareFolder(targetProjectDir)

            const targetProjectFile = targetProjectDir + '/index.md'
            const targetProjectFileBanner = targetProjectDir + `/${this.config.acronym}_banner.svg`

            this.copyBannerImage(this.config.svgBanner, targetProjectFileBanner)

            const finalMarkdown = await this.fetchAndReplaceImages(markdown, targetProjectDir)

            StringStream.from(frontMatter + removeBrokenMarkdownParts(finalMarkdown))
                .pipe(fs.createWriteStream(targetProjectFile))
        }

        console.log(`\tSkipped ${skipDueLowScore} posts due to low score/view count and ${skipDueLowWordCount} due to low word count out of ${answersByUser.length}.`)

        return contentStats
    }

    private async fetchAllAnswersForUser(user: number, site: string): Promise<Answer[]> {

        console.log(`\tFetching all answers for user ${user}`)

        let hasMore = true
        let page = 1
        const allAnswers: Answer[] = []

        while (hasMore) {
            const answerResponse = await got.get(`${stackExchangeUrl}/users/${user}/answers?page=${page}&pagesize=100&order=desc&sort=votes&site=${site}&filter=withbody`)
                .then((res) => JSON.parse(res.body) as AnswerResponse)

            // throttling for api
            await new Promise(resolve => setTimeout(resolve, 750))

            for (const item of answerResponse.items) {
                allAnswers.push(item)
            }

            hasMore = answerResponse.has_more
            page++
        }

        return allAnswers
    }

    private async fetchAllQuestionsForUser(user: number, site: string): Promise<Question[]> {

        console.log(`\tFetching all questions for user ${user}`)

        let hasMore = true
        let page = 1
        const allQuestions: Question[] = []

        while (hasMore) {
            const answerResponse = await got.get(`${stackExchangeUrl}/users/${user}/questions?page=${page}&pagesize=100&order=desc&sort=votes&site=${site}&filter=withbody`)
                .then((res) => JSON.parse(res.body) as QuestionResponse)

            // throttling for api
            await new Promise(resolve => setTimeout(resolve, 750))

            for (const item of answerResponse.items) {
                allQuestions.push(item)
            }

            hasMore = answerResponse.has_more
            page++
        }

        return allQuestions
    }

    private async fetchAllQuestions(answers: Answer[], site: string): Promise<{ [key: number]: Question }> {
        const chunkSize = 30

        console.log(`\tFetching all questions for ${answers.length} found answers with chunkSize ${chunkSize}`)

        const questionIds = []
        const allQuestions: Question[] = []

        for (const answer of answers) {
            questionIds.push(answer.question_id)
        }

        for (let i = 0; i < questionIds.length; i += chunkSize) {
            const chunk = questionIds.slice(i, i + chunkSize)
            const questionResponse = await got.get(`${stackExchangeUrl}/questions/${chunk.join(';')}?order=desc&sort=activity&site=${site}&filter=withbody`)
                .then((res) => JSON.parse(res.body) as QuestionResponse)

            // throttling for api
            await new Promise(resolve => setTimeout(resolve, 750))

            for (const item of questionResponse.items) {
                allQuestions.push(item)
            }
        }

        return allQuestions.reduce((acc: { [key: number]: Question }, obj) => {
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
        const turndownService = new TurndownService()
        turndownService.use(figureCaption)
        turndownService.use(strikethrough)
        turndownService.use(tables)
        turndownService.use(taskListItems)
        turndownService.use(stackExchangeHighlightedCodeBlock)
        turndownService.use(supportedHtml)

        return turndownService.turndown(body)
    }

    private createSummary(answer: Answer, question: Question): string {
        return `This was originally posted as ${answer.is_accepted ? 'the accepted' : 'an'} answer to the question "${question.title}" on ${this.config.url}.`
    }

    private createFrontMatter(answer: Answer, question: Question, summary: string, slug: Slug, answerLink: string): string {
        let meta = '---\n'
        meta += `title: 'Q: ${Downloader.escapeFrontMatterText(question.title)}'\n`
        meta += `date: ${new Date(answer.creation_date * 1000).toISOString().split('T')[0]}\n`

        if (answer.last_edit_date) {
            meta += `lastmod: ${new Date(answer.last_edit_date * 1000).toISOString().split('T')[0]}\n`
        } else {
            meta += `lastmod: ${new Date(answer.creation_date * 1000).toISOString().split('T')[0]}\n`
        }

        meta += `description: '${Downloader.escapeFrontMatterText(question.title)}'\n`
        meta += `summary: '${Downloader.escapeFrontMatterText(summary)}'\n`
        meta += `aliases: [${slug.permalink}]\n`
        meta += `slug: ${slug.yearSlashSafeName}\n`
        meta += `tags: [${question.tags.map(m => '"' + m + '"').join(', ')}]\n`
        meta += `keywords: [${question.tags.map(m => '"' + m + '"').join(', ')}]\n`
        meta += `alltags: [${question.tags.map(m => '"' + m + '"').join(', ')}]\n`
        meta += `categories: ["${this.config.site}"]\n`
        meta += 'showEdit: false\n'
        meta += 'showSummary: true\n'
        meta += 'type: stackexchange\n'
        meta += `thumbnail: '${this.config.acronym}_banner*'\n`
        meta += `deeplink: ${slug.permalink}\n`
        meta += `originalContentLink: ${question.link}\n`
        meta += `originalContentType: stackexchange\n`
        meta += `originalContentId: ${answer.answer_id}\n`
        meta += `seSite: ${this.config.site}\n`
        meta += `seScore: ${answer.score}\n`
        meta += `seViews: ${Math.ceil(question.view_count / 1000) * 1000}\n`
        meta += `seIsAccepted: ${answer.is_accepted}\n`
        meta += `seQuestionId: ${answer.question_id}\n`
        meta += `seAnswerLicense: ${answer.content_license}\n`
        meta += `seAnswerLink: ${answerLink}\n`
        meta += '---\n'
        return meta
    }

    private async addContentStats(userId: number, contentStats: ContentStat[], answersByUser: Answer[], questionsByUser: Question[], questionsForAnswers: {
        [answerId: number]: Question
    }) {
        contentStats.push(await this.getUserStats(userId, answersByUser, questionsByUser))
        contentStats.push(...await this.getQuestionStats(userId, questionsByUser))
        contentStats.push(...await this.getAnswerStats(userId, answersByUser, questionsForAnswers))
    }

    private async getUserStats(userId: number, answers: Answer[], questions: Question[]): Promise<ContentStat> {
        console.log(`\tFetching ${this.config.site} user info: ${userId}`)

        const userResponse = await got.get(`${stackExchangeUrl}/users/${userId}?order=desc&sort=reputation&site=${this.config.site}`)
            .then(response => JSON.parse(response.body) as StackExchangeUserResponse)
            .then(r => r.items[0])

        return {
            type: `${this.config.acronym}-user`,
            user: userId.toString(),
            subjectId: userId.toString(),
            date: this.downloadDate,
            values: {
                score: userResponse.reputation,
                answers: answers.length,
                questions: questions.length,
                acceptRate: userResponse.accept_rate ? userResponse.accept_rate : 0,
                gold: userResponse.badge_counts.gold,
                silver: userResponse.badge_counts.silver,
                bronze: userResponse.badge_counts.bronze,
            }
        };
    }

    private async getQuestionStats(userId: number, questionsByUser: Question[]): Promise<ContentStat[]> {
        return (questionsByUser).map(q => {
            return {
                type: `${this.config.acronym}-question`,
                user: userId.toString(),
                subjectId: q.question_id.toString(),
                date: this.downloadDate,
                values: {
                    contentLength: q.body.length,
                    score: q.score,
                    views: Math.ceil(q.view_count / 100) * 100
                }
            }
        })
    }

    private async getAnswerStats(userId: number, answersByUser: Answer[], questionsForAnswers: {
        [answerId: number]: Question
    }): Promise<ContentStat[]> {
        return answersByUser.map(answer => {
            return {
                type: `${this.config.acronym}`,
                user: userId.toString(),
                subjectId: answer.answer_id.toString(),
                date: this.downloadDate,
                values: {
                    contentLength: answer.body.length,
                    score: answer.score,
                    views: Math.ceil(questionsForAnswers[answer.question_id].view_count / 100) * 100
                }
            }
        })
    }
}

export const configDefaults: Pick<StackExchangeConfig, 'minWords' | 'minVote' | 'minViews'> = {
    minWords: 200,
    minViews: 20_000,
    minVote: 10
}

interface StackExchangeConfig {
    site: string
    url: string
    acronym: string
    userId: number
    svgBanner: string
    minVote: number
    minViews: number
    minWords: number
}

interface AnswerResponse {
    items: Answer[]
    has_more: boolean
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

interface QuestionResponse {
    items: Question[]
    has_more: boolean
}

interface Question {
    question_id: number
    title: string
    link: string
    view_count: number
    score: number
    tags: string[]
    body: string
}

interface StackExchangeUser {
    badge_counts: {
        bronze: number
        silver: number
        gold: number
    }
    account_id: number
    is_employee: boolean
    last_modified_date: number
    last_access_date: number
    reputation_change_year: number
    reputation_change_quarter: number
    reputation_change_month: number
    reputation_change_week: number
    reputation_change_day: number
    reputation: number
    creation_date: number
    user_type: string
    user_id: number
    accept_rate: number
    location: string
    website_url: string
    link: string
    profile_image: string
    display_name: string
}

interface StackExchangeUserResponse {
    items: StackExchangeUser[]
}
