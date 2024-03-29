---
title: 'Q: Android: How to programmatically access the device serial number shown in the AVD manager (API Version 8)'
date: 2017-10-30
lastmod: 2023-03-26
description: 'Android: How to programmatically access the device serial number shown in the AVD manager (API Version 8)'
summary: 'This was originally posted as an answer to the question "Android: How to programmatically access the device serial number shown in the AVD manager (API Version 8)" on stackoverflow.com.'
aliases: [/link/fsnd25wk]
slug: 2017/android-how-to-programmatically-access-the-device-serial-number-shown-in-the-avd-manager-(api-version-8)
tags: ["android", "serial-number"]
keywords: ["android", "serial-number"]
alltags: ["android", "serial-number"]
categories: ["stackoverflow"]
showEdit: false
showSummary: true
type: stackexchange
thumbnail: 'so_banner*'
deeplink: /link/fsnd25wk
originalContentLink: https://stackoverflow.com/questions/11029294/android-how-to-programmatically-access-the-device-serial-number-shown-in-the-av
originalContentType: stackexchange
originalContentId: 47022263
seSite: stackoverflow
seScore: 68
seViews: 147000
seIsAccepted: false
seQuestionId: 11029294
seAnswerLicense: CC BY-SA 4.0
seAnswerLink: https://stackoverflow.com/a/47022263/774398
---
### Up to Android 7.1 (SDK 25)

Until Android 7.1 you will get it with:

```java
Build.SERIAL

```

### From Android 8 (SDK 26)

On Android 8 (SDK 26) and above, this field will return [`UNKNOWN`](https://developer.android.com/reference/android/os/Build.html#UNKNOWN) and must be accessed with:

```java
Build.getSerial()

```

which requires the [dangerous permission](https://developer.android.com/guide/topics/permissions/requesting.html#normal-dangerous) [`android.permission.READ_PHONE_STATE`](https://developer.android.com/reference/android/Manifest.permission.html#READ_PHONE_STATE).

### From Android Q (SDK 29)

Since Android Q using `Build.getSerial()` gets a bit more complicated by requiring:

`android.Manifest.permission.READ_PRIVILEGED_PHONE_STATE` (which can only be acquired by system apps), **or** for the calling package to be the _device or profile owner_ and have the [`READ_PHONE_STATE`](https://developer.android.com/reference/android/Manifest.permission.html#READ_PHONE_STATE) permission. This means most apps won't be able to uses this feature. See the [Android Q announcement](https://developer.android.com/preview/privacy/data-identifiers#device-ids) from Google.

See [Android SDK reference](https://developer.android.com/reference/android/os/Build.html#getSerial())

* * *

Best Practice for Unique Device Identifier
------------------------------------------

If you just require a unique identifier, it's best to avoid using hardware identifiers as Google continuously tries to make it harder to access them for privacy reasons. You could just generate a `UUID.randomUUID().toString();` and save it the first time it needs to be accessed in e.g. shared preferences. Alternatively you could use [`ANDROID_ID`](https://stackoverflow.com/questions/2785485/is-there-a-unique-android-device-id) which is a 8 byte long hex string unique to the device, user and (only Android 8+) app installation. For more info on that topic, see [Best practices for unique identifiers](https://developer.android.com/training/articles/user-data-ids).