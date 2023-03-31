---
title: 'Q: How to add a URL to a LaTeX bibtex file?'
date: 2014-12-07
lastmod: 2014-12-07
description: 'How to add a URL to a LaTeX bibtex file?'
summary: 'This was originally posted as an answer to the question "How to add a URL to a LaTeX bibtex file?" on tex.stackexchange.com.'
aliases: [/link/ecm6k4d6]
slug: 2014/how-to-add-a-url-to-a-latex-bibtex-file
tags: ["urls", "bibtex"]
keywords: ["urls", "bibtex"]
alltags: ["urls", "bibtex"]
categories: ["tex"]
showEdit: false
showSummary: true
type: stackexchange
thumbnail: 'se_tex_banner*'
deeplink: /link/ecm6k4d6
originalContentLink: https://tex.stackexchange.com/questions/35977/how-to-add-a-url-to-a-latex-bibtex-file
originalContentType: stackexchange
originalContentId: 215892
seSite: tex
seScore: 18
seViews: 837000
seIsAccepted: false
seQuestionId: 35977
seAnswerLicense: CC BY-SA 3.0
seAnswerLink: https://tex.stackexchange.com/a/215892/42691
---

To use url with a `plain` bibliography style you can use this format:

```
@misc{Doe:2009:Online,
author = {author},
title = {Title of Citation},
year = {2010 (accessed December 7, 2014)}, 
howpublished = "\url{http://www.myurl.com}"}

```

Additionally you need to add the url package

```
\usepackage{url}

```

If you want to use the url attribute in you need to use natbib because standard bibstyles (such as plain) will not
typeset the url key contents of the individual entries; it is required to use one of natbib's own entries, e.g.
plainnat.

For example

```
@ONLINE{Doe:2009:Online,
author = {Doe, Ringo},
title = {This is a test entry of type {@ONLINE}},
month = jun,
year = {2009},
url = {http://www.test.org/doe/}
}

```

and the document

```
\documentclass{article}

\usepackage{biblatex}
\bibliography{test.bib}

\title{BibTeX Website citatations with the \textsf{biblatex}~package}
\date{}

\begin{document}

\maketitle
\nocite{Doe:2009:Online}
\printbibliography

\end{document}

```

Source: [http://nschloe.blogspot.ro/2009/06/bibtex-how-to-cite-website\_21.html](http://nschloe.blogspot.ro/2009/06/bibtex-how-to-cite-website_21.html)
