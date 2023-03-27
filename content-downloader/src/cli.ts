import {gistIds, githubProjects, githubProjectsUser, mediumUserName, stackoverflowUserId} from './confg'
import {GithubDownloader} from './downloader/github'
import {MediumDownloader} from './downloader/medium'
import {StackOverflowDownloader} from './downloader/stackoverflow'
import {GistDownloader} from './downloader/gist'
import {StatsManager} from "./store/statsManager";

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

    const contentStats = [
        ...await gistDownloader.download(),
        ...await stackOverflowDownloader.download(),
        ...await githubDownloader.download(),
        ...await mediumDownloader.download(),
    ];

    console.log(`All done, found ${contentStats.length} stats while importing content.`);


    const statManager = new StatsManager();
    if(statManager.isEnabled()) {
        console.log(`\n\nStarting updating content stats.`);
        const previousData = await statManager.getRecentContentStats()
        await statManager.persist(contentStats, previousData)
    } else {
        console.log(`\n\nNo Firebase credentials provided, skipping updating content stats.`);
    }
}

function parseArguments(args: string[]): string {
    if (args && args.length && args.length >= 3) {
        return args[2]
    }

    return defaultRootDir
}
