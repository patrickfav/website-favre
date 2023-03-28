---
title: 'Q: java.io.IOException: Received authentication challenge is null in ICS 4.0.3'
date: 2014-02-03
lastmod: 2017-05-23
description: 'java.io.IOException: Received authentication challenge is null in ICS 4.0.3'
summary: 'This was originally posted as an answer to the question "java.io.IOException: Received authentication challenge is null in ICS 4.0.3" on stackoverflow.com.'
aliases: [/link/25msrj5f]
slug: 2014/javaioioexception-received-authentication-challenge-is-null-in-ics-403
tags: ["android", "httpurlconnection"]
keywords: ["android", "httpurlconnection"]
alltags: ["android", "httpurlconnection"]
categories: ["stackoverflow"]
showEdit: false
showSummary: true
type: stackoverflow
thumbnail: 'sobanner*'
deeplink: /link/25msrj5f
originalContentLink: https://stackoverflow.com/questions/12931791/java-io-ioexception-received-authentication-challenge-is-null-in-ics-4-0-3
originalContentType: stackoverflow
originalContentId: 21534247
soScore: 1
soViews: 14000
soIsAccepted: false
soQuestionId: 12931791
soAnswerLicense: CC BY-SA 3.0
soAnswerLink: https://stackoverflow.com/a/21534247/774398
---
This error happens beause the server sends a 401 (Unauthorized) but does not give a "WWW-Authenticate" which is a hint for the client what to do next. The "WWW-Authenticate" Header tells the client which kind of authentication is needed (either [Basic](http://en.wikipedia.org/wiki/Basic_access_authentication) or [Digest](http://en.wikipedia.org/wiki/Digest_access_authentication)). This is usually not very useful in headless http clients, but thats how the standard is defined. The error occurs because the lib tries to parse the "WWW-Authenticate" header but can't.

Possible solutions if you can change the server:

*   Add a fake "WWW-Authenticate" header like: `WWW-Authenticate: Basic realm="fake"`. This is a mere workaround not a solution, but it should work and the http client is satisfied.
*   Use HTTP status code `403` instead of `401`. It's semantic is not the same and usually when working with login 401 is a correct response ([see here for detailed discussion](https://stackoverflow.com/questions/3297048/403-forbidden-vs-401-unauthorized-http-responses)) but its close enough.

Possible solutions if you can't change the server:

As @ErikZ wrote in his [post](https://stackoverflow.com/questions/12931791/java-io-ioexception-received-authentication-challenge-is-null-in-ics-4-0-3) you could use a try&catch

```
HttpURLConnection connection = ...;
try {
    // Will throw IOException if server responds with 401.
    connection.getResponseCode(); 
} catch (IOException e) {
    // Will return 401, because now connection has the correct internal state.
    int responsecode = connection.getResponseCode(); 
}

```

I also posted this here: [java.io.IOException : No authentication challenges found](https://stackoverflow.com/questions/17121213/java-io-ioexception-no-authentication-challenges-found/21534175#21534175)