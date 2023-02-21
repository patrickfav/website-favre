---
title: 'Initial bytes incorrect after Java AES/CBC decryption'
date: 2018-10-29
lastmod: 2020-04-19
lastfetch: 2023-02-21T18:41:40.019Z
slug: 2018-10-29-initial-bytes-incorrect-after-java-aes_cbc-decryption
tags: ["java", "encryption", "aes"]
keywords: ["java", "encryption", "aes"]
alltags: ["java", "encryption", "aes"]
categories: ["stackoverflow"]
showEdit: false 
showSummary: false 
type: stackoverflow 
thumbnail: 'sobanner*' 
originalContentLink: https://stackoverflow.com/questions/15554296/initial-bytes-incorrect-after-java-aes-cbc-decryption
originalContentType: stackoverflow
soScore: 83
soViews: 484307
soIsAccepted: false
soQuestionId: 15554296
soAnswerId: 53051612
soAnswerLicense: CC BY-SA 4.0
---
_In this answer I choose to approach the "Simple Java AES encrypt/decrypt example" main theme and not the specific debugging question because I think this will profit most readers._

This is a simple summary of my [blog post about AES encryption in Java](https://proandroiddev.com/security-best-practices-symmetric-encryption-with-aes-in-java-7616beaaade9) so I recommend reading through it before implementing anything. I will however still provide a simple example to use and give some pointers what to watch out for.

In this example I will choose to use [authenticated encryption](https://en.wikipedia.org/wiki/Authenticated_encryption) with [Galois/Counter Mode or GCM](https://en.wikipedia.org/wiki/Galois/Counter_Mode) mode. The reason is that in most case you want [integrity and authenticity in combination with confidentiality](https://security.stackexchange.com/questions/148173/authenticity-confidentiality-integrity-general-questions) (read more in the [blog](https://proandroiddev.com/security-best-practices-symmetric-encryption-with-aes-in-java-7616beaaade9)).

AES-GCM Encryption/Decryption Tutorial
--------------------------------------

Here are the steps required to encrypt/decrypt with [AES-GCM](https://en.wikipedia.org/wiki/Galois/Counter_Mode) with the [Java Cryptography Architecture (JCA)](https://en.wikipedia.org/wiki/Java_Cryptography_Architecture). **Do not mix with other examples**, as subtle differences may make your code utterly insecure.

### 1\. Create Key

As it depends on your use-case, I will assume the simplest case: a random secret key.

```
SecureRandom secureRandom = new SecureRandom();
byte[] key = new byte[16];
secureRandom.nextBytes(key);
SecretKey secretKey = SecretKeySpec(key, "AES");

```

**Important:**

*   always use a strong [pseudorandom number generator](https://en.wikipedia.org/wiki/Pseudorandom_number_generator) like [ `SecureRandom` ](https://docs.oracle.com/javase/8/docs/api/java/security/SecureRandom.html)
*   use 16 byte / 128 bit long key (or more - [but more is seldom needed](https://security.stackexchange.com/a/6149/60108))
*   if you want a key derived from a user password, look into a [password hash function (or KDF)](https://en.wikipedia.org/wiki/Cryptographic_hash_function#Password_verification) with [stretching property](https://en.wikipedia.org/wiki/Key_stretching) like [PBKDF2](https://en.wikipedia.org/wiki/PBKDF2) or [bcrypt](https://en.wikipedia.org/wiki/Bcrypt)
*   if you want a key derived from other sources, use a proper [key derivation function (KDF)](https://en.wikipedia.org/wiki/Key_derivation_function) like [HKDF](https://en.wikipedia.org/wiki/HKDF) ([Java implementation here](https://github.com/patrickfav/hkdf)). Do _not_ use simple [cryptographic hashes](https://simple.wikipedia.org/wiki/Cryptographic_hash_function) for that (like [SHA-256](https://en.wikipedia.org/wiki/SHA-2)).

### 2\. Create the Initialization Vector

An [initialization vector (IV)](https://en.wikipedia.org/wiki/Initialization_vector) is used so that the same secret key will create different [cipher texts](https://en.wikipedia.org/wiki/Ciphertext).

```
byte[] iv = new byte[12]; //NEVER REUSE THIS IV WITH SAME KEY
secureRandom.nextBytes(iv);

```

**Important:**

*   never [reuse the same IV](https://crypto.stackexchange.com/questions/2991/why-must-IV-key-pairs-not-be-reused-in-ctr-mode) with the same key (**very important** in [GCM](https://en.wikipedia.org/wiki/Galois/Counter_Mode)/[CTR](https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Counter_(CTR)) mode)
*   the IV must be unique (ie. use random IV or a counter)
*   the IV is not required to be secret
*   always use a strong [pseudorandom number generator](https://en.wikipedia.org/wiki/Pseudorandom_number_generator) like [ `SecureRandom` ](https://docs.oracle.com/javase/8/docs/api/java/security/SecureRandom.html)
*   12 byte IV is the correct [choice for AES-GCM mode](https://crypto.stackexchange.com/questions/41601/aes-gcm-recommended-IV-size-why-12-bytes)

### 3\. Encrypt with IV and Key

```
final Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
GCMParameterSpec parameterSpec = new GCMParameterSpec(128, iv); //128 bit auth tag length
cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);
byte[] cipherText = cipher.doFinal(plainText);

```

**Important:**

*   use 16 byte / 128 bit [authentication tag](https://en.wikipedia.org/wiki/Authenticated_encryption) (used to verify integrity/authenticity)
*   the authentication tag will be automatically appended to the cipher text (in the JCA implementation)
*   since GCM behaves like a stream cipher, no padding is required
*   use [ `CipherInputStream` ](https://docs.oracle.com/javase/7/docs/api/javax/crypto/CipherInputStream.html) when encrypting large chunks of data
*   want additional (non-secret) data checked if it was changed? You may want to use [associated data](https://crypto.stackexchange.com/questions/6711/how-to-use-gcm-mode-and-associated-data-properly) with  `cipher.updateAAD(associatedData);`  [More here.](https://en.wikipedia.org/wiki/Authenticated_encryption#Authenticated_encryption_with_associated_data_(AEAD))

### 3\. Serialize to Single Message

Just append IV and ciphertext. As stated above, the IV doesn't need to be secret.

```
ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + cipherText.length);
byteBuffer.put(iv);
byteBuffer.put(cipherText);
byte[] cipherMessage = byteBuffer.array();

```

Optionally encode with [Base64](https://en.wikipedia.org/wiki/Base64) if you need a string representation. Either use [Android's](https://developer.android.com/reference/android/util/Base64.html) or [Java 8's built-in](https://docs.oracle.com/javase/8/docs/api/java/util/Base64.html) implementation (do not use Apache Commons Codec - it's an awful implementation). Encoding is used to "convert" byte arrays to string representation to make it ASCII safe e.g.:

```
String base64CipherMessage = Base64.getEncoder().encodeToString(cipherMessage);

```

### 4\. Prepare Decryption: Deserialize

If you have encoded the message, first decode it to byte array:

```
byte[] cipherMessage = Base64.getDecoder().decode(base64CipherMessage)

```

**Important:**

*   be careful to validate [input parameters](https://cwe.mitre.org/data/definitions/789.html), so to avoid [denial of service attacks](https://en.wikipedia.org/wiki/Denial-of-service_attack) by allocating too much memory.

### 5\. Decrypt

Initialize the cipher and set the same parameters as with the encryption:

```
final Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
//use first 12 bytes for iv
AlgorithmParameterSpec gcmIv = new GCMParameterSpec(128, cipherMessage, 0, 12);
cipher.init(Cipher.DECRYPT_MODE, secretKey, gcmIv);
//use everything from 12 bytes on as ciphertext
byte[] plainText = cipher.doFinal(cipherMessage, 12, cipherMessage.length - 12);

```

**Important:**

*   don't forget to add [associated data](https://crypto.stackexchange.com/questions/6711/how-to-use-gcm-mode-and-associated-data-properly) with  `cipher.updateAAD(associatedData);`  if you added it during encryption.

[A working code snippet can be found in this gist.](https://gist.github.com/patrickfav/7e28d4eb4bf500f7ee8012c4a0cf7bbf)

* * *

Note that most recent Android (SDK 21+) and Java (7+) implementations should have AES-GCM. Older versions may lack it. I still choose this mode, since it is easier to implement in addition to being more efficient compared to similar mode of [Encrypt-then-Mac](https://en.wikipedia.org/wiki/Authenticated_encryption#MAC-then-Encrypt_(MtE)) (with e.g. [AES-CBC](https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Cipher_Block_Chaining_(CBC)) + [HMAC](https://en.wikipedia.org/wiki/HMAC)). [See this article on how to implement AES-CBC with HMAC](https://proandroiddev.com/security-best-practices-symmetric-encryption-with-aes-in-java-and-android-part-2-b3b80e99ad36).