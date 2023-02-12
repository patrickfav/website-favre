---
title: 'website-favre'
date: 2018-05-31
lastmod: 2023-01-30
lastfetch: 2023-02-12T21:37:43.099Z
description: 'The source for my private website powered by static code generators.'
summary: 'The source for my private website powered by static code generators.'
slug: website-favre
tags: ["congo", "hugo", "portfolio-website", "static-site-generator"]
keywords: ["congo", "hugo", "portfolio-website", "static-site-generator", "tailwindcss", "website-performance"]
alltags: ["congo", "hugo", "portfolio-website", "static-site-generator", "tailwindcss", "website-performance", "github", "HTML"]
categories: ["opensource"]
editURL: https://github.com/patrickfav/website-favre
originalContentLink: https://github.com/patrickfav/website-favre
originalContentType: github
githubStars: 0
githubForks: 2
githubLanguage: HTML
githubLicense: MIT License
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

# License

Proprietary: Patrick Favre-Bulle 2020
