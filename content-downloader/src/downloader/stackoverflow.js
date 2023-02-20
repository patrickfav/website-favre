import got from "got";
import {stackoverflowEnabled} from "../confg";
import fs from "fs";
import {StringStream} from "scramjet";
import TurndownService from "turndown";

export async function downloadStackOverflow(soUser, rootDirMd, relOutDir) {
    if(stackoverflowEnabled === false) {
        console.log("Stack Overflow Downloader disabled");
        return;
    }

    const targetRootDir = rootDirMd + relOutDir

    console.log("Start Processing Stack Overflow posts");

    let soAnswers = await got.get(`https://api.stackexchange.com/2.3/users/${soUser}/answers?order=desc&sort=votes&site=stackoverflow&filter=withbody`)
        .then((res) => JSON.parse(res.body));

    for (const answer of soAnswers.items) {
        const question = await getQuestion(answer.question_id);

        console.log(`\tProcessing stack overflow post '${question.title}' (${answer.answer_id})`);

        const safeTitle = encodeURI(question.title.replace(/ /g, '-').replace(/:/g, '_').replace(/&#x2026;/g, '_').replace(/…/g, '_')).toLowerCase();
        let safeTitleWithDate = new Date(answer.creation_date * 1000).toISOString().split("T")[0] + "-" + safeTitle;

        const targetProjectDir = targetRootDir + "/" + safeTitleWithDate;

        if (!fs.existsSync(targetProjectDir)) {
            fs.mkdirSync(targetProjectDir, {recursive: true});
        }

        const frontMatter = createStackOverflowFrontMatter(answer, question, safeTitleWithDate);
        const markdown = createMarkdown(answer.body);

        const targetProjectFile = targetProjectDir + "/index.md";
        await StringStream.from(frontMatter + markdown)
            .pipe(fs.createWriteStream(targetProjectFile));
    }
}

async function getQuestion(questionId) {
    let soQuestion = await got.get(`https://api.stackexchange.com/2.3/questions/${questionId}?order=desc&sort=activity&site=stackoverflow&filter=withbody`)
        .then((res) => JSON.parse(res.body));
    return soQuestion.items[0];
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

    return turndownService.turndown(body);
}

function createStackOverflowFrontMatter(soAnswers, soQuestion, safeTitle) {
    let meta = '---\n';
    meta += "title: '" + soQuestion.title + "'\n"
    meta += "date: " + new Date(soAnswers.creation_date * 1000).toISOString().split("T")[0] + "\n"

    if(soAnswers.last_edit_date) {
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
    //meta += "alltags: [" + allTags.map(m => '"' + m + '"').join(", ") + "]\n"
    meta += "categories: [\"stackoverflow\"]\n"
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
