---
title: 'changelog'
date: 2014-05-26
lastmod: 2023-08-15
url: opensource/dali/changelog
showSummary: false
showTableOfContents: false
type: opensource-additional
---
# Releases

## v0.4.0

* migrate to AndroidX #14
* update AGP to 4, Gradle to 6.5, update compile SDK to 29
* **BREAKING**: Removed `DaliBlurDrawerTogglev4` since it is no longer supported since androidx.appcompat 1.1

## v0.3.8
* update renderscript target to 24 to support 64bit #16

## v0.3.7
* add androidx proguard rules

## v0.3.6
* update support lib version to 27.1.1
* update Gradle to 4.7 and Android Gradle Plugin to 3.1.1
* fix possible memory leak in placeholder transition drawable (thx @buptfarmer)

## v0.3.5
* update support lib version to 26.1.0
* raise minSdk from 10 to 14 due to requirements by support-libs
* all lib dependencies are now `implementation` i.e. cannot be seen by lib users

## v0.3.4
* updates support lib version to 25.1.1

## v0.3.3
* fixes build script to auto upload to maven central
* fixes gradle git command to get commit date
* fixes debug view

## v0.3.2
* updates demo app launcher icon
* adds build number to build config

## v0.3.1
* adds consumer proguard rules in lib
* live blur now renders a couple of frames after the last update was done

## v0.3.0
* first version in jcenter
* updates renderscriptTargetApi to 20
* updates target sdk and build tools to 25
* adds debug view in app

## v0.2.0
 initial release
