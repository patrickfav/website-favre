import {ContentStat} from "../downloader/models";
import {initializeApp} from "firebase/app";
import {getDatabase, query, ref, set} from "firebase/database";

class StatsManager {

    //private db: FirebaseStorage


    constructor() {
// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
        /*const firebaseConfig = {
            // ...
            // The value of `databaseURL` depends on the location of the database
            databaseURL: "https://DATABASE_NAME.firebaseio.com",
        };

        const app = initializeApp(firebaseConfig);
        this.db = getDatabase(app);

        ref(this.db, 'stats')

        set(ref(this.db, 'users/' + userId), {
            username: name,
            email: email,
            profile_picture : imageUrl
        });

        query()*/
    }

    async saveDocument(contentStat: ContentStat): Promise<void> {
        /*try {
            await this.db.collection('contentStats').doc(contentStat.subjectId).set(contentStat);
            console.log('Document successfully saved!');
        } catch (error) {
            console.error('Error saving document: ', error);
        }*/
    }

}
