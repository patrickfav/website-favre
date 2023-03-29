import { Downloader } from './downloader';
import { ContentStat } from './models';

class TestDownloader extends Downloader {
    constructor(name: string, isEnabled: boolean, rootOutDir: string, contentOutDir: string) {
        super(name, isEnabled, rootOutDir, contentOutDir);
    }
    downloadLogic(): Promise<ContentStat[]> {
        return Promise.resolve([]);
    }
}

describe('Downloader', () => {
    const downloader = new TestDownloader('Test', true, 'rootOutDir', 'contentOutDir');

    test('should be created', () => {
        expect(downloader).toBeTruthy();
    });

    test('should have the correct properties', () => {
        expect(downloader['name']).toBe('Test');
        expect(downloader['isEnabled']).toBe(true);
        expect(downloader['rootOutDir']).toBe('rootOutDir');
        expect(downloader['contentOutDir']).toBe('contentOutDir');
    });

    test('should call downloadLogic when download is called', async () => {
        const spy = jest.spyOn(downloader, 'downloadLogic');
        await downloader.download();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    test('should not call downloadLogic when isEnabled is false', async () => {
        const disabledDownloader = new TestDownloader('Test', false, 'rootOutDir', 'contentOutDir');
        const spy = jest.spyOn(disabledDownloader, 'downloadLogic');
        await disabledDownloader.download();
        expect(spy).toHaveBeenCalledTimes(0);
    });
});
