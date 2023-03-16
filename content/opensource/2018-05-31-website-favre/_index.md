---
title: 'website-favre'
date: 2018-05-31
lastmod: 2023-03-12
lastfetch: 2023-03-16T21:34:25.883Z
description: 'The source for my private website powered by static code generators.'
summary: 'The source for my private website powered by static code generators.'
aliases: ['/link/3xw5p9d9','/opensource/2018/website-favre']
url: opensource/website-favre
tags: ["congo", "hugo", "portfolio-website", "static-site-generator"]
keywords: ["congo", "hugo", "portfolio-website", "static-site-generator", "tailwindcss", "website-performance"]
alltags: ["congo", "hugo", "portfolio-website", "static-site-generator", "tailwindcss", "website-performance", "github", "HTML"]
categories: ["opensource"]
editURL: https://github.com/patrickfav/website-favre
showAuthor: true
deeplink: /link/3xw5p9d9
originalContentLink: https://github.com/patrickfav/website-favre
originalContentType: github
githubCloneUrlHttp: https://github.com/patrickfav/website-favre.git
githubStars: 0
githubForks: 2
githubWatchers: 0
githubLanguage: HTML
githubHomepage: https://favr.dev
githubDefaultBranch: main
githubOpenIssues: 4
githubIsFork: false
---
# Static Site Gen Repo for my Personal Website

A simple website with a list of all of my open source projects and articles I wrote. Can be found on [favr.dev](https://favr.dev). Uses [Hugo](https://gohugo.io/) as static site generator.

[](https://github.com/patrickfav/website-favre/actions)
[](https://github.com/patrickfav/website-favre/actions)
[](https://sonarcloud.io/summary/new_code?id=patrickfav_website-favre)
[](https://sonarcloud.io/summary/new_code?id=patrickfav_website-favre)
[](https://sonarcloud.io/summary/new_code?id=patrickfav_website-favre)

![Screenshot Website](gh_c99eb45c362a1585934c8ef0.png)

## Prepare

### Install Hugo

* Windows `choco install hugo-extended`
* Mac `brew install hugo`

### Cloning Project with Submodule

This project uses a git submodule for including the theme. To correctly clone it you need to do

```bash
git clone https://github.com/patrickfav/website-favre.git
git submodule init
git submodule update
```

## Build & Run

### Prepare Content Sync

Install everything in the local script and link the cli:

```bash
cd content-downloader
npm install
npm link 
```

optionally update the content with

```bash
hugo-content-downloader
```
which will populate the directories `content/opensource` and `content/articles`.

### Linting

This project uses [eslint](https://eslint.org/) to validate the code:

```bash
cd content-downloader
npm runt lint
```

### Using the build & run Docker Image

A docker image that builds everything, updates the content and then can be used to locally serve the website with nginx can be created by doing:

```bash
docker build --no-cache --progress=plain -t websitefavre:latest .
docker run -p 8080:80 websitefavre:latest
```

and then you can access the page with `http://localhost:8080`

# License

Proprietary: Patrick Favre-Bulle 2023
