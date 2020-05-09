import fs from "fs";
import {StringStream} from "scramjet";
import got from "got";

export async function downloadGithubReadme(github_projects, rootDirMd, relOutDir) {
    let tocEntriesGithub = [];

    for (const project of github_projects) {
        console.log("Downloading Readme from " + project);

        const parts = project.split('/');
        const user = parts[0];
        const name = parts[1];
        const fileName = name;
        const fileNameExt = fileName + ".md";

        tocEntriesGithub.push('> [' + name + '](/' + relOutDir + fileName + ')')

        if (!fs.existsSync(rootDirMd + relOutDir)) {
            fs.mkdirSync(rootDirMd + relOutDir);
        }

        const url = 'https://github.com/' + project + '/raw/master/';

        await StringStream.from(got.stream(url + 'README.md'))
            .endWith('> :GithubBtn repo=' + name + ', user=' + user + '\n\n')
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
