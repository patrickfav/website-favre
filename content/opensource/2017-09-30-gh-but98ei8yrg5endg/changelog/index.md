---
title: 'changelog'
date: 2017-09-30
lastmod: 2023-03-08
lastfetch: 2023-03-18T16:05:22.767Z
url: opensource/hkdf/changelog
showSummary: false
showTableOfContents: false
type: opensource-additional
---
# Releases

## v2.0.0

* added `module-info.java`

### Breaking Change
In order to avoid split package problems, we renamed this lib's main package `at.favre.lib.crypto` -> `at.favre.lib.hkdf`.

## v1.1.0

* refactor HkdfMacFactory to accept `SecretKey` types instead of byte array - helps to be compatible with some security frameworks #4

### Breaking Change

The interface HkdfMacFactory changed to accept `SecretKey` and two new methods where added for creating
a secret key from a raw byte source and to return the mac length in bytes. See the default implementation
for details on how to implement this if you need a custom impl.

## v1.0.2

* add OSWAP dependency check plugin to Maven POM #3

## v1.0.1

* update maven plugins and test dependencies
* switch to maven wrapper

## v1.0.0

* add checkstyle rules

## v0.4.4

* fix signed jar

## v0.4.3

* remove obsolete maven dependencies

## v0.4.2

* make mac factory public

## v0.4.1

* some small bugfixes

## v0.4.0

* change api from `extract(ikm,salt)` to a more RFC compliant `extract(salt,ikm)` (also `extractAndExpand()`)

## v0.3.0

* refactor 'expand' byte handling to use byte buffer
* rename package to `at.favre.lib.hkdf`

## v0.2.1

initial version
