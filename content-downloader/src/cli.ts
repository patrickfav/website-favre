import {gistIds, githubProjects, githubProjectsUser, mediumUserName, stackoverflowUserId} from './confg'
import {GithubDownloader} from './downloader/github'
import {MediumDownloader} from './downloader/medium'
import {StackOverflowDownloader} from './downloader/stackoverflow'
import {GistDownloader} from './downloader/gist'

const defaultRootDir = '../content/'

export function cli(args: string[]): void {
    const rootDir = parseArguments(args)

    const relOutDirGithub = 'opensource'
    const relOutDirArticles = 'articles'

    new GistDownloader(rootDir, relOutDirGithub, {githubUser: githubProjectsUser, gistIds: gistIds}).download()
        .then(() => new GithubDownloader(rootDir, relOutDirGithub, {
            githubUser: githubProjectsUser,
            githubProjects: githubProjects
        }).download())
        .then(() => new StackOverflowDownloader(rootDir, relOutDirArticles, {stackOverflowUserId: stackoverflowUserId}).download())
        .then(() => new MediumDownloader(rootDir, relOutDirArticles, {userName: mediumUserName}).download())
        .then(() => console.log('Waiting to finish'))
}

function parseArguments(args: string[]): string {
    if (args && args.length && args.length >= 3) {
        return args[2]
    }

    return defaultRootDir
}
