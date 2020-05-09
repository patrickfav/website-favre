const request = require('request');

const MEDIUM_IMG_CDN = "https://cdn-images-1.medium.com/max/";

const utils = {
    render: function (json) {

        let s = json.payload.value;
        let story = {};

        story.title = s.title;
        story.date = new Date(s.createdAt);
        story.url = s.canonicalUrl;
        story.language = s.detectedLanguage;
        story.license = s.license;

        story.sections = s.content.bodyModel.sections;
        story.paragraphs = s.content.bodyModel.paragraphs;

        let sections = [];
        for (let i = 0; i < story.sections.length; i++) {
            let s = story.sections[i];
            let section = utils.processSection(s);
            sections[s.startIndex] = section;
        }

        if (story.paragraphs.length > 1) {
            story.subtitle = story.paragraphs[1].text;
        }

        story.markdown = [];
        story.markdown.push("\n# " + story.title.replace(/\n/g, '\n# '));
        if (undefined != story.subtitle) {
            story.markdown.push("\n" + story.subtitle.replace(/#+/, ''));
        }

        let promises = [];

        for (let i = 2; i < story.paragraphs.length; i++) {

            if (sections[i]) story.markdown.push(sections[i]);

            let promise = new Promise(function (resolve, reject) {
                let p = story.paragraphs[i];
                utils.processParagraph(p, function (err, text) {
                    // Avoid double title/subtitle
                    if (text != story.markdown[i])
                        return resolve(text);
                    else
                        return resolve();
                });
            });
            promises.push(promise);
        }

        return Promise.all(promises).then((results) => {
            results.map(text => {
                story.markdown.push(text);
            })

            return story.markdown.join('\n');
        });
    },
    loadMediumPost: function (mediumURL, cb) {
        if (mediumURL.match(/^http/i)) {
            mediumURL = mediumURL.replace(/#.+$/, '');
            request(mediumURL + "?format=json", function (err, res, body) {
                if (err) return cb(err);
                let json_string = body.substr(body.indexOf('{'));
                let json = JSON.parse(json_string);
                return cb(null, json);
            });
        } else {
            json = require(process.cwd() + "/" + mediumURL);
            return cb(null, json);
        }
    },
    processSection: function (s) {
        let section = "";
        if (s.backgroundImage) {
            let imgwidth = parseInt(s.backgroundImage.originalWidth, 10);
            let imgsrc = MEDIUM_IMG_CDN + Math.max(imgwidth * 2, 2000) + "/" + s.backgroundImage.id;
            section = "\n![](" + imgsrc + ")";
        }
        return section;
    },
    getYouTubeEmbed: function (iframesrc, cb) {
        request(iframesrc, function (err, res) {
            let tokens = res.body.match(/youtube.com%2Fembed%2F([^%]+)%3F/);
            if (tokens && tokens.length > 1) {
                let videoId = tokens[1];
                return cb(null, `<center><iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></center>`);
            }
            cb(null, `<iframe src="${iframesrc}" frameborder=0></iframe>`);
        });
    },
    processParagraph: function (p, cb) {

        let markups_array = utils.createMarkupsArray(p.markups);

        if (markups_array.length > 0) {
            let previousIndex = 0, text = p.text, tokens = [];
            for (var j = 0; j < markups_array.length; j++) {
                if (markups_array[j]) {
                    token = text.substring(previousIndex, j);
                    previousIndex = j;
                    tokens.push(token);
                    tokens.push(markups_array[j]);
                }
            }
            tokens.push(text.substring(j - 1));
            p.text = tokens.join('')
                .replace(/`\[/g,'[`')
                .replace(/\s\*\*/g,'** ')
                .replace(/\s_/g,'_ ')
            ;
        }

        let markup = "";
        switch (p.type) {
            case 1:
                markup = "\n";
                break;
            case 2:
                p.text = "\n# " + p.text.replace(/\n/g, '\n# ');
                break;
            case 3:
                p.text = "\n## " + p.text.replace(/\n/g, '\n## ');
                break;
            case 4: // image & caption
                let imgwidth = parseInt(p.metadata.originalWidth, 10);
                let imgsrc = MEDIUM_IMG_CDN + Math.max(imgwidth * 2, 2000) + "/" + p.metadata.id;
                let text = "\n![" + p.text + "](" + imgsrc + ")";
                if (p.text) {
                    text += "\n<small>_" + p.text + "_</small>";
                }
                p.text = text;
                break;
            case 6:
                markup = "> ";
                break;
            case 7: // quote
                p.text = "> # " + p.text.replace(/\n/g, '\n> # ');
                break;
            case 8:
                p.text = "```\n" + p.text + "\n```";
                break;
            case 9:
                markup = "\n* ";
                break;
            case 10:
                markup = "\n1. ";
                break;
            case 11:
                return utils.getYouTubeEmbed('https://medium.com/media/' + p.iframe.mediaResourceId, function (err, embed) {
                    cb(null, `\n${embed}`);
                });
            case 14: //link box
                p.text = '\n' + p.text
                break;
            case 13:
                markup = "\n### ";
                break;
            case 15: // caption for section image
                p.text = "*" + p.text + "*";
                break;
        }

        p.text = markup + p.text;

        if (p.alignment == 2 && p.type != 6 && p.type != 7) p.text = "<center>" + p.text + "</center>";

        return cb(null, p.text);
    },
    addMarkup: function (markups_array, open, close, start, end) {
        if (markups_array[start])
            markups_array[start] += open;
        else
            markups_array[start] = open;

        if (markups_array[end])
            markups_array[end] += close;
        else
            markups_array[end] = close;

        return markups_array;
    },
    createMarkupsArray: function (markups) {
        if (!markups || markups.length === 0) return [];
        let markups_array = [];
        for (let j = 0; j < markups.length; j++) {
            let m = markups[j];
            switch (m.type) {
                case 1: // bold
                    utils.addMarkup(markups_array, "**", "**", m.start, m.end);
                    break;
                case 2: // italic
                    utils.addMarkup(markups_array, "_", "_", m.start, m.end);
                    break;
                case 3: // anchor tag
                    utils.addMarkup(markups_array, "[", "](" + m.href + ")", m.start, m.end);
                    break;
                case 10: // code
                    utils.addMarkup(markups_array, "`", "`", m.start, m.end);
                    break;
                default:
                    console.error("Unknown markup type " + m.type, m);
                    break;
            }
        }
        return markups_array;
    }
}

module.exports = utils;
