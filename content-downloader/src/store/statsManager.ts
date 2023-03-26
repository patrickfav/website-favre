import {
    ContentStat,
    GithubStats,
    GistStats,
    MediumStats,
    StackOverflowUserStats,
    StackOverflowAnswerStats
} from "../downloader/models";
import * as admin from "firebase-admin";

const firebaseCollectionName = 'content-stats'

export class StatsManager {
    readonly db: admin.firestore.Firestore | null

    readonly maxDateInPast: Date
    readonly maxUpdateIntervalDate: Date

    constructor() {
        const serviceAccount = this.getServiceAccount()

        if(serviceAccount) {
            const app = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });

            this.db = app.firestore()
        } else {
            this.db = null
        }

        this.maxDateInPast = new Date();
        this.maxDateInPast.setDate(this.maxDateInPast.getDate() - 90)

        this.maxUpdateIntervalDate = new Date();
        this.maxUpdateIntervalDate.setDate(this.maxUpdateIntervalDate.getDate() - 14)
    }

    isEnabled(): boolean {
        return this.db != null
    }

    async getRecentContentStats(): Promise<StatResults> {
        if(!this.db) {
           throw new Error("cannot use this instance, since it wasn't initialized properly.")
        }

        console.log(`Fetching all stats from ${this.maxDateInPast.toISOString()}.`);

        const latestStatsQuery = this.db
            .collection(firebaseCollectionName)
            .orderBy("date", "desc")
            .where("date", ">", this.maxDateInPast);

        const contentStatList: ContentStat[] = []
        const querySnapshot = await latestStatsQuery.get();
        querySnapshot.forEach((doc) => {
            contentStatList.push(doc.data() as ContentStat)
        });

        console.log(`Found ${contentStatList.length} elements in firestore.`);

        const result: StatResults = {};

        contentStatList.forEach(contentStat => {
            const {type, subjectId, date, values} = contentStat;

            // If type is not present in result, create a new object
            if (!result[type]) {
                result[type] = {};
            }

            // If subjectId is not present in result[type], create a new object with an empty values array
            if (!result[type][subjectId]) {
                result[type][subjectId] = {
                    data: [],
                };
            }

            // Add the current StatValues object to the corresponding values array
            result[type][subjectId].data.push({
                date: ((date as unknown) as admin.firestore.Timestamp).toDate(),
                values: values
            });

            // Sort the values array in descending order by the date property
            result[type][subjectId].data.sort((a, b) => b.date.getTime() - a.date.getTime());
        });

        return result;
    }

    private getServiceAccount(): admin.ServiceAccount | null {
        const jsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON

        if (jsonEnv && jsonEnv.length > 0) {
            try {
                return JSON.parse(jsonEnv) as admin.ServiceAccount
            } catch (e) {
                console.error("could not parse firebase service account json", e)
                throw e
            }
        }

        console.error("The environmental variable 'FIREBASE_SERVICE_ACCOUNT_JSON' which should contain a json of the service account, is not set.")
        return null
    }

    async persist(contentStats: ContentStat[], previousResults: StatResults) {
        if(!this.db) {
            throw new Error("cannot use this instance, since it wasn't initialized properly.")
        }

        console.log(`Persisting new stats (${contentStats.length}) while comparing them with previous results.`)

        for (const stat of contentStats.filter(contentStat => {
            if (
                previousResults[contentStat.type] &&
                previousResults[contentStat.type][contentStat.subjectId] &&
                previousResults[contentStat.type][contentStat.subjectId].data.length > 0
            ) {
                const mostRecentValue = previousResults[contentStat.type][contentStat.subjectId].data[0];

                if (this.areDatesOnSameDay(mostRecentValue.date, new Date())) {
                    console.log(`is on same date, filter out ${contentStat.type}|${contentStat.user}|${contentStat.subjectId}`)
                    return false
                }

                if (this.areObjectsEqual(mostRecentValue.values, contentStat.values)) {
                    // do not filter if most recent element is too old
                    if (mostRecentValue.date.getTime() < this.maxDateInPast.getTime()) {
                        return true
                    }

                    console.log(`equal data, filter out ${contentStat.type}|${contentStat.user}|${contentStat.subjectId}`)
                    return false
                }
            }

            return true
        })) {
            console.log(`Add element to firestore ${stat.type}|${stat.user}|${stat.subjectId}|${stat.date}`)

            await this.db.collection(firebaseCollectionName).add(stat)
        }
    }

    private areDatesOnSameDay(date1: Date, date2: Date): boolean {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    }

    private areObjectsEqual(a: object, b: object): boolean {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);

        if (keysA.length !== keysB.length) {
            return false;
        }

        // @ts-ignore
        return keysA.every(key => a[key] === b[key]);
    }
}

interface StatResults {
    [type: string]: {
        [subjectId: string]: {
            data: StatValues[]
        }
    }
}

interface StatValues {
    date: Date
    values: GithubStats | GistStats | MediumStats | StackOverflowAnswerStats | StackOverflowUserStats
}
