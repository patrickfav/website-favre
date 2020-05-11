import fs from "fs";
import {StringStream} from "scramjet";
import got from "got";

export async function downloadGithubReadme(github_user, github_projects, rootDirMd, relOutDir) {
    let metaOutputList = [];
    let githubMetaData = await got.get('https://api.github.com/users/'+github_user+'/repos?sort=updated&direction=desc')
        .then((res) => JSON.parse(res.body));

    for (const projectName of github_projects) {
        let metaOutput = {};

        console.log("Downloading Readme from " + projectName);

        const fileName = projectName;
        const fileNameExt = fileName + ".md";

        if (!fs.existsSync(rootDirMd + relOutDir)) {
            fs.mkdirSync(rootDirMd + relOutDir);
        }

        let githubMeta = githubMetaData.find(p => p.name === projectName);

        metaOutput.name = projectName;
        metaOutput.description = githubMeta.description;
        metaOutput.relLink = relOutDir + fileName;
        metaOutput.updateDate = new Date(githubMeta.updated_at);
        metaOutput.createDate = new Date(githubMeta.created_at);
        metaOutput.stars = githubMeta.stargazers_count;
        metaOutput.forks = githubMeta.forks;
        metaOutput.watchers = githubMeta.watchers;
        metaOutput.language = githubMeta.language;
        metaOutput.license = githubMeta.license ? githubMeta.license.name : '';
        metaOutput.issues = githubMeta.open_issues_count;
        metaOutput.cloneUrl = githubMeta.clone_url;

        metaOutputList.push(metaOutput);

        console.log("\tLast Updated" + metaOutput.updateDate.toISOString());


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
