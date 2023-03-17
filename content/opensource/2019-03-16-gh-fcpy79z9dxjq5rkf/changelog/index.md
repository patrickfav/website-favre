---
title: 'changelog'
date: 2019-03-16
lastmod: 2023-02-11
lastfetch: 2023-03-17T17:54:29.304Z
url: opensource/mvn-common-parent/changelog
showSummary: false
showTableOfContents: false
type: opensource-additional
---
# Releases

## 20

* update dependency check & compiler plugin

## 19

* increase duration CVEs are valid and ignore everything below CVSS 3.9
* add jdk17 & jdk17 with errorprone profile
* add site maven plugin version
* update dependency check, surefire, javadoc plugin
* update errorprone to latest 2.18 and to latest 2.10 for java 8

## 18.1

* add property on deploy profile

## 18

* first fully automated version to release directly to maven central

## 17

* add gpg signing

## 16

* update many plugins and dependencies
* migrate to github actions

## 15

* update dependencies (bytes, jackson)
* update plugins (proguard, owasp, versions, surefire, jacoco, checksum)

## 14

* bump junit from 4.13 to 4.13.1 due to minor CVE

## 13

* new property `commonConfig.proguard.configFile` defining location of proguard rules file
* add jacoco minimum coverage ratio check, currently 60% for line, 70% for method and 80% for class

## 12

* new property `commonConfig.compile.errorprone.version`
* add jdk7 compiler profile

### Plugins

* (new) proguard-maven-plugin: 2.2.0 (with Proguard 6.2.2) and jdk auto config

## 11

* add more compiler profiles
* fix jdk 8 errorprone profile

## 10

* add JDK profile feature

## 8/9

* add new property to make it easier to disable errorprone

## 7

### Dependencies

* (new) jackson-core: 2.10.3

## 6

* update maven wrapper
* add a lot of properties to make small customizations easier
* fix most default plugins (clean, install, deploy) at their current version

### Dependencies

* (new) at.favre.lib:bytes: 1.3.0

## 5

* add checkstyle to reporting

### Plugins

* (new) maven-source-plugin: 3.2.1
* checkstyle-plugin: 3.1.1
* maven-jar-plugin: 3.2.0
* checkstyle-config: 2
* jacoco-maven-plugin: 0.8.5
* maven-enforcer-plugin: 3.0.0-M3
* maven-javadoc-plugin: 3.2.0
* dependency-check-maven: 5.3.2
* maven-surefire-plugin: 3.0.0-M4

### Dependencies

* checkstyle: 8.31
* junit: 4.13

## 4

### Plugins

* add checkstyle to check phase (runs on install now)
* enable checkstyle plugin per default

## 3

### Plugins

* versions: 2.7 **(enabled)**
* javadoc: 3.0.1
* owasp-dependency-check: 5.0.0-M1
* checkstyle: 8.19

### Dependencies

* Junit: 4.12

## 2

### Plugins

* add required scm info (consumer should overwrite)

## 1

Initial release

### Plugins

* checkstyle-plugin: 3.0.0
    * checkstyle: 8.18
* compiler plugin: 3.0.0
  * errorprone plugin: 2.8.2
  * errorprone plugin: 2.0.5 (Java 7 compatible)
* jacoco: 0.8.3
* coveralls: 4.3.0
* jarsigner: 3.0.0
* checksum: 1.8
* enforcer: 3.0.0-M2 **(enabled)**


