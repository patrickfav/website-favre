---
title: 'contributing'
date: 2017-12-31
lastmod: 2022-11-18
lastfetch: 2023-03-18T16:05:27.185Z
url: opensource/slf4j-timber/contributing
showSummary: false
showTableOfContents: false
type: opensource-additional
---
# Contributing

We ❤ pull requests from everyone.

If possible proof features and bugfixes with unit tests.
This repo validates against checkstyle (import the xml found in the root to your IDE if possible)

To run the tests (and checkstyle):

```shell
./gradlew checkstyle
```

Tests are automatically run against branches and pull requests
via TravisCI, so you can also depend on that.
