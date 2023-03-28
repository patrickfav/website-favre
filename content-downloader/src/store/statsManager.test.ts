import {StatsManager} from './statsManager';
import * as admin from 'firebase-admin';
import {credential} from 'firebase-admin';
// @ts-ignore
import * as firebaseMock from 'firebase-mock';
import {ContentStat} from "../downloader/models";

// Mock Firebase environment
const mockFirestore = new firebaseMock.MockFirestore();
const nowTimestamp = admin.firestore.Timestamp.now()
const now = nowTimestamp.toDate()

jest.spyOn(admin, 'initializeApp').mockImplementation(() => {
    return {
        firestore: () => mockFirestore,
    } as unknown as admin.app.App;
});

jest.spyOn(credential, 'cert').mockReturnValue({} as unknown as credential.Credential)

describe('StatsManager', () => {
    const statsManager = new StatsManager({} as unknown as admin.ServiceAccount);

    beforeEach(() => {
        mockFirestore.autoFlush();
    });

    test('isEnabled should return true if Firestore is initialized', async () => {
        expect(statsManager.isEnabled()).toBe(true);
    });

    test('getRecentContentStats should return recent content stats', async () => {
        const contentStat = {
            type: 'gist',
            subjectId: '12345',
            user: 'gistUser',
            date: nowTimestamp,
            values: {
                comments: 0,
                forks: 4,
                revisions: 8,
                contentLength: 6
            },
        };

        // Add a document to the Firestore collection
        await mockFirestore.collection('content-stats').add(contentStat);

        const recentContentStats = await statsManager.getRecentContentStats();
        expect(recentContentStats).toHaveProperty('gist');
        expect(recentContentStats.gist).toHaveProperty('12345');
        expect(recentContentStats.gist['12345'].data[0]).toMatchObject({
            date: now,
            values: {
                comments: 0,
                forks: 4,
                revisions: 8,
                contentLength: 6
            }
        });
    });

    test('persist should add new content stats to Firestore', async () => {
        const contentStats: ContentStat[] = [
            {
                type: 'gh',
                subjectId: '67890',
                user: 'user1',
                date: now,
                values: {
                    watchers: 1,
                    contributors: 2,
                    stars: 3,
                    forks: 4,
                    repoSize: 5,
                    contentLength: 6
                },
            },
        ];

        const previousResults: any = {};

        await statsManager.persist(contentStats, previousResults);

        const persistedData = await mockFirestore
            .collection('content-stats')
            .where('type', '==', 'gh')
            .get();

        expect(persistedData.docs.length).toBe(1);
        expect(persistedData.docs[0].data()).toMatchObject({
            type: 'gh',
            subjectId: '67890',
            user: 'user1',
            date: now,
            values: {
                watchers: 1,
                contributors: 2,
                stars: 3,
                forks: 4,
                repoSize: 5,
                contentLength: 6
            },
        });
    });
});
