import {BaseModel} from "firestore-storage-core";

export interface ContentStat<T extends StatValues> extends BaseModel {
    "type": "gh" | "gist" | "medium" | "so",
    "user": string,
    "subjectId": string,
    "values" : T
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface StatValues {}

interface GithubStats extends StatValues {
    "watchers": number,
    "stars": number,
    "forks": number
}

interface GistStats extends StatValues {
    "comments": number,
    "stars": number,
    "forks": number
}

interface StackOverflowStats extends StatValues {
    "score": number,
    "views": number
}

interface MediumStats {
    "claps": number,
    "voters": number
}
