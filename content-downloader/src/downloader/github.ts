import * as fs from 'fs'
import {StringStream} from 'scramjet'
import got from 'got'
import * as cheerio from 'cheerio'
import * as crypto from 'crypto'
import {githubDownloaderEnabled} from '../confg'
import {escapeForFileName, escapeFrontMatterText, prepareFolder, Slug} from '../util'


export async function downloadGithubProjects(githubUser: string, githubProjects: { repo: string }[], rootDirMd: string, relOutDir: string): Promise<void> {
    if (!githubDownloaderEnabled) {
        console.log('Github Downloader disabled')
        return
    }

    console.log('Start Processing GitHub')

    const targetRootDir = rootDirMd + relOutDir + '/'

    const gotHeaders = createGotHttpHeaders()

    // download all repositories meta data from github api
    const githubMetaData = await got.get(`https://api.github.com/users/${githubUser}/repos?sort=updated&direction=desc&per_page=100`, gotHeaders)
        .then((res) => JSON.parse(res.body) as GithubMetaData[])

    for (const projectsIndex of githubProjects) {
        const projectName = projectsIndex.repo

        console.log('Processing github project ' + projectName)

        const githubMetaForProject = githubMetaData.find(p => p.name === projectName)!
        const slug = escapeForFileName(projectName, 'gh', new Date(githubMetaForProject.created_at), githubMetaForProject.id)

        const targetProjectDir = targetRootDir + '/' + slug.stableName
        prepareFolder(targetProjectDir)

        await downloadProjectImage(projectName, githubUser, targetProjectDir)
        const releaseMeta = await downloadReleases(projectName, githubUser, gotHeaders)
        const frontMatter = createGithubFrontMatter(projectName, githubMetaForProject, releaseMeta, relOutDir, slug)

        await downloadParseAndSaveReadme(githubUser, projectName, githubMetaForProject.default_branch, frontMatter, targetProjectDir)
        await downloadAdditionalContent(githubUser, projectName, githubMetaForProject.default_branch, ['CHANGELOG', 'CHANGELOG.md'], 'changelog', createGithubSubPageFrontMatter(projectName, githubMetaForProject, relOutDir, slug, 'changelog'), targetProjectDir)
        await downloadAdditionalContent(githubUser, projectName, githubMetaForProject.default_branch, ['LICENSE'], 'license', createGithubSubPageFrontMatter(projectName, githubMetaForProject, relOutDir, slug, 'license'), targetProjectDir)
        await downloadAdditionalContent(githubUser, projectName, githubMetaForProject.default_branch, ['CONTRIBUTING.md', 'CONTRIBUTING'], 'contributing', createGithubSubPageFrontMatter(projectName, githubMetaForProject, relOutDir, slug, 'contributing'), targetProjectDir)
    }
}

function createGotHttpHeaders(): { headers?: { Authentication: string } } {
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

async function downloadProjectImage(projectName: string, githubUser: string, targetProjectDir: string): Promise<void> {
    // parse social preview from html content
    const socialPreviewImageUrl = await got.get('https://github.com/' + githubUser + '/' + projectName)
        .then(result => result.body)
        .then(html => {
            return cheerio.load(html)('meta[property="og:image"]').attr('content')
        })

    const imageFileName = 'feature_' + projectName + '.png'

    if (socialPreviewImageUrl) {
        console.log('\tDownloading github social preview image: ' + socialPreviewImageUrl)
        await got.stream(socialPreviewImageUrl).pipe(fs.createWriteStream(targetProjectDir + '/' + imageFileName))
    }
}

async function downloadReleases(projectName: string, githubUser: string, gotHeaders: { headers?: any }): Promise<GithubRelease | undefined> {
    const releaseUrl = `https://api.github.com/repos/${githubUser}/${projectName}/releases`
    console.log('\tDownloading releases info ' + releaseUrl)

    const releases = await got.get(releaseUrl, gotHeaders)
        .then(result => JSON.parse(result.body) as GithubRelease[])

    // throttling for api
    await new Promise(resolve => setTimeout(resolve, 500))

    if (releases && releases.length > 0) {
        return releases
            .filter(element => element.draft !== true && element.prerelease !== true)
            .sort((a, b) => b.published_at.localeCompare(a.published_at))
            .reverse()
            .pop()
    }

    return undefined
}

async function downloadAdditionalContent(githubUser: string, projectName: string, mainBranch: string, fileNames: string[], leafName: string, frontMatter: string, targetProjectDir: string) {
    const targetFolder = `${targetProjectDir}/${leafName}`
    const targetProjectFile = `${targetFolder}/index.md`

    for (const fileName of fileNames) {
        const url = `https://github.com/${githubUser}/${projectName}/raw/${mainBranch}/${fileName}`
        const markdown = await got.get(url)
            .then(response => removeBadgesAndDownloadImages(response.body, githubUser, projectName, mainBranch, targetFolder))
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
        console.log(`\tDownloading ${fileName} from ${url}`)
        if (!fs.existsSync(targetFolder)) {
            fs.mkdirSync(targetFolder, {recursive: true})
        }
        await StringStream.from(frontMatter + markdown)
            .pipe(fs.createWriteStream(targetProjectFile))
    }
}

async function downloadParseAndSaveReadme(githubUser: string, projectName: string, mainBranch: string, frontMatter: string, targetProjectDir: string) {
    const fileNameExt = '_index.md'

    const url = `https://github.com/${githubUser}/${projectName}/raw/${mainBranch}/`

    const targetProjectFile = `${targetProjectDir}/${fileNameExt}`

    console.log('\tDownloading Readme from ' + url + 'README.md')

    const markdown = await got.get(url + 'README.md').then(response => removeBadgesAndDownloadImages(response.body, githubUser, projectName, mainBranch, targetProjectDir))

    await StringStream.from(frontMatter + markdown)
        .pipe(fs.createWriteStream(targetProjectFile))
}

async function removeBadgesAndDownloadImages(markdownContent: string, githubUser: string, projectName: string, mainBranch: string, targetProjectDir: string) {
    function getExtension(imageUrl: string): string {
        return imageUrl.split('.').pop()!.replace(/\?raw=true/g, '')
    }

    function regExpQuote(str: string): string {
        return str.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1')
    }

    const matches = [...markdownContent.matchAll(/!\[[^\]]*]\((?<filename>.*?)(?=[")])(?<optionalpart>".*")?\)/g)]

    for (const i in matches) {
        const baseGithubUrl = `https://github.com/${githubUser}/${projectName}/raw/${mainBranch}/`
        const markdownImage = matches[i][0]
        const imageUrl = matches[i][1]

        if (
            imageUrl.startsWith('https://api.bintray.com/packages/') ||
            imageUrl.startsWith('https://travis-ci.com/patrickfav') ||
            imageUrl.startsWith('https://travis-ci.org/patrickfav') ||
            imageUrl.startsWith('https://app.travis-ci.com/patrickfav/') ||
            imageUrl.startsWith('https://www.javadoc.io/badge') ||
            imageUrl.startsWith('https://coveralls.io/repos/github') ||
            imageUrl.startsWith('https://img.shields.io/github/') ||
            imageUrl.startsWith('https://img.shields.io/badge/') ||
            imageUrl.startsWith('https://img.shields.io/maven-central/') ||
            imageUrl.startsWith('https://api.codeclimate.com/v1/badges') ||
            imageUrl.startsWith('https://codecov.io/gh/patrickfav/') ||
            imageUrl.startsWith('https://sonarcloud.io/api/project_badges/') ||
            imageUrl.startsWith('doc/playstore_badge') ||
            (imageUrl.startsWith('https://github.com') && imageUrl.endsWith('/badge.svg'))
        ) {
            markdownContent = markdownContent.replace(new RegExp(regExpQuote(markdownImage), 'g'), '')
            continue
        }

        if (
            !imageUrl.startsWith('https://') || imageUrl.startsWith('https://github.com/patrickfav/')
        ) {
            const fullyQualifiedUrl = imageUrl.startsWith('https://') ? imageUrl : baseGithubUrl + imageUrl
            const imageFileName = 'gh_' + crypto.createHash('sha256').update(fullyQualifiedUrl).digest('hex').substring(0, 24) + '.' + getExtension(imageUrl)

            console.log('\tDownloading github image: ' + fullyQualifiedUrl + ' to ' + imageFileName)

            await got.stream(fullyQualifiedUrl).pipe(fs.createWriteStream(targetProjectDir + '/' + imageFileName))

            markdownContent = markdownContent.replace(new RegExp(regExpQuote(imageUrl), 'g'), imageFileName)
        }
    }

    return markdownContent
}

function createGithubSubPageFrontMatter(projectName: string, githubMeta: GithubMetaData, relOutDir: string, slug: Slug, leafName: string) {
    let meta = '---\n'
    meta += `title: '${escapeFrontMatterText(leafName)}'\n`
    meta += `date: ${new Date(githubMeta.created_at).toISOString().split('T')[0]}\n`
    meta += `lastmod: ${new Date(githubMeta.updated_at).toISOString().split('T')[0]}\n`
    meta += 'lastfetch: ' + new Date().toISOString() + '\n'
    meta += `url: ${relOutDir}/${slug.safeName}/${leafName}\n`
    meta += 'showSummary: false\n'
    meta += 'showTableOfContents: false\n'
    meta += 'type: opensource-additional\n'
    meta += '---\n'
    return meta
}

function createGithubFrontMatter(projectName: string, githubMeta: GithubMetaData, releaseMeta: GithubRelease | undefined, relOutDir: string, slug: Slug) {
    const githubTags = githubMeta.topics ? githubMeta.topics.slice() : []
    const allTags = githubTags.concat(['github', githubMeta.language]).filter(x => !!x)
    const reducedTags = githubTags.length > 5 ? githubTags.slice(0, 4) : githubTags.slice()

    let meta = '---\n'
    meta += 'title: \'' + escapeFrontMatterText(projectName) + '\'\n'
    meta += 'date: ' + new Date(githubMeta.created_at).toISOString().split('T')[0] + '\n'
    meta += 'lastmod: ' + new Date(githubMeta.updated_at).toISOString().split('T')[0] + '\n'
    meta += 'lastfetch: ' + new Date().toISOString() + '\n'
    meta += 'description: \'' + escapeFrontMatterText(githubMeta.description) + '\'\n'
    meta += 'summary: \'' + escapeFrontMatterText(githubMeta.description) + '\'\n'
    meta += `aliases: ['${slug.permalink}','/${relOutDir}/${slug.yearSlashSafeName}']\n`
    meta += `url: ${relOutDir}/${slug.safeName}\n`
    meta += 'tags: [' + reducedTags.map(m => '"' + m + '"').join(', ') + ']\n'
    meta += 'keywords: [' + githubTags.map(m => '"' + m + '"').join(', ') + ']\n'
    meta += 'alltags: [' + allTags.map(m => '"' + m + '"').join(', ') + ']\n'
    meta += 'categories: ["opensource"]\n'
    meta += 'editURL: ' + githubMeta.html_url + '\n'
    meta += 'showAuthor: true\n'
    meta += 'deeplink: ' + slug.permalink + '\n'
    meta += 'originalContentLink: ' + githubMeta.html_url + '\n'
    meta += 'originalContentType: github\n'
    meta += 'githubCloneUrlHttp: ' + githubMeta.clone_url + '\n'
    meta += 'githubStars: ' + githubMeta.stargazers_count + '\n'
    meta += 'githubForks: ' + githubMeta.forks_count + '\n'
    meta += 'githubWatchers: ' + githubMeta.watchers_count + '\n'
    meta += `githubLanguage: ${githubMeta.language}\n`
    meta += `githubHomepage: ${githubMeta.homepage}\n`
    meta += `githubDefaultBranch: ${githubMeta.default_branch}\n`
    meta += `githubOpenIssues: ${githubMeta.open_issues_count}\n`
    meta += `githubIsFork: ${githubMeta.fork}\n`
    if (releaseMeta) {
        meta += 'githubLatestVersion: ' + releaseMeta.tag_name + '\n'
        meta += 'githubLatestVersionDate: ' + releaseMeta.published_at + '\n'
        meta += 'githubLatestVersionUrl: ' + releaseMeta.html_url + '\n'
    }
    if (githubMeta.license) {
        meta += 'githubLicense: ' + githubMeta.license.name + '\n'
    }
    meta += '---\n'
    return meta
}

interface GithubRelease {
    prerelease: boolean
    draft: boolean
    html_url: string
    published_at: string
    tag_name: string
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
}
