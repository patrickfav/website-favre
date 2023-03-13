---
title: 'Q: Is HKDF implemented in Java Cryptography Architecture?'
date: 2017-10-07
lastmod: 2021-10-07
lastfetch: 2023-03-13T17:19:49.665Z
description: 'Is HKDF implemented in Java Cryptography Architecture?'
summary: 'This was originally posted as an answer to the question "Is HKDF implemented in Java Cryptography Architecture?" on stackoverflow.com.'
aliases: [/link/hhjyirv2]
slug: 2017/is-hkdf-implemented-in-java-cryptography-architecture
tags: ["java", "hmac", "hkdf"]
keywords: ["java", "hmac", "hkdf"]
alltags: ["java", "hmac", "hkdf"]
categories: ["stackoverflow"]
showEdit: false
showSummary: true
type: stackoverflow
thumbnail: 'sobanner*' 
deeplink: /link/hhjyirv2
originalContentLink: https://stackoverflow.com/questions/45985661/is-hkdf-implemented-in-java-cryptography-architecture
originalContentType: stackoverflow
soScore: 14
soViews: 5938
soIsAccepted: false
soQuestionId: 45985661
soAnswerId: 46619583
soAnswerLicense: CC BY-SA 4.0
soAnswerLink: https://stackoverflow.com/a/46619583/774398
---
HKDF Implementations in Java
----------------------------

No, [Hashed Message Authentication Code (HMAC)-based key derivation function (HKDF)](https://eprint.iacr.org/2010/264.pdf) has, like most KDFs, no standard implementation in JCA (as of 2020).

There are some implementations embedded in other projects (like you already said):

*   [mozilla-services/sync-crypto](https://github.com/mozilla-services/sync-crypto/blob/master/src/main/java/org/mozilla/android/sync/crypto/HKDF.java)
*   [WhisperSystems/libsignal-protocol-java](https://github.com/WhisperSystems/libsignal-protocol-java/blob/master/java/src/main/java/org/whispersystems/libsignal/kdf/HKDF.java)
*   [square/keywhiz](https://github.com/square/keywhiz/blob/master/hkdf/src/main/java/keywhiz/hkdf/Hkdf.java)

Also there is, of course, [Bouncy Castle](https://github.com/bcgit/bc-java/blob/master/core/src/main/java/org/bouncycastle/crypto/generators/HKDFBytesGenerator.java) which use their own Hmac/Mac implementations and APIs. BC is however a massive dependency, and may be unpractical for e.g. embedded or mobile use case. For this I implemented a **standalone**, lightweight java lib (passing all of the RFC 5869 test vectors), which works with any [ `javax.crypto.Mac` ](https://docs.oracle.com/javase/7/docs/api/javax/crypto/Mac.html) instance:

*   [https://github.com/patrickfav/hkdf](https://github.com/patrickfav/hkdf)

If you prefer, you could, of course implement it on your own, it's a fairly straight forward spec, when using the built-in JCA Hmac implementation.

Info Parameter in HKDF
----------------------

From the [RFC 5869](https://www.rfc-editor.org/rfc/rfc5869#section-3.2):

> While the 'info' value is optional in the definition of HKDF, it is  
> often of great importance in applications. Its main objective is to  
> bind the derived key material to application- and context-specific  
> information. (...) In particular, it may prevent the derivation of the same keying material for different contexts.

So for example if you want to derive an Secret Key and IV from the same source material you would use the info parameter ([using this lib](https://github.com/patrickfav/hkdf)):

```
//example input
String userInput = "this is a user input with bad entropy";

HKDF hkdf = HKDF.fromHmacSha256();

//extract the "raw" data to create output with concentrated entropy
byte[] pseudoRandomKey = hkdf.extract(staticSalt32Byte, userInput.getBytes(StandardCharsets.UTF_8));

//create expanded bytes for e.g. AES secret key and IV
byte[] expandedAesKey = hkdf.expand(pseudoRandomKey, "aes-key".getBytes(StandardCharsets.UTF_8), 16);
byte[] expandedIv = hkdf.expand(pseudoRandomKey, "aes-iv".getBytes(StandardCharsets.UTF_8), 16);

//Example boilerplate encrypting a simple string with created key/iv
SecretKey key = new SecretKeySpec(expandedAesKey, "AES"); //AES-128 key
Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
cipher.init(Cipher.ENCRYPT_MODE, key, new IvParameterSpec(expandedIv));
byte[] encrypted = cipher.doFinal("my secret message".getBytes(StandardCharsets.UTF_8));

```