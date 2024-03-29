---
title: 'dice'
date: 2017-08-14
lastmod: 2023-04-02
description: 'A cryptographically secure pseudorandom number generator cli tool printing in a wide variety of byte encodings (hex, base64,..) and for many programming languages (c, java, c#, php, etc.)  using NIST SP800-90Ar1 HMAC-DRBG. Supports external seeding from various true random services.'
summary: 'A cryptographically secure pseudorandom number generator cli tool printing in a wide variety of byte encodings (hex, base64,..) and for many programming languages (c, java, c#, php, etc.)  using NIST SP800-90Ar1 HMAC-DRBG. Supports external seeding from various true random services.'
aliases: ['/link/jz4twu2m','/opensource/2017/dice']
url: opensource/dice
tags: ["base32", "base36", "base64", "base85"]
keywords: ["base32", "base36", "base64", "base85", "cli", "encoding", "entropy-source", "hex", "hmac-drbg", "hotbits", "java", "nist", "octal", "prng", "random-number-generators", "seed", "sp800-90a", "text-encodings"]
alltags: ["base32", "base36", "base64", "base85", "cli", "encoding", "entropy-source", "hex", "hmac-drbg", "hotbits", "java", "nist", "octal", "prng", "random-number-generators", "seed", "sp800-90a", "text-encodings", "github", "Java"]
categories: ["opensource"]
editURL: https://github.com/patrickfav/dice
showAuthor: true
deeplink: /link/jz4twu2m
originalContentLink: https://github.com/patrickfav/dice
originalContentType: github
originalContentId: 100255165
githubCloneUrlHttp: https://github.com/patrickfav/dice.git
githubStars: 11
githubForks: 6
githubWatchers: 4
githubContributors: 1
githubRepoSize: 40845
githubLanguage: Java
githubHomepage: https://favr.dev/opensource/dice
githubDefaultBranch: main
githubOpenIssues: 1
githubIsFork: false
githubLatestVersion: v1.7.0
githubLatestVersionDate: 2023-03-11T12:09:26Z
githubLatestVersionUrl: https://github.com/patrickfav/dice/releases/tag/v1.7.0
githubLicense: Apache License 2.0
---
# Dice

A cryptographically secure pseudo-random number generator [CLI](https://en.wikipedia.org/wiki/Command-line_interface) tool which generates byte arrays with entropy from the best random source from your machine* optionally externally seeded by multiple true random number generators and supports various [byte-to-text encodings](https://en.wikipedia.org/wiki/Binary-to-text_encoding) like [hex](https://en.wikipedia.org/wiki/Hexadecimal#Transfer_encoding) or [base64](https://en.wikipedia.org/wiki/Base64) and for many programming languages. The output may be printed to the command line or to a file. This implementation uses the HMAC Deterministic Random Bit Generator (DRBG) schema as defined in [NIST](https://www.nist.gov/)  [SP800-90Ar1](http://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-90Ar1.pdf).







<sup>* depending on the used [provider](https://docs.oracle.com/javase/8/docs/technotes/guides/security/SunProviders.html#SecureRandomImp)</sup>

 ![logo](img_9ceb577441259837.png)

**Main features:**

 * Supports all common byte encodings and more (hex, [base32](https://en.wikipedia.org/wiki/Base32), [base36](https://en.wikipedia.org/wiki/Base36), base64, [base85](https://en.wikipedia.org/wiki/Ascii85#RFC_1924_version), etc.)
 * Optional secure seeding of random generator with [random.org](https://www.random.org/) and [ANU Quantum Random Numbers Server](https://qrng.anu.edu.au/)
 * Generates code for random byte arrays for many programming languages (java, c, c#, kotlin, python, swift, go,...)
 * [NIST SP800-90Ar1 HMAC_DRBG](http://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-90Ar1.pdf) tested with official [test vectors](https://csrc.nist.gov/projects/cryptographic-algorithm-validation-program)
 * Output to command line or file with automatic column formatting with upper limit of 10GiB+ of random data (~20MiB/s)
 * Entropy warnings if seed is weak
 * Additional output configuration like "[www-form-urlencoding](https://en.wikipedia.org/wiki/Percent-encoding)", padding of output and appended [crc32 checksum](https://en.wikipedia.org/wiki/Cyclic_redundancy_check)

Example usage generating randoms with 24 _byte-length_ (not char length) and default encoding:

    java -jar dice.jar 24

_More examples:_
    
    java -jar dice.jar 16 --count 100
    java -jar dice.jar 16 --encoding "base64"
    java -jar dice.jar 16 --encoding "java"
    java -jar dice.jar 4096 --encoding "raw" --count 1024 --file "./rnd-4-MiB-outputfile.txt"
    java -jar dice.jar 16 --seed "myBadRandomSeed"
    java -jar dice.jar 16 --offline
    java -jar dice.jar 32 --encoding "base85" --urlencode --padding --crc32

This should run on any Windows, Mac or Linux machine.

### Requirements

* [Java Runtime Environment (JRE) 8](http://www.oracle.com/technetwork/java/javase/downloads/jre8-downloads-2133155.html)

## Download

**[Grab jar from the latest Release](https://github.com/patrickfav/dice/releases/latest)**

_Using the *.exe Launcher: [Launch4J](http://launch4j.sourceforge.net/) is used to wrap the `.jar` into a Windows executable. It should automatically download the needed JRE if required._

## Demo

[![asciicast](img_52702b9784289914.png)](https://asciinema.org/a/140170)

## Use Cases

### Creating Nonces, Tokens, Identifiers or Passwords

I'll recommend `base32`, `base36` or `base58` because these encodings are typically url-safe. 16 byte usually suffice for globally unique, infeasible to brute force number.

    java -jar dice.jar 16 -e "base36"

If you require fixed char-sized output either use `hex` encoding or other encodings supporting paddings like `base32` or `base64`. For passwords, high-density encodings are recommended like `base85`.

### Creating static byte arrays for your application

You can create static salts, or randoms to hardcode, in your code. Just pick
your programming language to get the correct syntax (see below). E.g.:

    java -jar dice.jar 16 -e "java"

### Creating files of entropy

Create a file 4MiB full of raw random bytes with this call:

    java -jar dice.jar 4096 -c 1024 -e "raw" -f "./rnd-outfile.txt"

This will create random chunks of 4Kib (the maximum allowed size per chunk) repeated 1024 times. Currently, the tool is capped to 10 GiB of generated random data per call. Successive calls will append data, not overwrite it. 

## Command Line Interface

       --anuquantum             Enable external, supposed true random generator ANU Quantum; note this service is known
                                to be slow (only when online).
    -c,--count <number>         How many randoms should be generated. Automatically chosen if this argument is omitted.
       --crc32                  If this flag is set, 4 bytes of CRC32 checksum will be appended to every random value.
                                If you need to check the integrity of the data.
    -d,--debug                  Prints additional info for debugging.
    -e,--encoding <string>      Output byte-to-text encoding. Available encodings include:
                                binary, octal, dec, base16, BASE16, base26, base32, base36, base58, base64, base64-url,
                                base85, c, c#, java, go, kotlin, node, js, perl, php, python3, ruby, rust, swift, img,
                                raw, utf8
    -f,--file <path>            Prints the random data to given file instead of the command line. Will create the file
                                if it does not exist or append the data if it does.
    -h,--help                   Shows this page.
    -o,--offline                Skips request to external random generators (random.org) for seeding (use when
                                offline).
    -p,--padding                If this flag is set, byte-to-text output will be padded to full byte if needed.
    -r,--robot                  If this flag is set, output will be more friendly for scripting (ie. no verbose text,
                                only the randoms 1 per line)
    -s,--seed <string|number>   Uses either the 64-bit integer interpretation or the utf-8 byte representation of given
                                parameter to seed the internal random generator. Warns if entropy is low.
    -u,--urlencode              Uses 'www-form-urlencoded' encoding scheme, also misleadingly known as URL encoding, on
                                the output strings
    -v,--version                Prints application version.


## Supported Encodings

### Byte-to-Text Encodings

| Name       | Example                                                          | Efficiency | Padding | Description                                                                                                                                                                                                  |
|------------|------------------------------------------------------------------|-----------:|:-------:|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| binary     | `11101101 10101111 00011110 11111111 11111101 10010100 01001010` |     12.5 % |  false  | A simple binary representation with '0' and '1' divided into 8 bit groups.                                                                                                                                   |
| octal      | `1124517677707527755`                                            |     37.5 % |  true   | The octal numeral system, is the base-8 number system, and uses the digits 0 to 7.                                                                                                                           |
| dec        | `20992966904426477`                                              |     41.5 % |  true   | Decimal positive sign-magnitude representation representation in big-endian byte-order.                                                                                                                      |
| base16     | `4a94fdff1eafed`                                                 |     50.0 % |  false  | Base16 or hex stores each byte as a pair of hexadecimal digits. Lowercase (a-f) letters are used for digits greater than 9.                                                                                  |
| BASE16     | `4A94FDFF1EAFED`                                                 |     50.0 % |  false  | Base16 or hex stores each byte as a pair of hexadecimal digits. Uppercase (A-F) letters are used for digits greater than 9.                                                                                  |
| base26     | `FSSLZZFNQZQZ`                                                   |     58.8 % |  true   | Base26 uses the twenty-six letters A-Z.                                                                                                                                                                      |
| base32     | `JKKP37Y6V7WQ`                                                   |     62.5 % |  true   | Base32 uses a 32-character subset of the twenty-six letters A-Z and the digits 2-7. Uses the alphabet defined in RFC 4648.                                                                                   |
| base36     | `5qpdvuwjvu5`                                                    |     64.6 % |  true   | Base36 translating into a radix-36 (aka Hexatrigesimal) representation.                                                                                                                                      |
| base58     | `3pvkeHJmHN`                                                     |     73.2 % |  true   | Base58 is similar to Base64 but has been modified to avoid both non-alphanumeric characters and letters which might look ambiguous when printed. This version uses the alphabet common for Bitcoin protocol. |
| base64     | `SpT9/x6v7Q`                                                     |     75.0 % |  true   | Base64 represent binary data in an ASCII string format by translating it into a radix-64 representation.                                                                                                     |
| base64-url | `SpT9_x6v7Q`                                                     |     75.0 % |  true   | Base64 represent binary data in an ASCII string format by translating it into a radix-64 representation. Uses url safe mode                                                                                  |
| base85     | `8sK;S*j=r`                                                      |     80.1 % |  true   | Base85 uses an 85 character ASCII alphabet to encode. It's main use is with the PDF format and GIT.                                                                                                          |

### Programming Languages

|    Name    | Example                                                             |
|:----------:|---------------------------------------------------------------------|
|     c      | `{0xD0, 0x3A, 0x4A, 0xEE, 0x64, 0x11};`                             |
|     c#     | `new byte[]{0xD0, 0x3A, 0x4A, 0xEE, 0x64, 0x11};`                   |
|    java    | `new byte[]{(byte) 0xD0, 0x3A, 0x4A, (byte) 0xEE, 0x64, 0x11};`     |
|     go     | `[...]byte = {0xD0, 0x3A, 0x4A, 0xEE, 0x64, 0x11}`                  |
|   kotlin   | `byteArrayOf(0xD0.toByte(), 0x3A, 0x4A, 0xEE.toByte(), 0x64, 0x11)` |
|    node    | `new Buffer([0xD0, 0x3A, 0x4A, 0xEE, 0x64, 0x11]);`                 |
| javascript | `Uint8Array.from([0xD0, 0x3A, 0x4A, 0xEE, 0x64, 0x11]);`            |
|    perl    | `pack 0xD0, 0x3A, 0x4A, 0xEE, 0x64, 0x11;`                          |
|    php     | `array(208, 58, 74, 238, 100, 17);`                                 |
|  python3   | `bytes([0xD0, 0x3A, 0x4A, 0xEE, 0x64, 0x11])`                       |
|    ruby    | `[0xD0, 0x3A, 0x4A, 0xEE, 0x64, 0x11]`                              |
|    rust    | `[u8; 6] = [0xd0, 0x3a, 0x4a, 0xee, 0x64, 0x11];`                   |
|   swift    | `[UInt8] = [0xD0, 0x3A, 0x4A, 0xEE, 0x64, 0x11]`                    |

### Other

| Name | Example   | Description                                                                                                          |
|------|-----------|----------------------------------------------------------------------------------------------------------------------|
| raw  | `Jýÿ¯í` | Prints the raw byte array encoded in ISO_8859_1 which does not change the byte output. Most useful with file output. |
| utf8 | `J�����` | Prints the byte array interpreted as UTF-8 encoded text. Only for testing purpose.                                   |
| img  | `▙▝▚░▓▃`  | Prints a byte per character encoded in unicode block elements.                                                       |


## Digital Signatures

### Signed Jar

The provided JARs in the GitHub release page are signed with my private key:

    CN=Patrick Favre-Bulle, OU=Private, O=PF Github Open Source, L=Vienna, ST=Vienna, C=AT
    Validity: Thu Sep 07 16:40:57 SGT 2017 to: Fri Feb 10 16:40:57 SGT 2034
    SHA1: 06:DE:F2:C5:F7:BC:0C:11:ED:35:E2:0F:B1:9F:78:99:0F:BE:43:C4
    SHA256: 2B:65:33:B0:1C:0D:2A:69:4E:2D:53:8F:29:D5:6C:D6:87:AF:06:42:1F:1A:EE:B3:3C:E0:6D:0B:65:A1:AA:88

Use the jarsigner tool (found in your `$JAVA_HOME/bin` folder) folder to verify.

### Signed Commits

All tags and commits by me are signed with git with my private key:

    GPG key ID: 4FDF85343912A3AB
    Fingerprint: 2FB392FB05158589B767960C4FDF85343912A3AB

## Deterministic Random Bit Generation

As [cryptographically secure pseudorandom number generator](https://en.wikipedia.org/wiki/Cryptographically_secure_pseudorandom_number_generator), the [NIST SP800-90Ar1](http://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-90Ar1.pdf) recommendation `HMAC-DRBG` is used in an implementation derived from the [google/rappor](https://github.com/google/rappor) project. HMAC-DRBG seems to be a [better choice than the also recommended HASH-DRBG approach](https://crypto.stackexchange.com/questions/1393/is-hmac-drbg-or-hash-drbg-stronger). [Java 9](http://openjdk.java.net/jeps/273) is expected to have its own provider for it. There [is no known issue with Java's current SHA1-PRNG](https://security.stackexchange.com/questions/47871/how-securely-random-is-oracles-java-security-securerandom) implementation, but it is less studied thant the NIST recommendation.

This implementation uses HMAC-SHA512 internally and reseeds itself after
1 MiB of random data generation which is well below the maximum NIST
recommendation.

_References:_

* [Bruce Schneider: Proof that HMAC-DRBG has No Back Doors](https://www.schneier.com/blog/archives/2017/08/proof_that_hmac.html)
* [Formal Verification of the HMAC-DRBG Pseudo Random Number Generator](https://www.cs.cmu.edu/~kqy/resources/thesis.pdf)
* [Security Analysis of DRBG Using HMAC in NIST SP800-90Ar1](http://repo.flib.u-fukui.ac.jp/dspace/bitstream/10098/2126/1/art.pdf)

### Output Test Results

This PRNG was tested with Robert G. Brown's [dieharder](http://webhome.phy.duke.edu/~rgb/General/dieharder.php) test suite for random number generators, which among others, includes the [ NIST Statistical Test Suite](http://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-22r1a.pdf).

The reports can be seen in `/misc/reports/*` in this repo.


### DRBG Seeding & Input Sources

A DRGB needs to be seeded by strong entropy sources, so it can safely
be expanded to create unpredictable pseudo random output. SP800-90Ar1 defines
different types of input for the DRGB. This implementation uses the following
types:

#### Entropy Input

This implementation uses multiple entropy sources to seed its random
bit generator. All these sources are combined and a weak source will not
weaken the overall output. This ensures that even if one source fails
the output is still cryptographically strong. Below is a detailed
description of the used sources:

##### Strong Secure Random Seed

This is the main entropy source. This implementation uses the `SecureRandom` class with
its `getStrongInstance()` constructor to get [the best cryptographic random generator available](https://www.synopsys.com/blogs/software-security/proper-use-of-javas-securerandom/). Internally `SecureRandom` chooses among [providers available at runtime](https://docs.oracle.com/javase/8/docs/technotes/guides/security/SunProviders.html#SecureRandomImp). The best of those access the OS own entropy pools (e.g. `/dev/random` in *nix systems) since the OS has better access to various random sources.

_Further reading:_

* [The Right Way to use Secure Random](https://tersesystems.com/2015/12/17/the-right-way-to-use-securerandom/)
* [Discussion on seeding random generators](https://crypto.stackexchange.com/questions/51218/practical-way-to-generate-random-numbers-from-prng-which-are-indistinguishable-f)

##### External Random Service Seeding

Per default the tool tries to fetch a seed from an external (supposedly true) random source.

Because there are various opinions what technique delivers truly random data, this tool
incorporates 3 different services backed by different hardware RNG. Also, to mitigate the fact
that if one or more source is either compromised or produces predictable outcome, the other source
will mitigate that flaw.

Using an external random might open a new attack vector if, for example,
an attacker might read the seed send over the network. There are 2
measures against this:

* The connections are encrypted with TLS (i.e. HTTPS) and the random
is signed by the creator which will be verified by a local pinned certificate (only random.org).
* The seed is only a part of the entropy source and the knowledge of it does not
make it possible to guess the random bits. Therefore, there is no sole trust in
an external service. Every generation of random data will see seeding from both
local and external sources.

[HMAC-based key derivation function (HKDF)](https://en.wikipedia.org/wiki/HKDF)
 described in [RFC5869](https://tools.ietf.org/html/rfc5869) is used to expand the external seed to the desired length.

###### Random.org

[Random.org](https://www.random.org/) is a website that produces "true random numbers" based on atmospheric noise captured by several radios tuned between stations. The service has existed since 1998 and was built by [Dr. Mads Haahr](https://www.scss.tcd.ie/Mads.Haahr/) of the [School of Computer Science and Statistics at Trinity College](https://www.scss.tcd.ie/), Dublin in Ireland.
Random.org offers [Transport Layer Security (TLS)](https://en.wikipedia.org/wiki/Transport_Layer_Security) encrypted access and signed random data with [JSON-RPC 2.0](http://www.jsonrpc.org/specification)

_References:_
* [Statistical Analysis](https://www.random.org/analysis/)
* [Wikipedia Link](https://en.wikipedia.org/wiki/Random.org)

###### Hotbits

[Hotbits](https://www.fourmilab.ch/hotbits/retired.html) is not supported anymore since 1st of Jan 2023 and was removed in dice version 1.8.0.

###### ANU Quantum Random Numbers Server

A quantum random number generator [offered by the Australian National University](https://qrng.anu.edu.au/).
The random numbers are generated in real-time by measuring the quantum fluctuations of the vacuum. The services provide
a TLS encrypted JSON/REST API.

_References:_
* [Statistical Analysis](http://qrng.anu.edu.au)
* [Random Generator Paper](http://aip.scitation.org/doi/10.1063/1.3597793)

##### Local seeding

The caller may provide a string that additionally seeds the random bit generator. A seed provided by the user is seen as weak seed and will always
be combined with the internal state of a strong `SecureRandom` instance.

##### Threaded Seed Generator

A port of SUN's threaded [seed generator](http://grepcode.com/file/repository.grepcode.com/java/root/jdk/openjdk/6-b14/sun/security/provider/SeedGenerator.java) by [Joshua Bloch](https://en.wikipedia.org/wiki/Joshua_Bloch). The seed is produced by counting the number of times the VM manages to loop in a given period. This number roughly reflects the machine load at that point in time. The samples are translated using a permutation (s-box) and then XORed together. This process is non-linear and should prevent the samples from "averaging out". This implementation uses faster timings to produce values faster.

This generator is mainly used as a fallback if there is no external seed and the internal seeds fail.

### Nonce Input

The nonce is composed of:

* Monotonically increasing sequence number with a starting value of current JVM startup time
* System nanosecond time (which has arbitrary starting point)
* JVM uptime in milliseconds
* Current elapsed milliseconds since January 1, 1970, UTC.

The four 8 byte values will be hashed with HKDF.

### Personalization String

The goal of a personalization string is to gather as much information about
e.g. runtime, machine identifiers and static identifiers to make the call as
unique as possible for this particular machine/runtime/version/etc.

For this the following data will be gathered:

* MAC address of all network adapters
* Runtime & OS information (e.g. uptime, current cpu usage, processor count, classpath)
* SCM information (e.g. commit hash, committer, etc.) & version name
* Environmental variables and system properties
* Content of the temp directory

The resulting data will be hashed with HKDF.

## Example Data

Under `misc/example` a couple of files of example random data can be found (e.g. 1MiB and 10MiB)

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

Use maven (3.1+) to create a jar including all dependencies

    mvn clean install

### Checkstyle Config File

This project uses my [`common-parent`](https://github.com/patrickfav/mvn-common-parent) which centralized a lot of
the plugin versions as well as providing the checkstyle config rules. Specifically they are maintained in [`checkstyle-config`](https://github.com/patrickfav/checkstyle-config). Locally the files will be copied after you `mvnw install` into your `target` folder and is called
`target/checkstyle-checker.xml`. So if you use a plugin for your IDE, use this file as your local configuration.

## Tech-Stack

* Java 8
* Maven
* rxjava2, apache-commons-codec, apache-commons-cli, Retrofit 2
* Proguard, Launch4j, Jar Signing

# Credits

* HMAC_DRBG implementation derived from [google/rappor](https://github.com/google/rappor)
* Icon based on cube icon made by [Smashicons](https://www.flaticon.com/authors/smashicons)

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
