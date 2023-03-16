---
title: 'The Concise Interface Implementation Pattern'
date: 2018-04-11
lastmod: 2023-02-26
lastfetch: 2023-03-16T21:34:56.616Z
summary: 'A convenient pattern to always use interfaces where possible but to keep the code-footprint and complexity of relations small'
description: 'A convenient pattern to always use interfaces where possible but to keep the code-footprint and complexity of relations small'
aliases: [/link/pjmmxwy7]
slug: 2018/the-concise-interface-implementation-pattern
tags: ["Programming"]
keywords: ["java", "interfaces", "patterns", "dependency-injection", "testing"]
alltags: ["java", "interfaces", "patterns", "dependency-injection", "testing", "Programming", "medium"]
categories: ["article", "medium"]
deeplink: /link/pjmmxwy7
originalContentLink: https://medium.com/@patrickfav/the-concise-interface-implementation-pattern-9b15f35a806b
originalContentType: medium
mediumClaps: 0
mediumVoters: 0
mediumArticleId: 9b15f35a806b
---
![](article_19e386ffa7c7e9d1c5267b3a.jpeg)

#### A convenient pattern to always use interfaces where possible but to keep the code-footprint and complexity of relations small

_This article recaps why using abstraction is better than concrete implementation and how to minimize the burden of overhead for using it. This is aimed at Java, but is valid in many statically typed languages which support OOP and the concept of contracts and inner classes._

Interfaces are great. They expose a clear API, enhance encapsulation and make clean polymorphism possible. Interfaces encourage you to think about responsibility and therefore the required methods and their signature, as well as nearly invite you to properly document them. Interfaces create the basic blocks of abstraction for a clean architecture.

Now in daily life it can get annoying to use interfaces everywhere. Especially in those instances were you are sure there will only be one implementation or usage in the foreseeable future. In which package should the interface and implementation go? What would be appropriate names? Is the overhead really worth it, considering the interface will not be exposed to other modules? For these instance I use the following pattern:

#### The Concise Interface Implementation

Use this pattern if

*   …you keep the interface module-private and do not plan the expose it as an API; i.e. it is implementation detail of the module
*   …expect only a single implementation (apart from creating mocks during testing)
*   …it is OK that interface and implementation have the same visibility

The goal is to keep the implementation concise, that means the interface and default implementation can be at the exact same location creating a kind of “mini” module. The implementation doesn’t even need its own unique name.

The template looks like this (Java 7+):

```
public interface MyInterface {

    void interfaceMethod1();  
  
    void interfaceMethod2();

    final class Default implements MyInterface{

        @Override  
        public void interfaceMethod1() {  
            //impl  
        }

        @Override  
        public void interfaceMethod2() {  
            //impl  
        }

    }  
}
```

You would define your interface, like any other. Then you add an inner final static (implied) class called Default representing your default implementation. Static inner classes do not have any reference to their outer class, so it behaves just like a normal class defined as top-level class.

And you would use it like this:

```
MyInterface m = new MyInterface.Default();
```

As you can see, the intent and usage is very clear: you instantiate the default implementation of MyInterface.

I believe seeing such a construct also conveys the exact properties described above: single implementation and module private; so developers can treat it accordingly.

#### Future-proof

If in any point in time you wish to have multiple implementation or expose this interface as an API you just move the Default implementation to its own class and give it a proper name ([IntelliJ can do this for you](https://www.jetbrains.com/help/idea/move-inner-to-upper-level-dialog-for-java.html)). The interface and implementation are not tied to each other, they are just defined in the same location in the source code.

#### Avoid unnecessary Naming

[Naming is hard](https://martinfowler.com/bliki/TwoHardThings.html). With this concept we avoid having to invent a synthetic name for the default implementation of a simple interface. Often times if developers get the naming wrong, it can get very confusing and hard to read, like this example:

```
TextTransformer t = new StringManager();
```

#### Avoid Codebase Clutter

No need to create new packages structures that do not match the intended one. No need to search for the implementation (although IDEs like [IntelliJ make it very easy](https://www.jetbrains.com/help/idea/navigating-to-super-method-or-implementation.html)).

#### Testable

One of the main benefits of using interfaces is the better testability. By using well-defined contracts mocking becomes easy. You can use either a mocking library like [Mockito](http://site.mockito.org/) or you just implement the interface in your test package. Either way you are able to exactly test the behavior you are interested in and mock the rest.

### Conclusion

By abstracting and creating contracts with interfaces we can create better software. Unfortunately in some cases using interfaces can be unnecessary overhead. The proposed concise interface implementation pattern mitigates this issue by defining the name and location of the implementation without removing the flexibility of later using multiple implementations or as a standalone API.


