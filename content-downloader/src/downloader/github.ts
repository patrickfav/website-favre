import * as fs from 'fs'
import {StringStream} from 'scramjet'
import got from 'got'
import * as cheerio from 'cheerio'
import {generateSlug, removeBrokenMarkdownParts, Slug} from '../util'
import {Downloader} from "./downloader";
import {ContentStat} from "./models";

export class GithubDownloader extends Downloader {

    protected readonly config: GithubConfig
    private baseRawUrl = ''

    constructor(rootOutDir: string, contentOutDir: string, config: GithubConfig) {
        super("Github", rootOutDir, contentOutDir);
        this.config = config
    }

    protected async downloadLogic(): Promise<ContentStat[]> {
        const gotHeaders = this.createGotHttpHeaders()
        const contentStats: ContentStat[] = []

        // download all repositories meta data from github api
        const allGithubMeta = await got.get(`https://api.github.com/users/${this.config.githubUser}/repos?sort=updated&direction=desc&per_page=100`, gotHeaders)
            .then((res) => JSON.parse(res.body) as GithubMetaData[])

        await this.getUserInfoAndUpdateContentStats(contentStats, gotHeaders)

        for (const projectsIndex of this.config.githubProjects) {
            const projectName = projectsIndex.repo

            console.log(`\tProcessing github project ${projectName}`)

            const githubMeta = allGithubMeta.find(p => p.name === projectName)!
            const slug = generateSlug(projectName, 'gh', new Date(githubMeta.created_at), githubMeta.id)
            this.baseRawUrl = `https://github.com/${this.config.githubUser}/${projectName}/raw/${githubMeta.default_branch}/`

            const targetProjectDir = this.getTargetOutDir() + slug.stableName
            Downloader.prepareFolder(targetProjectDir)

            await this.downloadProjectImage(projectName, this.config.githubUser, targetProjectDir)
            const additionalMetaData = await this.downloadAdditionalMetaData(projectName, this.config.githubUser, gotHeaders)
            const frontMatter = this.createGithubFrontMatter(projectName, githubMeta, additionalMetaData, this.contentOutDir, slug)

            const contentLength = await this.downloadParseAndSaveReadme(this.config.githubUser, projectName, githubMeta.default_branch, frontMatter, targetProjectDir)

            await this.downloadAdditionalContent(this.config.githubUser, projectName, githubMeta.default_branch, ['CHANGELOG', 'CHANGELOG.md'], 'changelog', this.createGithubSubPageFrontMatter(githubMeta, this.contentOutDir, slug, 'changelog'), targetProjectDir)
            await this.downloadAdditionalContent(this.config.githubUser, projectName, githubMeta.default_branch, ['LICENSE'], 'license', this.createGithubSubPageFrontMatter(githubMeta, this.contentOutDir, slug, 'license'), targetProjectDir)
            await this.downloadAdditionalContent(this.config.githubUser, projectName, githubMeta.default_branch, ['CONTRIBUTING.md', 'CONTRIBUTING'], 'contributing', this.createGithubSubPageFrontMatter(githubMeta, this.contentOutDir, slug, 'contributing'), targetProjectDir)

            contentStats.push(this.createContentStat(githubMeta, additionalMetaData, contentLength))
        }

        return contentStats;
    }

    private createGotHttpHeaders(): gotHttpAuthHeader {
        const githubToken = process.env.GITHUB_TOKEN

        if (githubToken && githubToken.length > 0) {
            console.log('\tUsing Authenticated APIs, token is provided')
            return {
                headers: {
                    Authorization: `Bearer ${githubToken}`,
                    'User-Agent': "favr.dev-content-downloader/1.0.0"
                },
            }
        }
        return {}
    }

    private createContentStat(githubMeta: GithubMetaData, additionalMeta: AdditionalMetaData, contentLength: number): ContentStat {
        return {
            type: "gh",
            user: this.config.githubUser,
            subjectId: githubMeta.id,
            date: this.downloadDate,
            values: {
                contentLength: contentLength,
                repoSize: githubMeta.size,
                watchers: additionalMeta.subscribers.length,
                contributors: additionalMeta.contributors.length,
                stars: githubMeta.stargazers_count,
                forks: githubMeta.forks_count
            }
        }
    }

    private async getUserInfoAndUpdateContentStats(contentStats: ContentStat[], gotHeaders: gotHttpAuthHeader) {
        console.log(`\tFetch github user info for ${this.config.githubUser}`)

        const githubUser = await got.get(`https://api.github.com/users/${this.config.githubUser}`, gotHeaders)
            .then((res) => JSON.parse(res.body) as GithubFullUser)

        contentStats.push({
            type: "gh-user",
            user: this.config.githubUser,
            subjectId: this.config.githubUser,
            date: this.downloadDate,
            values: {
                followers: githubUser.followers,
                following: githubUser.following,
                repos: githubUser.public_repos,
                gists: githubUser.public_gists
            }
        })
    }

    private async downloadProjectImage(projectName: string, githubUser: string, targetProjectDir: string): Promise<void> {
        // parse social preview from html content
        const socialPreviewImageUrl = await got.get('https://github.com/' + githubUser + '/' + projectName)
            .then(result => result.body)
            .then(html => cheerio.load(html)('meta[property="og:image"]').attr('content'))

        const imageFileName = 'feature_' + projectName + '.png'

        if (socialPreviewImageUrl) {
            console.log('\t\tDownloading github social preview image: ' + socialPreviewImageUrl)
            got.stream(socialPreviewImageUrl).pipe(fs.createWriteStream(targetProjectDir + '/' + imageFileName))
        }
    }

    private async downloadAdditionalMetaData(projectName: string, githubUser: string, gotHeaders: gotHttpAuthHeader): Promise<AdditionalMetaData> {
        const releaseUrl = `https://api.github.com/repos/${githubUser}/${projectName}/releases`
        console.log('\t\tDownloading releases info ' + releaseUrl)
        const releases = await got.get(releaseUrl, gotHeaders)
            .then(result => JSON.parse(result.body) as GithubRelease[])

        let releaseMeta: GithubRelease | undefined = undefined

        if (releases && releases.length > 0) {
            releaseMeta = releases
                .filter(element => !element.draft && !element.prerelease)
                .sort((a, b) => b.published_at.localeCompare(a.published_at))
                .reverse()
                .pop()
        }

        const subscribersUrl = `https://api.github.com/repos/${githubUser}/${projectName}/subscribers`
        console.log('\t\tDownloading subscribers info ' + subscribersUrl)
        const subscribers = await got.get(subscribersUrl, gotHeaders)
            .then(result => JSON.parse(result.body) as GithubUser[])

        const contributorsUrl = `https://api.github.com/repos/${githubUser}/${projectName}/contributors`
        console.log('\t\tDownloading contributors info ' + contributorsUrl)
        const contributors = await got.get(contributorsUrl, gotHeaders)
            .then(result => JSON.parse(result.body) as GithubUser[])

        return {
            subscribers: subscribers,
            contributors: contributors.filter(u => u.type != 'Bot'),
            releaseMeta: releaseMeta
        }
    }

    private async downloadAdditionalContent(githubUser: string, projectName: string, mainBranch: string, fileNames: string[], leafName: string, frontMatter: string, targetProjectDir: string) {
        const targetFolder = `${targetProjectDir}/${leafName}`
        const targetProjectFile = `${targetFolder}/index.md`

        for (const fileName of fileNames) {
            const url = `https://github.com/${githubUser}/${projectName}/raw/${mainBranch}/${fileName}`
            const markdown = await got.get(url)
                .then(response => this.fetchAndReplaceImages(response.body, targetProjectDir))
                .catch(err => {
                    if (err.response && err.response.statusCode === 404) {
                        // do nothing
                    } else {
                        throw err
                    }
                })
            if (!markdown) {
                continue
            }
            console.log(`\t\tDownloading ${fileName} from ${url}`)
            if (!fs.existsSync(targetFolder)) {
                fs.mkdirSync(targetFolder, {recursive: true})
            }
            StringStream.from(frontMatter + markdown)
                .pipe(fs.createWriteStream(targetProjectFile))
        }
    }

    private async downloadParseAndSaveReadme(githubUser: string, projectName: string, mainBranch: string, frontMatter: string, targetProjectDir: string): Promise<number> {
        const fileNameExt = '_index.md'

        const url = `https://github.com/${githubUser}/${projectName}/raw/${mainBranch}/`

        const targetProjectFile = `${targetProjectDir}/${fileNameExt}`

        console.log('\t\tDownloading Readme from ' + url + 'README.md')

        const markdown = await got.get(url + 'README.md').then(response => this.fetchAndReplaceImages(response.body, targetProjectDir))

        StringStream.from(frontMatter + removeBrokenMarkdownParts(markdown))
            .pipe(fs.createWriteStream(targetProjectFile))

        return markdown.length
    }

    protected baseUrlForImages(): string {
        return this.baseRawUrl
    }

    protected testShouldFilterImage(url: string): boolean {
        return url.startsWith('https://api.bintray.com/packages/') ||
            url.startsWith('https://travis-ci.com/patrickfav') ||
            url.startsWith('https://travis-ci.org/patrickfav') ||
            url.startsWith('https://app.travis-ci.com/patrickfav/') ||
            url.startsWith('https://www.javadoc.io/badge') ||
            url.startsWith('https://coveralls.io/repos/github') ||
            url.startsWith('https://img.shields.io/github/') ||
            url.startsWith('https://img.shields.io/badge/') ||
            url.startsWith('https://img.shields.io/maven-central/') ||
            url.startsWith('https://api.codeclimate.com/v1/badges') ||
            url.startsWith('https://codecov.io/gh/patrickfav/') ||
            url.startsWith('https://sonarcloud.io/api/project_badges/') ||
            url.startsWith('doc/playstore_badge') ||
            (url.startsWith('https://github.com') && url.endsWith('/badge.svg'))
    }

    private createGithubSubPageFrontMatter(githubMeta: GithubMetaData, relOutDir: string, slug: Slug, leafName: string) {
        let meta = '---\n'
        meta += `title: '${Downloader.escapeFrontMatterText(leafName)}'\n`
        meta += `date: ${new Date(githubMeta.created_at).toISOString().split('T')[0]}\n`
        meta += `lastmod: ${new Date(githubMeta.updated_at).toISOString().split('T')[0]}\n`
        meta += `url: ${relOutDir}/${slug.safeName}/${leafName}\n`
        meta += 'showSummary: false\n'
        meta += 'showTableOfContents: false\n'
        meta += 'type: opensource-additional\n'
        meta += '---\n'
        return meta
    }

    private createGithubFrontMatter(projectName: string, githubMeta: GithubMetaData, additionalMeta: AdditionalMetaData, relOutDir: string, slug: Slug) {
        const githubTags = githubMeta.topics ? githubMeta.topics.slice() : []
        const allTags = githubTags.concat(['github', githubMeta.language]).filter(x => !!x)
        const reducedTags = githubTags.length > 5 ? githubTags.slice(0, 4) : githubTags.slice()

        let meta = '---\n'
        meta += `title: '${Downloader.escapeFrontMatterText(projectName)}'\n`
        meta += `date: ${new Date(githubMeta.created_at).toISOString().split('T')[0]}\n`
        meta += `lastmod: ${new Date(githubMeta.updated_at).toISOString().split('T')[0]}\n`
        meta += `description: '${Downloader.escapeFrontMatterText(githubMeta.description)}'\n`
        meta += `summary: '${Downloader.escapeFrontMatterText(githubMeta.description)}'\n`
        meta += `aliases: ['${slug.permalink}','/${relOutDir}/${slug.yearSlashSafeName}']\n`
        meta += `url: ${relOutDir}/${slug.safeName}\n`
        meta += `tags: [${reducedTags.map(m => '"' + m + '"').join(', ')}]\n`
        meta += `keywords: [${githubTags.map(m => '"' + m + '"').join(', ')}]\n`
        meta += `alltags: [${allTags.map(m => '"' + m + '"').join(', ')}]\n`
        meta += 'categories: ["opensource"]\n'
        meta += `editURL: ${githubMeta.html_url}\n`
        meta += 'showAuthor: true\n'
        meta += `deeplink: ${slug.permalink}\n`
        meta += `originalContentLink: ${githubMeta.html_url}\n`
        meta += 'originalContentType: github\n'
        meta += `originalContentId: ${githubMeta.id}\n`
        meta += `githubCloneUrlHttp: ${githubMeta.clone_url}\n`
        meta += `githubStars: ${githubMeta.stargazers_count}\n`
        meta += `githubForks: ${githubMeta.forks_count}\n`
        meta += `githubWatchers: ${additionalMeta.subscribers.length}\n`
        meta += `githubContributors: ${additionalMeta.contributors.length}\n`
        meta += `githubRepoSize: ${githubMeta.size}\n`
        meta += `githubLanguage: ${githubMeta.language}\n`
        meta += `githubHomepage: ${githubMeta.homepage}\n`
        meta += `githubDefaultBranch: ${githubMeta.default_branch}\n`
        meta += `githubOpenIssues: ${githubMeta.open_issues_count}\n`
        meta += `githubIsFork: ${githubMeta.fork}\n`
        if (additionalMeta.releaseMeta) {
            meta += `githubLatestVersion: ${additionalMeta.releaseMeta.tag_name}\n`
            meta += `githubLatestVersionDate: ${additionalMeta.releaseMeta.published_at}\n`
            meta += `githubLatestVersionUrl: ${additionalMeta.releaseMeta.html_url}\n`
        }
        if (githubMeta.license) {
            meta += `githubLicense: ${githubMeta.license.name}\n`
        }
        meta += '---\n'
        return meta
    }
}

interface AdditionalMetaData {
    subscribers: GithubUser[]
    contributors: GithubUser[]
    releaseMeta: GithubRelease | undefined
}


interface GithubConfig {
    githubUser: string,
    githubProjects: { repo: string }[]
}

interface GithubRelease {
    prerelease: boolean
    draft: boolean
    html_url: string
    published_at: string
    tag_name: string
}

interface GithubUser {
    login: string
    id: number
    type: string
}

interface GithubFullUser {
    login: string
    id: number
    type: string
    public_repos: number
    public_gists: number
    followers: number
    following: number
    created_at: Date
}

interface GithubMetaData {
    description: string
    fork: number
    clone_url: string
    created_at: string
    default_branch: string
    forks_count: number
    homepage: string
    html_url: string
    id: string
    language: string
    license: {
        name: string
    }
    name: string
    open_issues_count: number
    stargazers_count: number
    topics: string[]
    updated_at: string
    watchers_count: number
    size: number
}

type gotHttpAuthHeader = { headers?: { Authorization: string, 'User-Agent': string } }
