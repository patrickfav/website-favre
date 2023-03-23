export interface ContentStat {
    "type": "gh" | "gist" | "medium" | "so",
    "user": string,
    "subjectId": string,
    date: Date,
    "values" : GithubStats | GistStats | MediumStats | StackOverflowStats
}

interface GithubStats {
    "watchers": number,
    "stars": number,
    "forks": number
}

interface GistStats {
    "comments": number,
    "stars": number,
    "forks": number
}

interface StackOverflowStats {
    "score": number,
    "views": number
}

interface MediumStats {
    "claps": number,
    "voters": number
}
