import { gistIds, githubProjects, githubProjectsUser, stackoverflowUserId } from './confg'
import { downloadGithubProjects } from './downloader/github'
import { downloadMediumArticles } from './downloader/medium'
import { downloadStackOverflowPosts } from './downloader/stackoverflow'
import { downloadGists } from './downloader/gist'

export function cli () {
  const rootDirMd = '../content/'
  const relOutDirGithub = 'opensource/'
  const relOutDirArticles = 'articles/'

  downloadGists(githubProjectsUser, gistIds, rootDirMd, relOutDirGithub)
    .then(() => downloadStackOverflowPosts(stackoverflowUserId, rootDirMd, relOutDirArticles))
    .then(() => downloadMediumArticles(rootDirMd, relOutDirArticles))
    .then(() => downloadGithubProjects(githubProjectsUser, githubProjects, rootDirMd, relOutDirGithub))
    .then(() => console.log('Waiting to finish'))
}
