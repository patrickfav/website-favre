export interface ContentStat {
    type: "gh" | "gist" | "medium" | "so" | "so-user"
    user: string
    subjectId: string
    date: Date
    values: GithubStats | GistStats | MediumStats | StackOverflowAnswerStats | StackOverflowUserStats
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

interface StackOverflowAnswerStats extends GeneralStats {
    score: number
    views: number
}

interface StackOverflowUserStats {
    score: number
    answers: number
    acceptRate: number
    gold: number
    silver: number
    bronze: number
}

interface MediumStats extends GeneralStats {
    claps: number
    voters: number
}
