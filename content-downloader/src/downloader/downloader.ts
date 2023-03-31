import fs from "fs";
import {ContentStat} from "./models";
import {
    calculateFileSha256,
    findAllHtmlImages,
    findAllMarkdownImages,
    generateRandomFilename,
    getExtension,
    regexQuote,
    renameFile
} from "../util";
import got from "got";
import {promisify} from "util";
import * as stream from "stream";

const pipeline = promisify(stream.pipeline);

export abstract class Downloader {
    readonly name: string
    protected readonly rootOutDir: string
    protected readonly contentOutDir: string
    protected downloadDate!: Date

    protected constructor(name: string, rootOutDir: string, contentOutDir: string) {
        this.name = name
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

        const foundImages = [
            ...findAllHtmlImages(markdownContent),
            ...findAllMarkdownImages(markdownContent)
        ]

        for (const imageMeta of foundImages) {

            if (this.testShouldFilterImage(imageMeta.src)) {
                markdownContent = markdownContent.replace(new RegExp(regexQuote(imageMeta.raw), 'g'), '\n')
                continue
            }

            const fullyQualifiedUrl = imageMeta.src.startsWith('https://') ? imageMeta.src : this.baseUrlForImages() + imageMeta.src

            const randomFileName = `${targetProjectDir}/${generateRandomFilename()}`
            console.log(`\t\tDownloading image: ${fullyQualifiedUrl}`)

            await pipeline(
                got.stream(fullyQualifiedUrl),
                fs.createWriteStream(randomFileName)
            );

            const contentHash = calculateFileSha256(randomFileName)
            const newLocalImageName = `img_${contentHash.substring(0, 16)}.${getExtension(imageMeta.src)}`

            await renameFile(randomFileName, `${targetProjectDir}/${newLocalImageName}`)

            markdownContent = markdownContent
                .replace(
                    new RegExp(regexQuote(imageMeta.raw), 'g'),
                    `![${imageMeta.altText == '' ? 'Image' : imageMeta.altText}](${newLocalImageName}${imageMeta.caption ? ' ' + imageMeta.caption : ''})`
                ).replace(
                    new RegExp(regexQuote(imageMeta.src), 'g'), newLocalImageName
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
