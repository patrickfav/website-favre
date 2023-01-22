import fs from 'fs';
import {promisify} from 'util';
import {github_projects, github_projects_user} from "./confg";
import {downloadGithubReadme} from "./downloader/github";
import {downloadMediumArticles} from "./downloader/medium";

export function cli(args) {

    const rootDir = '../content/';
    const rootDirMd = rootDir;
    const relOutDirGithub = 'opensource/';
    const relOutDirArticles = 'articles/';

    const rapidApiKey = args[2]; // provide the API key as first parameter in CLI

    cleanDirs(rootDirMd, relOutDirGithub, relOutDirArticles)

    downloadMediumArticles(rootDirMd, relOutDirArticles, rapidApiKey)
        .then((te) =>  downloadGithubReadme(github_projects_user, github_projects, rootDirMd, relOutDirGithub))
        .then(() => console.log("Waiting to finish"));
}

function cleanDirs(rootDirMd, relOutDirGithub, relOutDirArticles) {
    const rmdirSync = promisify(fs.rmSync);

    rmdirSync(rootDirMd + relOutDirGithub, {force: true, recursive: true});
    rmdirSync(rootDirMd + relOutDirArticles, {force: true, recursive: true});
}
