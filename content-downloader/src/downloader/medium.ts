import fs from 'fs'
import {StringStream} from 'scramjet'
import got from 'got'
import crypto from 'crypto'
import Parser from 'rss-parser'
import TurndownService from 'turndown'
import * as cheerio from 'cheerio'
import {mediumDownloaderEnabled} from '../confg'
import {customTurnDownPlugin, generateSlug, getExtension, regexQuote, Slug} from '../util'
// @ts-ignore
import {strikethrough, tables, taskListItems} from 'turndown-plugin-gfm'
import {Downloader} from "./downloader";

export class MediumDownloader extends Downloader {

    private readonly config: MediumConfig

    constructor(rootOutDir: string, contentOutDir: string, config: MediumConfig) {
        super("Medium", mediumDownloaderEnabled, rootOutDir, contentOutDir);
        this.config = config
    }

    protected async downloadLogic(): Promise<void> {
        const postInfoArray = await this.getAllArticles(this.config.userName)

        for (const index in postInfoArray) {
            const post = postInfoArray[index]
            console.log('\tProcessing medium article ' + post.url)

            const articleInfo = await this.getArticleInfo(post)

            const title = articleInfo.title
            const slug = generateSlug(title, 'medium', new Date(articleInfo.firstPublishedAt), articleInfo.id)

            console.log('\t\tFound article ' + title + '(' + slug.safeNameWithDate + ') updated at ' + new Date(articleInfo.latestPublishedAt).toISOString())

            const targetProjectDir = this.getTargetOutDir() + '/' + slug.stableName

            Downloader.prepareFolder(targetProjectDir)

            await this.downloadProjectImage(articleInfo, slug.safeName, targetProjectDir)

            const targetProjectFile = targetProjectDir + '/index.md'
            const frontMatter = this.createFrontMatter(articleInfo, slug)
            const markdown = await this.fetchAndReplaceImages(post.markdown, targetProjectDir)
            StringStream.from(frontMatter + markdown)
                .pipe(fs.createWriteStream(targetProjectFile))
        }
    }

    private async downloadProjectImage(articleInfo: any, safeArticleTitle: string, targetProjectDir: string): Promise<void> {
        const imageUrl = 'https://cdn-images-1.medium.com/max/1024/' + articleInfo.previewImage.__ref.replace(/ImageMetadata:/g, '')
        const imageFileName = 'feature_' + safeArticleTitle + '.png'

        if (imageUrl) {
            console.log('\t\tDownloading social preview image: ' + imageUrl)
            got.stream(imageUrl).pipe(fs.createWriteStream(targetProjectDir + '/' + imageFileName))
        }
    }

    private async getAllArticles(mediumUserName: string): Promise<PostInfo[]> {
        function removeMediumDisclaimer(markdown: string): string {
            if (markdown.includes('on Medium, where people are continuing the conversation by highlighting and responding to this story.')) {
                return markdown.substring(0, markdown.lastIndexOf('* * *\n'))
            }
            return markdown
        }

        function parseAsMarkdown(rssElement: any): string {
            const htmlContent = rssElement['content:encoded']
            const turndownService = new TurndownService()
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
        const rssContent = await got('https://medium.com/feed/' + mediumUserName)
            .then(response => parser.parseString(response.body))

        const postInfo: PostInfo[] = []
        for (const itemIndex in rssContent.items) {
            postInfo.push({
                articleId: rssContent.items[itemIndex].guid!.split('/').at(-1)!,
                markdown: parseAsMarkdown(rssContent.items[itemIndex]),
                url: rssContent.items[itemIndex].guid!,
            })
        }

        return postInfo
    }

    private async getArticleInfo(post: PostInfo): Promise<ArticleInfo> {
        const mediumArticleDom = await got(post.url)
            .then(response => response.body)
            .then(body => cheerio.load(body, {xmlMode: true}))
            .catch(err => {
                throw new Error(err)
            })

        const json = mediumArticleDom('script')
            .map((idx, el) => mediumArticleDom(el).html())
            .toArray()
            .find((data) => data.includes('window.__APOLLO_STATE__'))!
            .replace('window.__APOLLO_STATE__ = ', '')
            .replace(/&quot;/g, '"')

        // throttle
        await new Promise(resolve => setTimeout(resolve, 500))

        return JSON.parse(json)[`Post:${post.articleId}`]
    }

    private createFrontMatter(articleInfo: ArticleInfo, slug: Slug) {
        const dateIso8601 = new Date(articleInfo.firstPublishedAt).toISOString().split('T')[0]

        const articleTags = articleInfo.tags.map(m => m.__ref.replace(/Tag:/g, '')).slice()
        const articleTopics = articleInfo.topics ? articleInfo.topics.map(m => m.name).slice() : []
        const allTags = articleTags.concat(articleTopics).concat(['medium'])

        let meta = '---\n'
        meta += `title: '${Downloader.escapeFrontMatterText(articleInfo.title)}'\n`
        meta += `date: ${dateIso8601}\n`
        meta += `lastmod: ${new Date(articleInfo.latestPublishedAt).toISOString().split('T')[0]}\n`
        meta += `summary: '${Downloader.escapeFrontMatterText(articleInfo.previewContent.subtitle)}'\n`
        meta += `description: '${Downloader.escapeFrontMatterText(articleInfo.previewContent.subtitle)}'\n`
        meta += `aliases: [${slug.permalink}]\n`
        meta += `slug: ${slug.yearSlashSafeName}\n`
        meta += `tags: [${articleTopics.map(m => '"' + m + '"').join(', ')}]\n`
        meta += `keywords: [${articleTags.map(m => '"' + m + '"').join(', ')}]\n`
        meta += `alltags: [${allTags.map(m => '"' + m + '"').join(', ')}]\n`
        meta += 'categories: ["article", "medium"]\n'
        meta += `deeplink: ${slug.permalink}\n`
        meta += `originalContentLink: ${articleInfo.mediumUrl}\n`
        meta += 'originalContentType: medium\n'
        meta += `mediumClaps: ${articleInfo.clapCount}\n`
        meta += `mediumVoters: ${articleInfo.voterCount}\n`
        meta += `mediumArticleId: ${articleInfo.id}\n`
        meta += '---\n'
        return meta
    }

    private async fetchAndReplaceImages(markdownContent: string, targetProjectDir: string) {

        const matches = [...markdownContent.matchAll(/!\[[^\]]*]\((?<filename>.*?)(?=[")])(?<optionalpart>".*")?\)/g)]

        for (const i in matches) {
            const imageUrl = matches[i][1]

            if (imageUrl.startsWith('https://medium.com/_/stat')) {
                markdownContent = markdownContent.replace(new RegExp(regexQuote(matches[i][0]), 'g'), '\n')
                continue // only the stats tracker from medium, just remove
            }

            const imageFileName = 'article_' + crypto.createHash('sha256').update(imageUrl).digest('hex').substring(0, 24) + '.' + getExtension(imageUrl)

            console.log('\t\tDownloading article image: ' + imageUrl + ' to ' + imageFileName)

            got.stream(imageUrl).pipe(fs.createWriteStream(targetProjectDir + '/' + imageFileName))

            markdownContent = markdownContent.replace(new RegExp(regexQuote(imageUrl), 'g'), imageFileName)
        }

        return markdownContent
    }
}

interface MediumConfig {
    userName: string
}

interface PostInfo {
    markdown: string
    url: string
    articleId: string
}

interface ArticleInfo {
    clapCount: number
    firstPublishedAt: string
    id: string
    latestPublishedAt: string
    mediumUrl: string
    previewContent: {
        subtitle: string
    }
    tags: [
        { __ref: string }
    ]
    title: string
    topics: [
        { name: string }
    ]
    voterCount: number
}
