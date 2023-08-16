---
title: 'Q: Bit shift operations on a byte array in Java'
date: 2017-11-10
lastmod: 2023-03-28
description: 'Bit shift operations on a byte array in Java'
summary: 'This was originally posted as an answer to the question "Bit shift operations on a byte array in Java" on stackoverflow.com.'
aliases: [/link/ukzhnzgf]
slug: 2017/bit-shift-operations-on-a-byte-array-in-java
tags: ["java", "bit-manipulation"]
keywords: ["java", "bit-manipulation"]
alltags: ["java", "bit-manipulation"]
categories: ["stackoverflow"]
showEdit: false
showSummary: true
type: stackexchange
thumbnail: 'so_banner*'
deeplink: /link/ukzhnzgf
originalContentLink: https://stackoverflow.com/questions/28997781/bit-shift-operations-on-a-byte-array-in-java
originalContentType: stackexchange
originalContentId: 47231300
seSite: stackoverflow
seScore: 4
seViews: 22000
seIsAccepted: false
seQuestionId: 28997781
seAnswerLicense: CC BY-SA 4.0
seAnswerLink: https://stackoverflow.com/a/47231300/774398
---
1\. Manually implemented
------------------------

Here are left and right shift implementation without using `BigInteger` (i.e. without creating a copy of the input array) and with unsigned right shift (`BigInteger` only supports arithmetic shifts of course)

**Left Shift <<**

```java
/**
 * Left shift of whole byte array by shiftBitCount bits. 
 * This method will alter the input byte array.
 */
static byte[] shiftLeft(byte[] byteArray, int shiftBitCount) {
    final int shiftMod = shiftBitCount % 8;
    final byte carryMask = (byte) ((1 << shiftMod) - 1);
    final int offsetBytes = (shiftBitCount / 8);

    int sourceIndex;
    for (int i = 0; i < byteArray.length; i++) {
        sourceIndex = i + offsetBytes;
        if (sourceIndex >= byteArray.length) {
            byteArray[i] = 0;
        } else {
            byte src = byteArray[sourceIndex];
            byte dst = (byte) (src << shiftMod);
            if (sourceIndex + 1 < byteArray.length) {
                dst |= byteArray[sourceIndex + 1] >>> (8 - shiftMod) & carryMask;
            }
            byteArray[i] = dst;
        }
    }
    return byteArray;
}

```

**Unsigned Right Shift >>>**

```java
/**
 * Unsigned/logical right shift of whole byte array by shiftBitCount bits. 
 * This method will alter the input byte array.
 */
static byte[] shiftRight(byte[] byteArray, int shiftBitCount) {
    final int shiftMod = shiftBitCount % 8;
    final byte carryMask = (byte) (0xFF << (8 - shiftMod));
    final int offsetBytes = (shiftBitCount / 8);

    int sourceIndex;
    for (int i = byteArray.length - 1; i >= 0; i--) {
        sourceIndex = i - offsetBytes;
        if (sourceIndex < 0) {
            byteArray[i] = 0;
        } else {
            byte src = byteArray[sourceIndex];
            byte dst = (byte) ((0xff & src) >>> shiftMod);
            if (sourceIndex - 1 >= 0) {
                dst |= byteArray[sourceIndex - 1] << (8 - shiftMod) & carryMask;
            }
            byteArray[i] = dst;
        }
    }
    return byteArray;
}

```

Used in this [class](https://github.com/patrickfav/bytes-java/blob/master/src/main/java/at/favre/lib/bytes/Util.java) by this [Project](https://github.com/patrickfav/bytes-java).

2\. Using BigInteger
--------------------

Be aware that `BigInteger` internally converts the byte array into an int\[\] array, so this may not be the most optimized solution:

**Arithmetic Left Shift <<:**

```java
byte[] result = new BigInteger(byteArray).shiftLeft(3).toByteArray();

```

**Arithmetic Right Shift >>:**

```java
byte[] result = new BigInteger(byteArray).shiftRight(2).toByteArray();

```

3\. External Library
--------------------

Using the [Bytes Java library](https://github.com/patrickfav/bytes-java)\*:

Add to pom.xml:

```xml
<dependency>
    <groupId>at.favre.lib</groupId>
    <artifactId>bytes</artifactId>
    <version>{latest-version}</version>
</dependency>

```

Code example:

```java
Bytes b = Bytes.wrap(someByteArray);
b.leftShift(3);
b.rightShift(3);
byte[] result = b.array();

```

<sub>*Full Disclaimer: I am the developer.</sub>