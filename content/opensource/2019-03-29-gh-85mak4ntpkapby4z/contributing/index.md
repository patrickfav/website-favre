---
title: 'contributing'
date: 2019-03-29
lastmod: 2023-03-11
lastfetch: 2023-03-18T12:42:40.087Z
url: opensource/id-mask/contributing
showSummary: false
showTableOfContents: false
type: opensource-additional
---
# Contributing to Id-Mask

We ❤ pull requests from everyone.

If possible proof features and bugfixes with unit tests.
This repo validates against checkstyle (import the xml found in the root to your IDE if possible)

To run the tests (and checkstyle):

```shell
mvn test checkstyle:check
```

Tests are automatically run against branches and pull requests
via TravisCI, so you can also depend on that.
