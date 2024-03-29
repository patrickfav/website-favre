---
title: 'changelog'
date: 2016-10-10
lastmod: 2023-08-15
url: opensource/uber-apk-signer/changelog
showSummary: false
showTableOfContents: false
type: opensource-additional
---
# Releases

## v1.2.2

* move to github actions & sonarqube
* update some dependencies
* fix flaky tests

## v1.3.0

* update internal apksigner implementation to 33.0.2 and zipalign binaries
* improve support for v3.1 and v4 signature schema


## v1.2.1

* minor: fix using incorrect version number

## v1.2.0

* fix using 'outfile.zip should use the same page alignment for all shared object files within infile.zip' by providing correct flag to zipalign (thx @subho007)
* fix some minor vulnerabilities in tests
* update maven dependencies & plugins

## v1.1.0

* support apk signer schema v3 with lineage file support #18
* updates apksigner to v29.0.2
* updates zipalign to v29.0.2 win/mac/linux binaries
* add OSWAP dependency check plugin to Maven POM

## v1.0.0

* updates apksigner to v28.0.3
* update zipalign to 28.0.3 win/linux binary
* updates maven plugin versions
* use maven wrapper
* slightly improved debugging output

## v0.8.4
* add file size info to log output
* fix nullpointer when using apk file and not dir (thx @yihongyuelan)
* updates apksigner to v27.0.3

## v0.8.3
* do not use `javax.xml.bind.*` dependencies, that might crash on jre9

## v0.8.2
* add jar signing
* updates apksigner to v26.0.2

## v0.8.1
* updates apksigner to v26.0.1
* adds checksum to release artifacts

## v0.8.0
* updates apksigner to v25.0.3

## v0.7.0
* updates apksigner to v25.0.2
* checks for empty input paths
* masks pw input

## v0.6.0
* adds verify sha256 feature
* adds resign feature
* adds multiple input files/folders feature
* fixes bug where source would be deleted when using skipZipalign

## v0.5.0
* adds embedded linux & mac zipalign (x64 only)
* enhances log output (more structural with checksums etc.)

## v0.4.0
* adds multi keystore sign feature
* better verify output
* adds --ksDebug to provide custom location for debug keystore
* prints file checksums

## v0.3.0
* fixes bug where wrong pw was used for release keystores
* fixes bug where mac was identified as windows machine

## v0.2.0
* fixes using release keystore
* better signature verify output

Issue: built-in zipalign for linux & mac do not work yet.

## v0.1.0 beta
 initial release

* sign, zipalign and verify of multiple apks
* built-in zipalign & debug.keystore
