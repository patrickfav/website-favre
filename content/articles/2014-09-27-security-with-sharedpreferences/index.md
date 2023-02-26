---
title: 'Q: Security with SharedPreferences'
date: 2014-09-27
lastmod: 2020-06-20
lastfetch: 2023-02-26T18:53:40.896Z
description: 'Security with SharedPreferences'
summary: 'Question: I got to know from this source that if a device is rooted then accessing SharedPreferences and modifying it is a cakewalk. - Discussion 1: The Attacker is Another App...'
aliases: [/link/cbfeh9ja]
slug: 2014/security-with-sharedpreferences
tags: ["android", "sharedpreferences"]
keywords: ["android", "sharedpreferences"]
alltags: ["android", "sharedpreferences"]
categories: ["stackoverflow"]
showEdit: false
showSummary: true
type: stackoverflow
thumbnail: 'sobanner*' 
deeplink: /link/cbfeh9ja
originalContentLink: https://stackoverflow.com/questions/26076292/security-with-sharedpreferences
originalContentType: stackoverflow
soScore: 33
soViews: 10083
soIsAccepted: true
soQuestionId: 26076292
soAnswerId: 26077852
soAnswerLicense: CC BY-SA 4.0
soAnswerLink: https://stackoverflow.com/a/26077852/774398
---

{{< alert "stack-overflow" >}} This was originally posted as an [answer](https://stackoverflow.com/a/26077852/774398) to this [question](https://stackoverflow.com/questions/26076292/security-with-sharedpreferences)  on stackoverflow.com{{< /alert >}}

_If you are interested in state of the art implementation, check out my project here [https://github.com/patrickfav/armadillo](https://github.com/patrickfav/armadillo) which may have some interesseting design principles relevant to this discussion._

* * *

Discussion 1: The Attacker is Another App
=========================================

There are different points to consider:

Shared Preference on an unrooted Device
---------------------------------------

The data is safe here on the code level. It can only be accessed through the app (in malice or normal manner)

Encrypted Shared Preference on a unrooted Device
------------------------------------------------

Same as above. Your data is safe. No difference in security level, it's just as safe or unsafe as it would be unencrypted (but slightly obfuscated).

Shared Preference on a rooted Device
------------------------------------

The data can be accessed and manipulated by any App. But you have to consider that only a very small percentage (I guess under 1-2%, but there is no reliable data on the _interweb_) of devices are rooted and if a user roots his device he/she deliberately leaves himself vulnerable. This is not an Android system setting, if you root, you are responsible for the consequences.

Encrypted Shared Preference on a rooted Device
----------------------------------------------

So you have the option to encrypt your data. There a ready [solutions for this](http://www.codeproject.com/Articles/549119/Encryption-Wrapper-for-Android-SharedPreferences). But the problem is to keep the key secret. A hardcoded key in source code can easily be decompiled (even with byte code obfuscator like ProGuard). A per-app generated key has to be saved somewhere, and in the end on a rooted device, it can be accessed irrelevant of the location (shared pref, SQL, file). A server side per user key that is only saved in RAM is a little more secure, but degrades usability as you need to make a server request the first time the app is started or every time it's garbage collected. This may interfere with offline capability.

Aside from the last method, encrypting your shared preference hardly gives any real security enhancements.

Implication of developing a malicious app
-----------------------------------------

Since April '14 Google has a [malware scanner embedded in the play services](http://www.androidpolice.com/2014/04/10/google-is-rolling-out-constant-on-device-scanning-for-verify-apps-feature/) on the device (also in the play store server side) that detects malice apps and its definition is frequently updated (at least every 6 weeks as is the release cycle of the play store app) and works with every Google Android 2.3+.

As a potential developer of a malicious app that reads your data I have to consider that my app only works on a small percentage of devices and then also only a brief period and my main distribution channel would be to make people download the APK and manually install the app and hopefully won't be recognized by the malware scanner immediately, which combined is a very unlikely scenario. This would make me inclined to use other means of intrusion which have a better effort-to-return ratio.

I guess that's the reason there are still only a few malice apps for Android and no widespread "infection" at least I know of (middle 2015).

Should an App store sensitive data?
-----------------------------------

I would rethink if your design fits your requirements. Usually you want to store the least sensitive data you can and only get it from the server if you need it and then only keep it in RAM as long as you need it. Data that is potentially very damaging therefore should not be saved persistently on the device (if possible). As we discussed data on your Android phone cannot be secured in a way that satisfies every security requirement.

Aside from that, you also have to consider to secure the data on the UI level or otherwise anybody could just take your phone and access the nuclear bomb codes through the app.

**tl;dr**

*   Persist only the sensitive data on your phone that you essentially need to keep a reasonable usability of your app. Everything else belongs in the RAM (as e.g. a object member) and should be fetched on demand and kept as brief as possible
*   The existence of an effective malware for your app is unlikely
*   Shared Preference is safe on all devices that are not deliberately made vulnerable. You have no influence on that so you cannot be held responsible as it is not a standard feature of the phone
*   Encrypting your data on a android phone hardly gives any real security enhancements

Discussion 2: The Attacker is the Device Owner
==============================================

Protecting dynamic App configuration - or how to protect yourself from the device owner
---------------------------------------------------------------------------------------

There might be an additional use case where manually encrypting data makes a lot of sense: If you want to make it harder to read and alter your app's internal configuration. A simple example would be: you have a boolean flag, when a user e.g. "likes" your FB page, will disable ads. If you just store a  `true`  or  `false`  it is trivial for the device owner to change that. For this scenario a good "obfuscation" might be enough for most attackers. Be aware that your encryption scheme must be [authenticated](https://en.wikipedia.org/wiki/Authenticated_encryption) meaning it should not only encrypt but leave a tag to check if the data has been modified. It would also be best to make it non-deterministic and device depended because otherwise an attacker could just copy the value from another device. For sample [implementation of this approach see here](https://github.com/patrickfav/armadillo).

Ways of improving protection against device owner
-------------------------------------------------

*   See [whitebox crypto](https://crypto.stackexchange.com/questions/386/differences-between-white-box-cryptography-and-code-obfuscation) for a solution on how to encrypt data on vulnerable devices.
*   [Android Keystore System](https://developer.android.com/training/articles/keystore)

* * *

The 2017 Update with Android 5/6 and the Area of the Android Keystore System
============================================================================

Inofficially released with [Android 4.3](https://nelenkov.blogspot.com/2013/08/credential-storage-enhancements-android-43.html), with it's first public release with Android 5 and vastly improved API and capabilities with [Android 6](https://developer.android.com/about/versions/marshmallow/android-6.0), the [Android Keystore System](https://developer.android.com/training/articles/keystore) made it possible to encrypt data and store keys with the device's secure hardware platform. On the face, this makes for a very strong concept which makes it impossible even for attackers with the device in hand to decrypt your data. In it's strongest configuration the Android Keystore System only decrypts, if the user either unlocked the screen or provided his fingerprint. This is not only more user friendly by not introducing additional passwords, but also does exactly what you want: The data is encrypted if the phone is locked (not only if it is off) und decrypted when the user unlocks her phone.

Unfortunately this concept has a major flaw: it is very unreliable. You are at the mercy of device fragmentation with major manufacturer providing unstable and non API confirm implementations. Drivers and/or SoC themselves often have major bugs and behavior might not what you want (e.g. by [deleting your keys](https://issuetracker.google.com/issues/36983155) when the user changes or deletes their lock screen). Even different Android versions behave differently. These observations were made by me during a project with very high requirements for persisting sensitive data during the time of 2017-2018 (lets say I added couple of Android Bug Tickets - which all got ignored of course). It is possible that newer devices and Android implementations are better now, but until I see otherwise I would be aware.
