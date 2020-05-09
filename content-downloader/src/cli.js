import fs from 'fs';
import {promisify} from 'util';
import {github_projects, medium_projects} from "./confg";
import {downloadGithubReadme} from "./downloader/github";
import {downloadMediumArticles} from "./downloader/medium";

export function cli(args) {

    const rootDir = '../docs/'
    const rootDirMd = rootDir + 'md/'
    const templateDir = rootDir + 'template/'
    const tocFileTemplate = templateDir + '_toc.md'
    const tocFile = rootDirMd + '_toc.md'
    const relOutDirGithub = 'opensource/';
    const relOutDirArticles = 'articles/';

    const writeFile = promisify(fs.writeFile);
    const readFile = promisify(fs.readFile);

    let tocEntriesGithub;
    let tocEntriesArticles;

    cleanDirs(rootDirMd, relOutDirGithub, relOutDirArticles)
        .then(() => downloadMediumArticles(medium_projects, rootDirMd, relOutDirArticles))
        .then((te) => {
            tocEntriesArticles = te;
            return downloadGithubReadme(github_projects, rootDirMd, relOutDirGithub)
        })
        .then((te) => {
            tocEntriesGithub = te;
            return readFile(tocFileTemplate);
        })
        .then(data => data.toString()
            .replace('{{PLACEHOLDER_GITHUB_TOC}}', tocEntriesGithub.join('\n'))
            .replace('{{PLACEHOLDER_ARTICLE_TOC}}', tocEntriesArticles.join('\n')))
        .then(data => writeFile(tocFile, data))
        .then(() => console.log("Waiting to finish"));
}

async function cleanDirs(rootDirMd, relOutDirGithub, relOutDirArticles) {
    const rmdirSync = promisify(fs.rmdirSync);

    await rmdirSync(rootDirMd + relOutDirGithub, {recursive: true});
    await rmdirSync(rootDirMd + relOutDirArticles, {recursive: true});
}
