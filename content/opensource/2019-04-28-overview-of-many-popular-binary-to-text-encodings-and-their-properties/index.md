---
title: 'Snippet: Overview of Many Popular Binary-to-Text Encodings and their properties.'
date: 2019-04-28
lastmod: 2023-02-26
lastfetch: 2023-02-26T18:53:25.263Z
description: 'Overview of Many Popular Binary-to-Text Encodings and their properties.'
summary: 'Overview of Many Popular Binary-to-Text Encodings and their properties.'
aliases: [/link/wkcx46r3]
slug: 2019/overview-of-many-popular-binary-to-text-encodings-and-their-properties
tags: ["Text"]
keywords: ["Text"]
alltags: ["Text"]
categories: ["opensource"]
type: gist
showTableOfContents: false
showTaxonomies: false
thumbnail: 'gistbanner*'
editURL: https://gist.github.com/00ba65af3a0ba059fbf24a437d21a104
deeplink: /link/wkcx46r3
originalContentLink: https://gist.github.com/00ba65af3a0ba059fbf24a437d21a104
originalContentType: gist
gistLanguage: Text
gistFileCount: 1
gistComments: 0
gistCommentsUrl: https://api.github.com/gists/00ba65af3a0ba059fbf24a437d21a104/comments
---

{{< info >}} Overview of Many Popular Binary-to-Text Encodings and their properties. The [original Gist](https://gist.github.com/00ba65af3a0ba059fbf24a437d21a104) can be found on Github.{{< /info >}}


### encoding_info.txt

```Text
## Binary

    ┌─────────────────┬──────────────────────────────────────────────────────────────────┐
    │ Efficiency      │ 12.5 % (1 bit/char), 1 bit segments                              │
    │ 32/64/128 bit   │ 1-32/1-64/1-128 chars                                            │
    │ Padding         │ false                                                            │
    │ Const. Out. Len.│ false                                                            │
    │ Suited for      │ number encoding, debugging                                       │
    │ Alphabet        │ 01                                                               │
    │ Known Usages    │ none                                                             │
    │ Standardization │ none                                                             │
    │ Example         │ 11010011 01111000 01101100 10010011 01111110 01111111 00111000   │
    └─────────────────┴──────────────────────────────────────────────────────────────────┘

## Octal

    ┌─────────────────┬──────────────────────────────────────────────────────────────────┐
    │ Efficiency      │ 37.5 % (3 bit/char), 24 bit segments                             │
    │ 32/64/128 bit   │ 1-11/1-22/1-43 chars                                             │
    │ Padding         │ false                                                            │
    │ Const. Out. Len.│ false                                                            │
    │ Suited for      │ number encoding                                                  │
    │ Alphabet        │ 01234567                                                         │
    │ Known Usages    │ chmod                                                            │
    │ Standardization │ none                                                             │
    │ Example         │ 703767722333074323                                               │
    └─────────────────┴──────────────────────────────────────────────────────────────────┘

## Dec

    ┌─────────────────┬──────────────────────────────────────────────────────────────────┐
    │ Efficiency      │ 41.5 % (3.32 bit/char)                                           │
    │ 32/64/128 bit   │ 1-10/1-20/1-39 chars                                             │
    │ Padding         │ false                                                            │
    │ Const. Out. Len.│ false                                                            │
    │ Suited for      │ number encoding                                                  │
    │ Alphabet        │ 0123456789                                                       │
    │ Known Usages    │ single byte representations                                      │
    │ Standardization │ none                                                             │
    │ Example         │ 15902780311763155                                                │
    └─────────────────┴──────────────────────────────────────────────────────────────────┘

## Hex

    ┌─────────────────┬──────────────────────────────────────────────────────────────────┐
    │ Efficiency      │ 50 % (4 bit/char), 8 bit segments                                │
    │ 32/64/128 bit   │ 8/16/32 chars                                                    │
    │ Padding         │ false                                                            │
    │ Const. Out. Len.│ true                                                             │
    │ Suited for      │ number & byte-string encoding                                    │
    │ Alphabet        │ 0123456789abcdef                                                 │
    │ Known Usages    │ widely used, e.g. UUIDs, cryptographic keys, ...                 │
    │ Standardization │ RFC 4648                                                         │
    │ Example         │ 387f7e936c78d3                                                   │
    └─────────────────┴──────────────────────────────────────────────────────────────────┘

## Base26

    ┌─────────────────┬──────────────────────────────────────────────────────────────────┐
    │ Efficiency      │ 58.8 % (4.70 bit/char)                                           │
    │ 32/64/128 bit   │ 7/14/28 chars                                                    │
    │ Padding         │ false                                                            │
    │ Const. Out. Len.│ true                                                             │
    │ Suited for      │ byte-string encoding                                             │
    │ Alphabet        │ ABCDEFGHIJKLMNOPQRSTUVWXYZ                                       │
    │ Known Usages    │ none                                                             │
    │ Standardization │ none                                                             │
    │ Example         │ EIQYWQEAJRFF                                                     │
    └─────────────────┴──────────────────────────────────────────────────────────────────┘

## Base32

    ┌─────────────────┬──────────────────────────────────────────────────────────────────┐
    │ Efficiency      │ 62.5 % (5 bit/char), 40 bit segments                             │
    │ 32/64/128 bit   │ 7+1/13+3/26+6 chars (+padding)                                   │
    │ Padding         │ true                                                             │
    │ Const. Out. Len.│ true                                                             │
    │ Suited for      │ byte-string encoding                                             │
    │ Alphabet        │ ABCDEFGHIJKLMNOPQRSTUVWXYZ234567                                 │
    │ Known Usages    │ none                                                             │
    │ Standardization │ RFC 4648                                                         │
    │ Variations      │ z-base-32, Crockford's Base32, base32hex, Geohash                │
    │ Example         │ HB7X5E3MPDJQ                                                     │
    └─────────────────┴──────────────────────────────────────────────────────────────────┘

## Base36

    ┌─────────────────┬──────────────────────────────────────────────────────────────────┐
    │ Efficiency      │ 64.6 % (5.17 bit/char)                                           │
    │ 32/64/128 bit   │ 1-7/1-13/1-25 chars                                              │
    │ Padding         │ false                                                            │
    │ Const. Out. Len.│ false                                                            │
    │ Suited for      │ big integer encoding                                             │
    │ Alphabet        │ 0123456789abcdefghijklmnopqrstuvwxyz                             │
    │ Known Usages    │ Reddit Url Slugs                                                 │
    │ Standardization │ none                                                             │
    │ Example         │ 4cl2cf404wj                                                      │
    └─────────────────┴──────────────────────────────────────────────────────────────────┘

## Base58

    ┌─────────────────┬──────────────────────────────────────────────────────────────────┐
    │ Efficiency      │ 73.2 % (5.86 bit/char)                                           │
    │ 32/64/128 bit   │ 6/11/22 chars                                                    │
    │ Padding         │ false                                                            │
    │ Const. Out. Len.│ false                                                            │
    │ Suited for      │ big integer encoding                                             │
    │ Alphabet        │ 123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz       │
    │ Known Usages    │ Bitcoin, IFPS                                                    │
    │ Standardization │ none                                                             │
    │ Variations      │ flicker short-urls                                               │
    │ Example         │ 39BQ5CdzFL                                                       │
    └─────────────────┴──────────────────────────────────────────────────────────────────┘

## Base64

    ┌─────────────────┬──────────────────────────────────────────────────────────────────┐
    │ Efficiency      │ 75 % (6 bit/char), 24 bit segments                               │
    │ 32/64/128 bit   │ 6+2/11+1/22+2 chars (+padding)                                   │
    │ Padding         │ true                                                             │
    │ Const. Out. Len.│ true                                                             │
    │ Suited for      │ byte-string encoding                                             │
    │ Alphabet        │ ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/ │
    │   (url-safe)    │ ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_ │
    │ Known Usages    │ practically everywhere                                           │
    │ Standardization │ RFC 4648 (previously RFC 3548)                                   │
    │ Variations      │ RFC 4880, RFC 1421, RFC 2152, RFC 3501, bcrypt radix64           │
    │ Example         │ OH9-k2x40w                                                       │
    │                 │ OH9+k2x40w (url-safe)                                            │
    └─────────────────┴──────────────────────────────────────────────────────────────────┘

## Ascii85

    ┌─────────────────┬──────────────────────────────────────────────────────────────────┐
    │ Efficiency      │ 80.1 % (6.41 bit/char)                                           │
    | 32/64/128 bit   │ 1-5/2-10/4-20 chars                                              │
    │ Padding         │ false                                                            │
    │ Const. Out. Len.│ false                                                            │
    │ Suited for      │ byte-string encoding                                             │
    │ Alphabet        │ 123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz       │
    │ Known Usages    │ Git, Adobe PDF and PostScript                                    │
    │ Variations      │ ZeroMQ, ZMODEM, btoa, Adobe, RFC 1924                            │
    │ Example         │ 3.HC@Cj=D                                                        │
    └─────────────────┴──────────────────────────────────────────────────────────────────┘

## Base122

    ┌─────────────────┬──────────────────────────────────────────────────────────────────┐
    │ Efficiency      │ 86.6 % (6.93 bit/char)                                           │
    | 32/64/128 bit   │ ?                                                                │
    │ Padding         │ false                                                            │
    │ Const. Out. Len.│ false                                                            │
    │ Suited for      │ embedding blobs in HTML (experimental)                           │
    │ Alphabet        │ full 7bit minus some reserved chars (UTF-8 compatible)           │
    │ Known Usages    │ none                                                             │
    │ Example         │ ��v�~�                                                       │
    └─────────────────┴──────────────────────────────────────────────────────────────────┘
```

