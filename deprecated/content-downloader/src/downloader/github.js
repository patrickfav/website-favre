import fs from "fs";
import {DataStream, MultiStream, StringStream} from "scramjet";
import got from "got";

export async function downloadGithubReadme(github_user, github_projects, rootDirMd, relOutDir) {
    let metaOutputList = [];
    let githubMetaData = await got.get('https://api.github.com/users/' + github_user + '/repos?sort=updated&direction=desc')
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

        const frontMatter = createGithubFrontMatter(projectName, githubMeta);

        await StringStream.from(frontMatter)
            .pipe(fs.createWriteStream(rootDirMd + relOutDir + fileNameExt));


        await MultiStream.from([StringStream.from(frontMatter), StringStream.from(got.stream(url + 'README.md'))]).mux()
            .endWith("\n---\n")
            .map(line =>
                line
                    .replace(/\]\(doc\//g, '](' + url + 'doc/')
                    .replace(/\]\(misc\//g, '](' + url + 'misc/')
                    .replace(/\]\(src\/main\/resources\/img\//g, '](' + url + 'src/main/resources/img/')
            )
            .pipe(fs.createWriteStream(rootDirMd + relOutDir + fileNameExt));
    }

    metaOutputList.sort((a, b) => b.createDate - a.createDate);

    return metaOutputList;
}

function createGithubFrontMatter(projectName, githubMeta) {
    let meta = '---\n';
    meta += "title: '" + projectName + "'\n"
    meta += "date: " + new Date(githubMeta.created_at).toISOString().split("T")[0] + "\n"
    meta += "lastmod: " + new Date(githubMeta.updated_at).toISOString().split("T")[0] + "\n"
    meta += "draft: false\n"
    meta += "description: '" + githubMeta.description.replace(/'/g, "`") + "'\n"
    meta += "summary: '" + githubMeta.description.replace(/'/g, "`") + "'\n"
    meta += "slug: " + projectName + "\n"
    meta += "tags: [" + githubMeta.topics.map(m => '"' + m + '"').join(", ") + "]\n"
    meta += "keywords: [" + githubMeta.topics.map(m => '"' + m + '"').join(", ") + "]\n"
    meta += "showReadingTime: false\n"
    meta += "githubStars: " + githubMeta.stargazers_count + "\n"
    meta += "githubForks: " + githubMeta.forks_count + "\n"
    meta += "githubLanguage: " + githubMeta.language + "\n"
    meta += "githubRepoLink: " + githubMeta.html_url + "\n"
    if(githubMeta.license) {
        meta += "githubLicense: " + githubMeta.license.name + "\n"
    }
    meta += "---\n"
    return meta;
}

export function createGithubMetaListMd(title, metaOutputList) {

    /*metaOutput.name = projectName;
    metaOutput.description = githubMeta.description;
    metaOutput.relLink = relOutDir + fileName;
    metaOutput.updateDate = githubMeta.updated_at;
    metaOutput.createDate = githubMeta.created_at;
    metaOutput.stars = githubMeta.stargazers_count;
    metaOutput.forks = githubMeta.forks;
    metaOutput.watchers = githubMeta.watchers;
    metaOutput.language = githubMeta.language;
    metaOutput.license = githubMeta.license.name;
    metaOutput.issues = githubMeta.open_issues_count;
    metaOutput.cloneUrl = githubMeta.clone_url;*/

    const dtf = new Intl.DateTimeFormat('en', {year: 'numeric', month: 'short', day: '2-digit'})

    let table = metaOutputList
        .map(m =>
            '| [' + m.name + '](/' + m.relLink + ')' +
            '| _' + m.description + '_ (' + m.createDate.getFullYear() + ')'
        )
        .join('\n');

    return '# ' + title + "\n\n"
        + "|Title|Description|\n" +
        "|:---|:---|\n"
        + table;
}
