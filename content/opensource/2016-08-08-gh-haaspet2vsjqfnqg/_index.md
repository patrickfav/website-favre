---
title: 'bankathon16-inso'
date: 2016-08-08
lastmod: 2023-01-30
description: 'This is the prototype developed during the "Bankathon16" hackathon hosted by INSO.  It was a 2 day event, 3 developer worked on the project. This project achieved 2nd place in the ranking.'
summary: 'This is the prototype developed during the "Bankathon16" hackathon hosted by INSO.  It was a 2 day event, 3 developer worked on the project. This project achieved 2nd place in the ranking.'
aliases: ['/link/haaspet2','/opensource/2016/bankathon16-inso']
url: opensource/bankathon16-inso
tags: ["android", "financial", "hackathon", "nfc", "payment"]
keywords: ["android", "financial", "hackathon", "nfc", "payment"]
alltags: ["android", "financial", "hackathon", "nfc", "payment", "github", "Java"]
categories: ["opensource"]
editURL: https://github.com/patrickfav/bankathon16-inso
showAuthor: true
deeplink: /link/haaspet2
originalContentLink: https://github.com/patrickfav/bankathon16-inso
originalContentType: github
originalContentId: 65230148
githubCloneUrlHttp: https://github.com/patrickfav/bankathon16-inso.git
githubStars: 2
githubForks: 1
githubWatchers: 1
githubContributors: 1
githubRepoSize: 11132
githubLanguage: Java
githubHomepage: https://cashtechthon.inso.tuwien.ac.at/
githubDefaultBranch: master
githubOpenIssues: 0
githubIsFork: false
---

# My First Wallet #Bankathon16

This is the prototype developed during the ["Bankathon16"](https://cashtechthon.inso.tuwien.ac.at/gewinner-2016/) hackathon hosted by [INSO](https://www.inso.tuwien.ac.at/) (Technical University of Vienna). 
It was a 2 day event, 3 developers worked on the project. This project achieved 2nd place in the ranking.

![Banner](img_0a5902f422654bf6.png)

## Use Cases

This is basically a specialized payment and send money app with added functionality to provide this service to a minor with the parents supervision.

### Adding children
An envisioned app for the parents contains an administrative UI where a child can be registered.
To do this the parents mobile phone communicates through NFC with the child's app, automatically
registering it to the parent.

![Screenshot](img_ec21c2a0583f699a.png)
![Screenshot](img_dd4dfd054a639a36.png)

### Sending money
Parents can send money and set restrictions on how the money can be spent (e.g. max daily amount, specific
shops, etc.)

![Screenshot](img_414d5ae6774a5137.png)
![Screenshot](img_a385edea6c78f455.png)
![Screenshot](img_edff68a47fc2a419.png)

### Pay with children's App
The app can be used to pay at NFC payment terminals. It is implemented to work with simple NFC tags, although HCE is a possible real world solution for this.

![Screenshot](img_5f568cfe01174ebc.png)
![Screenshot](img_ae29252733a9f418.png)

### Save money
To learn financial literacy, a child can set a saving goal to set a certain amount of money aside
whenever it feels like it. This amount won't be able to be spent through the payment function. A parent
has to release the money.

![Screenshot](img_238738eb7cc464cc.png)

## Architecture

![Diagram](img_973580332fd6fd55.png)

### Noteable Technical Details

* Update App through GCM push
* App-to-App and payment with `android.nfc.action.NDEF_DISCOVERED` nfc communication
* Server uses Spring Boot & Postgres as 

## Build & Run

# App 
Use Android Studio and fill with the GCM sender id

    buildConfigField "String", "GCM_PROJECT_ID", "\"FILL_ME\""
    
in the build.gradle.    

# Server

Fill server GCM Api key in class `NotificationService.java`
Use gradle task `bootRun` to start the server.
