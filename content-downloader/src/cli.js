import {github_projects, github_projects_user} from "./confg";
import {downloadGithubReadme} from "./downloader/github";
import {downloadMediumArticles} from "./downloader/medium";

export function cli(args) {

    const rootDir = '../content/';
    const rootDirMd = rootDir;
    const relOutDirGithub = 'opensource/';
    const relOutDirArticles = 'articles/';

    downloadMediumArticles(rootDirMd, relOutDirArticles)
        .then(() =>  downloadGithubReadme(github_projects_user, github_projects, rootDirMd, relOutDirGithub))
        .then(() => console.log("Waiting to finish"));
}
