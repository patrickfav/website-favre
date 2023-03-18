---
title: 'changelog'
date: 2018-11-18
lastmod: 2023-03-02
url: opensource/singlestep-kdf/changelog
showSummary: false
showTableOfContents: false
type: opensource-additional
---
# Releases

## v0.3.0

* use block length if null salt is provided instead of hash out length (makes no difference, hmac always pads to block length) #1
* add OSWAP dependency check plugin to Maven POM #2
* update various dependencies and move CI to github actions
* start using sonaqube

## v0.2.0

* add various unit tests
* update maven plugins

## v0.1.0

initial version
