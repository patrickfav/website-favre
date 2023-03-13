---
title: About
description: "This site is a summary of all of my relevant contributions in the form of open source software, articles or blog posts."
type: nonContentSite
showEdit: false
showDate: false
showReadingTime: false
showReadingTime: false
showTaxonomies: false
showAuthor: false
showPagination: false
showTableOfContents: true
feature: 'banner*'
---

This site is a summary of all of my relevant contributions in the form of open source software, articles or blog posts in the field of software engineering.
I am passionate about creating solutions that not only meet client needs but also have a positive 
impact on the wider community. My projects and contributions have covered a range of areas including web and mobile applications, 
security, and cloud computing.

Through my blog posts and articles, I aim to share my knowledge and experience with fellow software engineers and aspiring 
developers. I believe in the importance of continuous learning and development in the ever-changing landscape of technology, 
and I hope that my contributions will help others in their journey. As an open source contributor, I also value the power 
of collaboration and believe in giving back to the community. I look forward to sharing my work with you and hope that 
it will inspire you as much as it has me.

## Technical Stuff

This site is generated with [hugo](https://gohugo.io/), a static site generator. Base theme is derived from 
[jpanther's](https://github.com/jpanther) awesome [congo](https://github.com/jpanther/congo) theme. The source content
is hosted on [Github](https://github.com/patrickfav/website-favre) and continuously deployed via 
[Github Actions](https://github.com/patrickfav/website-favre/actions) to 
[Firebase Hosting](https://firebase.google.com/docs/hosting) (a [CDN](https://en.wikipedia.org/wiki/Content_delivery_network)).

### Syncing Content 

[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=patrickfav_website-favre&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=patrickfav_website-favre)

The content is fetched via a simple [Node CLI](https://github.com/patrickfav/website-favre/tree/main/content-downloader) 
that requests the content from e.g. GitHub, StackOverflow or Medium and converts it to markdown with a hugo-compatible 
[front matter](https://gohugo.io/content-management/front-matter/) and [directory structure](https://gohugo.io/content-management/organization/).

### Version

[![Build Status](https://github.com/patrickfav/website-favre/actions/workflows/build_deploy.yml/badge.svg)](https://github.com/patrickfav/website-favre/actions)

This version is based on commit {{< gitinfo >}} and build with ci job {{< buildinfo >}}.

## Old Site

This is the second version of this site, which was recreated from scratch. The previous version, which is not maintained anymore, can be found 
under [old.favr.dev](https://old.favr.dev/) was created with [Codedoc](https://codedoc.cc/) by [CONNECT platform](https://github.com/CONNECT-platform?type=source) which does not seem to be [actively
maintained](https://github.com/CONNECT-platform/codedoc/) anymore.
