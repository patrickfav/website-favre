import {ContentStat, ContentStatValue} from "../downloader/models";
import * as admin from "firebase-admin";

const firebaseCollectionName = 'content-stats'

export class StatsManager {
    readonly db: admin.firestore.Firestore | null

    readonly maxDateInPast: Date
    readonly maxUpdateIntervalDate: Date

    constructor(serviceAccount?: admin.ServiceAccount) {

        let usedServiceAccount: admin.ServiceAccount | null

        if (!serviceAccount) {
            usedServiceAccount = this.getServiceAccounts()
        } else {
            usedServiceAccount = serviceAccount
        }

        if (usedServiceAccount) {
            const app = admin.initializeApp({
                credential: admin.credential.cert(usedServiceAccount)
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
        if (!this.db) {
            throw new Error("cannot use this instance, since it wasn't initialized properly.")
        }

        const latestStatsQuery = this.db
            .collection(firebaseCollectionName)
            .orderBy("date", "desc")
            .where("date", ">", this.maxDateInPast);

        const contentStatList: ContentStat[] = []
        const querySnapshot = await latestStatsQuery.get();
        querySnapshot.forEach((doc) => {
            contentStatList.push(doc.data() as ContentStat)
        });

        console.log(`Found ${contentStatList.length} matching elements in firestore from ${this.maxDateInPast.toISOString()} until today.`);

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

    async persist(contentStats: ContentStat[], previousResults: StatResults) {
        if (!this.db) {
            throw new Error("cannot use this instance, since it wasn't initialized properly.")
        }

        console.log(`Persisting new stats (${contentStats.length}) while comparing them with previous results.`)

        let addCounter = 0
        for (const stat of contentStats.filter(contentStat => {
            if (
                previousResults[contentStat.type] &&
                previousResults[contentStat.type][contentStat.subjectId] &&
                previousResults[contentStat.type][contentStat.subjectId].data.length > 0
            ) {
                const mostRecentValue = previousResults[contentStat.type][contentStat.subjectId].data[0];

                if (this.areDatesOnSameDay(mostRecentValue.date, new Date())) {
                    console.log(`\tSkip: there is already an entry on this date '${contentStat.type}|${contentStat.user}|${contentStat.subjectId}'`)
                    return false
                }

                if (this.areObjectsEqual(mostRecentValue.values, contentStat.values)) {
                    // do not filter if most recent element is too old
                    if (mostRecentValue.date.getTime() < this.maxDateInPast.getTime()) {
                        return true
                    }

                    console.log(`\tSkip: data has not changed '${contentStat.type}|${contentStat.user}|${contentStat.subjectId}'`)
                    return false
                }
            }

            return true
        })) {
            addCounter++
            console.log(`\tAdd: '${stat.type}|${stat.user}|${stat.subjectId}|${JSON.stringify(stat.values)}'`)

            await this.db.collection(firebaseCollectionName).add(stat)
        }

        console.log(`Finished adding ${addCounter} new stats to Firestore.`)
    }

    protected getServiceAccounts(): admin.ServiceAccount | null {
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
    values: ContentStatValue
}
