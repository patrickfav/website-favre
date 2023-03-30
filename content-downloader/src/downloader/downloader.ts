import fs from "fs";
import {ContentStat} from "./models";
import {calculateFileSha256, generateRandomFilename, getExtension, regexQuote, renameFile} from "../util";
import got from "got";
import {promisify} from "util";
import * as stream from "stream";

const pipeline = promisify(stream.pipeline);

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

            if (this.testShouldFilterImage(imageUrl)) {
                markdownContent = markdownContent.replace(new RegExp(regexQuote(markdownImage), 'g'), '\n')
                continue
            }

            const fullyQualifiedUrl = imageUrl.startsWith('https://') ? imageUrl : this.baseUrlForImages() + imageUrl

            const randomFileName = `${targetProjectDir}/${generateRandomFilename()}`
            console.log(`\t\tDownloading image: ${fullyQualifiedUrl}`)

            await pipeline(
                got.stream(fullyQualifiedUrl),
                fs.createWriteStream(randomFileName)
            );

            const contentHash = calculateFileSha256(randomFileName)
            const newLocalImageName = `img_${contentHash.substring(0, 16)}.${getExtension(imageUrl)}`

            await renameFile(randomFileName, `${targetProjectDir}/${newLocalImageName}`)

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

    protected testShouldFilterImage(url: string): boolean {
        return false
    }

    protected baseUrlForImages(): string {
        return '';
    }
}

