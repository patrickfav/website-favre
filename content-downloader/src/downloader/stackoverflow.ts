import got from 'got'
import {stackoverflowEnabled, stackoverflowUserId} from '../confg'
import fs from 'fs'
import {StringStream} from 'scramjet'
import TurndownService from 'turndown'
import {figureCaption, generateSlug, Slug, stackOverflowHighlightedCodeBlock} from '../util'
import wordsCount from 'words-count'
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
        const answersByUser = await this.fetchAllSoAnswersForUser(this.config.stackOverflowUserId)
        const questionsByUser = await this.fetchAllSoQuestionsForUser(this.config.stackOverflowUserId)
        const questionsForAnswers = await this.fetchAllQuestions(answersByUser)
        const contentStats: ContentStat[] = []

        await this.addContentStats(this.config.stackOverflowUserId, contentStats, answersByUser, questionsByUser, questionsForAnswers)

        let skipDueLowScore = 0
        let skipDueLowWordCount = 0

        for (const answer of answersByUser) {
            const question = questionsForAnswers[answer.question_id]

            const slug = generateSlug(question.title, 'so', new Date(answer.creation_date * 1000), answer.answer_id.toString())
            const answerLink = `https://stackoverflow.com/a/${answer.answer_id}/${stackoverflowUserId}`
            const targetProjectDir = this.getTargetOutDir() + '/' + slug.stableName
            const summary = this.createSummary(answer, question)
            const frontMatter = this.createStackOverflowFrontMatter(answer, question, summary, slug, answerLink)
            const markdown = this.createMarkdown(answer.body)

            if ((answer.score <= 10 && question.view_count < 20000) || answer.score <= 3) {
                skipDueLowScore++
                continue
            }

            const wordCount = wordsCount(markdown)
            if (wordCount <= 200) {
                skipDueLowWordCount++
                continue
            }

            console.log(`\tProcessing stack overflow post '${question.title}' (${answer.answer_id}) ${answer.score} upvotes and ${Math.ceil(question.view_count / 1000)}k views`)

            Downloader.prepareFolder(targetProjectDir)

            const targetProjectFile = targetProjectDir + '/index.md'
            const targetProjectFileBanner = targetProjectDir + '/sobanner.svg'

            this.copyBannerImage(sobannerSvg, targetProjectFileBanner)

            const finalMarkdown = await this.fetchAndReplaceImages(markdown, targetProjectDir)


            StringStream.from(frontMatter + finalMarkdown)
                .pipe(fs.createWriteStream(targetProjectFile))
        }

        console.log(`\tSkipped ${skipDueLowScore} posts due to low score/view count and ${skipDueLowWordCount} due to low word count out of ${answersByUser.length}.`)


        return contentStats
    }

    private async fetchAllSoAnswersForUser(soUser: number): Promise<Answer[]> {

        console.log(`\tFetching all answers for user ${soUser}`)

        let hasMore = true
        let page = 1
        const allAnswers: Answer[] = []

        while (hasMore) {
            const answerResponse = await got.get(`https://api.stackexchange.com/2.3/users/${soUser}/answers?page=${page}&pagesize=100&order=desc&sort=votes&site=stackoverflow&filter=withbody`)
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

    private async fetchAllSoQuestionsForUser(soUser: number): Promise<Question[]> {

        console.log(`\tFetching all questions for user ${soUser}`)

        let hasMore = true
        let page = 1
        const allQuestions: Question[] = []

        while (hasMore) {
            const answerResponse = await got.get(`https://api.stackexchange.com/2.3/users/${soUser}/questions?page=${page}&pagesize=100&order=desc&sort=votes&site=stackoverflow&filter=withbody`)
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

    private async fetchAllQuestions(soAnswers: Answer[]): Promise<{ [key: number]: Question }> {
        const chunkSize = 30

        console.log(`\tFetching all questions for ${soAnswers.length} found answers with chunkSize ${chunkSize}`)

        const questionIds = []
        const allQuestions: Question[] = []

        for (const answer of soAnswers) {
            questionIds.push(answer.question_id)
        }

        for (let i = 0; i < questionIds.length; i += chunkSize) {
            const chunk = questionIds.slice(i, i + chunkSize)
            const soQuestion = await got.get(`https://api.stackexchange.com/2.3/questions/${chunk.join(';')}?order=desc&sort=activity&site=stackoverflow&filter=withbody`)
                .then((res) => JSON.parse(res.body) as QuestionResponse)

            // throttling for api
            await new Promise(resolve => setTimeout(resolve, 750))

            for (const item of soQuestion.items) {
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
        turndownService.use(stackOverflowHighlightedCodeBlock);

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
        meta += `soViews: ${Math.ceil(soQuestion.view_count / 1000) * 1000}\n`
        meta += `soIsAccepted: ${soAnswers.is_accepted}\n`
        meta += `soQuestionId: ${soAnswers.question_id}\n`
        meta += `soAnswerLicense: ${soAnswers.content_license}\n`
        meta += `soAnswerLink: ${answerLink}\n`
        meta += '---\n'
        return meta
    }

    private async addContentStats(stackOverflowUserId: number, contentStats: ContentStat[], answersByUser: Answer[], questionsByUser: Question[], questionsForAnswers: { [answerId: number]: Question }) {
        contentStats.push(await this.getSoUserStats(stackOverflowUserId, answersByUser, questionsByUser))
        contentStats.push(...await this.getSoQuestionStats(stackOverflowUserId, questionsByUser))
        contentStats.push(...await this.getSoAnswerStats(stackOverflowUserId, answersByUser, questionsForAnswers))
    }

    private async getSoUserStats(stackOverflowUserId: number, soAnswers: Answer[], soQuestions: Question[]): Promise<ContentStat> {
        console.log(`\tFetching so user info: ${stackOverflowUserId}`)

        const userResponse = await got.get(`https://api.stackexchange.com/2.3/users/${stackOverflowUserId}?order=desc&sort=reputation&site=stackoverflow`)
            .then(response => JSON.parse(response.body) as StackOverflowUserResponse)
            .then(r => r.items[0])

        return {
            type: "so-user",
            user: stackOverflowUserId.toString(),
            subjectId: stackOverflowUserId.toString(),
            date: this.downloadDate,
            values: {
                score: userResponse.reputation,
                answers: soAnswers.length,
                questions: soQuestions.length,
                acceptRate: userResponse.accept_rate,
                gold: userResponse.badge_counts.gold,
                silver: userResponse.badge_counts.silver,
                bronze: userResponse.badge_counts.bronze,
            }
        };
    }

    private async getSoQuestionStats(stackOverflowUserId: number, questionsByUser: Question[]): Promise<ContentStat[]> {
        return (questionsByUser).map(q => {
            return {
                type: "so-question",
                user: stackOverflowUserId.toString(),
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

    private async getSoAnswerStats(stackOverflowUserId: number, answersByUser: Answer[], questionsForAnswers: { [answerId: number]: Question }): Promise<ContentStat[]> {
        return answersByUser.map(answer =>  {
            return {
                type: "so",
                user: stackOverflowUserId.toString(),
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

interface StackOverflowConfig {
    stackOverflowUserId: number
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

interface StackOverflowUser {
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

interface StackOverflowUserResponse {
    items: StackOverflowUser[]
}
