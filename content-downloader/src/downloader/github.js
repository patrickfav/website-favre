import fs from "fs";
import {StringStream} from "scramjet";
import got from "got";
import * as cheerio from "cheerio";
import crypto from "crypto";
import {githubDownloaderEnabled} from "../confg";
import {escapeForFileName, escapeFrontMatterText} from "../util";

export async function downloadGithubProjects(github_user, github_projects, rootDirMd, relOutDir) {
    if (githubDownloaderEnabled === false) {
        console.log("Github Downloader disabled");
        return;
    }

    const targetRootDir = rootDirMd + relOutDir

    const gotHeaders = createGotHttpHeaders();

    //download all repositories meta data from github api
    let githubMetaData = await got.get('https://api.github.com/users/' + github_user + '/repos?sort=updated&direction=desc&per_page=100', gotHeaders)
        .then((res) => JSON.parse(res.body));

    for (const projectsIndex of github_projects) {
        const projectName = projectsIndex.repo;

        console.log("Processing github project " + projectName);

        let githubMetaForProject = githubMetaData.find(p => p.name === projectName);
        const slug = escapeForFileName(projectName, new Date(githubMetaForProject.created_at), githubMetaForProject.id);

        const targetProjectDir = targetRootDir + "/" + slug.safeNameWithDate;
        if (!fs.existsSync(targetProjectDir)) {
            fs.mkdirSync(targetProjectDir, {recursive: true});
        }

        await downloadProjectImage(projectName, github_user, targetProjectDir);
        const releaseMeta = await downloadReleases(projectName, github_user, gotHeaders)
        const frontMatter = createGithubFrontMatter(projectName, githubMetaForProject, releaseMeta, slug);

        await downloadParseAndSaveReadme(github_user, projectName, githubMetaForProject.default_branch, frontMatter, targetProjectDir);
    }
}

function createGotHttpHeaders() {
    const githubToken = process.env.GITHUB_TOKEN || undefined;

    if (githubToken) {
        return {
            headers: {
                'User-Agent': 'my-app/1.0.0'
            }
        };
    }
    return {};
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

async function downloadReleases(projectName, github_user, gotHeaders) {
    const releaseUrl = `https://api.github.com/repos/${github_user}/${projectName}/releases`;
    console.log("\tDownloading releases info " + releaseUrl);

    let releases = await got.get(releaseUrl, gotHeaders)
        .then(result => JSON.parse(result.body));

    //throttling for api
    await new Promise(resolve => setTimeout(resolve, 500));

    if (releases && releases.length > 0) {
        return releases
            .filter(element => element.draft !== true && element.prerelease !== true)
            .sort((a, b) => {
                b.published_at.localeCompare(a.published_at);
            })
            .reverse()
            .pop();
    }

    return undefined;
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
            imageUrl.startsWith("https://app.travis-ci.com/patrickfav/") ||
            imageUrl.startsWith("https://www.javadoc.io/badge") ||
            imageUrl.startsWith("https://coveralls.io/repos/github") ||
            imageUrl.startsWith("https://img.shields.io/github/") ||
            imageUrl.startsWith("https://img.shields.io/badge/") ||
            imageUrl.startsWith("https://img.shields.io/maven-central/") ||
            imageUrl.startsWith("https://api.codeclimate.com/v1/badges") ||
            imageUrl.startsWith("https://codecov.io/gh/patrickfav/") ||
            imageUrl.startsWith("https://sonarcloud.io/api/project_badges/") ||
            imageUrl.startsWith("doc/playstore_badge") ||
            (imageUrl.startsWith("https://github.com") && imageUrl.endsWith("/badge.svg"))
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
        }
    }

    return markdownContent;
}

function createGithubFrontMatter(projectName, githubMeta, releaseMeta, slug) {
    let githubTags = githubMeta.topics ? githubMeta.topics.slice() : [];
    let allTags = githubTags.concat(["github", githubMeta.language]);
    let reducedTags = githubTags.length > 5 ? githubTags.slice(0, 4) : githubTags.slice();

    let meta = '---\n';
    meta += "title: '" + escapeFrontMatterText(projectName) + "'\n"
    meta += "date: " + new Date(githubMeta.created_at).toISOString().split("T")[0] + "\n"
    meta += "lastmod: " + new Date(githubMeta.updated_at).toISOString().split("T")[0] + "\n"
    meta += "lastfetch: " + new Date().toISOString() + "\n"
    meta += "description: '" + escapeFrontMatterText(githubMeta.description) + "'\n"
    meta += "summary: '" + escapeFrontMatterText(githubMeta.description) + "'\n"
    meta += "aliases: ["+ slug.permalink +"]\n";
    meta += "slug: " + slug.yearSlashSafeName + "\n"
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
    if (releaseMeta) {
        meta += "githubLatestVersion: " + releaseMeta.tag_name + "\n"
        meta += "githubLatestVersionDate: " + releaseMeta.published_at + "\n"
        meta += "githubLatestVersionUrl: " + releaseMeta.html_url + "\n"

    }
    if (githubMeta.license) {
        meta += "githubLicense: " + githubMeta.license.name + "\n"
    }
    meta += "---\n"
    return meta;
}
