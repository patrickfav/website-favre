import {gistIds, github_projects, github_projects_user, stackoverflowUserId} from "./confg";
import {downloadGithubProjects} from "./downloader/github";
import {downloadMediumArticles} from "./downloader/medium";
import {downloadStackOverflowPosts} from "./downloader/stackoverflow";
import {downloadGists} from "./downloader/gist";

export function cli(args) {

    const rootDir = '../content/';
    const rootDirMd = rootDir;
    const relOutDirGithub = 'opensource/';
    const relOutDirArticles = 'articles/';

    downloadGists(github_projects_user, gistIds, rootDirMd, relOutDirGithub)
        .then(() => downloadStackOverflowPosts(stackoverflowUserId, rootDirMd, relOutDirArticles))
        .then(() => downloadMediumArticles(rootDirMd, relOutDirArticles))
        .then(() => downloadGithubProjects(github_projects_user, github_projects, rootDirMd, relOutDirGithub))
        .then(() => console.log("Waiting to finish"));
}
