---
title: 'Q: Using Jackson ObjectMapper with Jersey'
date: 2014-01-16
lastmod: 2023-03-26
description: 'Using Jackson ObjectMapper with Jersey'
summary: 'This was originally posted as an answer to the question "Using Jackson ObjectMapper with Jersey" on stackoverflow.com.'
aliases: [/link/cjaczjy2]
slug: 2014/using-jackson-objectmapper-with-jersey
tags: ["java", "json", "spring", "rest", "jersey-2.0"]
keywords: ["java", "json", "spring", "rest", "jersey-2.0"]
alltags: ["java", "json", "spring", "rest", "jersey-2.0"]
categories: ["stackoverflow"]
showEdit: false
showSummary: true
type: stackexchange
thumbnail: 'so_banner*'
deeplink: /link/cjaczjy2
originalContentLink: https://stackoverflow.com/questions/20563640/using-jackson-objectmapper-with-jersey
originalContentType: stackexchange
originalContentId: 21167382
seSite: stackoverflow
seScore: 13
seViews: 45000
seIsAccepted: false
seQuestionId: 20563640
seAnswerLicense: CC BY-SA 4.0
seAnswerLink: https://stackoverflow.com/a/21167382/774398
---
**EDIT**: Don't use the _old approach below_ as it produces bugs (at least with android device, see _EDIT2_ for more details). As of my tests, Jersey v2.6 seems to fix the problem with the `@Provide`, which approach did not work. I was able to get it work with this simple provider:

```java
@Provider
public class JerseyMapperProvider implements ContextResolver<ObjectMapper> {
    private static ObjectMapper apiMapper = ObjectMapperManager.createMapperForApi();
    @Override
    public ObjectMapper getContext(Class<?> type) {
        return apiMapper;
    }
}

```

So please don't use my hack from below.

* * *

**OLD APPROACH**

Using

```java
@Provider
public class MyObjectMapperProvider implements ContextResolver<ObjectMapper>

```

was not working for me (Jersey 2.4 & Jackson 2.3) and maybe this is due to an in the jackson provider reported bug in the code where the `ContextResolver` should be registered in `JacksonJsonProvider.java` (2.3rc1):

```java
@Override
protected ObjectMapper _locateMapperViaProvider(Class<?> type, MediaType mediaType) {
    if (_providers != null) {
        ContextResolver<ObjectMapper> resolver = _providers.getContextResolver(ObjectMapper.class, mediaType);
        /* Above should work as is, but due to this bug
         *   [https://jersey.dev.java.net/issues/show_bug.cgi?id=288]
         * in Jersey, it doesn't. But this works until resolution of
         * the issue:
         */
        if (resolver == null) {
            resolver = _providers.getContextResolver(ObjectMapper.class, null);
        }
        if (resolver != null) {
            return resolver.getContext(type);
        }
    }
    return null;
}

```

But at least I cannot access [https://jersey.dev.java.net/issues/show\_bug.cgi?id=288](https://jersey.dev.java.net/issues/show_bug.cgi?id=288), so I don't know what this bug is about.

However, I found a workaround (a hack if you so will). Just extend `JacksonJsonProvider` with the proper annotation and return your `ObjectMapper` like this:

```java
@Provider
@Consumes(MediaType.APPLICATION_JSON) // NOTE: required to support "non-standard" JSON variants
@Produces(MediaType.APPLICATION_JSON)
public class JacksonHackProvider extends JacksonJsonProvider {
    @Override
    protected ObjectMapper _locateMapperViaProvider(Class<?> type, MediaType mediaType) {
        return new MyCustomObjectMapper();
    }
}

```

No need to do anything it will register itself (check with log, it will register the first time you access a JSON rest service). This is now working for me, not elegant, but I gave up.

**EDIT**: Use with caution - I'm experiencing a bug maybe related to this hack: Android volley cannot send a POST/PUT request with a request body, always getting 400 from the framework, I will investigate and report my findings.

**EDIT2**: This hack was indeed responsible for a generic 400 whenever an Android app with volley and `OKHTTP` client tried to do a POST or PUT request so don't use this - in my test jersey 2.6 seems to fix this, so you can use `@Provide` approach