---
title: 'contributing'
date: 2017-12-19
lastmod: 2023-03-12
lastfetch: 2023-03-18T12:42:14.200Z
url: opensource/armadillo/contributing
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
gradle test checkstyle:check
```

Tests are automatically run against branches and pull requests
via TravisCI, so you can also depend on that.
