---
title: 'Q: Quality of Image after resize very low -- Java'
date: 2016-03-30
lastmod: 2017-05-23
description: 'Quality of Image after resize very low -- Java'
summary: 'This was originally posted as an answer to the question "Quality of Image after resize very low -- Java" on stackoverflow.com.'
aliases: [/link/pk6vsacv]
slug: 2016/quality-of-image-after-resize-very-low-java
tags: ["java", "image", "image-resizing"]
keywords: ["java", "image", "image-resizing"]
alltags: ["java", "image", "image-resizing"]
categories: ["stackoverflow"]
showEdit: false
showSummary: true
type: stackexchange
thumbnail: 'so_banner*'
deeplink: /link/pk6vsacv
originalContentLink: https://stackoverflow.com/questions/14115950/quality-of-image-after-resize-very-low-java
originalContentType: stackexchange
originalContentId: 36320292
seSite: stackoverflow
seScore: 12
seViews: 23000
seIsAccepted: false
seQuestionId: 14115950
seAnswerLicense: CC BY-SA 3.0
seAnswerLink: https://stackoverflow.com/a/36320292/774398
---
As already stated, Java's Graphics2D does not provide a very good algorithm for down-scaling. If you don't want to implement a sophisticated algorithm yourself you could try out the current open source libs specialized for this: [Thumbnailator](img_0f80221e8c773f90.png), [imgscalr](https://gist.github.com/patrickfav/a147ecd26a385ce4f6d8c373356454c4) and a Java interface for [ImageMagick](https://stackoverflow.com/a/36295066/774398).

While researching for a private project I tried them out (except ImageMagick) and here are the visual results with Photoshop as reference:

[![comparison](img_0f80221e8c773f90.png)](img_0f80221e8c773f90.png)

> A. **Thumbnailator** 0.4.8 with default settings (no additional internal resizing)  
> B. **imgscalr** 4.2 with ULTRA\_QUALTY setting  
> C. **Photoshop** CS5 bicubic filter (save for web)  
> D. **Graphics2d** with all HQ render hints

[_Here is the used code_](https://gist.github.com/patrickfav/a147ecd26a385ce4f6d8c373356454c4)

Thumbnailator and PS create similar results, while imgscalr seems to be softer. It is subjective which one of the libs creates the preferable results. Another point to consider though is the performance. While Thumbnailator and Graphics2d have similar runtime, imgscalr is considerably slower (with ULTRA\_QUALITY) [in my benchmarks](https://stackoverflow.com/a/36295066/774398).

[For more info, read this post providing more detail on this matter](https://stackoverflow.com/a/36295066/774398).