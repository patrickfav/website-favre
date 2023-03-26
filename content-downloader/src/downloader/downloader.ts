import fs from "fs";
import {ContentStat} from "./models";

export abstract class Downloader {
    readonly name: string
    readonly isEnabled: boolean
    protected readonly rootOutDir: string
    protected readonly contentOutDir: string
    protected downloadDate!:Date

    protected constructor(name: string, isEnabled: boolean, rootOutDir: string, contentOutDir: string) {
        this.name = name
        this.isEnabled = isEnabled
        this.rootOutDir = rootOutDir
        this.contentOutDir = contentOutDir
    }

    download(): Promise<ContentStat[]> {
        if (!this.isEnabled) {
            console.log(`${this.name} Downloader disabled`)
            return Promise.resolve([])
        }

        console.log(`Start Processing ${this.name}`)

        this.downloadDate = new Date();

        return this.downloadLogic();
    }
    protected abstract downloadLogic(): Promise<ContentStat[]>

    protected getTargetOutDir(): string {
        return this.rootOutDir + this.contentOutDir + '/'
    }

    protected static prepareFolder(folderPath: string): void {
        if (fs.existsSync(folderPath)) {
            fs.rmSync(folderPath, {
                recursive: true,
                force: true
            })
        }

        fs.mkdirSync(folderPath, { recursive: true })
    }

    protected static escapeFrontMatterText(title: string): string {
        return title.replace(/'/g, '`').replace(/\n/g, ' ').replace(/\r/g, '');
    }
}

