---
title: 'Q: Is there any mechanism available in Android platform for remote attestation?'
date: 2016-09-05
lastmod: 2018-04-11
description: 'Is there any mechanism available in Android platform for remote attestation?'
summary: 'This was originally posted as an answer to the question "Is there any mechanism available in Android platform for remote attestation?" on security.stackexchange.com.'
aliases: [/link/7ik2fmdc]
slug: 2016/is-there-any-mechanism-available-in-android-platform-for-remote-attestation
tags: ["android", "trusted-computing", "tpm", "remote-attestation"]
keywords: ["android", "trusted-computing", "tpm", "remote-attestation"]
alltags: ["android", "trusted-computing", "tpm", "remote-attestation"]
categories: ["security"]
showEdit: false
showSummary: true
type: stackexchange
thumbnail: 'se-security_banner*'
deeplink: /link/7ik2fmdc
originalContentLink: https://security.stackexchange.com/questions/102815/is-there-any-mechanism-available-in-android-platform-for-remote-attestation
originalContentType: stackexchange
originalContentId: 135892
seSite: security
seScore: 3
seViews: 9000
seIsAccepted: false
seQuestionId: 102815
seAnswerLicense: CC BY-SA 3.0
seAnswerLink: https://security.stackexchange.com/a/135892/60108
---
1.  There are Android phones with hardware-backed storage. This is supported since Android 4.3, ie. mid 2013, (SDK18) over the [`KeyChain`](https://developer.android.com/reference/android/security/KeyChain.html) API. [From the changelog:](https://developer.android.com/about/versions/android-4.3.html#Security)

> Android also now supports hardware-backed storage for your `KeyChain` credentials, providing more security by making the keys unavailable for extraction. That is, once keys are in a hardware-backed key store (Secure Element, TPM, or TrustZone), they can be used for cryptographic operations but the private key material cannot be exported. Even the OS kernel cannot access this key material. While not all Android-powered devices support storage on hardware, you can check at runtime if hardware-backed storage is available by calling `KeyChain.IsBoundKeyAlgorithm()`.

2.  Google offers over a Play Service the [Safty Net API](https://developer.android.com/training/safetynet/index.html) which can check if a device was compromised. Here is the description on their site:

> The service provides an API your app can use to analyze the device where it is installed. The API uses software and hardware information on the device where your app is installed to create a profile of that device. The service then attempts to match it to a list of device models that have passed Android compatibility testing. This check can help you decide if the device is configured in a way that is consistent with the Android platform specifications and has the capabilities to run your app.

This is used in the [Google Pay](https://play.google.com/store/apps/details?id=com.google.android.apps.walletnfcrel&hl=en) app afaik.