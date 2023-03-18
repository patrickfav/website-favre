---
title: 'changelog'
date: 2018-07-05
lastmod: 2023-03-07
url: opensource/bcrypt/changelog
showSummary: false
showTableOfContents: false
type: opensource-additional
---
# Releases

## v0.10.2

* Fix deployment setup

## v0.10.1

* Re-Introduce DEFAULT_MAX_PW_LENGTH_BYTE to be code compatible with 0.9.0- (thx for the hint @Andrew-Cottrell)

## v0.10.0

* [BREAKING CHANGE] the null terminator will not be counted to the 72 byte max length anymore. This changes the behaviour IF you used passwords with EXACTLY 72 bytes. #43, #44 (thx @quinot)
* migrate to Maven Central, Github Actions and Codecov #46
* update many dependencies and remove warnings for CVE-2020-15522 (bc) CVE-2020-15250 (junit) -> were never part of production code #41


## v0.9.0
* fix license headers and correct credits to jBcrypt
* add long-password strategy to verifier #21
* fix not returning correct hash version when verifying #24
* allow for custom max password length in Version #22

### Breaking Changes

* `verify(byte[] password, int cost, byte[] salt, byte[] rawBcryptHash23Bytes)` signature changed, added `version` property (see #24)
* `LongPasswordStrategies` factory methods now require the version for the max password length (see #22)
* Verifier now accepts `Version` as a constructor parameter and `verifyStrict` therefore does not need one (see #22)

## v0.8.0

* add new verify API signature accepting char array password and byte array hash #16
* add OSGi support #15

## v0.7.0

* add OSWAP dependency check plugin to Maven POM #14

## v0.6.0

* change verifier that accepts `String` type to accept more flexible `CharSequence`

## v0.5.0

* allow actual 2^31 rounds (fix integer overflow issue with `1<<31`) #7
* use Apache v2 compatible Radix 64 impl and skip OpenJDK one #8
* add JMH benchmark module #11

## v0.4.0

* add cli tool #5
* add (_experimental_) ProGuard optimized version (use maven classifier 'optimized') #4

## v0.3.0

* support 24byte hash out and make null terminator optional (BC style) #3
* use OpenJDK Radix64 encoder implementation #2
* fix issue where string was created internally which cannot be wiped

## v0.2.0

* add String API
* refactor Version to be POJO (so caller can provide own impl)
* add BcryptFormtter
* add more tests

## v0.1.0

initial version
