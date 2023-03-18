import * as fs from 'fs'
import {StringStream} from 'scramjet'
import got from 'got'
import {gistDownloaderEnabled} from '../confg'
import {generateSlug, shortenToTitle, Slug} from '../util'
import {gistbannerSvg} from '../svg'
import {Downloader} from "./downloader";

export class GistDownloader extends Downloader {

    private readonly config: GistConfig

    constructor(rootOutDir: string, contentOutDir: string, config: GistConfig) {
        super("Gist", gistDownloaderEnabled, rootOutDir, contentOutDir);
        this.config = config
    }

    protected async downloadLogic(): Promise<void> {
        const gotHeaders = this.createGotHttpHeaders()

        // download all repositories meta data from github api
        const gistMetaData: GistMeta[] = await got
            .get(`https://api.github.com/users/${this.config.githubUser}/gists?per_page=100`, gotHeaders)
            .then((res) => JSON.parse(res.body))
            .catch((err) => {
                console.log(`Error ${JSON.stringify(err)}`)
                throw err
            })

        for (const gistId of this.config.gistIds) {
            const gistMeta = gistMetaData.find((p) => p.id === gistId)!
            const title = shortenToTitle(gistMeta.description)
            const slug = generateSlug(title, 'gist', new Date(gistMeta.created_at), gistId)
            console.log(`\tProcessing gist ${title} (${gistMeta.created_at}, ${gistId})`)

            const frontMatter = this.createGistFrontMatter(gistMeta, title, slug)
            const markdown = await this.createAndDownloadContent(gistMeta)

            const targetProjectDir = this.getTargetOutDir() + '/' + slug.stableName
            const targetProjectFileBanner = targetProjectDir + '/gistbanner.svg'

            Downloader.prepareFolder(targetProjectDir)

            this.copyBannerImage(gistbannerSvg, targetProjectFileBanner)

            StringStream.from(frontMatter + markdown).pipe(fs.createWriteStream(targetProjectDir + '/index.md'))
        }
    }

    private createGotHttpHeaders(): { headers?: { Authentication: string } } {
        const githubToken = process.env.GITHUB_TOKEN || undefined

        if (githubToken) {
            console.log('\tUsing Authenticated APIs, token is provided')
            return {
                headers: {
                    Authentication: `Bearer ${githubToken}`,
                },
            }
        }
        return {}
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

    private createGistFrontMatter(gistMeta: GistMeta, title: string, slug: Slug) {
        const allFiles = Object.entries(gistMeta.files).map(([, f]) => f)
        allFiles.sort((a, b) => b.size - a.size)
        const mainLanguage = allFiles[0].language
        const tags = [...new Set(allFiles.map(f => f.language))]

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
        meta += `gistLanguage: ${mainLanguage}\n`
        meta += `gistFileCount: ${allFiles.length}\n`
        meta += `gistComments: ${gistMeta.comments}\n`
        meta += `gistCommentsUrl: ${gistMeta.comments_url}\n`
        meta += '---\n'

        return meta
    }
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
