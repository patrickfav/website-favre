---
title: About
description: "This site is a summary of all of my relevant contributions in the form of open source software, articles or blog posts."
type: nonContentSite
showEdit: false
showDate: false
showReadingTime: false
showTaxonomies: false
showAuthor: false
showPagination: false
showTableOfContents: true
feature: 'banner*'
---

This site is a curated overview of my work in software engineering, including open-source projects, articles, and blog posts.

I focus on building practical, well-engineered solutions across areas such as web and mobile applications, security, and cloud computing. I’m particularly interested in work that not only solves real-world problems but also contributes positively to the wider developer community.

Through writing and open-source contributions, I share insights from my experience and ongoing learning in a constantly evolving field. Collaboration and knowledge sharing are central to how I work, and I hope my projects and articles are useful and inspiring to others.

## Contact

Either you find me on one of the multiple sites I frequent (
[{{< icon "se_stackoverflow" >}} StackOverflow](https://stackoverflow.com/users/774398),
[{{< icon "linkedin" >}} LinkedIn](https://www.linkedin.com/in/pfb/),
[{{< icon "twitter" >}} Twitter](https://twitter.com/patrickfav),
[{{< icon "github" >}} Gist](https://gist.github.com/patrickfav),
[{{< icon "github" >}} GitHub](https://github.com/patrickfav),
[{{< icon "medium" >}} Medium](https://medium.com/@patrickfav),
[{{< icon "devto" >}} dev.to](https://dev.to/favr)
) or feel free to send me a message via {{< mail-address mailto="patrick@favr.dev" >}}.

## Technical Stuff

This site is generated with [hugo](https://gohugo.io/), a static site generator. Base theme is derived from
[jpanther's](https://github.com/jpanther) awesome [congo](https://github.com/jpanther/congo) theme. The source content
is hosted on [GitHub](https://github.com/patrickfav/website-favre) and continuously deployed via
[GitHub Actions](https://github.com/patrickfav/website-favre/actions) to
[Firebase Hosting](https://firebase.google.com/docs/hosting) (
a [CDN](https://en.wikipedia.org/wiki/Content_delivery_network)).

### Syncing Content

[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=patrickfav_website-favre&metric=coverage)](https://sonarcloud.io/summary/new_code?id=patrickfav_website-favre)

The content is fetched via a simple [Node CLI](https://github.com/patrickfav/website-favre/tree/main/content-downloader)
written in [Typescript](https://www.typescriptlang.org/)
that requests the content from e.g. GitHub, StackOverflow, dev.to or Medium and converts it to markdown with a
hugo-compatible
[front matter](https://gohugo.io/content-management/front-matter/)
and [directory structure](https://gohugo.io/content-management/organization/).

### Version

[![Build Status](https://github.com/patrickfav/website-favre/actions/workflows/build_deploy.yml/badge.svg)](https://github.com/patrickfav/website-favre/actions)

This version is based on commit {{< gitinfo >}} and build with ci job {{< buildinfo >}}.

### Old Site

This is the second version of this site, which was recreated from scratch. The previous version, which is not maintained anymore, can be found 
under [old.favr.dev](https://old.favr.dev/) was created with [Codedoc](https://codedoc.cc/) by [CONNECT platform](https://github.com/CONNECT-platform?type=source) which does not seem to be [actively
maintained](https://github.com/CONNECT-platform/codedoc/) anymore.
