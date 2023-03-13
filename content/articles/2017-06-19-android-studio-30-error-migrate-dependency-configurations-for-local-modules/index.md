---
title: 'Q: Android Studio 3.0 Error. Migrate dependency configurations for local modules'
date: 2017-06-19
lastmod: 2017-11-02
lastfetch: 2023-03-13T17:19:49.655Z
description: 'Android Studio 3.0 Error. Migrate dependency configurations for local modules'
summary: 'This was originally posted as an answer to the question "Android Studio 3.0 Error. Migrate dependency configurations for local modules" on stackoverflow.com.'
aliases: [/link/dzwn7c4f]
slug: 2017/android-studio-30-error-migrate-dependency-configurations-for-local-modules
tags: ["android", "android-studio", "gradle", "android-studio-3.0"]
keywords: ["android", "android-studio", "gradle", "android-studio-3.0"]
alltags: ["android", "android-studio", "gradle", "android-studio-3.0"]
categories: ["stackoverflow"]
showEdit: false
showSummary: true
type: stackoverflow
thumbnail: 'sobanner*' 
deeplink: /link/dzwn7c4f
originalContentLink: https://stackoverflow.com/questions/44390590/android-studio-3-0-error-migrate-dependency-configurations-for-local-modules
originalContentType: stackoverflow
soScore: 33
soViews: 27699
soIsAccepted: false
soQuestionId: 44390590
soAnswerId: 44640156
soAnswerLicense: CC BY-SA 3.0
soAnswerLink: https://stackoverflow.com/a/44640156/774398
---
With the new plugin, the variant-aware dependency resolution

```
implementation project(':MyLib')

```

needs to have exact matching build types. [The migration guide describes this](https://developer.android.com/studio/preview/features/new-android-plugin-migration.html#variant_dependencies)

> For instance, it is not possible to make a 'debug' variant consume a 'release' variant through this mechanism because the producer and consumer would not match. (In this case, the name 'debug' refers to the published configuration object mentioned above in the Publishing Dependencies section.) Now that we publish two configurations, one for compiling and one for runtime, this old way of selecting one configuration really doesn't work anymore.

So the old method of

```
releaseCompile project(path: ':foo', configuration: 'debug')

```

will not work anymore.

Example
-------

With your example this would look like this:

In app  `build.gradle` :

```
apply plugin: 'com.android.application'

android {
  buildTypes {
    debug {}
    releaseApp {}
    releaseSdk {}
  }
  ...
  dependencies {
    implementation project(':MyLib')
  }
}

```

In module/lib 'MyLib'  `build.gradle` :

```
apply plugin: 'com.android.library'

android {
  buildTypes {
    debug {}
    releaseApp {}
    releaseSdk {}
  }
}

```

Therefore the build type must _exactly_ match, no more no less.

Using Build-Type Fallbacks
--------------------------

A new feature called "matchingFallbacks" can be used to define default buildtypes if a sub-module does not define the buildtype.

> Use matchingFallbacks to specify alternative matches for a given build type (...)

For example if module/lib 'MyLib' gradle would look like this:

```
apply plugin: 'com.android.library'

android {
  buildTypes {
    debug {}
    releaseLib {}
  }
}

```

You could define the following in your app  `build.gradle` :

```
apply plugin: 'com.android.application'

android {
  buildTypes {
    debug {}
    releaseApp {
        ...
        matchingFallbacks = ['releaseLib']
    }
    releaseSdk {
        ...
        matchingFallbacks = ['releaseLib']
    }
  }
  ...
  dependencies {
    implementation project(':MyLib')
  }
}

```

Missing Flavor Dimensions
-------------------------

> Use missingDimensionStrategy in the defaultConfig block to specify the default flavor the plugin should select from each missing dimension

```
android {
    defaultConfig {
        missingDimensionStrategy 'minApi', 'minApi18', 'minApi23'
        ...
    }
}

```