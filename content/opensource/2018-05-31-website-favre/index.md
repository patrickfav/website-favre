---
title: 'website-favre'
date: 2018-05-31
lastmod: 2023-02-21
lastfetch: 2023-02-26T14:35:17.357Z
description: 'The source for my private website powered by static code generators.'
summary: 'The source for my private website powered by static code generators.'
aliases: ['/link/3xw5p9d9','/opensource/website-favre']
slug: 2018/website-favre
tags: ["congo", "hugo", "portfolio-website", "static-site-generator"]
keywords: ["congo", "hugo", "portfolio-website", "static-site-generator", "tailwindcss", "website-performance"]
alltags: ["congo", "hugo", "portfolio-website", "static-site-generator", "tailwindcss", "website-performance", "github", "JavaScript"]
categories: ["opensource"]
editURL: https://github.com/patrickfav/website-favre
deeplink: /link/3xw5p9d9
originalContentLink: https://github.com/patrickfav/website-favre
originalContentType: github
githubStars: 0
githubForks: 2
githubLanguage: JavaScript
---
# Static Site Gen Repo for my Personal Website

A simple website with a list of all of my open source projects and articles I wrote. Can be found on [favr.dev](https://favr.dev). Uses [Hugo](https://gohugo.io/) as static site generator.

[](https://github.com/patrickfav/website-favre/actions)

## Prepare

## Build & Run

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

### Prepare Content

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

### Using the build & run Docker Image

A docker image that builds everything, updates the content and then can be used to locally serve the website with nginx can be created by doing:

```bash
docker build --no-cache --progress=plain -t websitefavre:latest .
docker run -p 8080:80 websitefavre:latest
```

and then you can access the page with `http://localhost:8080`

# License

Proprietary: Patrick Favre-Bulle 2023