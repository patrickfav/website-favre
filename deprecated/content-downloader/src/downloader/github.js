import fs from "fs";
import {MultiStream, StringStream} from "scramjet";
import got from "got";
import * as cheerio from "cheerio";

export async function downloadGithubReadme(github_user, github_projects, rootDirMd, relOutDir) {
    const targetRootDir = rootDirMd + relOutDir

    //download all repositories meta data from github api
    let githubMetaData = await got.get('https://api.github.com/users/' + github_user + '/repos?sort=updated&direction=desc')
        .then((res) => JSON.parse(res.body));


    for (const projectName of github_projects) {
        console.log("Processing github project " + projectName);

        const targetProjectDir = targetRootDir + "/" + projectName;

        if (!fs.existsSync(targetProjectDir)) {
            fs.mkdirSync(targetProjectDir, {recursive: true});
        }

        await downloadProjectImage(projectName, github_user, targetProjectDir);

        let githubMetaForProject = githubMetaData.find(p => p.name === projectName);

        const frontMatter = createGithubFrontMatter(projectName, githubMetaForProject);
        await downloadParseAndSaveReadme(github_user, projectName, frontMatter, targetProjectDir);
    }
}

async function downloadProjectImage(projectName, github_user, targetProjectDir) {
    //parse social preview from html content
    let socialPreviewImageUrl = await got.get('https://github.com/' + github_user + '/' + projectName)
        .then(result => result.body)
        .then(html => {
            return cheerio.load(html)('meta[property="og:image"]').attr('content')
        })

    const imageFileName = "thumb_" + projectName + ".png";

    if (socialPreviewImageUrl) {
        console.log("\tDownloading github social preview image: " + socialPreviewImageUrl);
        await got.stream(socialPreviewImageUrl).pipe(fs.createWriteStream(targetProjectDir + "/" + imageFileName))
    }
}

async function downloadParseAndSaveReadme(github_user, projectName, frontMatter, targetProjectDir) {
    const fileNameExt = "index.md";

    const url = 'https://github.com/' + github_user + '/' + projectName + '/raw/master/';

    const targetProjectFile = targetProjectDir + "/" + fileNameExt;

    console.log("\tDownloading Readme from " + url + 'README.md');

    await MultiStream.from([StringStream.from(frontMatter), StringStream.from(got.stream(url + 'README.md'))]).mux()
        .endWith("\n---\n")
        .map(line =>
            line
                .replace(/\]\(doc\//g, '](' + url + 'doc/')
                .replace(/\]\(misc\//g, '](' + url + 'misc/')
                .replace(/\]\(src\/main\/resources\/img\//g, '](' + url + 'src/main/resources/img/')
        )
        .pipe(fs.createWriteStream(targetProjectFile));
}

function createGithubFrontMatter(projectName, githubMeta) {
    let meta = '---\n';
    meta += "title: '" + projectName + "'\n"
    meta += "date: " + new Date(githubMeta.created_at).toISOString().split("T")[0] + "\n"
    meta += "lastmod: " + new Date(githubMeta.updated_at).toISOString().split("T")[0] + "\n"
    meta += "draft: false\n"
    meta += "description: '" + githubMeta.description.replace(/'/g, "`") + "'\n"
    meta += "summary: '" + githubMeta.description.replace(/'/g, "`") + "'\n"
    meta += "slug: " + projectName + "\n"
    meta += "tags: [" + githubMeta.topics.map(m => '"' + m + '"').join(", ") + "]\n"
    meta += "keywords: [" + githubMeta.topics.map(m => '"' + m + '"').join(", ") + "]\n"
    meta += "showDate: false\n"
    meta += "showReadingTime: false\n"
    meta += "showReadingTime: false\n"
    meta += "showTaxonomies: true\n"
    meta += "showEdit: false\n"
    meta += "editURL: " + githubMeta.html_url + "\n"
    meta += "editAppendPath: false\n"
    meta += "cover: 'thumb*'\n"
    meta += "originalContentLink: " + githubMeta.html_url + "\n"
    meta += "originalContentType: github\n"
    meta += "githubStars: " + githubMeta.stargazers_count + "\n"
    meta += "githubForks: " + githubMeta.forks_count + "\n"
    meta += "githubLanguage: " + githubMeta.language + "\n"
    if (githubMeta.license) {
        meta += "githubLicense: " + githubMeta.license.name + "\n"
    }
    meta += "---\n"
    return meta;
}
