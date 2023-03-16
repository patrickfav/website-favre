---
title: 'hkdf'
date: 2017-09-30
lastmod: 2023-03-08
lastfetch: 2023-03-16T21:33:44.241Z
description: 'A standalone Java 7 implementation of HMAC-based key derivation function (HKDF) defined in RFC 5869 first described by Hugo Krawczyk. HKDF follows the "extract-then-expand" paradigm which is compatible to NIST 800-56C Rev. 1 two step KDF'
summary: 'A standalone Java 7 implementation of HMAC-based key derivation function (HKDF) defined in RFC 5869 first described by Hugo Krawczyk. HKDF follows the "extract-then-expand" paradigm which is compatible to NIST 800-56C Rev. 1 two step KDF'
aliases: ['/link/but98ei8','/opensource/2017/hkdf']
url: opensource/hkdf
tags: ["800-56c", "android-compatibility", "cryptography", "hash"]
keywords: ["800-56c", "android-compatibility", "cryptography", "hash", "hkdf", "hmac", "hmac-sha1", "hmac-sha256", "hmac-sha512", "java", "java7", "jdk7", "kdf", "key-derivation-function", "nist", "rfc5869", "two-step-key-derivation"]
alltags: ["800-56c", "android-compatibility", "cryptography", "hash", "hkdf", "hmac", "hmac-sha1", "hmac-sha256", "hmac-sha512", "java", "java7", "jdk7", "kdf", "key-derivation-function", "nist", "rfc5869", "two-step-key-derivation", "github", "Java"]
categories: ["opensource"]
editURL: https://github.com/patrickfav/hkdf
showAuthor: true
deeplink: /link/but98ei8
originalContentLink: https://github.com/patrickfav/hkdf
originalContentType: github
githubCloneUrlHttp: https://github.com/patrickfav/hkdf.git
githubStars: 52
githubForks: 11
githubWatchers: 52
githubLanguage: Java
githubHomepage: https://favr.dev/opensource/hkdf
githubDefaultBranch: main
githubOpenIssues: 1
githubIsFork: false
githubLatestVersion: v2.0.0
githubLatestVersionDate: 2023-02-11T22:20:28Z
githubLatestVersionUrl: https://github.com/patrickfav/hkdf/releases/tag/v2.0.0
githubLicense: Apache License 2.0
---
# HMAC-based Key Derivation Function (HKDF) RFC 5869

[Hashed Message Authentication Code](https://en.wikipedia.org/wiki/Hash-based_message_authentication_code) (HMAC)-based
key derivation function ([HKDF](https://en.wikipedia.org/wiki/HKDF)), can be used as a building block in various
protocols and applications. The [key derivation function](https://en.wikipedia.org/wiki/Key_derivation_function) (KDF)
is intended to support a wide range of applications and requirements, and is conservative in its use
of [cryptographic hash functions](https://en.wikipedia.org/wiki/Cryptographic_hash_function). It is likely to
have [better security properties](https://crypto.stackexchange.com/questions/13232/how-is-hkdf-expand-better-than-a-simple-hash)
than KDF's based on just a hash functions alone. See [RFC 5869](https://tools.ietf.org/html/rfc5869) for full detail.
HKDF specifies a version of
the [NIST Special Publication 800-56C](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-56Cr1.pdf) "
Two-Step Key Derivation" scheme.

[](https://mvnrepository.com/artifact/at.favre.lib/hkdf)
[](https://github.com/patrickfav/hkdf/actions)
[](https://www.javadoc.io/doc/at.favre.lib/hkdf)
[](https://sonarcloud.io/summary/new_code?id=patrickfav_hkdf)
[](https://sonarcloud.io/summary/new_code?id=patrickfav_hkdf)
[](https://sonarcloud.io/summary/new_code?id=patrickfav_hkdf)

This is a standalone, lightweight, simple to use, fully tested and stable implementation in Java. The code is compiled
with target [Java 7](https://en.wikipedia.org/wiki/Java_version_history#Java_SE_7) to be compatible with most [
_Android_](https://www.android.com/) versions as well as normal Java applications. It passes all test vectors
from [RFC 5869 Appendix A.](https://tools.ietf.org/html/rfc5869#appendix-A)

## Quickstart

Add dependency to your `pom.xml` ([check latest release](https://github.com/patrickfav/hkdf/releases)):

```xml
<dependency>
    <groupId>at.favre.lib</groupId>
    <artifactId>hkdf</artifactId>
    <version>{latest-version}</version>
</dependency>
```

A very simple example:

```java
byte[] pseudoRandomKey = HKDF.fromHmacSha256().extract(null, lowEntropyInput);
byte[] outputKeyingMaterial = HKDF.fromHmacSha256().expand(pseudoRandomKey, null, 64);
```

### Full Example

This example creates a high-quality [AES](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) secret key and initialization vector from a shared secret calculated by a [key agreement](https://en.wikipedia.org/wiki/Key-agreement_protocol) protocol and encrypts with [CBC](https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#CBC) block mode:

```java
//if no dynamic salt is available, a static salt is better than null
byte[] staticSalt32Byte = new byte[]{(byte) 0xDA, (byte) 0xAC, 0x3E, 0x10, 0x55, (byte) 0xB5, (byte) 0xF1, 0x3E, 0x53, (byte) 0xE4, 0x70, (byte) 0xA8, 0x77, 0x79, (byte) 0x8E, 0x0A, (byte) 0x89, (byte) 0xAE, (byte) 0x96, 0x5F, 0x19, 0x5D, 0x53, 0x62, 0x58, (byte) 0x84, 0x2C, 0x09, (byte) 0xAD, 0x6E, 0x20, (byte) 0xD4};

//example input
byte[] sharedSecret = ...;

HKDF hkdf = HKDF.fromHmacSha256();

//extract the "raw" data to create output with concentrated entropy
byte[] pseudoRandomKey = hkdf.extract(staticSalt32Byte, sharedSecret);

//create expanded bytes for e.g. AES secret key and IV
byte[] expandedAesKey = hkdf.expand(pseudoRandomKey, "aes-key".getBytes(StandardCharsets.UTF_8), 16);
byte[] expandedIv = hkdf.expand(pseudoRandomKey, "aes-iv".getBytes(StandardCharsets.UTF_8), 16);

//Example boilerplate encrypting a simple string with created key/iv
SecretKey key = new SecretKeySpec(expandedAesKey, "AES"); //AES-128 key
Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
cipher.init(Cipher.ENCRYPT_MODE, key, new IvParameterSpec(expandedIv));
byte[] encrypted = cipher.doFinal("my secret message".getBytes(StandardCharsets.UTF_8));
```

_Note_: HKDF is not suited for password-based key derivation, since it has no key stretching property. Use something like [PBKDF2](https://en.wikipedia.org/wiki/PBKDF2) or [bcrpyt](https://github.com/patrickfav/bcrypt) for that.

### Using custom HMAC implementation

```java
//don't use md5, this is just an example
HKDF hkdfMd5 = HKDF.from(new HkdfMacFactory.Default("HmacMD5", 16, Security.getProvider("SunJCE")));

byte[] lowEntropyInput = new byte[]{0x62, 0x58, (byte) 0x84, 0x2C};
byte[] outputKeyingMaterial = hkdfMd5.extractAndExpand(null, lowEntropyInput null, 32);
```

## Download

The artifacts are deployed to [jcenter](https://bintray.com/bintray/jcenter) and [Maven Central](https://search.maven.org/).

### Maven

Add dependency to your `pom.xml`:

```xml
<dependency>
    <groupId>at.favre.lib</groupId>
    <artifactId>hkdf</artifactId>
    <version>{latest-version}</version>
</dependency>
```

### Gradle

Add to your `build.gradle` module dependencies:

    compile group: 'at.favre.lib', name: 'hkdf', version: '{latest-version}'

### Local Jar

[Grab jar from latest release.](https://github.com/patrickfav/hkdf/releases/latest)


## Description

For the full description see the [RFC 5869](https://tools.ietf.org/html/rfc5869). For
an in-depth discussion about the security considerations [see the Paper "Cryptographic Extraction and Key Derivation: The HKDF Scheme (2010)" by Hugo Krawczyk](https://eprint.iacr.org/2010/264). The following
is a summary of the 2 sources above. If there seems to be a contradiction, the original
sources are always correct over this.

### Extract and Expand

HKDF follows the "extract-then-expand" paradigm, where the KDF logically consists of two modules.

1. To "extract" (condense/blend) entropy from a larger random source to provide a more uniformly unbiased and higher entropy but smaller output. This is done by utilising the diffusion properties of cryptographic MACs.
2. To "expand" the generated output of an already reasonably random input such as an existing shared key into a larger cryptographically independent output, thereby producing multiple keys deterministically from that initial shared key, so that the same process may produce those same secret keys safely on multiple devices, as long as the same inputs are utilised.

Note that some existing KDF specifications, such as NIST Special Publication 800-56A, NIST Special Publication 800-108 and IEEE Standard 1363a-2004, either only consider the second stage (expanding a pseudorandom key), or do not explicitly differentiate between the "extract" and "expand" stages, often resulting in design shortcomings.  The goal of this HKDF is to accommodate a wide range of KDF requirements while minimizing the assumptions about the underlying hash function.

### Use Cases

HKDF is intended for use in a wide variety of KDF applications. Some applications _will not be able_ to use HKDF "as-is" due to specific operational requirements. One significant example is the derivation of cryptographic keys from a source of low entropy, such as a user's password. In the case of _password-based KDFs_, a main goal is to slow down dictionary attacks. HKDF naturally accommodates the use of salt; _however, a slowing down mechanism is not part of this specification_. Therefore, for a user's password, other KDFs might be considered like: [PKDF2](https://en.wikipedia.org/wiki/PBKDF2), [bcryt](https://github.com/patrickfav/bcrypt), [scrypt](https://en.wikipedia.org/wiki/Scrypt) or [Argon2](https://github.com/P-H-C/phc-winner-argon2) which are all designed to be computationally intensive.

#### Key Derivation

The following examples are from [RFC5869 Section 4](https://tools.ietf.org/html/rfc5869#section-4):

* The derivation of cryptographic keys from a shared Diffie-Hellman value in a key-agreement protocol.
* The derivation of symmetric keys from a hybrid public-key encryption scheme.
* Key derivation for key-wrapping mechanisms.

##### Creating multiple keys from a single input

The expand phase includes an "info" parameter which should be used to create
multiple key material from a single PRK source. For example a Secret Key and
IV from a shared Diffie-Hellman Value.

#### Pseudorandom number generator (PRNG)

These two functions may also be combined and used to form a PRNG to improve a random number generator's potentially-biased output, as well as protect it from analysis and help defend the random number generation from malicious inputs.

## Security Relevant Information

### OWASP Dependency Check

This project uses the [OWASP Dependency-Check](https://www.owasp.org/index.php/OWASP_Dependency_Check) which is a utility that identifies project dependencies and checks if there are any known, publicly disclosed, vulnerabilities against a [NIST database](https://nvd.nist.gov/vuln/data-feeds).
The build will fail if any issue is found.

### Digital Signatures

#### Signed Jar

The provided JARs in the Github release page are signed with my private key:

    CN=Patrick Favre-Bulle, OU=Private, O=PF Github Open Source, L=Vienna, ST=Vienna, C=AT
    Validity: Thu Sep 07 16:40:57 SGT 2017 to: Fri Feb 10 16:40:57 SGT 2034
    SHA1: 06:DE:F2:C5:F7:BC:0C:11:ED:35:E2:0F:B1:9F:78:99:0F:BE:43:C4
    SHA256: 2B:65:33:B0:1C:0D:2A:69:4E:2D:53:8F:29:D5:6C:D6:87:AF:06:42:1F:1A:EE:B3:3C:E0:6D:0B:65:A1:AA:88

Use the jarsigner tool (found in your `$JAVA_HOME/bin` folder) folder to verify.

#### Signed Commits

All tags and commits by me are signed with git with my private key:

    GPG key ID: 4FDF85343912A3AB
    Fingerprint: 2FB392FB05158589B767960C4FDF85343912A3AB

## Build

### Jar Sign

If you want to jar sign you need to provide a file `keystore.jks` in the
root folder with the correct credentials set in environment variables (
`OPENSOURCE_PROJECTS_KS_PW` and `OPENSOURCE_PROJECTS_KEY_PW`); alias is
set as `pfopensource`.

If you want to skip jar signing just change the skip configuration in the
`pom.xml` jar sign plugin to true:

    <skip>true</skip>

### Build with Maven

Use the Maven wrapper to create a jar including all dependencies

    mvnw clean install

### Checkstyle Config File

This project uses my [`common-parent`](https://github.com/patrickfav/mvn-common-parent) which centralized a lot of
the plugin versions aswell as providing the checkstyle config rules. Specifically they are maintained in [`checkstyle-config`](https://github.com/patrickfav/checkstyle-config). Locally the files will be copied after you `mvnw install` into your `target` folder and is called
`target/checkstyle-checker.xml`. So if you use a plugin for your IDE, use this file as your local configuration.

## Tech Stack

* Java 7 (+ [errorprone](https://github.com/google/error-prone) static analyzer)
* Maven

## HKDF Implementations in Java

* [Mozilla: sync-crypto](https://github.com/mozilla-services/sync-crypto/blob/master/src/main/java/org/mozilla/android/sync/crypto/HKDF.java)
* [WhisperSystems: libsignal-protocol-java](https://github.com/WhisperSystems/libsignal-protocol-java/blob/master/java/src/main/java/org/whispersystems/libsignal/kdf/HKDF.java)
* [Square: keywhiz](https://github.com/square/keywhiz/blob/master/hkdf/src/main/java/keywhiz/hkdf/Hkdf.java)
* [Bouncy Castle](https://github.com/bcgit/bc-java/blob/master/core/src/main/java/org/bouncycastle/crypto/generators/HKDFBytesGenerator.java)
* [Google Tink](https://github.com/google/tink/blob/6625fcf2cfc3f56fc8babbb0f0388a5983fab65c/java/src/main/java/com/google/crypto/tink/subtle/Hkdf.java)

## Related Libraries

* [BCyrpt Password Hash Function (Java)](https://github.com/patrickfav/bcrypt)
* [Single Step KDF [NIST SP 800-56C] (Java)](https://github.com/patrickfav/singlestep-kdf)

# License

Copyright 2017 Patrick Favre-Bulle

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
