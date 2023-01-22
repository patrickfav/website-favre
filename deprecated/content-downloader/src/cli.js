import fs from 'fs';
import {promisify} from 'util';
import {github_projects, github_projects_user, medium_projects} from "./confg";
import {createGithubMetaListMd, downloadGithubReadme} from "./downloader/github";
import {downloadMediumArticles} from "./downloader/medium";
import {createMetaListMd, createPage, createTocMd} from "./common";

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

    let metaDataGithub;
    let metaDataMedium;

    if (!fs.existsSync(rootDirMd)) {
        fs.mkdirSync(rootDirMd, { recursive: true });
    }

    cleanDirs(rootDirMd, relOutDirGithub, relOutDirArticles)

    downloadGithubReadme(github_projects_user, github_projects, rootDirMd, relOutDirGithub)
        .then(() => console.log("Waiting to finish"));

    // downloadMediumArticles(medium_projects, rootDirMd, relOutDirArticles)
    //     .then((te) => {
    //         metaDataMedium = te;
    //         return downloadGithubReadme(github_projects_user, github_projects, rootDirMd, relOutDirGithub)
    //     })
        // .then((te) => {
        //     metaDataGithub = te;
        //     return readFile(tocFileTemplate);
        // })
        // .then(data => data.toString()
        //     .replace('{{PLACEHOLDER_GITHUB_TOC}}', createTocMd(metaDataGithub))
        //     .replace('{{PLACEHOLDER_ARTICLE_TOC}}', createTocMd(metaDataMedium)))
        // .then(data => writeFile(tocFile, data))
        // .then(() => createPage(rootDirMd + relOutDirGithub + '_index.md', createGithubMetaListMd("Open Source", metaDataGithub)))
        // .then(() => createPage(rootDirMd + relOutDirArticles + '_index.md', createMetaListMd("Articles", metaDataMedium)))
        // .then(() => console.log("Waiting to finish"));
}

function cleanDirs(rootDirMd, relOutDirGithub, relOutDirArticles) {
    const rmdirSync = promisify(fs.rmSync);

    rmdirSync(rootDirMd + relOutDirGithub, {force: true, recursive: true});
    rmdirSync(rootDirMd + relOutDirArticles, {force: true, recursive: true});
}
