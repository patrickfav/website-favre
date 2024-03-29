---
title: 'checkstyle-config'
date: 2019-04-14
lastmod: 2023-03-02
description: 'Global checkstyle config to be reused in different projects. These include my own personal rules so your milage may vary.'
summary: 'Global checkstyle config to be reused in different projects. These include my own personal rules so your milage may vary.'
aliases: ['/link/y2ys6x9i','/opensource/2019/checkstyle-config']
url: opensource/checkstyle-config
tags: ["checkstyle", "checkstyle-plugin", "configuration", "java", "maven"]
keywords: ["checkstyle", "checkstyle-plugin", "configuration", "java", "maven"]
alltags: ["checkstyle", "checkstyle-plugin", "configuration", "java", "maven", "github"]
categories: ["opensource"]
editURL: https://github.com/patrickfav/checkstyle-config
showAuthor: true
deeplink: /link/y2ys6x9i
originalContentLink: https://github.com/patrickfav/checkstyle-config
originalContentType: github
originalContentId: 181350695
githubCloneUrlHttp: https://github.com/patrickfav/checkstyle-config.git
githubStars: 3
githubForks: 1
githubWatchers: 3
githubContributors: 1
githubRepoSize: 324
githubLanguage: null
githubHomepage: https://favr.dev/opensource/checkstyle-config
githubDefaultBranch: master
githubOpenIssues: 0
githubIsFork: false
githubLatestVersion: v2
githubLatestVersionDate: 2020-04-05T14:17:37Z
githubLatestVersionUrl: https://github.com/patrickfav/checkstyle-config/releases/tag/v2
githubLicense: Apache License 2.0
---
# Common Checkstyle Config

![Logo](img_c2911b1c6f131b95.png)

Externalized checkstyle configuration which can be used in other Maven projects.




## Description

This is a hand-picked, incrementally improved checkstyle configuration. It is more on the liberal side as I believe tools should work for the user not the other way around. Code style is subjective and this one might not be for you.

## Usage

Add this maven project as dependency to load the external checkstyle configuration. The name of the config xml is `checkstyle.xml`.

```xml
    <build>
        <plugins>
            <!-- checkstyle -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-checkstyle-plugin</artifactId>
                ...
                <dependencies>
                    ...
                    <!-- add this lib as dependency to load external checkstyle config -->
                    <dependency>
                        <groupId>at.favre.lib</groupId>
                        <artifactId>checkstyle-config</artifactId>
                        <version>{latest_version}</version>
                    </dependency>
                </dependencies>
                <configuration>
                    <configLocation>checkstyle.xml</configLocation>
                </configuration>
            </plugin>
            ...
```

See this [stackoverflow.com post](https://stackoverflow.com/a/19690484/774398) for more info.

### IDE Integration

#### IntelliJ

If you are using the [checkstyle plugin](https://plugins.jetbrains.com/plugin/1065-checkstyle-idea) for [IntelliJ](https://www.jetbrains.com/idea/) (which you should). You will find a copy of the configuration in the `/target` folder called `checkstyle-checker.xml`. 

# License

Copyright 2019 Patrick Favre-Bulle

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
