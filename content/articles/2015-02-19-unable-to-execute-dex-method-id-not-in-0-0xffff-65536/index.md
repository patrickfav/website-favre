---
title: 'Q: Unable to execute dex: method ID not in [0, 0xffff]: 65536'
date: 2015-02-19
lastmod: 2017-05-23
lastfetch: 2023-03-11T13:22:43.931Z
description: 'Unable to execute dex: method ID not in [0, 0xffff]: 65536'
summary: ''
aliases: [/link/fy578y5b]
slug: 2015/unable-to-execute-dex-method-id-not-in-0-0xffff-65536
tags: ["android", "dex"]
keywords: ["android", "dex"]
alltags: ["android", "dex"]
categories: ["stackoverflow"]
showEdit: false
showSummary: true
type: stackoverflow
thumbnail: 'sobanner*' 
deeplink: /link/fy578y5b
originalContentLink: https://stackoverflow.com/questions/15209831/unable-to-execute-dex-method-id-not-in-0-0xffff-65536
originalContentType: stackoverflow
soScore: 78
soViews: 145838
soIsAccepted: false
soQuestionId: 15209831
soAnswerId: 28606782
soAnswerLicense: CC BY-SA 3.0
soAnswerLink: https://stackoverflow.com/a/28606782/774398
---

{{< alert "stack-overflow" >}} This was originally posted as an [answer](https://stackoverflow.com/a/28606782/774398) to this [question](https://stackoverflow.com/questions/15209831/unable-to-execute-dex-method-id-not-in-0-0xffff-65536)  on stackoverflow.com{{< /alert >}}

As already stated, you have too many methods (more than 65k) in your project and libs.

Prevent the Problem: Reduce the number of methods with Play Services 6.5+ and support-v4 24.2+
----------------------------------------------------------------------------------------------

Since often the Google Play services is one of the main suspects in "wasting" methods with its [20k+ methods](http://jakewharton.com/play-services-is-a-monolith/). Google Play services version 6.5 or later, it is possible for you to include [Google Play services in your application using a number of smaller client libraries.](http://android-developers.blogspot.co.at/2014/12/google-play-services-and-dex-method.html) For example, if you only need GCM and maps you can choose to use these dependencies only:

```
dependencies {
    compile 'com.google.android.gms:play-services-base:6.5.+'
    compile 'com.google.android.gms:play-services-maps:6.5.+'
}

```

[The full list of sub libraries and it's responsibilities can be found in the official google doc](https://developer.android.com/google/play-services/setup.html?utm_campaign=dex-1214&utm_source=dac&utm_medium=blog).

**Update**: Since Support Library v4 v24.2.0 it was split up into the following modules:

>  `support-compat` ,  `support-core-utils` ,  `support-core-ui` ,  `support-media-compat`  and  `support-fragment` 

```
dependencies {
    compile 'com.android.support:support-fragment:24.2.+'
}

```

Do note however, if you use  `support-fragment` , it will have dependencies to all the other modules (ie. if you use  `android.support.v4.app.Fragment`  there is no benefit)

[See here the official release notes for support-v4 lib](https://developer.android.com/topic/libraries/support-library/revisions.html)

* * *

Enable MultiDexing
------------------

Since Lollipop (aka build tools 21+) it is very easy to handle. The approach is to work around the 65k methods per dex file problem to create multiple dex files for your app. Add the following to your gradle build file ([this is taken from the official google doc on applications with more than 65k methods](http://developer.android.com/tools/building/multidex.html)):

```
android {
    compileSdkVersion 21
    buildToolsVersion "21.1.0"

    defaultConfig {
        ...
        // Enabling multidex support.
        multiDexEnabled true
    }
    ...
}

dependencies {
  compile 'com.android.support:multidex:1.0.1'
}

```

The second step is to either prepare your Application class or if you don't extend Application use the  `MultiDexApplication`  in your Android Manifest:

Either add this to your Application.java

```
@Override
  protected void attachBaseContext(Context base) {
    super.attachBaseContext(base);
    MultiDex.install(this);
  }

```

**or** use the provided application from the mutlidex lib

```
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.android.myapplication">
    <application
        ...
        android:name="android.support.multidex.MultiDexApplication">
        ...
    </application>
</manifest>

```

* * *

Prevent OutOfMemory with MultiDex
---------------------------------

As further tip, if you run into  `OutOfMemory`  exceptions during the build phase you could enlarge the heap with

```
android {
    ...
    dexOptions {
        javaMaxHeapSize "4g"
    }
}

```

which would set the heap to 4 gigabytes.

[See this question for more detail on the dex heap memory issue.](https://stackoverflow.com/questions/25013638/android-studio-google-jar-causing-gc-overhead-limit-exceeded-error)

* * *

Analyze the source of the Problem
---------------------------------

To analyze the source of the methods the gradle plugin [https://github.com/KeepSafe/dexcount-gradle-plugin](https://github.com/KeepSafe/dexcount-gradle-plugin) can help in combination with the dependency tree provided by gradle with e.g.

```
.\\gradlew app:dependencies

```

[See this answer and question for more information on method count in android](https://stackoverflow.com/a/32328348/774398)