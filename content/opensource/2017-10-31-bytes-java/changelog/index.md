---
title: 'changelog'
date: 2017-10-31
lastmod: 2023-03-13
lastfetch: 2023-03-13T14:22:35.869Z
url: opensource//bytes-java/changelog
showSummary: false
showTableOfContents: false
---
# Releases

## v1.6.1

* now build by JDK 11 and removed errorprone compiler #52
* introduce sonarqube and remove codecov
* improve javadoc by fixing many typos #53
* some small bugfixes

## v1.6.0

* migrate to github actions, codecov and maven central #49
* add `indexOf` (thx @hlyakhovich) #48
* add `toShortArray` (thx @hlyakhovich) #44
* add `from()` constructor from `short` vararg or array (thx @hlyakhovich) #45
* add an automatic module name to support the JPMS (thx @airsquared) #47
* fix warning of junit 4.13 CVE-2020-15250

## v1.5.0

* fix `leftShift()` and `rightShift()` to respect byte order (thx @gfpeltier)
* fix `bitAt()` to respect byte order (thx @gfpeltier)

## v1.4.0

* add `from()` constructor from `float[]`
* add `from()` constructor from `double[]`
* fix throwing `IllegalArgumentException` instead of `IllegalStateException` in `.toUUID()`

## v1.3.0
* improve hex encoder performance by factor 5

## v1.2.0

* let hex decoder accept odd length string #37

## v1.1.0

* add `unsecureRandom()` constructor which creates random for e.g. tests or deterministic randoms
* adds overwrite method to Bytes (thx @JadePaukkunen)
* make project OSGi compatible #36
* add `toFloatArray()` converter #30
* add `toDoubleArray()` converter #30

## v1.0.0

* add `append()` method supporting multiple byte arrays #26
* add `toCharArray()` method which decodes internal byte array to char[] #27
* add `encodeBase64()` supporting padding-less encoding
* add `toIntArray()` converter #28
* add `toLongArray()` converter #29
* add `AutoCloseable` to MutableBytes interface #31
* add `allocate()` as mutable byte static constructor (thx @petrukhnov)

### Breaking

* removed deprecated `toObjectArray()`; use `toBoxedArray()` instead

## v0.8.0

* add radix encoding/parsing and fix radix tests #6, #20
* add support for Base32 RFC4648 non-hex alphabet encoding/parsing #21
* add constructor for `IntBuffer` and `CharBuffer`
* `parse()` methods now expect more flexible `CharSequence` instead of `String` #23
* `from()` constructor reading from `char[]` has new version that accepts offset and length #24
* add `from()` constructor reading file with offset and length parameter #25

### Breaking

* interface `BinaryToTextEncoding.decode()` changed param to `CharSequence` from `String` #23

### Deprecations (will be removed in v1.0+)

* `parseBase36()`/`encodeBase36()` - use `parseRadix(36)`/`encodeRadix(36)` instead

## v0.7.1

* sign AFTER ProGuard so optimized version has correct jar signature

## v0.7.0

 * add `count` method for counting byte arrays (like pattern matching)
 * add dedicated `md5` and `sha1` transformer methods
 * add `from(Inputstream stream, int maxlength)` limiting stream reading constructor #13
 * add indexOf() with `fromIndex` parameter #14
 * add support for base64 url safe encoding #15
 * use EMPTY constant instance for empty byte array to safe memory #16
 * add `startsWith()` and `endsWidth()` methods #12
 * add cache for calculating the hashCode
 * add HMAC byte transformer #11
 * add unsigned sort transformer #17
 * add `.immutable()` converter in MutableBytes #18

## v0.6.0

 * add `encodeCharsetToBytes()` feature #7
 * add new `from(char[] charArray, Charset charset)` constructor with improved logic #8
 * add constructor/converter from/to UUID #9
 * add `empty()` constructor, creating empty byte array

### Deprecations (will be removed in v1.0+)

* `toObjectArray()` renamed to `toBoxedArray()`

## v0.5.0

 * better resource handling for compression
 * add nullSafe from() constructor
 * rename `toObjectArray()` to `toBoxedArray()` (will be removed in 1.0)
 * add appendNullSafe and append string with encoding
 * add proguard optimized version (can be used with classifier 'optimized')
 * add constant time equals
 * fix or() operator using and() internally #2

## v0.4.6

* add appending with strings
* add boolean, float, double and char array constructor
* try to fix radix encoder missing prefixing 0 byte

## v0.4.5

* add nullSafe wrapper
* fix accepting illegal hex string when parsing

## v0.4.4

* add feature for gathering parts of the array as primitives (e.g. intAt(int position))
* add to unsigned byte conversations
* add overloaded equals

## v0.4.3

* add toFloat/toDouble
* add resize mode (from 0 or length)
* fix bitAt bug
* add in place byte array shift feature

## v0.4.2

* add check method if transformer supports inplace
* add contains method
* add Iterable interface
* add setByteAt
* add construction from DataInput

## v0.4.1

* add bitAt() utility
* add hash feature
* add checksum transformer
* add gzip transformer

## v0.4.0

* logical expressions in validators
* more validators

## v0.3.1

* better validation and more creation possibilities
* create from bigInteger, int[], long[] and Byte[]

## v0.3.0

* better type hierarchy with read-only and mutable types
* add validator feature
* add bit switch feature

## v0.2.0

initial version
