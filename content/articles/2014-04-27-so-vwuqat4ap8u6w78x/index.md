---
title: 'Q: Android: fast bitmap blur?'
date: 2014-04-27
lastmod: 2017-05-23
description: 'Android: fast bitmap blur?'
summary: 'This was originally posted as an answer to the question "Android: fast bitmap blur?" on stackoverflow.com.'
aliases: [/link/vwuqat4a]
slug: 2014/android-fast-bitmap-blur
tags: ["android", "image-processing", "blur", "convolution"]
keywords: ["android", "image-processing", "blur", "convolution"]
alltags: ["android", "image-processing", "blur", "convolution"]
categories: ["stackoverflow"]
showEdit: false
showSummary: true
type: stackoverflow
thumbnail: 'sobanner*'
deeplink: /link/vwuqat4a
originalContentLink: https://stackoverflow.com/questions/14988990/android-fast-bitmap-blur
originalContentType: stackoverflow
soScore: 13
soViews: 28412
soIsAccepted: false
soQuestionId: 14988990
soAnswerId: 23329963
soAnswerLicense: CC BY-SA 3.0
soAnswerLink: https://stackoverflow.com/a/23329963/774398
---
Probably the most demanding requirement is live blur, meaning you blur live as the view changes. In this situation a blur should not take longer than 10 or so ms (to have some playroom onto the 16ms/60fps) to look smooth. It is possible to achieve this effect with the right settings, even on not so high end devices (galaxy s3 and even slower).

Here is how to improve performance in descending importance:

1.  Use downscaled images: This decreases the pixels to blur enormously. Also it works for you when you want a real blurred image. Also image loading and memory consumption is drastically lowered.
    
2.  Use Renderscript ScriptIntrinsicBlur - there is probably not a better/faster solution in Android as of 2014. One mistake I often see is that the Renderscript context is not reused, but created everytime the blur algorithm is used. Mind you that  `RenderScript.create(this);`  takes around 20ms on a Nexus 5, so you want to avoid this.
    
3.  Reuse Bitmaps: don't create unnecessary instances and always use the same instance. When you need really fast blur, garbage collection plays a major role (taking a good 10-20 ms for collection some bitmaps). Also crop and blur only what you need.
    
4.  For a live blur, probably because of context switching, it's not possible to blur in another thread (even with threadpools), only the main thread was fast enough to keep the view updated timely, with threads I saw lags of 100-300ms
    

on more tips see my other post here [https://stackoverflow.com/a/23119957/774398](https://stackoverflow.com/a/23119957/774398)

btw. I did a simple live blur in this app: [github](https://github.com/patrickfav/BlurTestAndroid), [Playstore](https://play.google.com/store/apps/details?id=at.favre.app.blurbenchmark)