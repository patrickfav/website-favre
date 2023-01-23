---
title: 'The Bcrypt Protocol&#x2026; is kind of a mess'
date: 2018-11-07
lastmod: 2020-04-18
draft: false
summary: 'While writing my own bcrypt library, I discovered a lot of odd things surrounding the bcrypt protocol.'
description: 'While writing my own bcrypt library, I discovered a lot of odd things surrounding the bcrypt protocol.'
slug: 2018-11-07-the-bcrypt-protocol&#x2026;-is-kind-of-a-mess
tags: ["Cybersecurity", "Programming"]
keywords: ["security", "bcrypt", "crypto", "passwords", "bcrypt-protocol"]
showDate: true
showReadingTime: true
showTaxonomies: true
showWordCount: true
showEdit: false
originalContentLink: https://medium.com/hackernoon/the-bcrypt-protocol-is-kind-of-a-mess-4aace5eb31bd
originalContentType: medium
mediumClaps: 72
mediumVoters: 14
mediumArticleId: 4aace5eb31bd
---
![](https://cdn-images-1.medium.com/max/1024/1*0nnp9MK5uVf5e2ncH6aftw.jpeg)

_While writing my own bcrypt library, being unsatisfied with the current Java de-facto standard implementation jBcrypt, I discovered a lot of odd things surrounding the bcrypt protocol (mind you: not the underlying cryptographic primitive ‘Eksblowfish’)._

Bcrypt is a password hashing function [designed by Niels Provos and David Mazières](http://www.usenix.org/events/usenix99/provos/provos_html/node1.html) in 1999 which became popular as the default password hash algorithm for OpenBSD[¹](https://en.wikipedia.org/wiki/Bcrypt). In comparison to simple [cryptographic hash functions](https://en.wikipedia.org/wiki/Cryptographic_hash_function) (like SHA-256), the main benefit of using bcrypt is that a developer can set how expensive it is to calculate the hash. This is called [key stretching](https://en.wikipedia.org/wiki/Key_stretching) and should be used with any (usually weak) user provided password to protect against brute force attacks (i.e. simple guessing).

#### Introduction to Bcrypt

So how does it work? First you need a password and set the iteration count as a logarithmic work factor between 4–31, doubling the required computation every increment. So for example it could look like this:

```
bcrypt("secretPassword", 8)
```

which may output

![](https://cdn-images-1.medium.com/max/1024/1*wFASmAwFFZot0rTrJv1W1Q.png)

$2a$08$0SN/h83Gt1jZMR6924.Kd.HaK3MyTDt/W8FCjUOtbY3Pmres5rsma

This is the [modular crypt format](https://passlib.readthedocs.io/en/stable/modular_crypt_format.html) defined and used by OpenBSD. The first part $2a$ is the protocol version identifier. Historically bcrypt used to be $2$ but since nobody back then thought about Unicode handling, a new version had to be defined. The next part 08$ is the work factor as passed to the function. The next 22 ASCII characters (16 byte raw) 0SN/h83Gt1jZMR6924.Kd. represent the encoded salt. Most implementations automatically create a salt for the caller, which is nice. This measure protects against rainbow tables, i.e. using a list of pre-calculated hashes of commonly used passwords.

And finally the last 23 byte or encoded 31 ASCII characters are the actual bcrypt hash: HaK3MyTDt/W8FCjUOtbY3Pmres5rsma. This format is especially convenient for storing password hashes, since all the parameters apart from the actual password are included.

#### Issue 1: Non-Standard encoding

First what’s odd is, that the used encoding for the salt and hash is a strange non-standard Base64 dialect. [Wikipedia](https://en.wikipedia.org/wiki/Base64#Radix-64_applications_not_compatible_with_Base64) lists it in its article in the section “Radix-64 applications” and originates it to [crypt(3)](http://crypt(3)) with seemingly only modern usage being bcrypt. Granted, it has the same, but permutated alphabet, still making it incompatible to [RFC 4648](https://tools.ietf.org/html/rfc4648#section-5). This makes implementing it unnecessarily harder and more error prone, since practically all programming languages have a RFC 4648 implementation of Base64 or support for it.

#### Issue 2: Using 23 byte instead of the full 24 byte hash

As stated before, nearly all bcrypt implementations output a 23 byte long hash. The bcrypt algorithm however generates a 24 byte password hash by encrypting three 8 byte blocks using a password-derived blowfish key. The original reference implementation however choose truncate the hash output, it is rumored the reason is to [cap it to a more manageable length of 60 character limit](http://manageable length) (a strange reason if you ask me). The [consensus seems](https://news.ycombinator.com/item?id=2654586) to be that the issue of cutting a hash byte off is not a meaningful degradation in security, so it stays an oddity inherited from the reference implementation.

#### Issues 3: Derivations of the White Paper vs Reference Implementation

According to the [BouncyCastle Javadoc](http://javadox.com/org.bouncycastle/bcprov-jdk15on/1.53/org/bouncycastle/crypto/generators/BCrypt.html) the OpenBSD reference implementation derivatives from the algorithm described in the [whitepaper](http://www.openbsd.org/papers/bcrypt-paper.ps):

> In contrast to the paper, the order of key setup and salt setup is reversed: state <- ExpandKey(state, 0, key) state <- ExpandKey(state, 0, salt). This corresponds to the OpenBSD reference implementation of Bcrypt.

There is no reference to a potential security vulnerability because of that (and I wouldn’t expect one). Since basically everybody copied the behavior of the reference implementation, the specification seems to be superseded.

#### Issue 4: No handling for passwords longer than 56/72 bytes

According to the [whitepaper](http://www.openbsd.org/papers/bcrypt-paper.ps):

> (…) the key argument is a secret encryption key, which can be a user-chosen password of up to 56 bytes (including a terminating zero byte when the key is an ASCII string).

Others [have pointed out](https://security.stackexchange.com/questions/39849/does-bcrypt-have-a-maximum-password-length) that the algorithm, internally, manages things as 18 32-bit words, for a total of 72 bytes (including a null-terminator byte). Mind that a UTF-8 character can take up to 4 bytes of space, which would limit the password with the reference limitation to 14 characters in the worst case.

The confusion about the actual limitation and the lack of specification on what to do on long passwords can create a lot of issues with compatibility as well as [possibly creating a lot of different dialects](https://security.stackexchange.com/questions/39849/does-bcrypt-have-a-maximum-password-length) of bcrypt.

#### Issue 5: Many Non-Standard Versions

As stated earlier, bcrypt startet out with version $2$ which lacked definition on how to handle non-ASCII characters, so the most prevalent version is $2a$ which fixed that. But of course other implementations have had issues too, so there is a $2x$ and $2y$ for the PHP version and there is [talk to bump the version output](http://undeadly.org/cgi?action=article&sid=20140224132743) of the original to $2b$. Most of these version changes address bugs in specific implementation and may not apply to others. This however makes it harder to achieve interoperability between different systems (most often databases which are used by PHP and other systems, e.g. [this](https://stackoverflow.com/questions/49878948/hashing-password-with-2y-identifier))

#### Issue 6: Slightly Inefficient Format

The output format

```
$2a$08$0SN/h83Gt1jZMR6924.Kd.HaK3MyTDt/W8FCjUOtbY3Pmres5rsma
```

is clearly optimized to be user readable. It is also slightly inefficient to parse: first the whole string has to be read in as ASCII, then it has to be parsed character to character until the last $. After that the next 22 and 32 characters are decoded separately. Using a more compact message format and encoded only once, for example:

![](https://cdn-images-1.medium.com/max/1024/1*vUs9KREMBXKziDZFXL0H2w.png)

the storage demand is reduced from 60 byte to ~56 byte (Base64 encoded). This is irrelevant in most use cases, but in the grant scale when storing millions or billions of password hashes this can make a difference slightly reducing storage demand and parsing computational time.

#### Issue 7: No Official Test Vectors

When trying to implement bcrypt, the developer is faced with the lack of official test vectors (aka test cases) to verify the algorithm. Neither the white paper, nor a Google search reveals a lot of useful examples other than some random test cases. This makes it hard to verify compatibility with other implementations. That’s actually the reason I posted some of my own, trying to capture most the the edge cases; [they can be found here](https://github.com/patrickfav/bcrypt/wiki/Published-Test-Vectors).

#### Issue 8: Not well suited as Key Derivation Function

Bcrypt on OpenBSD was designed for password storage. Many times however it is necessary to create a secret key from a user password requiring a key derivation function (KDF). The two lacking properties are the ability to set arbitrary out length to satisfy different key types and to just output the raw hash without the whole message format. Currently one would need to parse the last 31 characters from the hash message and then expand it with a proper KDF like. [HKDF](https://en.wikipedia.org/wiki/HKDF).

**Note**: Bcrypt not being a KDF is not necessarily an issue with bcrypt (it never claimed to be). However oftentimes developers misuse it as such without really knowing about the potential problems. Giving an option to use as KDF would help.

### Conclusion

The lack of a strong specification by an authority, age and various quirks and bugs in many implementations make it hard to properly implement this time tested password hashing function.

Security is hard to get right. So even if some of the issues seem nit-picky (and maybe they are), there is no reason to strive for the most simple, straight forward implementation and API resulting in a reviewed specification which can be used as a base for an implementation. Trust me, [I’ve been there](https://github.com/patrickfav/armadillo/issues/16).

**_Just to reiterate_**: I do not challenge the security strength of the underlying “Eksblowfish” (“expensive key schedule Blowfish”), those [analysis](https://security.stackexchange.com/questions/4781/do-any-security-experts-recommend-bcrypt-for-password-storage) should be left to the cryptographic experts. I would summarize however that bcrypt is still in the realm of recommended password hashing functions.

Stay tuned for part 2 where I propose a KDF based on bcrypt and an improved password hashing protocol.

A small plug: most of the issues explained can be overcome with my Java implementation of bcrypt (using the _Eksblowfish_ algorithm from jBcrypt). The main goal of this lib is to be as straight forward as possible to make it hard for people not familiar with bcrypt to get it wrong, but still allowing as much flexibility as possible. Check it out, you maybe find it useful (it’s Apache v2):

[patrickfav/bcrypt](https://github.com/patrickfav/bcrypt)

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=4aace5eb31bd)


---
