import fs from 'fs';
import got from 'got';
import {promisify} from 'util';
import {StringStream} from 'scramjet';
import markdowndl from './markdown-dl';

const github_projects = [
    'patrickfav/bcrypt',
    'patrickfav/Dali',
    'patrickfav/under-the-hood',
    'patrickfav/density-converter',
    'patrickfav/uber-apk-signer',
    'patrickfav/armadillo',
    'patrickfav/BlurTestAndroid',
    'patrickfav/uber-adb-tools',
    'patrickfav/bytes-java',
    'patrickfav/indoor-positioning',
    'patrickfav/hkdf',
    'patrickfav/slf4j-timber',
    'patrickfav/id-mask',
    'patrickfav/dice',
    'patrickfav/singlestep-kdf',
    'patrickfav/bkdf',
]

const medium_links = [
    {
        url: 'https://proandroiddev.com/security-best-practices-symmetric-encryption-with-aes-in-java-7616beaaade9',
        title: 'Security Best Practices: Symmetric Encryption with AES in Java and Android'
    },
    {
        url: 'https://codeburst.io/how-to-centralize-your-checkstyle-configuration-with-maven-7575eacd7295',
        title: 'How to Centralize your Checkstyle Configuration with Maven'
    },
    {
        url: 'https://medium.com/@patrickfav/a-better-way-to-protect-your-database-ids-a33fa9867552',
        title: 'A Better Way to Protect Your IDs'
    },
    {
        url: 'https://proandroiddev.com/security-best-practices-symmetric-encryption-with-aes-in-java-and-android-part-2-b3b80e99ad36',
        title: 'Security Best Practices: Symmetric Encryption with AES in Java and Android: Part 2: AES-CBC + HMAC'
    },
    {
        url: 'https://medium.com/hackernoon/the-bcrypt-protocol-is-kind-of-a-mess-4aace5eb31bd',
        title: 'The Bcrypt Protocol… is kind of a mess'
    },
    {
        url: 'https://medium.com/@patrickfav/the-concise-interface-implementation-pattern-9b15f35a806b',
        title: 'The Concise Interface Implementation Pattern'
    },
    {url: 'https://proandroiddev.com/improving-proguard-name-obfuscation-83b27b34c52a', title: 'Improving ProGuard Name Obfuscation'},
    {
        url: 'https://proandroiddev.com/handling-proguard-as-library-developer-or-in-a-multi-module-android-application-2d738c37890',
        title: 'Handling Proguard as Library Developer'
    },
    {
        url: 'https://proandroiddev.com/managing-logging-in-a-multi-module-android-application-eb966fb7fedc',
        title: 'Managing Logging in a Multi-Module Android App'
    },
]

export function cli(args) {

    const rootDir = '../docs/'
    const rootDirMd = rootDir + 'md/'
    const templateDir = rootDir + 'template/'
    const tocFileTemplate = templateDir + '_toc.md'
    const tocFile = rootDirMd + '_toc.md'
    const relOutDir = 'docs/opensource/';
    const relOutDirArticles = 'docs/articles/';

    const writeFile = promisify(fs.writeFile);
    const readFile = promisify(fs.readFile);
    const rmdirSync = promisify(fs.rmdirSync);

    let tocEntriesGithub = [];
    let tocEntriesArticles = [];

    async function downloadGithubReadme() {
        for (const project of github_projects) {
            console.log("Downloading Readme from " + project);

            const name = project.replace('patrickfav/', '');
            const fileName = project.replace('/', '-')
            const fileNameExt = fileName + ".md"

            tocEntriesGithub.push('> [' + name + '](/' + relOutDir + fileName + ')')

            if (!fs.existsSync(rootDirMd + relOutDir)) {
                fs.mkdirSync(rootDirMd + relOutDir);
            }

            const url = 'https://github.com/' + project + '/raw/master/';

            await StringStream.from(got.stream(url + 'README.md'))
                .endWith("\n\n> :ToCPrevNext\n")
                .map(line =>
                    line
                        .replace(/\]\(doc\//g, '](' + url + 'doc/')
                        .replace(/\]\(misc\//g, '](' + url + 'misc/')
                )
                .pipe(fs.createWriteStream(rootDirMd + relOutDir + fileNameExt));
        }
        tocEntriesGithub.sort();
    }

    async function downloadMediumArticles() {
        const mediumExporterApi = promisify(markdowndl.loadMediumPost);

        if (!fs.existsSync(rootDirMd + relOutDirArticles)) {
            fs.mkdirSync(rootDirMd + relOutDirArticles);
        }

        for (const article of medium_links) {
            console.log("Downloading Article '" + article.title + "'");

            await mediumExporterApi(article.url)
                .then(json => markdowndl.render(json))
                .then(content => {
                    let fileName = article.title.replace(/ /g, '-');
                    tocEntriesArticles.push('> [' + article.title + '](/' + relOutDirArticles + fileName + ')')
                    return StringStream.from(content).pipe(fs.createWriteStream(rootDirMd + relOutDirArticles + fileName + ".md"));
                });
        }

        tocEntriesArticles.sort();
    }

    rmdirSync(rootDirMd + relOutDir, {recursive: true});
    rmdirSync(rootDirMd + relOutDirArticles, {recursive: true});

    downloadMediumArticles()
        .then(() => downloadGithubReadme())
        .then(() => readFile(tocFileTemplate))
        .then(data => data.toString()
            .replace('{{PLACEHOLDER_GITHUB_TOC}}', tocEntriesGithub.join('\n'))
            .replace('{{PLACEHOLDER_ARTICLE_TOC}}', tocEntriesArticles.join('\n')))
        .then(data => writeFile(tocFile, data))
        .then(() => console.log("Waiting to finish"));
}


