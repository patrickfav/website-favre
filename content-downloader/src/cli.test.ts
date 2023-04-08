import {cli} from './cli'
import {GithubDownloader} from './downloader/github'
import {MediumDownloader} from './downloader/medium'
import {GistDownloader} from './downloader/gist'
import {StackExchangeDownloader} from './downloader/stackexchange'
import {DevToDownloader} from './downloader/devto'

jest.mock('./downloader/github')
jest.mock('./downloader/medium')
jest.mock('./downloader/gist')
jest.mock('./downloader/stackexchange')
jest.mock('./downloader/devto')

describe('cli', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should download content and update stats', async () => {
        // Mock downloader download methods
        GithubDownloader.prototype.download = jest.fn().mockResolvedValue([])
        MediumDownloader.prototype.download = jest.fn().mockResolvedValue([])
        GistDownloader.prototype.download = jest.fn().mockResolvedValue([])
        StackExchangeDownloader.prototype.download = jest.fn().mockResolvedValue([])
        DevToDownloader.prototype.download = jest.fn().mockResolvedValue([])

        await cli([])

        // Assert download methods were called
        expect(GithubDownloader.prototype.download).toHaveBeenCalledTimes(1)
        expect(MediumDownloader.prototype.download).toHaveBeenCalledTimes(1)
        expect(GistDownloader.prototype.download).toHaveBeenCalledTimes(1)
        expect(StackExchangeDownloader.prototype.download).toHaveBeenCalledTimes(4) // 4 instances
        expect(DevToDownloader.prototype.download).toHaveBeenCalledTimes(1)
    })
})
