import got from "got";
import {stackoverflowEnabled} from "../confg";
import fs from "fs";
import {StringStream} from "scramjet";
import TurndownService from "turndown";
import {escapeForFileName} from "../util";
import wordsCount from "words-count";



export async function downloadStackOverflow(soUser, rootDirMd, relOutDir) {
    if (stackoverflowEnabled === false) {
        console.log("Stack Overflow Downloader disabled");
        return;
    }

    const targetRootDir = rootDirMd + relOutDir

    console.log("Start Processing Stack Overflow posts");

    let soAnswers = await got.get(`https://api.stackexchange.com/2.3/users/${soUser}/answers?order=desc&sort=votes&site=stackoverflow&filter=withbody`)
        .then((res) => JSON.parse(res.body));

    for (const answer of soAnswers.items) {
        const question = await getQuestion(answer.question_id);

        console.log(`\tProcessing stack overflow post '${question.title}' (${answer.answer_id}) ${answer.score} upvotes`);

        if(answer.score <= 10) {
            console.log(`\tskipping due to low score`);
            continue;
        }

        const escaped = escapeForFileName(question.title, new Date(answer.creation_date * 1000))

        const targetProjectDir = targetRootDir + "/" + escaped.safeNameWithDate;

        if (!fs.existsSync(targetProjectDir)) {
            fs.mkdirSync(targetProjectDir, {recursive: true});
        }

        const frontMatter = createStackOverflowFrontMatter(answer, question, escaped.safeNameWithDate);
        const markdown = createMarkdown(answer.body);

        const wordCount = wordsCount(markdown);
        if(wordCount <= 200) {
            console.log(`\tskipping due to low word count ${wordCount}`);
            continue;
        }

        const targetProjectFile = targetProjectDir + "/index.md";
        const targetProjectFileBanner = targetProjectDir + "/sobanner.png";

        copyBannerImage("src/data/sobanner.png", targetProjectFileBanner);

        await StringStream.from(frontMatter + markdown)
            .pipe(fs.createWriteStream(targetProjectFile));
    }
}

async function getQuestion(questionId) {
    let soQuestion = await got.get(`https://api.stackexchange.com/2.3/questions/${questionId}?order=desc&sort=activity&site=stackoverflow&filter=withbody`)
        .then((res) => JSON.parse(res.body));
    return soQuestion.items[0];
}

function copyBannerImage(inputFile, targetProjectFileBanner) {
    fs.readFile(inputFile, (err, data) => {
        if (err) {
            console.error(`Error reading file: ${err}`);
            throw err;
        }

        fs.writeFile(targetProjectFileBanner, data, (err) => {
            if (err) {
                console.error(`Error writing file: ${err}`);
                throw err;
            }
        });
    });
}

function createMarkdown(body) {
    function deEscape(content) {
        const escapes = [
            [/\\`/g, '`'],
            [/\\\[/g, '['],
            [/\\]/g, ']'],
            [/\\>/g, '>'],
            [/\\_/g, '_']
        ];

        for (let escapeRuleArrayIndex in escapes) {
            content = content.replace(escapes[escapeRuleArrayIndex][0], escapes[escapeRuleArrayIndex][1])
        }
        return content;
    }

    function correctHtml(body) {
        return body.replace(/<pre[^>]*>\s*<code>/g, '<pre>').replace(/<\/code>\s*<\/pre>/g, '</pre>');
    }

    let turndownService = new TurndownService({preformattedCode: false})

    turndownService.addRule('codeBlockFormat', {
        filter: ['pre'],
        replacement: function (content) {
            return '\n```\n' + deEscape(content) + '\n```\n'
        }
    }).addRule('codeFormat', {
        filter: ['code'],
        replacement: function (content) {
            return ' `' + content + '` '
        }
    });

    body = correctHtml(body);
    return turndownService.turndown(body);
}

function createStackOverflowFrontMatter(soAnswers, soQuestion, safeTitle) {
    let meta = '---\n';
    meta += "title: '" + soQuestion.title + "'\n"
    meta += "date: " + new Date(soAnswers.creation_date * 1000).toISOString().split("T")[0] + "\n"

    if (soAnswers.last_edit_date) {
        meta += "lastmod: " + new Date(soAnswers.last_edit_date * 1000).toISOString().split("T")[0] + "\n"
    } else {
        meta += "lastmod: " + new Date(soAnswers.creation_date * 1000).toISOString().split("T")[0] + "\n"
    }

    meta += "lastfetch: " + new Date().toISOString() + "\n"
    //meta += "description: '" + githubMeta.description.replace(/'/g, "`") + "'\n"
    //meta += "summary: '" + githubMeta.description.replace(/'/g, "`") + "'\n"
    meta += "slug: " + safeTitle + "\n"
    meta += "tags: [" + soQuestion.tags.map(m => '"' + m + '"').join(", ") + "]\n"
    meta += "keywords: [" + soQuestion.tags.map(m => '"' + m + '"').join(", ") + "]\n"
    meta += "alltags: [" + soQuestion.tags.map(m => '"' + m + '"').join(", ") + "]\n"
    meta += "categories: [\"stackoverflow\"]\n"
    meta += "showEdit: false \n"
    meta += "showSummary: false \n"
    meta += "type: stackoverflow \n"
    meta += "thumbnail: 'sobanner*' \n"
    meta += "originalContentLink: " + soQuestion.link + "\n"
    meta += "originalContentType: stackoverflow\n"
    meta += "soScore: " + soAnswers.score + "\n"
    meta += "soViews: " + soQuestion.view_count + "\n"
    meta += "soIsAccepted: " + soAnswers.is_accepted + "\n"
    meta += "soQuestionId: " + soAnswers.question_id + "\n"
    meta += "soAnswerId: " + soAnswers.answer_id + "\n"
    meta += "soAnswerLicense: " + soAnswers.content_license + "\n"
    meta += "---\n"
    return meta;
}
