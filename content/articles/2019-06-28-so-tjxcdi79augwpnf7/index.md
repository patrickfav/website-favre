---
title: 'Q: Spring WebFlux differences when Netty vs. Tomcat is used under the hood'
date: 2019-06-28
lastmod: 2023-03-14
description: 'Spring WebFlux differences when Netty vs. Tomcat is used under the hood'
summary: 'This was originally posted as an answer to the question "Spring WebFlux differences when Netty vs. Tomcat is used under the hood" on stackoverflow.com.'
aliases: [/link/tjxcdi79]
slug: 2019/spring-webflux-differences-when-netty-vs-tomcat-is-used-under-the-hood
tags: ["java", "tomcat", "netty", "spring-webflux", "nonblocking"]
keywords: ["java", "tomcat", "netty", "spring-webflux", "nonblocking"]
alltags: ["java", "tomcat", "netty", "spring-webflux", "nonblocking"]
categories: ["stackoverflow"]
showEdit: false
showSummary: true
type: stackoverflow
thumbnail: 'sobanner*'
deeplink: /link/tjxcdi79
originalContentLink: https://stackoverflow.com/questions/56794263/spring-webflux-differences-when-netty-vs-tomcat-is-used-under-the-hood
originalContentType: stackoverflow
originalContentId: 56806022
soScore: 54
soViews: 31735
soIsAccepted: false
soQuestionId: 56794263
soAnswerLicense: CC BY-SA 4.0
soAnswerLink: https://stackoverflow.com/a/56806022/774398
---
Currently there are 2 basic concepts to handle parallel access to a web-server with various advantages and disadvantages:

1.  **Blocking**
2.  **Non-Blocking**

Blocking Web-Servers
--------------------

The first concept of _blocking, multi-threaded_ server has a finite set amount of threads in a pool. Every request will get assigned to specific thread and this thread will be assigned until the request has been fully served. This is basically the same as how a the checkout queues in a super market works, a customer at a time with possible parallel lines. In most circumstances a request in a web server will be cpu-idle for the majority of the time while processing the request. This is due the fact that it has to wait for I/O: read the socket, write to the db (which is also basically IO) and read the result and write to the socket. Additionally using/creating a bunch of threads is slow (context switching) and requires a lot of memory. Therefore this concept often does not use the hardware resources it has very efficiently and has a hard limit on how many clients can be served in parallel. This property is misused in so called starvation attacks, e.g. the [slow loris](https://www.youtube.com/watch?v=XiFkyR35v2Y), an attack where usually a single client can DOS a big multi-threaded web-server with little effort.

### Summary

*   (+) simpler code

*   (-) hard limit of parallel clients
*   (-) requires more memory
*   (-) inefficient use of hardware for usual web-server work
*   (-) easy to DOS

Most "conventional" web server work that way, e.g. older tomcat, Apache Webserver, and everything  `Servlet`  older than 3 or 3.1 etc.

Non-Blocking Web-Servers
------------------------

In contrast a non-blocking web-server can serve multiple clients with only a single thread. That is because it uses the _[non-blocking kernel I/O features](https://jameshfisher.com/2017/04/05/set_socket_nonblocking/)_. These are just kernel calls which immediately return and call back when something can be written or read, making the cpu free to do other work instead. Reusing our supermarket metaphor, this would be like, when a cashier needs his supervisor to solve a problem, he does not wait and block the whole lane, but starts to check out the next customer until the supervisor arrives and solves the problem of the first customer.

This is often done in an event loop or higher abstractions as [green-threads](https://en.wikipedia.org/wiki/Green_threads) or [fibers](https://cr.openjdk.java.net/%7Erpressler/loom/Loom-Proposal.html). In essence such servers can't really process anything _concurrently_ (of course you can have multiple non-blocking threads), but they are able to serve thousands of clients in parallel because the memory consumption will not scale as drastically as with the multi-thread concept (read: there is no hard limit on max parallel clients). Also there is no thread context-switching. The downside is, that non-blocking code is often more complex to read and write (e.g. [callback-hell](http://callbackhell.com/)) and doesn't prefrom well in situations where a request does a lot of cpu-expensive work.

### Summary

*   (-) more complex code
*   (-) performance worse with cpu intensive tasks

*   (+) uses resources much more efficiently as web server
*   (+) many more parallel clients with no hard-limit (except max memory)

Most modern "fast" web-servers and framework facilitate non-blocking concepts: Netty, Vert.x, Webflux, nginx, servlet 3.1+, Node, Go, and ASP.NET kestrel web servers.

As a side note, looking at this benchmark page you will see that most of the fastest web-servers are usually non-blocking ones: [https://www.techempower.com/benchmarks/](https://www.techempower.com/benchmarks/)

* * *

### See also

*   [https://stackoverflow.com/a/21155697/774398](https://stackoverflow.com/a/21155697/774398)
*   [https://www.quora.com/What-exactly-does-it-mean-for-a-web-server-to-be-blocking-versus-non-blocking](https://www.quora.com/What-exactly-does-it-mean-for-a-web-server-to-be-blocking-versus-non-blocking)