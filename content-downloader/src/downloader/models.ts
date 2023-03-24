export interface ContentStat {
    type: "gh" | "gist" | "medium" | "so"
    user: string
    subjectId: string
    date: Date
    values: GithubStats | GistStats | MediumStats | StackOverflowStats
}

interface GeneralStats {
    contentLength: number
}

interface GithubStats extends GeneralStats {
    watchers: number
    contributors: number
    stars: number
    forks: number
    repoSize: number
}

interface GistStats extends GeneralStats {
    comments: number
    forks: number
    revisions: number
}

interface StackOverflowStats extends GeneralStats {
    score: number
    views: number
}

interface MediumStats extends GeneralStats {
    claps: number
    voters: number
}
