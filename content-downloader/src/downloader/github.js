import fs from "fs";
import {StringStream} from "scramjet";
import got from "got";

export async function downloadGithubReadme(github_user, github_projects, rootDirMd, relOutDir) {
    let metaOutputList = [];

    for (const projectName of github_projects) {
        let metaOutput = {};

        console.log("Downloading Readme from " + projectName);

        const fileName = projectName;
        const fileNameExt = fileName + ".md";

        if (!fs.existsSync(rootDirMd + relOutDir)) {
            fs.mkdirSync(rootDirMd + relOutDir);
        }

        metaOutput.name = projectName;
        metaOutput.description = '';
        metaOutput.relLink = relOutDir + fileName;
        metaOutput.updateDate = new Date(0);
        metaOutput.createDate = new Date(0);

        metaOutputList.push(metaOutput);

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

    metaOutputList.sort((a, b) => a.createDate - b.createDate);

    return metaOutputList;
}
