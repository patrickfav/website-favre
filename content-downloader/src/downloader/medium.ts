import fs from 'fs'
import {StringStream} from 'scramjet'
import got from 'got'
import Parser from 'rss-parser'
import TurndownService from 'turndown'
import * as cheerio from 'cheerio'
import {mediumDownloaderEnabled} from '../confg'
import {codeBlockFormat, figureCaption, generateSlug, Slug} from '../util'
// @ts-ignore
import {strikethrough, tables, taskListItems} from 'turndown-plugin-gfm'
import {Downloader} from "./downloader";
import {ContentStat} from "./models";

export class MediumDownloader extends Downloader {

    private readonly config: MediumConfig

    constructor(rootOutDir: string, contentOutDir: string, config: MediumConfig) {
        super("Medium", mediumDownloaderEnabled, rootOutDir, contentOutDir);
        this.config = config
    }

    protected async downloadLogic(): Promise<ContentStat[]> {
        const postInfoArray = await this.getAllArticles(this.config.userName)
        const contentStats: ContentStat[] = []

        for (const index in postInfoArray) {
            const post = postInfoArray[index]
            console.log('\tProcessing medium article ' + post.url)

            const [articleInfo, userInfo] = await this.parseMetaDataFromArticleHtml(post)

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

            this.updateContentStats(contentStats, articleInfo, userInfo, markdown.length)
        }

        return contentStats
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
            turndownService.use(figureCaption)
            turndownService.use(strikethrough)
            turndownService.use(tables)
            turndownService.use(taskListItems)
            turndownService.use(codeBlockFormat);

            return removeMediumDisclaimer(
                turndownService
                    .turndown(htmlContent)
                    .replace(/```\n```/g, '')
                    // eslint-disable-next-line no-irregular-whitespace
                    .replace(/ /g, ' ')
            )
        }

        console.log(`\tDownloading content from feed for ${mediumUserName}`)
        const parser = new Parser()
        // https://medium.com/feed/@patrickfav
        const rssContent = await got.get(`https://medium.com/feed/${mediumUserName}`)
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

    private async parseMetaDataFromArticleHtml(post: PostInfo): Promise<[ArticleInfo, UserInfo]> {
        const mediumArticleDom = await got(post.url)
            .then(response => response.body)
            .then(body => cheerio.load(body, {xmlMode: true}))
            .catch(err => {
                throw new Error(err)
            })

        const jsonString = mediumArticleDom('script')
            .map((idx, el) => mediumArticleDom(el).html())
            .toArray()
            .find((data) => data.includes('window.__APOLLO_STATE__'))!
            .replace('window.__APOLLO_STATE__ = ', '')
            .replace(/&quot;/g, '"')

        // throttle
        await new Promise(resolve => setTimeout(resolve, 500))

        const json = JSON.parse(jsonString)
        const articleInfo = json[`Post:${post.articleId}`]

        return [articleInfo, json[`${articleInfo.creator.__ref}`]]
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
        meta += `originalContentId: ${articleInfo.id}\n`
        meta += `mediumClaps: ${articleInfo.clapCount}\n`
        meta += `mediumVoters: ${articleInfo.voterCount}\n`
        meta += '---\n'
        return meta
    }

    protected filteredImageUrlPrefix() {
        return ['https://medium.com/_/stat']
    }

    private updateContentStats(contentStats: ContentStat[], articleInfo: ArticleInfo, userInfo: UserInfo, contentLength: number) {
        if (userInfo && userInfo.socialStats && !contentStats.find(c => {
            return c.type === 'medium-user'
        })) {
            contentStats.push({
                type: "medium-user",
                user: this.config.userName,
                subjectId: articleInfo.id,
                date: this.downloadDate,
                values: {
                    followers: userInfo.socialStats.followerCount,
                    following: userInfo.socialStats.followingCount
                }
            })
        }

        contentStats.push({
            type: "medium",
            user: this.config.userName,
            subjectId: this.config.userName,
            date: this.downloadDate,
            values: {
                contentLength: contentLength,
                claps: articleInfo.clapCount,
                voters: articleInfo.voterCount,
            }
        })
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
    creator: {
        __ref: string
    }
}

interface UserInfo {
    id: string
    socialStats: {
        collectionFollowingCount: number
        followerCount: number
        followingCount: number
    }
}
