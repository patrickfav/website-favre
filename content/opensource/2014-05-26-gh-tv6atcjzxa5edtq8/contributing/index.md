---
title: 'contributing'
date: 2014-05-26
lastmod: 2023-03-13
lastfetch: 2023-03-17T17:53:19.748Z
url: opensource/dali/contributing
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
.gradlew checkstyle
```

Tests are automatically run against branches and pull requests
via TravisCI, so you can also depend on that.