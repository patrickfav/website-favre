---
title: 'contributing'
date: 2017-09-30
lastmod: 2023-03-08
lastfetch: 2023-03-16T21:33:45.761Z
url: opensource/hkdf/contributing
showSummary: false
showTableOfContents: false
type: opensource-additional
---
# Contributing to HKDF

We ❤ pull requests from everyone.

If possible proof features and bugfixes with unit tests.
This repo validates against checkstyle (import the xml found in the root to your IDE if possible)

To run the tests (and checkstyle):

```shell
mvn test checkstyle:check
```

Tests are automatically run against branches and pull requests
via TravisCI, so you can also depend on that.