---
title: 'changelog'
date: 2016-09-11
lastmod: 2023-07-29
url: opensource/uber-adb-tools/changelog
showSummary: false
showTableOfContents: false
type: opensource-additional
---
# Releases

## v1.0.4
* update various dependencies and plugins
* migrate to github actions & sonaqube

## v1.0.3
* update various dependencies and plugins
* use newer launch4J version, which should be compatible with Java 9/10
* switch to maven wrapper

## v1.0.2
* No-Arg install will try to reinstall the app (usage with just the apk without any arguments)
* Add MiB indicator to install command

## v1.0.1
* do not use `javax.xml.bind.*` dependencies, that might crash on jre9

## v1.0.0
* will not prompt user on install if only 1 device present and only 1 apk to install

## v0.9.2
* adds .exe launcher

## v0.9.1
* fixes bug where 'clear', 'force-stop' and 'start-activity' would not work if more than 1 device was connected

## v0.9.0
* adds start activity feature
* downscales bug report screenshots if they are too big (>2MB)
* more bug report logs
* more app info output (hash)

## v0.8.0
* adds wait-for-device feature
* adds app-info feature
* adds clear app data feature
* adds force stop feature
* adds dumpsys options for bugreport and simple bugreport flag
* adds multi file/folder arg for install
* changes multi package syntax to use space seperated list instead of comma

## v0.7.0
* fix bug in adb location finding
* fix bug in os selector
* adds test for adb tool
* bugreport includes dumsys, installed apps and current processes
* process returns different ints depending on state
* better adb error parsing

## v0.6.0
* adds 'bugreports' feature with custom intent support
*changes most command line arguments to use 2 hyphens including additional short cmd versions

## v0.5.0
* adds -install & -uninstall argument
* install can use folder or file as source
* new -upgrade argument to be able to reinstall apps
* renaming of the the tool to 'uber-adbtools'

## v0.3.0
* fixes '-k' option bug
* adds ask/force option
* small changes in output

## v0.2.0
* tested & fixed with ubunut + mac
* new -debug flag
* new default locations including `ANDROID_HOME`

## v0.1.0
* wildcard support
* multi device support
* multi package support

Untested on Linux/Mac
