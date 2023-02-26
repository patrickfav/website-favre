---
title: 'Snippet: Encrypt .ppm file with AES-ECB to show ECB will reveal patterns'
date: 2018-11-17
lastmod: 2020-11-05
lastfetch: 2023-02-26T18:53:25.085Z
description: 'Encrypt .ppm file with AES-ECB to show ECB will reveal patterns'
summary: 'Encrypt .ppm file with AES-ECB to show ECB will reveal patterns'
aliases: [/link/b84zqhi6]
slug: 2018/encrypt-ppm-file-with-aes-ecb-to-show-ecb-will-reveal-patterns
tags: ["Shell"]
keywords: ["Shell"]
alltags: ["Shell"]
categories: ["opensource"]
type: gist
showTableOfContents: false
showTaxonomies: false
thumbnail: 'gistbanner*'
editURL: https://gist.github.com/13b2f727eaf91e3a72d87ac427485cb1
deeplink: /link/b84zqhi6
originalContentLink: https://gist.github.com/13b2f727eaf91e3a72d87ac427485cb1
originalContentType: gist
gistLanguage: Shell
gistFileCount: 1
gistComments: 1
gistCommentsUrl: https://api.github.com/gists/13b2f727eaf91e3a72d87ac427485cb1/comments
---

{{< info >}} Encrypt .ppm file with AES-ECB to show ECB will reveal patterns The [original Gist](https://gist.github.com/13b2f727eaf91e3a72d87ac427485cb1) can be found on Github.{{< /info >}}


### encrypt_img_ecb.sh

```Shell
#!/bin/sh

# This is part of my blog about AES: https://medium.com/p/7616beaaade9
# Inspired by https://blog.filippo.io/the-ecb-penguin/

# Convert your image to .ppm with Gimp or Photoshop
#
# Usage: ./ecb_img <image file as ppm> <password>

# extract header and body
head -n 4 $1 > $1.header.txt
tail -n +5 $1 > $1.body.bin

# encrypt with ecb and given password
openssl enc -aes-128-ecb -nosalt -pass pass:"$2" -in  $1.body.bin -out $1.body.ecb.bin

# reassemble image
cat $1.header.txt $1.body.ecb.bin > $1.ecb.ppm

# Clean up temp files
rm $1.header.txt
rm $1.body.bin
rm $1.body.ecb.bin

echo "encrypted image to $1.ecb.ppm"

```

