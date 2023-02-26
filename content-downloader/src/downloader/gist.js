import fs from 'fs'
import { StringStream } from 'scramjet'
import got from 'got'
import { gistDownloaderEnabled } from '../confg'
import { escapeForFileName, escapeFrontMatterText, shortenToTitle } from '../util'
import { gistbannerSvg } from '../svg'

export async function downloadGists (githubUser, gistIds, rootDirMd, relOutDir) {
  if (gistDownloaderEnabled === false) {
    console.log('Gist Downloader disabled')
    return
  }

  console.log('Start Processing Gists')

  const targetRootDir = rootDirMd + relOutDir

  const gotHeaders = createGotHttpHeaders()

  // download all repositories meta data from github api
  const gistMetaData = await got.get('https://api.github.com/users/' + githubUser + '/gists?per_page=100', gotHeaders)
    .then((res) => JSON.parse(res.body))
    .catch(err => {
      console.log('Error ' + JSON.stringify(err))
      throw err
    })

  for (const gistId of gistIds) {
    const gistMeta = gistMetaData.find(p => p.id === gistId)
    const title = shortenToTitle(gistMeta.description)
    const slug = escapeForFileName(title, new Date(gistMeta.created_at), gistId)
    console.log(`\tProcessing gist ${title} (${gistMeta.created_at}, ${gistId})`)

    const frontMatter = createGistFrontMatter(gistId, gistMeta, title, slug)
    const infoText = createInfoText(gistMeta)
    const markdown = await createAndDownloadContent(gistId, gistMeta)

    const targetProjectDir = targetRootDir + '/' + slug.safeNameWithDate
    const targetProjectFileBanner = targetProjectDir + '/gistbanner.svg'

    if (!fs.existsSync(targetProjectDir)) {
      fs.mkdirSync(targetProjectDir, { recursive: true })
    }

    copyBannerImage(gistbannerSvg, targetProjectFileBanner)

    await StringStream.from(frontMatter + infoText + markdown)
      .pipe(fs.createWriteStream(targetProjectDir + '/index.md'))
  }
}

function createGotHttpHeaders () {
  const githubToken = process.env.GITHUB_TOKEN || undefined

  if (githubToken) {
    console.log('\tUsing Authenticated APIs, token is provided')
    return {
      headers: {
        Authentication: `Bearer ${githubToken}`
      }
    }
  }
  return {}
}

async function createAndDownloadContent (gistId, gistMeta) {
  async function downloadFileContent (rawUrl) {
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

function createInfoText (gistMeta) {
  return `\n{{< info >}} ${gistMeta.description} The [original Gist](${gistMeta.html_url}) can be found on Github.{{< /info >}}\n\n`
}

function copyBannerImage (svg, targetProjectFileBanner) {
  fs.writeFile(targetProjectFileBanner, svg, (err) => {
    if (err) {
      console.error(`Error writing file: ${err}`)
      throw err
    }
  })
}

function createGistFrontMatter (gistId, gistMeta, title, slug) {
  const allFiles = Object.entries(gistMeta.files).map(([, f]) => f)
  const mainLanguage = allFiles.sort((a, b) => b.size - a.size)[0].language
  const tags = [...new Set(allFiles.map(f => f.language))]

  let meta = '---\n'
  meta += "title: 'Snippet: " + escapeFrontMatterText(title) + "'\n"
  meta += 'date: ' + new Date(gistMeta.created_at).toISOString().split('T')[0] + '\n'
  meta += 'lastmod: ' + new Date(gistMeta.updated_at).toISOString().split('T')[0] + '\n'
  meta += 'lastfetch: ' + new Date().toISOString() + '\n'
  meta += "description: '" + escapeFrontMatterText(gistMeta.description) + "'\n"
  meta += "summary: '" + escapeFrontMatterText(gistMeta.description) + "'\n"
  meta += 'aliases: [' + slug.permalink + ']\n'
  meta += 'slug: ' + slug.yearSlashSafeName + '\n'
  meta += 'tags: [' + tags.map(m => '"' + m + '"').join(', ') + ']\n'
  meta += 'keywords: [' + tags.map(m => '"' + m + '"').join(', ') + ']\n'
  meta += 'alltags: [' + tags.map(m => '"' + m + '"').join(', ') + ']\n'
  meta += 'categories: ["opensource"]\n'
  meta += 'type: gist\n'
  meta += 'showTableOfContents: false\n'
  meta += 'showTaxonomies: false\n'
  meta += "thumbnail: 'gistbanner*'\n"
  meta += 'editURL: ' + gistMeta.html_url + '\n'
  meta += 'deeplink: ' + slug.permalink + '\n'
  meta += 'originalContentLink: ' + gistMeta.html_url + '\n'
  meta += 'originalContentType: gist\n'
  meta += 'gistLanguage: ' + mainLanguage + '\n'
  meta += 'gistFileCount: ' + allFiles.length + '\n'
  meta += 'gistComments: ' + gistMeta.comments + '\n'
  meta += 'gistCommentsUrl: ' + gistMeta.comments_url + '\n'
  meta += '---\n'

  return meta
}
