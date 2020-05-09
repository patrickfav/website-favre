import fs from "fs";
import {StringStream} from "scramjet";
import got from "got";

export async function downloadGithubReadme(github_user, github_projects, rootDirMd, relOutDir) {
    let tocEntriesGithub = [];

    for (const projectName of github_projects) {
        console.log("Downloading Readme from " + projectName);

        const fileName = projectName;
        const fileNameExt = fileName + ".md";

        tocEntriesGithub.push('> [' + projectName + '](/' + relOutDir + fileName + ')')

        if (!fs.existsSync(rootDirMd + relOutDir)) {
            fs.mkdirSync(rootDirMd + relOutDir);
        }

        const url = 'https://github.com/' + github_user + '/' + projectName + '/raw/master/';

        await StringStream.from(got.stream(url + 'README.md'))
            .endWith('> :GithubBtn repo=' + projectName + ', user=' + github_user + '\n\n')
            .endWith("\n\n> :ToCPrevNext\n")
            .map(line =>
                line
                    .replace(/\]\(doc\//g, '](' + url + 'doc/')
                    .replace(/\]\(misc\//g, '](' + url + 'misc/')
                    .replace(/\]\(src\/main\/resources\/img\//g, '](' + url + 'src/main/resources/img/')
            )
            .pipe(fs.createWriteStream(rootDirMd + relOutDir + fileNameExt));
    }
    tocEntriesGithub.sort();

    return tocEntriesGithub;
}
