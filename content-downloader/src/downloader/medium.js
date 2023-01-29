import fs from "fs";
import {StringStream} from "scramjet";
import axios from "axios";
import got from "got";
import crypto from "crypto";
import Parser from "rss-parser";
import TurndownService from "turndown";
import * as cheerio from "cheerio";

export async function downloadMediumArticles(rootDirMd, relOutDirArticles) {
    console.log("Start Processing medium articles");

    const targetRootDir = rootDirMd + relOutDirArticles

    const userName = '@patrickfav'

    const postInfoArray = await getAllArticles(userName);

    for (const index in postInfoArray) {
        const post = postInfoArray[index]
        console.log("Processing medium article " + post.url);

        const articleInfo = await getArticleInfo(post);

        const title = articleInfo.title;
        let safeArticleTitle = encodeURI(title.replace(/ /g, '-').replace(/:/g, '_').replace(/&#x2026;/g, '_').replace(/…/g, '_')).toLowerCase();
        let safeArticleTitleWithDate = new Date(articleInfo.firstPublishedAt).toISOString().split("T")[0] + "-" + safeArticleTitle;

        console.log("\tFound article " + title + "(" + safeArticleTitleWithDate + ") updated at " + new Date(articleInfo.latestPublishedAt).toISOString());

        const targetProjectDir = targetRootDir + "/" + safeArticleTitleWithDate;

        if (!fs.existsSync(targetProjectDir)) {
            fs.mkdirSync(targetProjectDir, {recursive: true});
        }

        await downloadProjectImage(articleInfo, safeArticleTitle, targetProjectDir)

        const targetProjectFile = targetProjectDir + "/index.md";
        const frontMatter = createFrontMatter(articleInfo, safeArticleTitleWithDate);
        const markdown = await fetchAndReplaceImages(post.markdown, targetProjectDir)
        await StringStream.from(frontMatter + markdown)
            .pipe(fs.createWriteStream(targetProjectFile));
    }
}

async function downloadProjectImage(articleInfo, safeArticleTitle, targetProjectDir) {
    const imageUrl = "https://cdn-images-1.medium.com/max/1024/" + articleInfo.previewImage['__ref'].replace(/ImageMetadata:/g, "")
    const imageFileName = "feature_" + safeArticleTitle + ".png";

    if (imageUrl) {
        console.log("\tDownloading social preview image: " + imageUrl);
        await got.stream(imageUrl).pipe(fs.createWriteStream(targetProjectDir + "/" + imageFileName))
    }
}

async function getAllArticles(mediumUserName) {
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

    function parseAsMarkdown(rssElement) {
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

    console.log("\tDownloading content from feed for " + mediumUserName);
    let parser = new Parser();
    // https://medium.com/feed/@patrickfav
    const rssContent = await axios.request({
        method: 'GET',
        url: 'https://medium.com/feed/' + mediumUserName
    }).then(response => parser.parseString(response.data));

    let postInfo = []
    for (const itemIndex in rssContent.items) {
        postInfo.push({
            markdown: parseAsMarkdown(rssContent.items[itemIndex]),
            url: rssContent.items[itemIndex].guid,
            articleId: rssContent.items[itemIndex].guid.split("/").at(-1)
        })
    }

    return postInfo;
}

async function getArticleInfo(post) {
    const mediumArticleDom = await axios.request({
        method: 'GET',
        url: post.url
    })
        .then(response => response.data)
        .then(body => cheerio.load(body, {xmlMode: true}));

    const json = mediumArticleDom("script")
        .map((idx, el) => mediumArticleDom(el).html())
        .toArray()
        .find((element) => {
            if (element.includes("window.__APOLLO_STATE__")) {
                return true;
            }
        })
        .replace("window.__APOLLO_STATE__ = ", "")
        .replace(/&quot;/g, '"');

    return JSON.parse(json)[`Post:${post.articleId}`];
}

function createFrontMatter(articleInfo, safeArticleTitle) {
    const dateIso8601 = new Date(articleInfo.firstPublishedAt).toISOString().split("T")[0];

    let articleTags = articleInfo.tags.map(m => m['__ref'].replace(/Tag:/g, "")).slice();
    let articleTopics = articleInfo.topics ? articleInfo.topics.map(m => m.name).slice() : [];
    let allTags = articleTags.concat(articleTopics).concat(["medium"]);

    let meta = '---\n';
    meta += "title: '" + articleInfo.title.replace(/'/g, "`") + "'\n"
    meta += "date: " + dateIso8601 + "\n"
    meta += "lastmod: " + new Date(articleInfo.latestPublishedAt).toISOString().split("T")[0] + "\n"
    meta += "summary: '" + articleInfo.previewContent.subtitle.replace(/'/g, "`") + "'\n"
    meta += "description: '" + articleInfo.previewContent.subtitle.replace(/'/g, "`") + "'\n"
    meta += "slug: " + safeArticleTitle + "\n"
    meta += "tags: [" + articleTopics.map(m => '"' + m + '"').join(", ") + "]\n"
    meta += "keywords: [" + articleTags.map(m => '"' + m + '"').join(", ") + "]\n"
    meta += "alltags: [" + allTags.map(m => '"' + m + '"').join(", ") + "]\n"
    meta += "categories: [\"article\", \"medium\"]\n"
    meta += "originalContentLink: " + articleInfo.mediumUrl + "\n"
    meta += "originalContentType: medium\n"
    meta += "mediumClaps: " + articleInfo.clapCount + "\n"
    meta += "mediumVoters: " + articleInfo.voterCount + "\n"
    meta += "mediumArticleId: " + articleInfo.id + "\n"
    meta += "---\n"
    return meta;
}

async function fetchAndReplaceImages(markdownContent, targetProjectDir) {

    function getExtension(imageUrl) {
        return imageUrl.split('.').pop();
    }

    function regExpQuote(str) {
        return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
    }

    const matches = [...markdownContent.matchAll(/!\[[^\]]*\]\((?<filename>.*?)(?=\"|\))(?<optionalpart>\".*\")?\)/g)];

    for (const i in matches) {
        const imageUrl = matches[i][1];

        if (imageUrl.startsWith("https://medium.com/_/stat")) {
            markdownContent = markdownContent.replace(new RegExp(regExpQuote(matches[i][0]), "g"), "\n")
            continue; //only the stats tracker from medium, just remove
        }

        const imageFileName = "article_" + crypto.createHash('sha256').update(imageUrl).digest('hex').substring(0, 24) + "." + getExtension(imageUrl);

        console.log("\tDownloading article image: " + imageUrl + " to " + imageFileName);

        await got.stream(imageUrl).pipe(fs.createWriteStream(targetProjectDir + "/" + imageFileName))

        markdownContent = markdownContent.replace(new RegExp(regExpQuote(imageUrl), "g"), imageFileName)
    }

    return markdownContent;
}