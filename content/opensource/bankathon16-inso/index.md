---
title: 'bankathon16-inso'
date: 2016-08-08
lastmod: 2023-01-30
description: 'This is the prototype developed during the "Bankathon16" hackathon hosted by INSO.  It was a 2 day event, 3 developer worked on the project. This project achieved 2nd place in the ranking.'
summary: 'This is the prototype developed during the "Bankathon16" hackathon hosted by INSO.  It was a 2 day event, 3 developer worked on the project. This project achieved 2nd place in the ranking.'
slug: bankathon16-inso
tags: ["android", "financial", "hackathon", "nfc", "payment"]
keywords: ["android", "financial", "hackathon", "nfc", "payment"]
alltags: ["android", "financial", "hackathon", "nfc", "payment", "github", "Java"]
categories: ["opensource"]
editURL: https://github.com/patrickfav/bankathon16-inso
originalContentLink: https://github.com/patrickfav/bankathon16-inso
originalContentType: github
githubStars: 2
githubForks: 1
githubLanguage: Java
---

# My First Wallet #Bankathon16

This is the prototype developed during the "Bankathon16" hackathon hosted by [INSO](https://www.inso.tuwien.ac.at/home/) (Technical University of Vienna). 
It was a 2 day event, 3 developers worked on the project. This project achieved 2nd place in the ranking.

![Banner](gh_ecc3c21df393fb8c795870f7.png)

## Use Cases

This is basically a specialized payment and send money app with added functionality to provide this service to a minor with the parents supervision.

### Adding children
An envisioned app for the parents contains an administrative UI where a child can be registered.
To do this the parents mobile phone communicates through NFC with the child's app, automatically
registering it to the parent.

![Screenshot](gh_8d52587a4a8379e2e947a0ff.png)
![Screenshot](gh_3c65e74fd18a13c8001fe19f.png)

### Sending money
Parents can send money and set restrictions on how the money can be spent (e.g. max daily amount, specific
shops, etc.)

![Screenshot](gh_66991bccdcd8a5f7201f6c3a.png)
![Screenshot](gh_94a5ae134f8cc748186bf0a1.png)
![Screenshot](gh_f0ab6fe4e533daea044abc50.png)

### Pay with children's App
The app can be used to pay at NFC payment terminals. It is implemented to work with simple NFC tags, although HCE is a possible real world solution for this.

![Screenshot](gh_ea4ac7559885dee5a67b8329.png)
![Screenshot](gh_a90e61f53fbc593c15cdab22.png)

### Save money
To learn financial literacy, a child can set a saving goal to set a certain amount of money aside
whenever it feels like it. This amount won't be able to be spent through the payment function. A parent
has to release the money.

![Screenshot](gh_66292085ab2bf5067f3e4edd.png)

## Architecture

![Diagram](gh_e9a761ca22dbf4e68124b08e.png)

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
