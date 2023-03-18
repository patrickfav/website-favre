---
title: 'Snippet: A Liquid Filter for obfuscating an Email Address'
date: 2018-05-31
lastmod: 2023-02-25
description: 'A Liquid Filter for obfuscating an Email Address (can be used with Jekyll aswell).'
summary: 'A Liquid Filter for obfuscating an Email Address (can be used with Jekyll aswell).'
aliases: [/link/4auzrc32]
slug: 2018/a-liquid-filter-for-obfuscating-an-email-address
tags: ["Markdown", "Ruby"]
keywords: ["Markdown", "Ruby"]
alltags: ["Markdown", "Ruby"]
categories: ["opensource"]
type: gist
showTableOfContents: false
showTaxonomies: false
thumbnail: 'gistbanner*'
editURL: https://gist.github.com/3f9127e25dd6538f0d682b89cbfaefd9
deeplink: /link/4auzrc32
originalContentLink: https://gist.github.com/3f9127e25dd6538f0d682b89cbfaefd9
originalContentType: gist
gistLanguage: Markdown
gistFileCount: 2
gistComments: 6
gistCommentsUrl: https://api.github.com/gists/3f9127e25dd6538f0d682b89cbfaefd9/comments
---

### example_jekyll.md

```Markdown
In Jekyll set a variable for the mail, e.g. in the `_config.yml`

    email: name@mail.com

then use it in your page

    Reach me under:	{{ site.email | mailObfuscate }}
   
which will generate the following HTML

    <a href="#" data-contact="bmFtZUBtYWlsLmNvbQ== " target="_blank" onfocus="this.href = 'mailto:' + atob(this.dataset.contact)">    
        <script type="text/javascript">document.write(atob("bmFtZUBtYWlsLmNvbQ== "));</script>
    </a>

This uses some simple obfuscation techniques of url encode and base64 encode the mail and use JS to support the link and write it to HTML programmatically. This is certainly not bulletproof, but a good shield and in combination with a good spam filter this will fix your problem with mail crawlers.

These techniques are partly from http://techblog.tilllate.com/2008/07/20/ten-methods-to-obfuscate-e-mail-addresses-compared/

```

### mail_obfuscate.rb

```Ruby
require "base64"
require "uri"

module ObfuscateMailAddress
  def mailObfuscate(input)
    base64Mail = Base64.strict_encode64(URI::encode(input))

    # See http://techblog.tilllate.com/2008/07/20/ten-methods-to-obfuscate-e-mail-addresses-compared/
    output = "<a href=\"#\" "
    output += "data-contact=\"#{base64Mail}\" target=\"_blank\" "
    output += "onfocus=\"this.href = 'mailto:' + atob(this.dataset.contact)\">"
    output += "<script type=\"text/javascript\">document.write(atob(\"#{base64Mail}\"));</script></a>"
    return output
  end
end

Liquid::Template.register_filter(ObfuscateMailAddress)
```

