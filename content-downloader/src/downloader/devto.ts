import fs from 'fs'
import {StringStream} from 'scramjet'
import got from 'got'
import {generateSlug, getExtension, removeBrokenMarkdownParts, Slug} from '../util'
import {Downloader} from "./downloader";
import {ContentStat} from "./models";

export class DevToDownloader extends Downloader {

    private readonly config: DevToConfig

    constructor(rootOutDir: string, contentOutDir: string, config: DevToConfig) {
        super("dev.to", rootOutDir, contentOutDir);
        this.config = config
    }

    protected async downloadLogic(): Promise<ContentStat[]> {
        const articles = await this.fetchAllArticles(this.config.userName)
        const contentStats: ContentStat[] = []

        for (const article of articles) {
            const title = article.title

            console.log(`\tProcessing dev.to article ${title} updated at ${article.published_timestamp}`)
            const articlesWithBody = await this.fetchArticleBody(article.id)

            const slug = generateSlug(title, 'devto', new Date(articlesWithBody.published_timestamp), articlesWithBody.id.toString())

            const targetProjectDir = this.getTargetOutDir() + slug.stableName

            Downloader.prepareFolder(targetProjectDir)

            await this.downloadProjectImage(articlesWithBody, slug.safeName, targetProjectDir)

            const targetProjectFile = targetProjectDir + '/index.md'
            const frontMatter = this.createFrontMatter(articlesWithBody, slug)
            const markdown = await this.fetchAndReplaceImages(articlesWithBody.body_markdown, targetProjectDir)

            StringStream.from(frontMatter + removeBrokenMarkdownParts(markdown))
                .pipe(fs.createWriteStream(targetProjectFile))

            this.updateContentStats(contentStats, articlesWithBody, markdown.length)
        }

        return contentStats
    }

    private fetchAllArticles(username: string): Promise<DevToArticle[]> {
        console.log(`\tDownloading all articles for ${username}`)

        return got.get(`https://dev.to/api/articles?username=${username}`)
            .then(response => JSON.parse(response.body) as DevToArticle[])
    }

    private async fetchArticleBody(articleId: number): Promise<DevToArticleWithBody> {
        console.log(`\t\tDownloading markdown for article ${articleId}`)

        const articleWithBody = await got.get(`https://dev.to/api/articles/${articleId}`)
            .then(response => JSON.parse(response.body) as DevToArticleWithBody)

        const frontMatterRegex = /^---\s*[\s\S]*?---\s*/;
        articleWithBody.body_markdown = articleWithBody.body_markdown.replace(frontMatterRegex, '');

        return articleWithBody
    }

    private async downloadProjectImage(article: DevToArticleWithBody, safeArticleTitle: string, targetProjectDir: string): Promise<void> {
        if (article.social_image) {
            const extension = getExtension(article.social_image)
            const imageFileName = `feature_${safeArticleTitle}.${extension}`

            console.log(`\t\tDownloading social preview image: ${article.social_image}`)
            got.stream(article.social_image).pipe(fs.createWriteStream(targetProjectDir + '/' + imageFileName))
        }
    }

    private createFrontMatter(article: DevToArticleWithBody, slug: Slug) {
        const dateIso8601 = new Date(article.published_timestamp).toISOString().split('T')[0]
        const tags = article.tags.join(",")
        let meta = '---\n'
        meta += `title: '${Downloader.escapeFrontMatterText(article.title)}'\n`
        meta += `date: ${dateIso8601}\n`
        if (article.edited_at) {
            meta += `lastmod: ${new Date(article.edited_at).toISOString().split('T')[0]}\n`
        } else {
            meta += `lastmod: ${new Date(article.published_timestamp).toISOString().split('T')[0]}\n`
        }
        meta += `summary: '${Downloader.escapeFrontMatterText(article.description)}'\n`
        meta += `description: '${Downloader.escapeFrontMatterText(article.description)}'\n`
        meta += `feature: 'feature_*'\n`
        meta += `aliases: [${slug.permalink}]\n`
        meta += `slug: ${slug.yearSlashSafeName}\n`
        meta += `tags: [${tags}]\n`
        meta += `keywords: [${tags}]\n`
        meta += `alltags: [${tags}]\n`
        meta += 'categories: ["article", "devto"]\n'
        meta += `deeplink: ${slug.permalink}\n`
        meta += `originalContentLink: ${article.canonical_url}\n`
        meta += 'originalContentType: devto\n'
        meta += `originalContentId: ${article.id}\n`
        meta += `devtoReactions: ${article.public_reactions_count}\n`
        meta += `devtoPositiveReactions: ${article.positive_reactions_count}\n`
        meta += `devtoComments: ${article.comments_count}\n`
        meta += '---\n'
        return meta
    }

    private updateContentStats(contentStats: ContentStat[], articlesWithBody: DevToArticleWithBody, contentLength: number) {
        contentStats.push({
            type: "devto",
            user: this.config.userName,
            subjectId: articlesWithBody.id.toString(),
            date: this.downloadDate,
            values: {
                contentLength: contentLength,
                reactions: articlesWithBody.public_reactions_count,
                positive_reactions: articlesWithBody.positive_reactions_count,
                comments: articlesWithBody.comments_count
            }
        })
    }


}

interface DevToConfig {
    userName: string
}

interface DevToArticle {
    id: number
    title: string
    description: string
    comments_count: number
    public_reactions_count: number
    positive_reactions_count: number
    published_timestamp: Date
    created_at: Date
    edited_at: Date
    last_comment_at: Date
    cover_image: string
    social_image: string
    canonical_url: string
    tags: string[]
    body_markdown: string
    user: DevToUser
}

interface DevToArticleWithBody extends DevToArticle {
    body_markdown: string
}

interface DevToUser {
    name: string
    username: string
    user_id: number
    profile_image: string
}
