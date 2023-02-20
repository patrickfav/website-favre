import {github_projects, github_projects_user, stackoverflowUserId} from "./confg";
import {downloadGithubReadme} from "./downloader/github";
import {downloadMediumArticles} from "./downloader/medium";
import {downloadStackOverflow} from "./downloader/stackoverflow";

export function cli(args) {

    const rootDir = '../content/';
    const rootDirMd = rootDir;
    const relOutDirStackOverflow = 'stackoverflow/';
    const relOutDirGithub = 'opensource/';
    const relOutDirArticles = 'articles/';

    downloadStackOverflow(stackoverflowUserId, rootDirMd, relOutDirStackOverflow)
        .then(()=> downloadMediumArticles(rootDirMd, relOutDirArticles))
        .then(() =>  downloadGithubReadme(github_projects_user, github_projects, rootDirMd, relOutDirGithub))
        .then(() => console.log("Waiting to finish"));
}
