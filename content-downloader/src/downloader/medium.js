import {promisify} from "util";
import medium_utils from "../util/medium-utils";
import fs from "fs";
import {StringStream} from "scramjet";


export async function downloadMediumArticles(medium_links, rootDirMd, relOutDirArticles) {
    const mediumExporterApi = promisify(medium_utils.loadMediumPost);
    let tocEntriesArticles = [];

    if (!fs.existsSync(rootDirMd + relOutDirArticles)) {
        fs.mkdirSync(rootDirMd + relOutDirArticles);
    }

    for (const article of medium_links) {
        console.log("Downloading Article '" + article.title + "'");
        let metaJson = await mediumExporterApi(article.url);

        let content = await medium_utils.render(metaJson);
        content = fixCommonPageRenderIssues(content);

        content = createPageMeta(metaJson) +
            content + "\n\n> :ToCPrevNext\n" +
            createFootNote(metaJson, article)

        let fileName = encodeURI(article.title.replace(/ /g, '-').replace(/:/g, '_').replace(/…/g, '_'));
        tocEntriesArticles.push('> [' + article.title + '](/' + relOutDirArticles + fileName + ')')
        await StringStream.from(content).pipe(fs.createWriteStream(rootDirMd + relOutDirArticles + fileName + ".md"));
    }

    tocEntriesArticles.sort();

    return tocEntriesArticles;
}

function createPageMeta(metaJson) {
    let meta = '';
    if (metaJson.payload.value.content.metaDescription) {
        meta += "\n\n> :MetaOverride target=description\n>\n> " + metaJson.payload.value.content.metaDescription + "\n"
    }
    meta += "\n\n> :MetaOverride target=subject\n>\n> " + metaJson.payload.value.content.subtitle + "\n"
    meta += "\n\n> :MetaOverride target=keywords\n>\n> " + metaJson.payload.value.virtuals.tags.map(m => m.name).join(", ") + "\n"
    return meta;
}

function fixCommonPageRenderIssues(content) {
    return content.replace(/```\n```/g, '');
}

function createFootNote(metaJson, article) {
    return "\n\n<small>_This article was published on " + new Date(metaJson.payload.value.latestPublishedAt).toLocaleDateString("en-US") + " on [medium.com](" + article.url + ')._</small>';
}
