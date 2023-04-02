export type ContentStatType =
    "gh"
    | "gh-user"
    | "gist"
    | "medium"
    | "medium-user"
    | "so"
    | "so-user"
    | "so-question"
    | "devto"
    | string;
export type ContentStatValue =
    GithubStats
    | GithubUserStats
    | GistStats
    | MediumStats
    | MediumUserStats
    | DevToStats
    | StackOverflowAnswerStats
    | StackOverflowUserStats;

export interface ContentStat {
    type: ContentStatType
    user: string
    subjectId: string
    date: Date
    values: ContentStatValue
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

export interface GithubUserStats {
    repos: number
    gists: number
    followers: number
    following: number
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

export interface MediumUserStats {
    followers: number
    following: number
}

export interface DevToStats extends GeneralStats {
    comments: number
    reactions: number
    positive_reactions: number
}
