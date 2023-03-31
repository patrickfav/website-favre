import {Downloader} from './downloader';
import {ContentStat} from './models';

class TestDownloader extends Downloader {
    constructor(name: string, rootOutDir: string, contentOutDir: string) {
        super(name, rootOutDir, contentOutDir);
    }

    downloadLogic(): Promise<ContentStat[]> {
        return Promise.resolve([]);
    }
}

describe('Downloader', () => {
    const downloader = new TestDownloader('Test', 'rootOutDir', 'contentOutDir');

    test('should be created', () => {
        expect(downloader).toBeTruthy();
    });

    test('should have the correct properties', () => {
        expect(downloader['name']).toBe('Test');
        expect(downloader['rootOutDir']).toBe('rootOutDir');
        expect(downloader['contentOutDir']).toBe('contentOutDir');
    });

    test('should call downloadLogic when download is called', async () => {
        const spy = jest.spyOn(downloader, 'downloadLogic');
        await downloader.download();
        expect(spy).toHaveBeenCalledTimes(1);
    });
});
