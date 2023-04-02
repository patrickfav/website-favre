---
title: 'Q: java.io.IOException : No authentication challenges found'
date: 2014-02-03
lastmod: 2023-03-26
description: 'java.io.IOException : No authentication challenges found'
summary: 'This was originally posted as an answer to the question "java.io.IOException : No authentication challenges found" on stackoverflow.com.'
aliases: [/link/ji5yg94p]
slug: 2014/javaioioexception-no-authentication-challenges-found
tags: ["java", "android", "authentication", "httpurlconnection", "ioexception"]
keywords: ["java", "android", "authentication", "httpurlconnection", "ioexception"]
alltags: ["java", "android", "authentication", "httpurlconnection", "ioexception"]
categories: ["stackoverflow"]
showEdit: false
showSummary: true
type: stackexchange
thumbnail: 'so_banner*'
deeplink: /link/ji5yg94p
originalContentLink: https://stackoverflow.com/questions/17121213/java-io-ioexception-no-authentication-challenges-found
originalContentType: stackexchange
originalContentId: 21534175
seSite: stackoverflow
seScore: 51
seViews: 34000
seIsAccepted: false
seQuestionId: 17121213
seAnswerLicense: CC BY-SA 4.0
seAnswerLink: https://stackoverflow.com/a/21534175/774398
---
This error happens because the server sends a 401 (Unauthorized) but does not give a [`WWW-Authenticate`](https://en.wikipedia.org/wiki/List_of_HTTP_header_fields#Response_fields) header which is a hint to the client what to do next. The `WWW-Authenticate` header tells the client, which kind of authentication is needed (either [Basic](http://en.wikipedia.org/wiki/Basic_access_authentication) or [Digest](http://en.wikipedia.org/wiki/Digest_access_authentication)). This is probably not very useful in headless http clients, but that's how the [HTTP 1.1 RFC is defined](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html#sec10.4.2). The error occurs because the lib tries to parse the `WWW-Authenticate` header but can't.

From the RFC:

> (...)The response MUST include a WWW-Authenticate header field (section 14.47) containing a challenge applicable to the requested resource.(...)

Possible solutions if you **can** change the server:

*   Add a fake "WWW-Authenticate" header like: `WWW-Authenticate: Basic realm="fake"`. This is a mere workaround not a solution, but it should work and the http client is satisfied ([see here a discussion of what you can put in the header](https://stackoverflow.com/questions/1748374/http-401-whats-an-appropriate-www-authenticate-header-value)). But beware that some http clients may automatically retry the request resulting in multiple requests (e.g. increments the wrong login count too often). This was observed with the iOS http client.
*   As proposed by _loudvchar_ in [this blog](http://loudvchar.blogspot.com.es/2010/11/avoiding-browser-popup-for-401.html) to avoid automatic reactions to the challenge like a pop-up login form in a browser, you can use a non-standard authentication method like so: `WWW-Authenticate: xBasic realm="fake"`. The important point is that the `realm` has to be included.
*   Use HTTP status code `403` instead of `401`. Its semantic is not the same and usually when working with login 401 is a correct response ([see here for a detailed discussion](https://stackoverflow.com/questions/3297048/403-forbidden-vs-401-unauthorized-http-responses)) but the safer solution in terms of compatibility.

Possible solutions if you **can't** change the server:

*   As @ErikZ wrote in his [post](https://stackoverflow.com/questions/12931791/java-io-ioexception-received-authentication-challenge-is-null-in-ics-4-0-3) you could use a try & catch

```java
HttpURLConnection connection = ...;
try {
    // Will throw IOException if server responds with 401.
    connection.getResponseCode(); 
} catch (IOException e) {
    // Will return 401, because now connection has the correct internal state.
    int responsecode = connection.getResponseCode(); 
}

```

*   Use different http client like [OkHttp](http://square.github.io/okhttp/)