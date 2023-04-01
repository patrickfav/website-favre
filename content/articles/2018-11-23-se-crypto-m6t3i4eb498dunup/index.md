---
title: 'Q: Where can I find official test vectors for NIST SP 800-56C r1 Single Step KDF'
date: 2018-11-23
lastmod: 2018-11-23
description: 'Where can I find official test vectors for NIST SP 800-56C r1 Single Step KDF'
summary: 'This was originally posted as the accepted answer to the question "Where can I find official test vectors for NIST SP 800-56C r1 Single Step KDF" on crypto.stackexchange.com.'
aliases: [/link/m6t3i4eb]
slug: 2018/where-can-i-find-official-test-vectors-for-nist-sp-800-56c-r1-single-step-kdf
tags: ["key-derivation", "hkdf", "test-vectors", "kbkdf"]
keywords: ["key-derivation", "hkdf", "test-vectors", "kbkdf"]
alltags: ["key-derivation", "hkdf", "test-vectors", "kbkdf"]
categories: ["cryptography"]
showEdit: false
showSummary: true
type: stackexchange
thumbnail: 'se-crypto_banner*'
deeplink: /link/m6t3i4eb
originalContentLink: https://crypto.stackexchange.com/questions/64140/where-can-i-find-official-test-vectors-for-nist-sp-800-56c-r1-single-step-kdf
originalContentType: stackexchange
originalContentId: 64277
seSite: cryptography
seScore: 1
seViews: 2000
seIsAccepted: true
seQuestionId: 64140
seAnswerLicense: CC BY-SA 4.0
seAnswerLink: https://crypto.stackexchange.com/a/64277/44838
---
Since as of now (2018) there seems to be no official test vectors, I generated some of may own. The whole list covering SHA1, SHA256, SHA512 and HMAC-SHA256/SHA512 can be found here: [https://github.com/patrickfav/singlestep-kdf/wiki/NIST-SP-800-56C-Rev1:-Non-Official-Test-Vectors](https://github.com/patrickfav/singlestep-kdf/wiki/NIST-SP-800-56C-Rev1:-Non-Official-Test-Vectors)

Here is a snippet:

### SHA-256

```
(z: afc4e154498d4770aa8365f6903dc83b, L: 16, fixedInfo: 662af20379b29d5ef813e655) = f0b80d6ae4c1e19e2105a37024e35dc6
(z: a3ce8d61d699ad150e196a7ab6736a63, L: 16, fixedInfo: ce5cd95a44ee83a8fb83f34c) = 5db3455a22b65edfcfde3da3e8d724cd
(z: a9723e56045f0847fdd9c1c78781c8b7, L: 16, fixedInfo: e69b6005b78f7d42d0a8ed2a) = ac3878b8cf357976f7fd8266923e1882
(z: a07a5e8df7ee1b2ce2a3d1348edfa8ab, L: 16, fixedInfo: e22a8ee34296dd39b56b31fb) = 70927d218b6d119268381e9930a4f256

(z: 3f892bd8b84dae64a782a35f6eaa8f00, L: 02, fixedInfo: ec3f1cd873d28858a58cc39e) = a7c0
(z: 3f892bd8b84dae64a782a35f6eaa8f00, L: 36, fixedInfo: ec3f1cd873d28858a58cc39e) = a7c0665298252531e0db37737a374651b368275f2048284d16a166c6d8a90a91a491c16f
(z: 3f892bd8b84dae64a782a35f6eaa8f00, L: 68, fixedInfo: ec3f1cd873d28858a58cc39e) = a7c0665298252531e0db37737a374651b368275f2048284d16a166c6d8a90a91a491c16f49641b9f516a03d9d6d0f4fe7b81ffdf1c816f40ecd74aed8eda2b8a3c714fa0

(z: 9ce5457e4a0eecc1c8709f7ef37a32e9, L: 16, fixedInfo: ) = 7d81e7d61acc06b90984ec4145469608

```

### HMAC-SHA256

```
(z: 6ee6c00d70a6cd14bd5a4e8fcfec8386, L: 16, salt: 532f5131e0a2fecc722f87e5aa2062cb, fixedInfo: 861aa2886798231259bd0314) = 13479e9a91dd20fdd757d68ffe8869fb
(z: cb09b565de1ac27a50289b3704b93afd, L: 16, salt: d504c1c41a499481ce88695d18ae2e8f, fixedInfo: 5ed3768c2c7835943a789324) = f081c0255b0cae16edc6ce1d6c9d12bc
(z: 98f50345fd970639a1b7935f501e1d7c, L: 16, salt: 3691939461247e9f74382ae4ef629b17, fixedInfo: 6ddbdb1314663152c3ccc192) = 56f42183ed3e287298dbbecf143f51ac

(z: 02b40d33e3f685aeae677ac344eeaf77, L: 02, salt: 0ad52c9357c85e4781296a36ca72039c, fixedInfo: c67c389580128f18f6cf8592) = be32
(z: 02b40d33e3f685aeae677ac344eeaf77, L: 36, salt: 0ad52c9357c85e4781296a36ca72039c, fixedInfo: c67c389580128f18f6cf8592) = be32e7d306d891028be088f213f9f947c50420d9b5a12ca69818dd9995dedd8e6137c710
(z: 02b40d33e3f685aeae677ac344eeaf77, L: 68, salt: 0ad52c9357c85e4781296a36ca72039c, fixedInfo: c67c389580128f18f6cf8592) = be32e7d306d891028be088f213f9f947c50420d9b5a12ca69818dd9995dedd8e6137c7104d67f2ca90915dda0ab68af2f355b904f9eb0388b5b7fe193c9546d45849133d

(z: 2c2438b6321fed7a9eac200b91b3ac30, L: 56, salt: 6199187690823def2037e0632577c6b1, fixedInfo: ) = b402fda16e1c2719263be82158972c9080a7bafcbe0a3a6ede3504a3d5c8c0c0e00fe7e5f6bb3afdfa4d661b8fbe4bd7b950cfe0b2443bbd
(z: 0ffa4c40a822f6e3d86053aefe738eac, L: 64, salt: 6199187690823def2037e0632577c6b1, fixedInfo: ) = 0486d589aa71a603c09120fb76eeab3293eee2dc36a91b23eb954d6703ade8a7b660d920c5a6f7bf3898d0e81fbad3a680b74b33680e0cc6a16aa616d078b256
(z: a801d997ed539ae9aa05d17871eb7fab, L: 08, fixedInfo: 03697296e42a6fdbdb24b3ec) = 1a5efa3aca87c1f4
(z: e9624e112f9e90e7bf8a749cf37d920c, L: 16, fixedInfo: 03697296e42a6fdbdb24b3ec) = ee93ca3986cc43516ae4e29fd7a90ef1

```