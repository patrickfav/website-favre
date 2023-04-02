---
title: 'Q: Android SlidingDrawer from top?'
date: 2013-08-20
lastmod: 2023-03-28
description: 'Android SlidingDrawer from top?'
summary: 'This was originally posted as an answer to the question "Android SlidingDrawer from top?" on stackoverflow.com.'
aliases: [/link/ycef5jpy]
slug: 2013/android-slidingdrawer-from-top
tags: ["android"]
keywords: ["android"]
alltags: ["android"]
categories: ["stackoverflow"]
showEdit: false
showSummary: true
type: stackexchange
thumbnail: 'so_banner*'
deeplink: /link/ycef5jpy
originalContentLink: https://stackoverflow.com/questions/3695856/android-slidingdrawer-from-top
originalContentType: stackexchange
originalContentId: 18341293
seSite: stackoverflow
seScore: 7
seViews: 34000
seIsAccepted: false
seQuestionId: 3695856
seAnswerLicense: CC BY-SA 4.0
seAnswerLink: https://stackoverflow.com/a/18341293/774398
---
I was very unsatisfied with the solutions provided here:

*   The `Panel` class from [http://code.google.com/p/android-misc-widgets/](http://code.google.com/p/android-misc-widgets/) was really unintuitive to use and also had bugs and visual glitches (unusable for productive use) and no docs at all
*   `SlidingTray` class from [http://aniqroid.sileria.com/doc/api/](http://aniqroid.sileria.com/doc/api/) was nested in a lib needing too much dependency and for me, I did not get it to work at all
*   using `android:rotation="180"` requires API Level 11, and my target is 10.

(no offense to the respective devs, trying to be objective here)

So my solution was to extract [SlidingTray](http://aniqroid.sileria.com/doc/api/com/sileria/android/view/SlidingTray.html) from this lib [http://aniqroid.sileria.com/doc/api/](http://aniqroid.sileria.com/doc/api/) (by Ahmed Shakil) and refactored it a bit since it had some quirks needed to be used within Ahmed's lib. `SlidingTray` is based on Androids own `SlidingDrawer`, so I guess it is stable. My modification consists of 1 class which I called `MultipleOrientationSlidingDrawer` and you have to add declare-styleables in your attrs.xml. Other than that it has pretty much the same usage as [SlidingDrawer](http://developer.android.com/reference/android/widget/SlidingDrawer.html) with the additional "orientation" attribute..

**Check it out: [MultipleOrientationSlidingDrawer (source & example) @ gist](https://gist.github.com/patrickfav/6284130)**

Here is a usage example (also provided in the gist)

```xml
<your.app.MultipleOrientationSlidingDrawer
        xmlns:custom="http://schemas.android.com/apk/res-auto/your.app"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        custom:handle="@+id/handle_c"
        custom:content="@+id/content_c"
        custom:orientation="top">
        <RelativeLayout
            android:id="@id/handle_c"
            android:layout_width="match_parent"
            android:layout_height="30dp"
            android:background="#333333">
            <TextView
                android:layout_width="wrap_content"
                android:layout_height="match_parent"
                android:text="Handle Text"
                android:gravity="left|center_vertical"/>
        </RelativeLayout>

        <FrameLayout
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            android:id="@id/content_c"
            android:background="#555555">

            <ListView
                android:id="@+id/listview_credits"
                android:layout_width="match_parent"
                android:layout_height="match_parent"/>
        </FrameLayout>
    </your.app.MultipleOrientationSlidingDrawer>

```

Disclaimer: All the credits go to respective dev. I did not test this solution extensively, it works great with TOP and BOTTOM set in XML. I did not try to use it programmatically.