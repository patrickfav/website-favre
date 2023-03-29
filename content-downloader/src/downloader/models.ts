export type ContentStatType = "gh" | "gist" | "medium" | "so" | "so-user" | "so-question";

export interface ContentStat {
    type: ContentStatType
    user: string
    subjectId: string
    date: Date
    values: GithubStats | GistStats | MediumStats | StackOverflowAnswerStats | StackOverflowUserStats
}

interface GeneralStats {
    contentLength: number
}

export interface GithubStats extends GeneralStats {
    watchers: number
    contributors: number
    stars: number
    forks: number
    repoSize: number
}

export interface GistStats extends GeneralStats {
    comments: number
    forks: number
    revisions: number
}

export interface StackOverflowAnswerStats extends GeneralStats {
    score: number
    views: number
}

export interface StackOverflowUserStats {
    score: number
    answers: number
    questions: number
    acceptRate: number
    gold: number
    silver: number
    bronze: number
}

export interface MediumStats extends GeneralStats {
    claps: number
    voters: number
}
