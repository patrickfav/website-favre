import fs from "fs";
import {StringStream} from "scramjet";
import axios from "axios";
import got from "got";

export async function downloadMediumArticles(medium_links, rootDirMd, relOutDirArticles) {
    console.log("Start Processing medium articles");

    let metaOutputList = [];

    const targetRootDir = rootDirMd + relOutDirArticles

    // see here: https://rapidapi.com/nishujain199719-vgIfuFHZxVZ/api/medium2

    const userId = 'f5582e224131' //@patrickfav
    const rapidApiKey = '3ab9f2cf40msh51a29d3c484dee6p178c32jsne0839fcf35f1'
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
        let safeArticleTitle = encodeURI(title.replace(/ /g, '-').replace(/:/g, '_').replace(/…/g, '_'));
        console.log("\tFound article " + title + "(" + safeArticleTitle + ") updated at " + new Date(articleInfo.last_modified_at).toISOString());

        const targetProjectDir = targetRootDir + "/" + safeArticleTitle;

        if (!fs.existsSync(targetProjectDir)) {
            fs.mkdirSync(targetProjectDir, {recursive: true});
        }

        await downloadProjectImage(articleInfo.image_url, safeArticleTitle, targetProjectDir)

        console.log("\tDownloading markdown content");
        const markdownContent = await axios.request({
            method: 'GET',
            url: 'https://medium2.p.rapidapi.com/article/' + articleId + "/markdown",
            headers: {'X-RapidAPI-Key': rapidApiKey, 'X-RapidAPI-Host': rapidApiHost}
        }).then(response => response.data.markdown);

        const targetProjectFile = targetProjectDir + "/index.md";

        const frontMatter = createFrontMatter(articleInfo, safeArticleTitle);
        await StringStream.from(frontMatter+markdownContent+"\n---\n")
            .pipe(fs.createWriteStream(targetProjectFile));
    }

    metaOutputList.sort((a, b) => b.createDate - a.createDate);

    return metaOutputList;
}

async function downloadProjectImage(imageUrl, safeArticleTitle, targetProjectDir) {
    const imageFileName = "thumb_" + safeArticleTitle + ".png";

    if (imageUrl) {
        console.log("\tDownloading medium image: " + imageUrl);
        await got.stream(imageUrl).pipe(fs.createWriteStream(targetProjectDir + "/" + imageFileName))
    }
}

function createFrontMatter(articleInfo, safeArticleTitle) {
    let meta = '---\n';
    meta += "title: '" + articleInfo.title.replace(/'/g, "`") + "'\n"
    meta += "date: " + new Date(articleInfo.published_at).toISOString().split("T")[0] + "\n"
    meta += "lastmod: " + new Date(articleInfo.last_modified_at).toISOString().split("T")[0] + "\n"
    meta += "draft: false\n"
    meta += "summary: '" + articleInfo.subtitle.replace(/'/g, "`") + "'\n"
    meta += "description: '" + articleInfo.subtitle.replace(/'/g, "`") + "'\n"
    meta += "slug: " + safeArticleTitle.toLowerCase() + "\n"
    if(articleInfo.topics && articleInfo.topics.map) {
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

function fixCommonPageRenderIssues(content) {
    return content.replace(/```\n```/g, '');
}

function createFootNote(metaJson, article) {
    return "\n\n<small>_This article was published on " + new Date(metaJson.payload.value.latestPublishedAt).toLocaleDateString("en-US") + " on [medium.com](" + article.url + ')._</small>';
}
