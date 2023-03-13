---
title: 'contributing'
date: 2018-12-08
lastmod: 2023-03-12
lastfetch: 2023-03-13T14:23:04.816Z
url: opensource//bkdf/contributing
showSummary: false
showTableOfContents: false
---
# Contributing

We ❤ pull requests from everyone.

If possible proof features and bugfixes with unit tests.
This repo validates against checkstyle (import the xml found in the root to your IDE if possible)

To run the tests (and checkstyle):

```shell
mvn test checkstyle:check
```

Tests are automatically run against branches and pull requests
via TravisCI, so you can also depend on that.
