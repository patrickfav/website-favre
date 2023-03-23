import {gistIds, githubProjects, githubProjectsUser, mediumUserName, stackoverflowUserId} from './confg'
import {GithubDownloader} from './downloader/github'
import {MediumDownloader} from './downloader/medium'
import {StackOverflowDownloader} from './downloader/stackoverflow'
import {GistDownloader} from './downloader/gist'

const defaultRootDir = '../content/'

export async function cli(args: string[]): Promise<void> {
    const rootDir = parseArguments(args)

    const relOutDirGithub = 'opensource'
    const relOutDirArticles = 'articles'


    const gistDownloader = new GistDownloader(rootDir, relOutDirGithub, {
        githubUser: githubProjectsUser,
        gistIds: gistIds,
    });

    const githubDownloader = new GithubDownloader(rootDir, relOutDirGithub, {
        githubUser: githubProjectsUser,
        githubProjects: githubProjects,
    });

    const stackOverflowDownloader = new StackOverflowDownloader(rootDir, relOutDirArticles, {
        stackOverflowUserId: stackoverflowUserId,
    });

    const mediumDownloader = new MediumDownloader(rootDir, relOutDirArticles, {
        userName: mediumUserName,
    });

    try {
        const gistObjects = await gistDownloader.download();
        const githubObjects = await githubDownloader.download();
        const stackOverflowObjects = await stackOverflowDownloader.download();
        const mediumObjects = await mediumDownloader.download();

        const contentStats = [
            ...gistObjects,
            ...githubObjects,
            ...stackOverflowObjects,
            ...mediumObjects,
        ];

        console.log('All objects:', contentStats);
        console.log('All done.');
    } catch (error) {
        console.error('An error occurred:', error);
        throw error;
    }
}

function parseArguments(args: string[]): string {
    if (args && args.length && args.length >= 3) {
        return args[2]
    }

    return defaultRootDir
}
