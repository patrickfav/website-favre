---
title: 'Q: How to sign an android apk file'
date: 2016-10-15
lastmod: 2017-05-23
description: 'How to sign an android apk file'
summary: 'This was originally posted as an answer to the question "How to sign an android apk file" on stackoverflow.com.'
aliases: [/link/8ten84uq]
slug: 2016/how-to-sign-an-android-apk-file
tags: ["android", "apk", "signing"]
keywords: ["android", "apk", "signing"]
alltags: ["android", "apk", "signing"]
categories: ["stackoverflow"]
showEdit: false
showSummary: true
type: stackexchange
thumbnail: 'so_banner*'
deeplink: /link/8ten84uq
originalContentLink: https://stackoverflow.com/questions/4853011/how-to-sign-an-android-apk-file
originalContentType: stackexchange
originalContentId: 40064199
seSite: stackoverflow
seScore: 44
seViews: 205000
seIsAccepted: false
seQuestionId: 4853011
seAnswerLicense: CC BY-SA 3.0
seAnswerLink: https://stackoverflow.com/a/40064199/774398
---
Here is a guide on how to manually sign an APK. It includes info about the new `apk-signer` introduced in `build-tools 24.0.3` _(10/2016)_

Automated Process:
==================

Use this tool (uses the new apksigner from Google):

[https://github.com/patrickfav/uber-apk-signer](https://github.com/patrickfav/uber-apk-signer)

<sup>Disclaimer: Im the developer :)</sup>

Manual Process:
===============

Step 1: Generate Keystore (only once)
-------------------------------------

You need to generate a keystore once and use it to sign your `unsigned` apk. Use the [`keytool`](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/keytool.html) [provided by the JDK](https://stackoverflow.com/questions/4830253/where-is-the-keytool-application) found in `%JAVA_HOME%/bin/`

```
keytool -genkey -v -keystore my.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias app

```

Step 2 or 4: Zipalign
---------------------

[`zipalign`](https://developer.android.com/studio/command-line/zipalign.html) [which is a tool provided by the Android SDK](https://stackoverflow.com/questions/24442213/cannot-find-zip-align-when-publishing-app) found in e.g. `%ANDROID_HOME%/sdk/build-tools/24.0.2/` is a mandatory optimzation step if you want to upload the apk to the Play Store.

```
zipalign -p 4 my.apk my-aligned.apk

```

**Note:** when using the old `jarsigner` you need to zipalign _AFTER_ signing. When using the new `apksigner` method you do it _BEFORE_ signing (confusing, I know). [Invoking zipalign before apksigner works fine](https://developer.android.com/studio/releases/build-tools.html) because apksigner preserves APK alignment and compression (unlike jarsigner).

You can _verify_ the alignment with

```
zipalign -c 4 my-aligned.apk

```

Step 3: Sign & Verify
---------------------

### Using build-tools 24.0.2 and older

Use [`jarsigner`](http://docs.oracle.com/javase/7/docs/technotes/tools/windows/jarsigner.html) which, like the keytool, [comes with the JDK distribution](https://stackoverflow.com/questions/12135699/where-is-jarsigner) found in `%JAVA_HOME%/bin/` and use it like so:

```
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my.keystore my-app.apk my_alias_name

```

and can be verified with

```
jarsigner -verify -verbose my_application.apk

```

### Using build-tools 24.0.3 and newer

Android 7.0 introduces APK Signature Scheme v2, a new app-signing scheme that offers faster app install times and more protection against unauthorized alterations to APK files (See [here](https://developer.android.com/about/versions/nougat/android-7.0.html#apk_signature_v2) and [here](https://source.android.com/security/apksigning/v2.html) for more details). Threfore Google implemented their [own apk signer called `apksigner`](https://developer.android.com/studio/command-line/apksigner.html) (duh!) The script file can be found in `%ANDROID_HOME%/sdk/build-tools/24.0.3/` (the .jar is in the `/lib` subfolder). Use it like this

```
apksigner sign --ks my.keystore my-app.apk --ks-key-alias alias_name

```

and can be verified with

```
apksigner verify my-app.apk

```

[The official documentation can be found here.](https://developer.android.com/studio/publish/app-signing.html#signing-manually)