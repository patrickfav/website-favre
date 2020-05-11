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

export async function createPage(fileName, content) {
    const writeFile = promisify(fs.writeFile);

    return writeFile(fileName, content)
}
