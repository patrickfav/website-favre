---
title: 'contributing'
date: 2017-10-31
lastmod: 2023-03-16
lastfetch: 2023-03-18T16:05:17.298Z
url: opensource/bytes-java/contributing
showSummary: false
showTableOfContents: false
type: opensource-additional
---
# Contributing to Bytes

We ❤ pull requests from everyone.

If possible to proof features and bug fixes with unit tests.
This repo validates against checkstyle (import the xml found in the root to your IDE if possible)

To run the tests (and checkstyle):

```shell
mvn verify
```

Tests are automatically run against branches and pull requests
via TravisCI, so you can also depend on that.
