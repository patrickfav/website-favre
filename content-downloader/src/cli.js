import { gistIds, githubProjects, githubProjectsUser, stackoverflowUserId } from './confg'
import { downloadGithubProjects } from './downloader/github'
import { downloadMediumArticles } from './downloader/medium'
import { downloadStackOverflowPosts } from './downloader/stackoverflow'
import { downloadGists } from './downloader/gist'

const defaultRootDir = '../content/'

export function cli (args) {

  const rootDir = parseArguments(args)

  const relOutDirGithub = 'opensource/'
  const relOutDirArticles = 'articles/'

  downloadGists(githubProjectsUser, gistIds, rootDir, relOutDirGithub)
    .then(() => downloadGithubProjects(githubProjectsUser, githubProjects, rootDir, relOutDirGithub))
    .then(() => downloadStackOverflowPosts(stackoverflowUserId, rootDir, relOutDirArticles))
    .then(() => downloadMediumArticles(rootDir, relOutDirArticles))
    .then(() => console.log('Waiting to finish'))
}

function parseArguments(args) {

  if(args && args.length && args.length >= 3) {
    return args[2];
  }

  return defaultRootDir;
}