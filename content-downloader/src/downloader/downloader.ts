import fs from "fs";
import {ContentStat} from "./models";
import {getExtension, regexQuote} from "../util";
import crypto from "crypto";
import got from "got";

export abstract class Downloader {
    readonly name: string
    readonly isEnabled: boolean
    protected readonly rootOutDir: string
    protected readonly contentOutDir: string
    protected downloadDate!: Date

    protected constructor(name: string, isEnabled: boolean, rootOutDir: string, contentOutDir: string) {
        this.name = name
        this.isEnabled = isEnabled
        this.rootOutDir = rootOutDir
        this.contentOutDir = contentOutDir
    }

    protected static prepareFolder(folderPath: string): void {
        if (fs.existsSync(folderPath)) {
            fs.rmSync(folderPath, {
                recursive: true,
                force: true
            })
        }

        fs.mkdirSync(folderPath, {recursive: true})
    }

    protected static escapeFrontMatterText(title: string): string {
        return title.replace(/'/g, '`').replace(/\n/g, ' ').replace(/\r/g, '');
    }

    async download(): Promise<ContentStat[]> {
        if (!this.isEnabled) {
            console.log(`${this.name} Downloader disabled`)
            return Promise.resolve([])
        }

        console.log(`Start Processing ${this.name}`)

        this.downloadDate = new Date();
        try {
            return await this.downloadLogic();
        } catch (err: any) {
            console.log(`An error has occurred while downloading ${this.name}.`);

            if (err.response) {
                console.log(`Error response body: ${err.response.body}.`);
            }

            throw err
        }
    }

    protected abstract downloadLogic(): Promise<ContentStat[]>

    protected getTargetOutDir(): string {
        return this.rootOutDir + this.contentOutDir + '/'
    }

    protected async fetchAndReplaceImages(markdownContent: string, targetProjectDir: string) {

        const matches = [...markdownContent.matchAll(/!\[(?<alttext>[^\]]*)]\((?<filename>[^\s]*?)(?=\s*[")])\s*(?<optionalpart>".*")?\)/g)]

        for (const i in matches) {
            const markdownImage = matches[i][0];
            const altText = matches[i][1]
            const imageUrl = matches[i][2]
            const caption = matches[i][3]

            let abort = false
            for (const urlPrefix of this.filteredImageUrlPrefix()) {
                if (imageUrl.startsWith(urlPrefix)) {
                    markdownContent = markdownContent.replace(new RegExp(regexQuote(markdownImage), 'g'), '\n')
                    abort = true
                    break
                }
            }

            if (abort) {
                continue
            }

            const newLocalImageName = `img_${crypto.createHash('sha256').update(imageUrl).digest('hex').substring(0, 16)}.${getExtension(imageUrl)}`

            console.log('\t\tDownloading image: ' + imageUrl + ' to ' + newLocalImageName)

            got.stream(imageUrl).pipe(fs.createWriteStream(targetProjectDir + '/' + newLocalImageName))

            markdownContent = markdownContent
                .replace(
                    new RegExp(regexQuote(markdownImage), 'g'),
                    `![${altText}](${newLocalImageName}${caption ? ' ' + caption : ''})`
                ).replace(
                    new RegExp(regexQuote(imageUrl), 'g'), newLocalImageName
                )
        }

        return markdownContent
    }

    protected filteredImageUrlPrefix(): string[] {
        return []
    }
}

