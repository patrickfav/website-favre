---
title: 'contributing'
date: 2018-07-05
lastmod: 2023-03-07
lastfetch: 2023-03-16T21:33:09.822Z
url: opensource/bcrypt/contributing
showSummary: false
showTableOfContents: false
type: opensource-additional
---
# Contributing to Bcrypt

We ❤ pull requests from everyone.

If possible proof features and bugfixes with unit tests.
This repo validates against checkstyle (import the xml found in the root to your IDE if possible)

To run the tests (and checkstyle):

```shell
mvn clean install
```

Tests are automatically run against feature branches and pull requests
via TravisCI, so you can also depend on that.