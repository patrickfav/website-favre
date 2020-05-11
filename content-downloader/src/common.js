import {promisify} from "util";
import fs from "fs";

export function createTocMd(metaOutputList) {
    return metaOutputList.map(m => '> [' + m.name + '](/' + m.relLink + ')').join('\n')
}

export function createMetaListMd(title, metaOutputList) {
    const dtf = new Intl.DateTimeFormat('en', {year: 'numeric', month: 'short', day: '2-digit'})

    let table = metaOutputList
        .map(m => '| [' + m.name + '](/' + m.relLink + ') | ' + dtf.format(m.createDate) + ' |')
        .join('\n');

    return '# ' + title + "\n\n"
        + "|Title |Published|\n" +
        "|:---|---:|\n"
        + table;
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
            '| [' + m.name + '](/' + m.relLink + ')'+
            '| ' + m.language + ' |' +
            '| ' + m.forks + ' |' +
            '| ' + m.stars + ' |' +
            '| ' + m.watchers + ' |' +
            '| ' + m.license + ' |' +
            '| ' + dtf.format(m.createDate) + ' |'
        )
        .join('\n');

    return '# ' + title + "\n\n"
        + "|Title|Language|Forks|Stars|Watchers|License|Published|\n" +
        "|:---|---|---|---|---|---|---:|\n"
        + table;
}

export async function createPage(fileName, content) {
    const writeFile = promisify(fs.writeFile);

    return writeFile(fileName, content)
}
