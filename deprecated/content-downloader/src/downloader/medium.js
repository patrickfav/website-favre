import fs from "fs";
import {StringStream} from "scramjet";
import axios from "axios";
import got from "got";
import Parser from "rss-parser";
import TurndownService from "turndown";

export async function downloadMediumArticles(rootDirMd, relOutDirArticles, rapidApiKey) {
    console.log("Start Processing medium articles");

    const targetRootDir = rootDirMd + relOutDirArticles

    // see here: https://rapidapi.com/nishujain199719-vgIfuFHZxVZ/api/medium2

    const userId = 'f5582e224131' //@patrickfav
    const userName = '@patrickfav'
    const rapidApiHost = 'medium2.p.rapidapi.com'

    const allArticleIds = await axios.request({
        method: 'GET',
        url: 'https://medium2.p.rapidapi.com/user/' + userId + '/articles',
        headers: {'X-RapidAPI-Key': rapidApiKey, 'X-RapidAPI-Host': rapidApiHost}
    }).then(articleIds => articleIds.data.associated_articles);

    for (const index in allArticleIds) {
        const articleId = allArticleIds[index]
        console.log("Processing medium article " + articleId);

        const articleInfo = await axios.request({
            method: 'GET',
            url: 'https://medium2.p.rapidapi.com/article/' + articleId,
            headers: {'X-RapidAPI-Key': rapidApiKey, 'X-RapidAPI-Host': rapidApiHost}
        }).then(response => response.data);

        const title = articleInfo.title;
        let safeArticleTitle = encodeURI(title.replace(/ /g, '-').replace(/:/g, '_').replace(/…/g, '_')).toLowerCase();
        let safeArticleTitleWithDate = new Date(articleInfo.published_at).toISOString().split("T")[0] + "-" + safeArticleTitle;

        console.log("\tFound article " + title + "(" + safeArticleTitleWithDate + ") updated at " + new Date(articleInfo.last_modified_at).toISOString());

        const targetProjectDir = targetRootDir + "/" + safeArticleTitleWithDate;

        if (!fs.existsSync(targetProjectDir)) {
            fs.mkdirSync(targetProjectDir, {recursive: true});
        }

        await downloadProjectImage(articleInfo.image_url, safeArticleTitle, targetProjectDir)

        const markdownContent = await downloadAndRenderContent(articleId, userName);

        const targetProjectFile = targetProjectDir + "/index.md";
        const frontMatter = createFrontMatter(articleInfo, safeArticleTitleWithDate);
        await StringStream.from(frontMatter + markdownContent + "\n---\n")
            .pipe(fs.createWriteStream(targetProjectFile));
    }
}

async function downloadProjectImage(imageUrl, safeArticleTitle, targetProjectDir) {
    const imageFileName = "thumb_" + safeArticleTitle + ".png";

    if (imageUrl) {
        console.log("\tDownloading medium image: " + imageUrl);
        await got.stream(imageUrl).pipe(fs.createWriteStream(targetProjectDir + "/" + imageFileName))
    }
}

async function downloadAndRenderContent(articleId, mediumUserName) {
    function deEscape(content) {
        const escapes = [
            [/\\`/g, '`'],
            [/\\\[/g, '['],
            [/\\]/g, ']'],
            [/\\>/g, '>'],
            [/\\_/g, '_']
        ];

        for (let escapeRuleArrayIndex in escapes) {
            content = content.replace(escapes[escapeRuleArrayIndex][0], escapes[escapeRuleArrayIndex][1])
        }
        return content;
    }

    function removeMediumDisclaimer(markdown) {
        if (markdown.includes("on Medium, where people are continuing the conversation by highlighting and responding to this story.")) {
            return markdown.substring(0, markdown.lastIndexOf('* * *\n'))
        }
        return markdown;
    }

    console.log("\tDownloading markdown content");
    let parser = new Parser();
    // https://medium.com/feed/@patrickfav
    const rssContent = await axios.request({
        method: 'GET',
        url: 'https://medium.com/feed/' + mediumUserName
    }).then(response => parser.parseString(response.data));

    const rssElement = rssContent.items.find(e => e.guid && e.guid.endsWith(articleId));
    const htmlContent = rssElement['content:encoded'];

    let turndownService = new TurndownService({preformattedCode: false})

    turndownService.addRule('codeBlockFormat', {
        filter: ['pre'],
        replacement: function (content) {
            return '\n```\n' + deEscape(content) + '\n```\n'
        }
    }).addRule('codeFormat', {
        filter: ['code'],
        replacement: function (content) {
            return ' `' + content + '` '
        }
    })

    return removeMediumDisclaimer(
        turndownService
            .turndown(htmlContent)
            .replace(/```\n```/g, '')
    );
}

function createFrontMatter(articleInfo, safeArticleTitle) {
    const dateIso8601 = new Date(articleInfo.published_at).toISOString().split("T")[0];
    let meta = '---\n';
    meta += "title: '" + articleInfo.title.replace(/'/g, "`") + "'\n"
    meta += "date: " + dateIso8601 + "\n"
    meta += "lastmod: " + new Date(articleInfo.last_modified_at).toISOString().split("T")[0] + "\n"
    meta += "draft: false\n"
    meta += "summary: '" + articleInfo.subtitle.replace(/'/g, "`") + "'\n"
    meta += "description: '" + articleInfo.subtitle.replace(/'/g, "`") + "'\n"
    meta += "slug: " + safeArticleTitle + "\n"
    if (articleInfo.topics && articleInfo.topics.map) {
        meta += "tags: [" + articleInfo.topics.map(m => '"' + m + '"').join(", ") + "]\n"
    }
    meta += "keywords: [" + articleInfo.tags.map(m => '"' + m + '"').join(", ") + "]\n"
    meta += "showDate: true\n"
    meta += "showReadingTime: true\n"
    meta += "showTaxonomies: true\n"
    meta += "showWordCount: true\n"
    meta += "showEdit: false\n"
    meta += "originalContentLink: " + articleInfo.url + "\n"
    meta += "originalContentType: medium\n"
    meta += "mediumClaps: " + articleInfo.claps + "\n"
    meta += "mediumVoters: " + articleInfo.voters + "\n"
    meta += "mediumArticleId: " + articleInfo.id + "\n"
    meta += "---\n"
    return meta;
}

function createFootNote(metaJson, article) {
    return "\n\n<small>_This article was published on " + new Date(metaJson.payload.value.latestPublishedAt).toLocaleDateString("en-US") + " on [medium.com](" + article.url + ')._</small>';
}


/*
final Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
//use first 12 bytes for iv
AlgorithmParameterSpec gcmIv = new GCMParameterSpec(128, cipherMessage, 0, 12);
cipher.init(Cipher.DECRYPT_MODE, secretKey, gcmIv);
if (associatedData != null) {
    cipher.updateAAD(associatedData);
}
//use everything from 12 bytes on as ciphertext
byte[] plainText = cipher.doFinal(cipherMessage, 12, cipherMessage.length - 12);
 */
