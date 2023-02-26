---
title: 'Snippet: Research of ID-Mask SIV Engine MAC & Randomization Byte Lengths.'
date: 2019-05-03
lastmod: 2023-02-26
lastfetch: 2023-02-26T18:53:25.131Z
description: 'Research of ID-Mask SIV Engine MAC & Randomization Byte Lengths.'
summary: 'Research of ID-Mask SIV Engine MAC & Randomization Byte Lengths.'
aliases: [/link/agikwsni]
slug: 2019/research-of-id-mask-siv-engine-mac-randomization-byte-lengths
tags: ["Markdown"]
keywords: ["Markdown"]
alltags: ["Markdown"]
categories: ["opensource"]
type: gist
showTableOfContents: false
showTaxonomies: false
thumbnail: 'gistbanner*'
editURL: https://gist.github.com/e2c027fda3a62d484c804ea32f33ea63
deeplink: /link/agikwsni
originalContentLink: https://gist.github.com/e2c027fda3a62d484c804ea32f33ea63
originalContentType: gist
gistLanguage: Markdown
gistFileCount: 1
gistComments: 0
gistCommentsUrl: https://api.github.com/gists/e2c027fda3a62d484c804ea32f33ea63/comments
---

{{< info >}} Research of ID-Mask SIV Engine MAC & Randomization Byte Lengths. The [original Gist](https://gist.github.com/e2c027fda3a62d484c804ea32f33ea63) can be found on Github.{{< /info >}}


### mac-rnd-sizes.md

```Markdown

# Proposed Lengths for ID Encryption Schema

## 32-bit Integer

| Integer       | Value  | MAC     | Version | Randomization | Sum               | Base64/Base32 |
|---------------|--------|---------|---------|---------------|-------------------|---------------|
| deterministic | 4 byte | 12 byte | 1 byte  | -             | 17 byte (136 bit) | 22/27         |
| randomized    | 4 byte | 12 byte | 1 byte  | 10 byte       | 27 byte (216 bit) | 36/43         |

## 64-bit Integer

| Long          | Value  | MAC     | Version | Randomization | Sum               | Base64/Base32 |
|---------------|--------|---------|---------|---------------|-------------------|---------------|
| deterministic | 8 byte | 12 byte | 1 byte  | -             | 21 byte (168 bit) | 28/33         |
| randomized    | 8 byte | 12 byte | 1 byte  | 12 byte       | 33 byte (264 bit) | 44/52         |

## 128-bit Integer

| 128-bit       | Value   | MAC     | Version | Randomization | Sum               | Base64/Base32 |
|---------------|---------|---------|---------|---------------|-------------------|---------------|
| deterministic | 16 byte | 16 byte | 1 byte  | -             | 33 byte (264 bit) | 44/52         |
| randomized    | 16 byte | 16 byte | 1 byte  | 16 byte       | 49 byte (329 bit) | 65/78         |


## 256-bit Integer

| 256-bit       | Value   | MAC     | Version | Randomization | Sum               | Base64/Base32 |
|---------------|---------|---------|---------|---------------|-------------------|---------------|
| deterministic | 32 byte | 16 byte | 1 byte  | -             | 49 byte (329 bit) | 65/78         |
| randomized    | 32 byte | 16 byte | 1 byte  | 16 byte       | 65 byte (520 bit) | 86/104        |

# Birthday Problem Cheat Sheet

    f=sqr(2*n*ln(1/1-p))
    n.....number of possible values
    p.....probability of finding a duplicate

| prob of duplicate | 0,1%      | 1,0%      | 25,0%     | 50,0%     | 75,0%     | 99,0%     |
|-------------------|-----------|-----------|-----------|-----------|-----------|-----------|
| 1 bytes           | 7,16E-01  | 2,27E+00  | 1,21E+01  | 1,88E+01  | 2,66E+01  | 4,86E+01  |
| 2 bytes           | 1,15E+01  | 3,63E+01  | 1,94E+02  | 3,01E+02  | 4,26E+02  | 7,77E+02  |
| 4 bytes           | 2,93E+03  | 9,29E+03  | 4,97E+04  | 7,72E+04  | 1,09E+05  | 1,99E+05  |
| 6 bytes           | 7,50E+05  | 2,38E+06  | 1,27E+07  | 1,98E+07  | 2,79E+07  | 5,09E+07  |
| 7 bytes           | 1,20E+07  | 3,81E+07  | 2,04E+08  | 3,16E+08  | 4,47E+08  | 8,15E+08  |
| 8 bytes           | 1,92E+08  | 6,09E+08  | 3,26E+09  | 5,06E+09  | 7,15E+09  | 1,30E+10  |
| 9 bytes           | 3,07E+09  | 9,74E+09  | 5,21E+10  | 8,09E+10  | 1,14E+11  | 2,09E+11  |
| 10 bytes          | 4,92E+10  | 1,56E+11  | 8,34E+11  | 1,29E+12  | 1,83E+12  | 3,34E+12  |
| 11 bytes          | 7,87E+11  | 2,49E+12  | 1,33E+13  | 2,07E+13  | 2,93E+13  | 5,34E+13  |
| 12 bytes          | 1,26E+13  | 3,99E+13  | 2,14E+14  | 3,31E+14  | 4,69E+14  | 8,54E+14  |
| 14 bytes          | 3,22E+15  | 1,02E+16  | 5,47E+16  | 8,48E+16  | 1,20E+17  | 2,19E+17  |
| 15 bytes          | 5,16E+16  | 1,63E+17  | 8,75E+17  | 1,36E+18  | 1,92E+18  | 3,50E+18  |
| 16 bytes          | 8,25E+17  | 2,62E+18  | 1,40E+19  | 2,17E+19  | 3,07E+19  | 5,60E+19  |
| 20 bytes          | 5,41E+22  | 1,71E+23  | 9,17E+23  | 1,42E+24  | 2,01E+24  | 3,67E+24  |
| 22 bytes          | 1,38E+25  | 4,39E+25  | 2,35E+26  | 3,64E+26  | 5,15E+26  | 9,39E+26  |
| 24 bytes          | 3,54E+27  | 1,12E+28  | 6,01E+28  | 9,33E+28  | 1,32E+29  | 2,40E+29  |
| 28 bytes          | 2,32E+32  | 7,36E+32  | 3,94E+33  | 6,11E+33  | 8,65E+33  | 1,58E+34  |
| 32 bytes          | 1,52E+37  | 4,82E+37  | 2,58E+38  | 4,01E+38  | 5,67E+38  | 1,03E+39  |
| 36 bytes          | 9,98E+41  | 3,16E+42  | 1,69E+43  | 2,63E+43  | 3,71E+43  | 6,77E+43  |
| 40 bytes          | 6,54E+46  | 2,07E+47  | 1,11E+48  | 1,72E+48  | 2,43E+48  | 4,44E+48  |
| 48 bytes          | 2,81E+56  | 8,90E+56  | 4,76E+57  | 7,39E+57  | 1,05E+58  | 1,91E+58  |
| 56 bytes          | 1,21E+66  | 3,82E+66  | 2,04E+67  | 3,17E+67  | 4,49E+67  | 8,18E+67  |
| 64 bytes          | 5,18E+75  | 1,64E+76  | 8,78E+76  | 1,36E+77  | 1,93E+77  | 3,51E+77  |
| 72 bytes          | 2,22E+85  | 7,05E+85  | 3,77E+86  | 5,86E+86  | 8,28E+86  | 1,51E+87  |
| 80 bytes          | 9,55E+94  | 3,03E+95  | 1,62E+96  | 2,51E+96  | 3,56E+96  | 6,48E+96  |
| 96 bytes          | 1,76E+114 | 5,59E+114 | 2,99E+115 | 4,64E+115 | 6,56E+115 | 1,20E+116 |
| 112 bytes         | 3,25E+133 | 1,03E+134 | 5,51E+134 | 8,56E+134 | 1,21E+135 | 2,21E+135 |

# Current Applications

## Google Photos

Creates shared link album with 70 char length (probably Base64-url) e.g.:

https://photos.google.com/share/CF111pMluO7DxBtyDDZl731xn_pX-Nk_N4bZrz-B3dopWdpV-Ozc59Kmy2blFe14IeRB2H

Alternative this 17 char Base64 string:

https://photos.app.goo.gl/Vyxy4gr1nQCXe9iTA

## Youtube

Creates video link slugs with length ~11 chars

https://youtu.be/eCm5fiRniXc

Playlist use 34 char links

https://www.youtube.com/playlist?list=PLMC9KNkIncKtGvr2kFRuXBVmBev6cAJ2u

## Github: Gist

Uses 32 char hex string for as id (also decimal found)

https://gist.github.com/cryptix/87127f76a94183747b53

## Doodle

A inviation Link has 16 chars of probably base36 or base32 encoding.

https://doodle.com/poll/a2scup5d2kbe1dpf

# Misc

## BaseX Encoding Length Calculation

* Base64: `4*(n/3)` 
* Base32: `n * 8 / 5`
```

