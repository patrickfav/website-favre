import fs from "fs";
import {StringStream} from "scramjet";
import got from "got";
import * as cheerio from "cheerio";
import crypto from "crypto";

export async function downloadGithubReadme(github_user, github_projects, rootDirMd, relOutDir) {
    const targetRootDir = rootDirMd + relOutDir

    //download all repositories meta data from github api
    let githubMetaData = await got.get('https://api.github.com/users/' + github_user + '/repos?sort=updated&direction=desc&per_page=100')
        .then((res) => JSON.parse(res.body));

    for (const projectsIndex of github_projects) {
        const projectName = projectsIndex.repo;
        const mainBranch = projectsIndex.branch;

        console.log("Processing github project " + projectName);

        const targetProjectDir = targetRootDir + "/" + projectName;

        if (!fs.existsSync(targetProjectDir)) {
            fs.mkdirSync(targetProjectDir, {recursive: true});
        }

        await downloadProjectImage(projectName, github_user, targetProjectDir);

        let githubMetaForProject = githubMetaData.find(p => p.name === projectName);

        const frontMatter = createGithubFrontMatter(projectName, githubMetaForProject);
        await downloadParseAndSaveReadme(github_user, projectName, mainBranch, frontMatter, targetProjectDir);
    }
}

async function downloadProjectImage(projectName, github_user, targetProjectDir) {
    //parse social preview from html content
    let socialPreviewImageUrl = await got.get('https://github.com/' + github_user + '/' + projectName)
        .then(result => result.body)
        .then(html => {
            return cheerio.load(html)('meta[property="og:image"]').attr('content')
        })

    const imageFileName = "feature_" + projectName + ".png";

    if (socialPreviewImageUrl) {
        console.log("\tDownloading github social preview image: " + socialPreviewImageUrl);
        await got.stream(socialPreviewImageUrl).pipe(fs.createWriteStream(targetProjectDir + "/" + imageFileName))
    }
}

async function downloadParseAndSaveReadme(github_user, projectName, mainBranch, frontMatter, targetProjectDir) {
    const fileNameExt = "index.md";

    const url = `https://github.com/${github_user}/${projectName}/raw/${mainBranch}/`;

    const targetProjectFile = targetProjectDir + "/" + fileNameExt;

    console.log("\tDownloading Readme from " + url + 'README.md');

    const markdown = await got.get(url + 'README.md').then(response => removeBadgesAndDownloadImages(response.body, github_user, projectName, mainBranch, targetProjectDir));

    await StringStream.from(frontMatter + markdown)
        .pipe(fs.createWriteStream(targetProjectFile));
}

async function removeBadgesAndDownloadImages(markdownContent, github_user, projectName, mainBranch, targetProjectDir) {

    function getExtension(imageUrl) {
        return imageUrl.split('.').pop().replace(/\?raw=true/g, "");
    }

    function regExpQuote(str) {
        return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
    }

    const matches = [...markdownContent.matchAll(/!\[[^\]]*\]\((?<filename>.*?)(?=\"|\))(?<optionalpart>\".*\")?\)/g)];

    for (const i in matches) {
        const baseGithubUrl = `https://github.com/${github_user}/${projectName}/raw/${mainBranch}/`;
        const markdownImage = matches[i][0];
        const imageUrl = matches[i][1];

        if (
            imageUrl.startsWith("https://api.bintray.com/packages/") ||
            imageUrl.startsWith("https://travis-ci.com/patrickfav") ||
            imageUrl.startsWith("https://travis-ci.org/patrickfav") ||
            imageUrl.startsWith("https://www.javadoc.io/badge") ||
            imageUrl.startsWith("https://coveralls.io/repos/github") ||
            imageUrl.startsWith("https://img.shields.io/github/") ||
            imageUrl.startsWith("https://img.shields.io/badge/") ||
            imageUrl.startsWith("https://api.codeclimate.com/v1/badges") ||
            imageUrl.startsWith("doc/playstore_badge")
        ) {
            markdownContent = markdownContent.replace(new RegExp(regExpQuote(markdownImage), "g"), "")
            continue;
        }

        if (
            !imageUrl.startsWith("https://") || imageUrl.startsWith("https://github.com/patrickfav/")
        ) {
            const fullyQualifiedUrl = imageUrl.startsWith("https://") ? imageUrl : baseGithubUrl + imageUrl;
            const imageFileName = "gh_" + crypto.createHash('sha256').update(fullyQualifiedUrl).digest('hex').substring(0, 24) + "." + getExtension(imageUrl);

            console.log("\tDownloading github image: " + fullyQualifiedUrl + " to " + imageFileName);

            await got.stream(fullyQualifiedUrl).pipe(fs.createWriteStream(targetProjectDir + "/" + imageFileName))

            markdownContent = markdownContent.replace(new RegExp(regExpQuote(imageUrl), "g"), imageFileName);
            continue;
        }
    }

    return markdownContent;
}

function createGithubFrontMatter(projectName, githubMeta) {
    let githubTags = githubMeta.topics ? githubMeta.topics.slice() : [];
    let allTags = githubTags.concat(["github", githubMeta.language]);
    let reducedTags = githubTags.length > 5 ? githubTags.slice(0, 4) : githubTags.slice();

    let meta = '---\n';
    meta += "title: '" + projectName + "'\n"
    meta += "date: " + new Date(githubMeta.created_at).toISOString().split("T")[0] + "\n"
    meta += "lastmod: " + new Date(githubMeta.updated_at).toISOString().split("T")[0] + "\n"
    meta += "description: '" + githubMeta.description.replace(/'/g, "`") + "'\n"
    meta += "summary: '" + githubMeta.description.replace(/'/g, "`") + "'\n"
    meta += "slug: " + projectName + "\n"
    meta += "tags: [" + reducedTags.map(m => '"' + m + '"').join(", ") + "]\n"
    meta += "keywords: [" + githubTags.map(m => '"' + m + '"').join(", ") + "]\n"
    meta += "alltags: [" + allTags.map(m => '"' + m + '"').join(", ") + "]\n"
    meta += "categories: [\"opensource\"]\n"
    meta += "editURL: " + githubMeta.html_url + "\n"
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
