import {gistIds, githubProjects, githubProjectsUser, mediumUserName} from './confg'
import {GithubDownloader} from './downloader/github'
import {MediumDownloader} from './downloader/medium'
import {GistDownloader} from './downloader/gist'
import {StatsManager} from "./store/statsManager";
import {configDefaults, StackExchangeDownloader} from "./downloader/stackexchange";
import {
    cryptographyStackExchangeBanner,
    securityStackExchangeBanner,
    stackOverflowBanner,
    texStackExchangeBanner
} from "./svg";

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

    const stackOverflowDownloader = new StackExchangeDownloader(rootDir, relOutDirArticles, {
        ...configDefaults,
        site: 'stackoverflow',
        url: 'stackoverflow.com',
        acronym: 'so',
        userId: 774398,
        svgBanner: stackOverflowBanner,
    });

    const securityStackExchange = new StackExchangeDownloader(rootDir, relOutDirArticles, {
        ...configDefaults,
        site: 'security',
        url: 'security.stackexchange.com',
        acronym: 'se-security',
        userId: 60108,
        svgBanner: securityStackExchangeBanner,
        minWords: 100,
        minVote: 3,
        minViews: 1000
    });

    const cryptoStackExchange = new StackExchangeDownloader(rootDir, relOutDirArticles, {
        ...configDefaults,
        site: 'cryptography',
        url: 'crypto.stackexchange.com',
        acronym: 'se-crypto',
        userId: 44838,
        svgBanner: cryptographyStackExchangeBanner,
        minWords: 100,
        minVote: 1,
        minViews: 500
    });

    const texStackExchange = new StackExchangeDownloader(rootDir, relOutDirArticles, {
        ...configDefaults,
        site: 'tex',
        url: 'tex.stackexchange.com',
        acronym: 'se-tex',
        userId: 42691,
        svgBanner: texStackExchangeBanner,
        minWords: 100
    });

    const mediumDownloader = new MediumDownloader(rootDir, relOutDirArticles, {
        userName: mediumUserName,
    });

    const contentStats = [
        ...await securityStackExchange.download(),
        ...await cryptoStackExchange.download(),
        ...await texStackExchange.download(),
        ...await gistDownloader.download(),
        ...await stackOverflowDownloader.download(),
        ...await githubDownloader.download(),
        ...await mediumDownloader.download(),
    ];

    console.log(`All done, found ${contentStats.length} stats while importing content.`);

    const statManager = new StatsManager();
    if (statManager.isEnabled()) {
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


