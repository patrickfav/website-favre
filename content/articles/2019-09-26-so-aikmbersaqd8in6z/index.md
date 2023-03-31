---
title: 'Q: How to convert a byte array to a hex string in Java?'
date: 2019-09-26
lastmod: 2023-02-26
description: 'How to convert a byte array to a hex string in Java?'
summary: 'This was originally posted as an answer to the question "How to convert a byte array to a hex string in Java?" on stackoverflow.com.'
aliases: [/link/aikmbers]
slug: 2019/how-to-convert-a-byte-array-to-a-hex-string-in-java
tags: ["java", "arrays", "hex"]
keywords: ["java", "arrays", "hex"]
alltags: ["java", "arrays", "hex"]
categories: ["stackoverflow"]
showEdit: false
showSummary: true
type: stackexchange
thumbnail: 'so_banner*'
deeplink: /link/aikmbers
originalContentLink: https://stackoverflow.com/questions/9655181/how-to-convert-a-byte-array-to-a-hex-string-in-java
originalContentType: stackexchange
originalContentId: 58118078
seSite: stackoverflow
seScore: 160
seViews: 966000
seIsAccepted: false
seQuestionId: 9655181
seAnswerLicense: CC BY-SA 4.0
seAnswerLink: https://stackoverflow.com/a/58118078/774398
---
Here are some common options ordered from simple (one-liner) to complex (huge library). If you are interested in performance, see the micro benchmarks below.

Option 1: Code snippet - Simple (only using JDK/Android)
--------------------------------------------------------

### Option 1a: BigInteger

One very simple solution is to use the `BigInteger`'s hex representation:

```java
new BigInteger(1, someByteArray).toString(16);

```

Note that since this handles _numbers_ not arbitrary _byte-strings_ it will omit leading zeros - this may or may not be what you want (e.g. `000AE3` vs `0AE3` for a 3 byte input). This is also very slow, about _100x slower_ compared to option 2.

### Option 1b: String.format()

Using the `%X` placeholder, [`String.format()`](https://docs.oracle.com/javase/8/docs/api/java/util/Formatter.html) is able to encode most primitive types (`short`, `int`, `long`) to hex:

```java
String.format("%X", ByteBuffer.wrap(eightByteArray).getLong());

```

### Option 1c: Integer/Long (only 4/8 Byte Arrays)

If you **exclusively have 4 bytes arrays** you can use the [`toHexString`](https://docs.oracle.com/javase/8/docs/api/java/lang/Integer.html#toHexString-int-) method of the Integer class:

```java
Integer.toHexString(ByteBuffer.wrap(fourByteArray).getInt());

```

The same works with **8 byte arrays** and [`Long`](https://docs.oracle.com/javase/8/docs/api/java/lang/Long.html#toHexString-long-)

```java
Long.toHexString(ByteBuffer.wrap(eightByteArray).getLong());

```

### Option 1d: JDK17+ HexFormat

Finally, JDK 17 offers first-level support of straight forward hex encoding with [`HexFormat`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/HexFormat.html):

```java
HexFormat hex = HexFormat.of();
hex.formatHex(someByteArray)

```

Option 2: Code snippet - Advanced
---------------------------------

Here is a full-featured, copy & pasteable code snippet supporting **upper/lowercase** and [**endianness**](https://en.wikipedia.org/wiki/Endianness). It is optimized to minimize memory complexity and maximize performance and should be compatible with all modern Java versions (5+).

```java
private static final char[] LOOKUP_TABLE_LOWER = new char[]{0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x61, 0x62, 0x63, 0x64, 0x65, 0x66};
private static final char[] LOOKUP_TABLE_UPPER = new char[]{0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x41, 0x42, 0x43, 0x44, 0x45, 0x46};
        
public static String encode(byte[] byteArray, boolean upperCase, ByteOrder byteOrder) {

    // our output size will be exactly 2x byte-array length
    final char[] buffer = new char[byteArray.length * 2];

    // choose lower or uppercase lookup table
    final char[] lookup = upperCase ? LOOKUP_TABLE_UPPER : LOOKUP_TABLE_LOWER;

    int index;
    for (int i = 0; i < byteArray.length; i++) {
        // for little endian we count from last to first
        index = (byteOrder == ByteOrder.BIG_ENDIAN) ? i : byteArray.length - i - 1;
        
        // extract the upper 4 bit and look up char (0-A)
        buffer[i << 1] = lookup[(byteArray[index] >> 4) & 0xF];
        // extract the lower 4 bit and look up char (0-A)
        buffer[(i << 1) + 1] = lookup[(byteArray[index] & 0xF)];
    }
    return new String(buffer);
}

public static String encode(byte[] byteArray) {
    return encode(byteArray, false, ByteOrder.BIG_ENDIAN);
}

```

The full source code with Apache v2 license and decoder can be found [here](https://github.com/patrickfav/bytes-java).

Option 3: Using a small optimized library: bytes-java
-----------------------------------------------------

While working on my previous project, I created this little toolkit for working with bytes in Java. It has no external dependencies and is compatible with Java 7+. It includes, among others, a very fast and well tested HEX en/decoder:

```java
import at.favre.lib.bytes.Bytes;
...
Bytes.wrap(someByteArray).encodeHex()

```

You can check it out on [GitHub: bytes-java](https://github.com/patrickfav/bytes-java).

Option 4: Apache Commons Codec
------------------------------

Of course there is the good 'ol [commons codecs](https://commons.apache.org/proper/commons-codec/). (**_warning opinion ahead_**) _While working on the project outlined above I analyzed the code and was quite disappointed; a lot of duplicate unorganized code, obsolete and exotic codecs probably only useful for very few and quite overengineered and slow implementations of popular codecs (specifically Base64). I therefore would make an informed decision if you want to use it or an alternative._ Anyways, if you still want to use it, here is a code snippet:

```java
import org.apache.commons.codec.binary.Hex;
...
Hex.encodeHexString(someByteArray));

```

Option 5: Google Guava
----------------------

More often than not you already have [Guava](https://guava.dev/releases/16.0/api/docs/com/google/common/io/BaseEncoding.html) as a dependency. If so just use:

```java
import com.google.common.io.BaseEncoding;
...
BaseEncoding.base16().lowerCase().encode(someByteArray);

```

Option 6: Spring Security
-------------------------

If you use the [Spring framework](https://spring.io/) with [Spring Security](https://spring.io/projects/spring-security) you can use the following:

```java
import org.springframework.security.crypto.codec.Hex
...
new String(Hex.encode(someByteArray));

```

Option 7: Bouncy Castle
-----------------------

If you already use the security framework [Bouncy Castle](https://www.bouncycastle.org/) you can use its `Hex` util:

```java
import org.bouncycastle.util.encoders.Hex;
...
Hex.toHexString(someByteArray);

```

Not Really Option 8: Java 9+ Compatibility or 'Do Not Use JAXBs javax/xml/bind/DatatypeConverter'
-------------------------------------------------------------------------------------------------

In previous Java (8 and below) versions the Java code for JAXB was included as runtime dependency. Since Java 9 and [Jigsaw modularisation](http://openjdk.java.net/projects/jigsaw/doc/jdk-modularization-tips) your code cannot access other code outside of its module without explicit declaration. So be aware if you get an exception like:

```java
java.lang.NoClassDefFoundError: javax/xml/bind/JAXBException

```

when running on a JVM with Java 9+. If so then switch implementations to any of the alternatives above. See also this [question](https://stackoverflow.com/q/43574426/774398).

* * *

Micro Benchmarks
================

Here are results from a simple [JMH](https://openjdk.java.net/projects/code-tools/jmh/) micro benchmark encoding _byte arrays of different sizes_. The values are operations per second, so _**higher is better.**_ Note that micro benchmarks very often do not represent real world behavior, so take these results with a grain of salt.

```
| Name (ops/s)         |    16 byte |    32 byte |  128 byte | 0.95 MB |
|----------------------|-----------:|-----------:|----------:|--------:|
| Opt1: BigInteger     |  2,088,514 |  1,008,357 |   133,665 |       4 |
| Opt2/3: Bytes Lib    | 20,423,170 | 16,049,841 | 6,685,522 |     825 |
| Opt4: Apache Commons | 17,503,857 | 12,382,018 | 4,319,898 |     529 |
| Opt5: Guava          | 10,177,925 |  6,937,833 | 2,094,658 |     257 |
| Opt6: Spring         | 18,704,986 | 13,643,374 | 4,904,805 |     601 |
| Opt7: BC             |  7,501,666 |  3,674,422 | 1,077,236 |     152 |
| Opt8: JAX-B          | 13,497,736 |  8,312,834 | 2,590,940 |     346 |

```

Specs: JDK 8u202, i7-7700K, Win10, 24 GB Ram. See the full benchmark [here](https://github.com/patrickfav/bytes-java/blob/master/src/test/java/at/favre/lib/bytes/EncodingHexJmhBenchmark.java).

Benchmark Update 2022
---------------------

Here are results with current JMH 1.36, Java 17 and a higher end computer

```
| Name (ops/s)         |    16 byte |    32 byte |  128 byte | 0.95 MB |
|----------------------|-----------:|-----------:|----------:|--------:|
| Opt1a: BigInteger    |  2,941,403 |  1,389,448 |   242,096 |       5 |
| Opt1d: HexFormat     | 32,635,184 | 20,262,332 | 7,388,135 |     922 |
| Opt2/3: Bytes Lib    | 31,724,981 | 22,786,906 | 6,197,028 |     930 |

```

Specs: JDK temurin 17.0.6, Ryzen 5900X, Win11, 24 GB DDR4 Ram