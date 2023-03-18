---
title: 'Snippet: A hugo shortcode that obfuscates email addresses'
date: 2023-02-25
lastmod: 2023-03-18
lastfetch: 2023-03-18T16:04:37.127Z
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
gistFileCount: 3
gistComments: 0
gistCommentsUrl: https://api.github.com/gists/649dcd1283c25f16b8b3aa6f3a05bd96/comments
---

### head.html

```HTML
{{/* If you are using a CSP header this is how you can whitelist the inline-script */}}
{{/* its not optimal since it only changes every day and only if you regenerate the site */}}

{{ $currentDayNonce := now | time.Format "2006-01-02" | md5 }}

<meta http-equiv="Content-Security-Policy"
    content="default-src 'self';
    script-src 'self' 'nonce-{{ $currentDayNonce }}';
    img-src 'self';"
/>
```

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
{{/* Get the input parameter */}}
{{ $mail := printf "%s" (.Get "mailto" )  }}

{{/* Shuffle a list of letters and syllable and select 3 words from it */}}
{{ $randomWords := slice "z" "y" "h" "a" "j" "k" "m" "wx" "me" "us" "up" "so" "by" "if" "it" "at" "dm" "an" "be" "do" "bag" "bat" "bit" "bet" "bun" "bus" "but" "dot" "duh" "hix" "dig" "dim" "zen" "did" "fit" "fan" "fin" }}
{{ $randomWordsShuffle := shuffle $randomWords }}
{{ $randomWord1 := index $randomWordsShuffle 0 }}
{{ $randomWord2 := index $randomWordsShuffle 1 }}
{{ $randomWord3 := index $randomWordsShuffle 2 }}

{{/* Generate a nonce that will change every day for e.g. whitelisting in CSP header */}}
{{ $currentDayNonce := now | time.Format "2006-01-02" | md5 }}

{{ $seed := now.UnixNano  }}
{{/* Generate a semi random hash from current time, input and the 3 random words */}}
{{ $randomId := (print (mod (add (mul 13 $seed) 97) 4000000) "_" $mail "_" $randomWord1 "_" $randomWord2 "_" $randomWord3 ) | md5 }}

{{/* Select the random position where the mail address will be cut into different pieces */}}
{{ $randomPosition := index (shuffle (seq (sub (len $mail) 1))) 0 }}

{{/* Create the label that will be rendered with some random words spilled in, since we set it to display:none they will not be shown, but visible in dom */}}
{{ $mailLabel := print (substr $mail 0 $randomPosition ) "<span id=\"mo_" $randomId "\">" $randomWord1 "" $randomWord2 "" $randomWord3 "</span>" (substr $mail $randomPosition (sub (len $mail) 1) ) | base64Encode }}

{{/* The mail payload for the data field to use in the inline script */}}
{{ $base64Mail := $mail | base64Encode }}

<style nonce="{{ $currentDayNonce }}">span#mo_{{ $randomId }} { display:none; }</style>
<a href='#'
   id="ma_{{ $randomId }}"
   data-contact='{{ $base64Mail }}'
   target='_blank' rel="nofollow">
    <script nonce="{{ $currentDayNonce }}">
      (function () {
        document.write(atob('{{ $mailLabel }}'))
        const elem = document.getElementById('ma_{{ $randomId }}')
        elem.addEventListener('focusin', () => {
          elem.href = 'mailto:' + atob(elem.dataset.contact);
        });
      })()</script>
</a>

```

