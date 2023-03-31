---
title: 'Q: Java String to SHA1'
date: 2018-11-23
lastmod: 2023-03-28
description: 'Java String to SHA1'
summary: 'This was originally posted as an answer to the question "Java String to SHA1" on stackoverflow.com.'
aliases: [/link/k8y84sgc]
slug: 2018/java-string-to-sha1
tags: ["java", "string", "sha1"]
keywords: ["java", "string", "sha1"]
alltags: ["java", "string", "sha1"]
categories: ["stackoverflow"]
showEdit: false
showSummary: true
type: stackexchange
thumbnail: 'so_banner*'
deeplink: /link/k8y84sgc
originalContentLink: https://stackoverflow.com/questions/4895523/java-string-to-sha1
originalContentType: stackexchange
originalContentId: 53439267
seSite: stackoverflow
seScore: 5
seViews: 305000
seIsAccepted: false
seQuestionId: 4895523
seAnswerLicense: CC BY-SA 4.0
seAnswerLink: https://stackoverflow.com/a/53439267/774398
---
Message Digest (hash) is byte\[\] in byte\[\] out
-------------------------------------------------

A message digest is defined as a function that takes a raw byte array and returns a raw byte array (aka `byte[]`). For example [SHA-1 (Secure Hash Algorithm 1)](https://en.wikipedia.org/wiki/SHA-1) has a digest size of 160 bit or 20 bytes. Raw byte arrays cannot usually be interpreted as [character encodings](https://en.wikipedia.org/wiki/Character_encoding) like [UTF-8](https://en.wikipedia.org/wiki/SHA-1), because not every byte in every order is a legal that encoding. So converting them to a `String` with:

```java
new String(md.digest(subject), StandardCharsets.UTF_8)

```

might create some illegal sequences or has code-pointers to undefined [Unicode](https://en.wikipedia.org/wiki/Binary-to-text_encoding) mappings:

```
[�a�ɹ??�%l�3~��.

```

### Binary-to-text Encoding

For that [binary-to-text](https://en.wikipedia.org/wiki/Binary-to-text_encoding) encoding is used. With hashes, the one that is used most is the [HEX encoding or Base16](https://en.wikipedia.org/wiki/Hexadecimal#Transfer_encoding). Basically a byte can have the value from `0` to `255` (or `-128` to `127` signed) which is equivalent to the HEX representation of `0x00`\-`0xFF`. Therefore, hex will double the required length of the output, that means a 20 byte output will create a 40 character long hex string, e.g.:

```
2fd4e1c67a2d28fced849ee1bb76e7391b93eb12

```

Note that it is not required to use hex encoding. You could also use something like [base64](https://en.wikipedia.org/wiki/Base64). Hex is often preferred because it is easier readable by humans and has a defined output length without the need for padding.

You can convert a byte array to hex with JDK functionality alone:

```java
new BigInteger(1, token).toString(16)

```

Note however that `BigInteger` will interpret given byte array as _number_ and not as a byte string. That means leading zeros will not be outputted, and the resulting string may be shorter than 40 chars.

### Using Libraries to Encode to HEX

You could now [copy and paste an untested byte-to-hex method from Stack Overflow](https://stackoverflow.com/questions/2817752/java-code-to-convert-byte-to-hexadecimal) or use massive dependencies like [Guava](https://google.github.io/guava/releases/16.0/api/docs/com/google/common/io/BaseEncoding.html).

To have a go-to solution for most byte related issues I implemented a utility to handle these cases: [bytes-java (GitHub)](https://github.com/patrickfav/bytes-java)

To convert your message digest byte array you could just do

```java
String hex = Bytes.wrap(md.digest(subject)).encodeHex();

```

or you could just use the built-in hash feature

```java
String hex =  Bytes.from(subject).hashSha1().encodeHex();

```