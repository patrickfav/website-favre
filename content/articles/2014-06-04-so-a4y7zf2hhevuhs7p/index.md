---
title: 'Q: View&#39;s getWidth() and getHeight() returns 0'
date: 2014-06-04
lastmod: 2020-06-23
description: 'View&#39;s getWidth() and getHeight() returns 0'
summary: 'This was originally posted as an answer to the question "View&#39;s getWidth() and getHeight() returns 0" on stackoverflow.com.'
aliases: [/link/a4y7zf2h]
slug: 2014/views-getwidth()-and-getheight()-returns-0
tags: ["java", "android", "android-layout", "getter"]
keywords: ["java", "android", "android-layout", "getter"]
alltags: ["java", "android", "android-layout", "getter"]
categories: ["stackoverflow"]
showEdit: false
showSummary: true
type: stackoverflow
thumbnail: 'sobanner*'
deeplink: /link/a4y7zf2h
originalContentLink: https://stackoverflow.com/questions/3591784/views-getwidth-and-getheight-returns-0
originalContentType: stackoverflow
originalContentId: 24035591
soScore: 968
soViews: 400385
soIsAccepted: false
soQuestionId: 3591784
soAnswerLicense: CC BY-SA 4.0
soAnswerLink: https://stackoverflow.com/a/24035591/774398
---
The basic problem is, that you have to wait for the drawing phase for the actual measurements (especially with dynamic
values like `wrap_content` or `match_parent`), but usually this phase hasn't been finished up to `onResume()`. So you
need a workaround for waiting for this phase. There a are different possible solutions to this:

1\. Listen to Draw/Layout Events: ViewTreeObserver
--------------------------------------------------

A ViewTreeObserver gets fired for different drawing events. Usually
the [`OnGlobalLayoutListener`](http://developer.android.com/reference/android/view/ViewTreeObserver.OnGlobalLayoutListener.html)
is what you want for getting the measurement, so the code in the listener will be called after the layout phase, so the
measurements are ready:

```
view.getViewTreeObserver().addOnGlobalLayoutListener(new ViewTreeObserver.OnGlobalLayoutListener() {
            @Override
            public void onGlobalLayout() {
                view.getViewTreeObserver().removeOnGlobalLayoutListener(this);
                view.getHeight(); //height is ready
            }
        });

```

Note: The listener will be immediately removed because otherwise it will fire on every layout event. If you have to
support apps _SDK Lvl < 16_ use this to unregister the listener:

`public void removeGlobalOnLayoutListener (ViewTreeObserver.OnGlobalLayoutListener victim)`

  

2\. Add a runnable to the layout queue: View.post()
---------------------------------------------------

Not very well known and my favourite solution. Basically just use the View's post method with your own runnable. This basically queues your code _after_ the view's measure, layout, etc. as stated by [Romain Guy](https://stackoverflow.com/users/298575/romain-guy):

> The UI event queue will process events in order. After setContentView() is invoked, the event queue will contain a message asking for a relayout, so anything you post to the queue will happen after the layout pass

Example:

```
final View view=//smth;
...
view.post(new Runnable() {
            @Override
            public void run() {
                view.getHeight(); //height is ready
            }
        });

```

The advantage over `ViewTreeObserver`:

*   your code is only executed once and you don't have to disable the Observer after execution which can be a hassle
*   less verbose syntax

References:

*   [https://stackoverflow.com/a/3602144/774398](https://stackoverflow.com/a/3602144/774398)
*   [https://stackoverflow.com/a/3948036/774398](https://stackoverflow.com/a/3948036/774398)

  

3\. Overwrite Views's onLayout Method
-------------------------------------

This is only practical in certain situation when the logic can be encapsulated in the view itself, otherwise this is a quite verbose and cumbersome syntax.

```
view = new View(this) {
    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        super.onLayout(changed, l, t, r, b);
        view.getHeight(); //height is ready
    }
};

```

Also mind, that onLayout will be called many times, so be considerate what you do in the method, or disable your code after the first time

  

4\. Check if has been through layout phase
------------------------------------------

If you have code that is executing multiple times while creating the ui you could use the following support v4 lib method:

```
View viewYouNeedHeightFrom = ...
...
if(ViewCompat.isLaidOut(viewYouNeedHeightFrom)) {
   viewYouNeedHeightFrom.getHeight();
}

```

> Returns true if view has been through at least one layout since it was last attached to or detached from a window.

Additional: Getting staticly defined measurements
-------------------------------------------------

If it suffices to just get the statically defined height/width, you can just do this with:

* [`View.getMeasuredWidth()`](http://developer.android.com/reference/android/view/View.html#getMeasuredWidth())
* [`View.getMeasuredHeigth()`](http://developer.android.com/reference/android/view/View.html#getMeasuredHeight())

But mind you, that this might be different to the actual width/height after drawing. The javadoc describes the difference in more detail:

> The size of a view is expressed with a width and a height. A view actually possess two pairs of width and height values.
> 
> The first pair is known as measured width and measured height. These dimensions define how big a view wants to be within its parent (see Layout for more details.) The measured dimensions can be obtained by calling getMeasuredWidth() and getMeasuredHeight().
> 
> The second pair is simply known as width and height, or sometimes drawing width and drawing height. These dimensions define the actual size of the view on screen, at drawing time and after layout. These values may, but do not have to, be different from the measured width and height. The width and height can be obtained by calling getWidth() and getHeight().
