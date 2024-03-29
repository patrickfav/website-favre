---
title: 'changelog'
date: 2016-02-25
lastmod: 2023-07-07
url: opensource/density-converter/changelog
showSummary: false
showTableOfContents: false
type: opensource-additional
---
# Releases

## v1.0.0-alpha7
* update to jdk11

## v1.0.0-alpha6
* update various dependencies and plugins

## v1.0.0-alpha5
* update various dependencies and plugins
* switch to maven wrapper

## v1.0.0-alpha4
* fixes ios content json format

## v1.0.0-alpha3
* fixes bug in ninepatch where lanczos3 would not scale due to min dimension restrictions
* adds console and gui exe

## v1.0.0-alpha1
* greatly refactor scaling options and logic making it possible to select specific scaling algorithm
* makes project compatible with travis ci
* updates TwelveMonkeys image lib to 3.3.1

Note: this is a early alpha preview - use at your own risk

## v0.9.2
* exchanges imgsclr lib with thumbnailator for scaling resulting in much better quality

## v0.9.1
* new clean before convert option
* "simpler" simple mode

## v0.9.0
* adds web converter suitable for css image-set
* can select abitratry permutation of converters in gui
* ios converter now uses @2x, @3x postfix
* ios converter gets option for either .imageset or root folder
* adds gui advanced mode
* ui polishing
* add better cmd progress visualisation

## v0.8.1
* new button that will open file explorer with destination folder
* removes verbose from GUI
* jpeg quality can now also be 0.75,0.85 and 0.95
* add screen size check

## v0.8.0
* adds keep original flag (for post processors)
* refactors threading design - post processors are now parallel
* fix ninepatch calculation (using net image as dimensions)
* adds mozJpeg lossless jpg compression post processor
* some error handling if post processor cmd application is missing

## v0.7.0
* adds 9-patch support (needs to have .9.png extension and out compression must be png; also only works in Android converter)
* adds ability to I18n cmd & gui
* adds ui tests with testfx

## v0.6.2
* adds Windows converter

## v0.6.1
* adds fixed height dp mode
* fixes some bugs

## v0.6.0
* adds scale mode: fixed width in dp
* adds unit tests

## v0.5.1
* support for svg rendering
* additional support for file types: psd, tiff and bmp
* new same-strict mode in out compression
* ui will now persist settings
* fixed some bugs

> Because svg-renderer batik is used which needs a lot of dependencies, the jar grew to 5MB - use of proguard for future releases is researched

## v0.4.0
* better resize algo
* adds anti aliasing
* adds tvdpi
*fixes jpeg with wrong colors output

## v0.3.0

* fixes pom

## v0.2.0
 initial release
