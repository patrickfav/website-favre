---
title: 'Snippet: A hugo shortcode that obfuscates email addresses'
date: 2023-02-25
lastmod: 2023-02-26
lastfetch: 2023-03-05T20:13:20.690Z
description: 'A hugo shortcode that obfuscates email addresses; makes it more difficult for bots to crawl it from your website. Add the html file to your "layouts/shortcodes/" folder then you can use it in your content.'
summary: 'A hugo shortcode that obfuscates email addresses; makes it more difficult for bots to crawl it from your website. Add the html file to your "layouts/shortcodes/" folder then you can use it in your content.'
aliases: [/link/4sh8eqre]
slug: 2023/a-hugo-shortcode-that-obfuscates-email-addresses
tags: ["HTML", "Text"]
keywords: ["HTML", "Text"]
alltags: ["HTML", "Text"]
categories: ["opensource"]
type: gist
showTableOfContents: false
showTaxonomies: false
thumbnail: 'gistbanner*'
editURL: https://gist.github.com/649dcd1283c25f16b8b3aa6f3a05bd96
deeplink: /link/4sh8eqre
originalContentLink: https://gist.github.com/649dcd1283c25f16b8b3aa6f3a05bd96
originalContentType: gist
gistLanguage: HTML
gistFileCount: 2
gistComments: 0
gistCommentsUrl: https://api.github.com/gists/649dcd1283c25f16b8b3aa6f3a05bd96/comments
---

{{< info >}} A hugo shortcode that obfuscates email addresses; makes it more difficult for bots to crawl it from your website. Add the html file to your "layouts/shortcodes/" folder then you can use it in your content. The [original Gist](https://gist.github.com/649dcd1283c25f16b8b3aa6f3a05bd96) can be found on Github.{{< /info >}}


### index.md.txt

```Text
---
title: ...
...
---

# Email Address

My Email address is {{&#60; mail-address-obfuscate mailto="example@example.com" >}}

```

### mail-address-obfuscate.html

```HTML
{{ $mail := printf "%s" (.Get "mailto" )  }}

{{ $seed := now.Unix  }}
{{ $randomId := mod (add (mul 13 $seed) 97) 4000000 | md5 }}
{{ $randomPosition := index (shuffle (seq (sub (len $mail) 1))) 0 }}

{{ $randomWords := slice "f" "g" "h" "i" "j" "k" "l" "m" "we" "me" "us" "up" "so" "by" "if" "it" "at" "am" "an" "be" "do" "bag" "bat" "bit" "bet" "bun" "bus" "but" "dot" "duh" "dip" "dig" "dim" "den" "did" "fit" "fan" "fun" "fin" }}
{{ $randomWordsShuffle := shuffle $randomWords }}
{{ $randomWord1 := index $randomWordsShuffle 0 }}
{{ $randomWord2 := index $randomWordsShuffle 1 }}
{{ $randomWord3 := index $randomWordsShuffle 2 }}

{{ $mailLabel := print (substr $mail 0 $randomPosition ) "<span id=\"mo_" $randomId "\">" $randomWord1 "" $randomWord2 "" $randomWord3 "</span>" (substr $mail $randomPosition (sub (len $mail) 1) ) | base64Encode }}
{{ $base64Mail := $mail | base64Encode }}

<style>span#mo_{{ $randomId }} { display:none; }</style>
<a href='#'
   data-contact='{{ $base64Mail }}'
   target='_blank' rel="nofollow"
   onfocusin='this.href = "mailto:" + atob(this.dataset.contact)'>
    <script type="text/javascript">document.write(atob("{{ $mailLabel }}"));</script>
</a>

```

