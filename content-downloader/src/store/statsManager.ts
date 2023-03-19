import {BaseRepository} from "firestore-storage";
import {ContentStat} from "./models";
import {GithubDownloader} from "../downloader/github";

class StatsManager {

}

class FirebaseStatsRepository extends BaseRepository<ContentStat<GithubDownloader>> {

}
