---
title: 'changelog'
date: 2016-11-27
lastmod: 2023-03-02
lastfetch: 2023-03-13T17:18:12.770Z
url: opensource//under-the-hood/changelog
showSummary: false
showTableOfContents: false
type: opensource-additional
---
# Releases

## v0.7.0

* update to SDK 29 and Android Gradle Plugin v4
* do not plant Timber tree anymore and fix error log issues
* support RTL
* Migrate to AndroidX

## v0.6.0

* update to SDK26
* add new default for section TrafficStats
* add new createDataMap feature creating a key-value map from pages object

## v0.5.3 (2017-07-27)

* add some overloaded property factory methods

## v0.5.2 (2017-05-12)

* removes allow backup and support rtl from lib manifests

## v0.5.1 (2017-02-27)

* adds spacer element in HoodApi
* error in single package assembler type will not prevent other types from being shown
* fix bug where vibrator would not be checked if any existed in shake debug feature
* adds obfuscate and shorten feature
* adds apk signature context ref feature

## v0.5.0 (2017-02-04)

* adds feature to disable logging for entries or entire pages
* adds feature to get log of pages as StringBuilder
* fix showing null if uses-feature requires glEsVersion and has no name (used often for Google Maps)

### Migration from v0.4.x

* Use PageEntry.disableLogging() instead of Hood.get().createHeaderEntry(String,bool) to disable it in logging

## v0.4.4 (2017-01-30)

* minor demo app layout fix
* build script fixes
* deploy noop fix

## v0.4.3 (2017-01-30)

* fixes toolbar tinting/coloring regression

## v0.4.2 (2017-01-29)

* adds feature to be able to theme toolbar text & icons
* adds playstore link default

## v0.4.1 (2017-01-27)

* fixes bug in demo activity were application context was used in shake detector to start activity

## v0.4.0 (2017-01-26)

* adds view type to PageEntry interface
* fixes async property loading
* fixes reusing view templates instead of creating new ones
* fixes shake detector starting activity twice

## v0.3.0 (2017-01-21)

* fixes typo in interface ValueSet
* renames HoodThemeBaseLight to HoodThemeLight

## v0.2.3 (2017-01-20)

* fixes theming issues
* moves no-op to own build type
* fixes publish script
* fixes correct use of ViewTemplate
* adds doc

## v0.2.0 (2017-01-18)

initial release
