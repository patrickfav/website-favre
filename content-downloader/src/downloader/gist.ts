import * as fs from 'fs'
import {StringStream} from 'scramjet'
import got from 'got'
import {gistDownloaderEnabled} from '../confg'
import {generateSlug, shortenToTitle, Slug} from '../util'
import {gistbannerSvg} from '../svg'
import {Downloader} from "./downloader";
import {ContentStat} from "./models";

export class GistDownloader extends Downloader {

    private readonly config: GistConfig

    constructor(rootOutDir: string, contentOutDir: string, config: GistConfig) {
        super("Gist", gistDownloaderEnabled, rootOutDir, contentOutDir);
        this.config = config
    }

    protected async downloadLogic(): Promise<ContentStat[]> {
        const gotHeaders = this.createGotHttpHeaders()
        const contentStats: ContentStat[] = []

        // download all repositories meta data from github api
        const allGistMetaData: GistMeta[] = await this.getAllGists(gotHeaders)

        for (const gistId of this.config.gistIds) {
            const gistMeta = allGistMetaData.find((p) => p.id === gistId)!
            const title = shortenToTitle(gistMeta.description)
            const slug = generateSlug(title, 'gist', new Date(gistMeta.created_at), gistId)
            console.log(`\tProcessing gist ${title} (${gistMeta.created_at}, ${gistId})`)
            const additionalMeta = await this.downloadAdditionalMetaData(gistId, gotHeaders)

            const frontMatter = this.createGistFrontMatter(gistMeta, additionalMeta, title, slug)
            const markdown = await this.createAndDownloadContent(gistMeta)

            const targetProjectDir = this.getTargetOutDir() + slug.stableName
            const targetProjectFileBanner = targetProjectDir + '/gistbanner.svg'

            Downloader.prepareFolder(targetProjectDir)

            this.copyBannerImage(gistbannerSvg, targetProjectFileBanner)
            StringStream.from(frontMatter + markdown).pipe(fs.createWriteStream(targetProjectDir + '/index.md'))

            contentStats.push(this.createContentStat(gistMeta, additionalMeta, markdown.length))
        }

        return contentStats
    }

    private async getAllGists(gotHeaders: GotHttpAuthHeader): Promise<GistMeta[]> {
        const url = this.hasToken() ? `https://api.github.com/gists` : `https://api.github.com/users/${this.config.githubUser}/gists?per_page=100`

        return await got
            .get(url, gotHeaders)
            .then((res) => JSON.parse(res.body) as GistMeta[])
    }

    private createContentStat(gistMeta: GistMeta, gistDetails: GistDetails, contentLength: number): ContentStat {
        return {
            type: "gist",
            user: this.config.githubUser,
            subjectId: gistMeta.id,
            date: this.downloadDate,
            values: {
                contentLength: contentLength,
                comments: gistMeta.comments,
                forks: gistDetails.forks.length,
                revisions: gistDetails.history.length
            }
        }
    }

    private hasToken() {
        //return process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN.length > 0 --> Github Actions token does not work with Gist (403)
        return false
    }

    private createGotHttpHeaders(): GotHttpAuthHeader {
        if (this.hasToken()) {
            console.log('\tUsing Authenticated APIs, token is provided')
            return {
                headers: {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                    'User-Agent': "favr.dev-content-downloader/1.0.0"
                },
            }
        }
        return {}
    }

    private async downloadAdditionalMetaData(gistId: string, gotHeaders: GotHttpAuthHeader): Promise<GistDetails> {
        const forksUrl = `https://api.github.com/gists/${gistId}`
        console.log('\t\tDownloading gist details ' + forksUrl)
        return await got.get(forksUrl, gotHeaders)
            .then(result => JSON.parse(result.body) as GistDetails)
    }

    private async createAndDownloadContent(gistMeta: GistMeta) {
        async function downloadFileContent(rawUrl: string) {
            return await got.get(rawUrl).then(response => response.body)
        }

        let markdown = '\n'

        for (const [, file] of Object.entries(gistMeta.files)) {
            markdown += '### ' + file.filename + '\n\n'
            markdown += '```' + file.language + '\n'
            markdown += await downloadFileContent(file.raw_url)
            markdown += '\n```\n\n'
        }

        return markdown
    }

    private copyBannerImage(svg: string, targetProjectFileBanner: string) {
        fs.writeFile(targetProjectFileBanner, svg, (err) => {
            if (err) {
                console.error(`Error writing file: ${err}`)
                throw err
            }
        })
    }

    private createGistFrontMatter(gistMeta: GistMeta, gistDetails: GistDetails, title: string, slug: Slug) {
        const allFiles = Object.entries(gistMeta.files).map(([, f]) => f)
        allFiles.sort((a, b) => b.size - a.size)
        const mainLanguage = allFiles[0].language
        const tags = [...new Set(allFiles.map(f => f.language))]

        const someVar = 42;
        const name= `
               ${someVar}
               My
               Name
            `;

        let meta = '---\n'
        meta += `title: 'Snippet: ${Downloader.escapeFrontMatterText(title)}'\n`
        meta += `date: ${new Date(gistMeta.created_at).toISOString().split('T')[0]}\n`
        meta += `lastmod: ${new Date(gistMeta.updated_at).toISOString().split('T')[0]}\n`
        meta += `description: '${Downloader.escapeFrontMatterText(gistMeta.description)}'\n`
        meta += `summary: '${Downloader.escapeFrontMatterText(gistMeta.description)}'\n`
        meta += `aliases: [${slug.permalink}]\n`
        meta += `slug: ${slug.yearSlashSafeName}\n`
        meta += `tags: [${tags.map(m => '"' + m + '"').join(', ')}]\n`
        meta += `keywords: [${tags.map(m => '"' + m + '"').join(', ')}]\n`
        meta += `alltags: [${tags.map(m => '"' + m + '"').join(', ')}]\n`
        meta += 'categories: ["opensource"]\n'
        meta += 'type: gist\n'
        meta += 'showTableOfContents: false\n'
        meta += 'showTaxonomies: false\n'
        meta += "thumbnail: 'gistbanner*'\n"
        meta += `editURL: ${gistMeta.html_url}\n`
        meta += `deeplink: ${slug.permalink}\n`
        meta += `originalContentLink: ${gistMeta.html_url}\n`
        meta += 'originalContentType: gist\n'
        meta += `originalContentId: ${gistMeta.id}\n`
        meta += `gistLanguage: ${mainLanguage}\n`
        meta += `gistFileCount: ${allFiles.length}\n`
        meta += `gistRevisions: ${gistDetails.history.length}\n`
        meta += `gistForks: ${gistDetails.forks.length}\n`
        meta += `gistComments: ${gistMeta.comments}\n`
        meta += '---\n'

        return meta
    }
}

interface GistDetails {
    id: string
    forks: GistFork[]
    history: GistHistory[]
}

interface GistHistory {
    version: string
    committed_at: Date
}

interface GistFork {
    id: string
    created_at: Date
    html_url: string

}

interface GistConfig {
    githubUser: string,
    gistIds: string[]
}

interface GistMeta {
    id: string
    description: string
    created_at: string
    updated_at: string
    html_url: string
    files: {
        [key: string]: {
            filename: string
            language: string
            raw_url: string
            size: number
        }
    }
    comments: number
    comments_url: string
}

type GotHttpAuthHeader = { headers?: { Authorization: string, 'User-Agent'?: string } }
