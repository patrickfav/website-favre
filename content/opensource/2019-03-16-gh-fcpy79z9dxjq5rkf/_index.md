---
title: 'mvn-common-parent'
date: 2019-03-16
lastmod: 2023-02-11
lastfetch: 2023-03-17T17:54:28.809Z
description: 'A maven configuration which can be used as a commons config parent for POM files'
summary: 'A maven configuration which can be used as a commons config parent for POM files'
aliases: ['/link/fcpy79z9','/opensource/2019/mvn-common-parent']
url: opensource/mvn-common-parent
tags: ["common", "maven", "maven-parent"]
keywords: ["common", "maven", "maven-parent"]
alltags: ["common", "maven", "maven-parent", "github"]
categories: ["opensource"]
editURL: https://github.com/patrickfav/mvn-common-parent
showAuthor: true
deeplink: /link/fcpy79z9
originalContentLink: https://github.com/patrickfav/mvn-common-parent
originalContentType: github
githubCloneUrlHttp: https://github.com/patrickfav/mvn-common-parent.git
githubStars: 2
githubForks: 2
githubWatchers: 2
githubLanguage: null
githubHomepage: null
githubDefaultBranch: main
githubOpenIssues: 0
githubIsFork: false
githubLatestVersion: v20
githubLatestVersionDate: 2023-03-05T19:30:47Z
githubLatestVersionUrl: https://github.com/patrickfav/mvn-common-parent/releases/tag/v20
githubLicense: Apache License 2.0
---
# Maven Common Configuration
A maven configuration which is used as commons config parent for POM files for my maven open source projects. Defines a lot of defaults in `pluginManagement` and some in `dependencyManagement` and activates some plugins.

[](https://mvnrepository.com/artifact/at.favre.lib/common-parent)
[](https://github.com/patrickfav/mvn-common-parent/actions)

## Features

Here is a high level feature set of this project:

* Flexible JDK compiler config with using profiles
* [Checkstyle](http://checkstyle.sourceforge.net/)
* [Google Errorprone](https://github.com/google/error-prone) (Java 7)
* [Maven enforcer](https://maven.apache.org/enforcer/maven-enforcer-plugin/) (for Maven version)
* [Versions plugin](https://www.mojohaus.org/versions-maven-plugin/)
* [OWASP dependency checker](https://jeremylong.github.io/DependencyCheck/dependency-check-maven/)
* [Jacoco](https://www.eclemma.org/jacoco/) + [Coveralls](https://coveralls.io/)
* [Jarsigner](https://maven.apache.org/plugins/maven-jarsigner-plugin/)
* [Checksum](https://checksum-maven-plugin.nicoulaj.net/)
* Default versions for plugins in the [Super POM](http://maven.apache.org/ref/3.0.4/maven-model-builder/super-pom.html)
* Default versions for [junit](https://junit.org/junit4/), jackson, [bytes](https://github.com/patrickfav/bytes-java) and more

## Setup

Use as parent pom:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>at.favre.lib</groupId>
        <artifactId>common-parent</artifactId>
        <version>[current-version]</version>
    </parent>
    ...
</project>
```

Don't forget to overwrite `<scm>...</scm>` config, otherwise it will be inherited from this project.

### Maven Wrapper (recommended)

It is recommended to use [maven wrapper](https://maven.apache.org/wrapper/) in a new project. Initialize with:

```bash
mvn wrapper:wrapper  
```

then you can use `mvnw` instead of `mvn`. The advantage is that everybody (+ci) uses a pre-defined maven version. Even [IntelliJ has Maven wrapper support](https://plugins.jetbrains.com/plugin/10633-maven-wrapper-support).

## Configuration

There are many ways to easily customize the parent configuration without the need to change the POM itself. Have a look at the `commonConfig.*` properties in the POM and override them as you please in your `<properties />`.

Important config:

```xml
<!-- set this to true if fail because of missing credentials -->
<commonConfig.jarSign.skip>false</commonConfig.jarSign.skip>
```

Additionally, you can use maven itself to override certain settings. For instance if you want to deactivate checkstyle, just add

```xml
<plugins>
    <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-checkstyle-plugin</artifactId>
        <configuration>
            <skip>true</skip>
        </configuration>
    </plugin>
</plugins>    
```

### JDK Config

To set the JDK you want to use, this config uses profiles. The easiest way to activate one of the is to generate the file `.mvn/maven.config` and add e.g.:

```properties
-DcommonConfig.compiler.profile=jdk8_w_errorprone
```

Currently possible values:

* `jdk7`
* `jdk7_w_errorprone`
* `jdk8`
* `jdk8_w_errorprone`
* `jdk11`
* `jdk11_w_errorprone`
* `jdk17`
* `jdk17_w_errorprone`


You can check if the correct profile is set with

```bash
mvnw help:active-profiles
mvnw help:all-profiles
```
### Jacoco Minimum Coverage Rules

If the Jacoco plugin is used, some minimum coverage ratio checks are active. Change them with these properties:

* `commonConfig.jacoco.check.linecov` (60% default)
* `commonConfig.jacoco.check.methodcov` (70% default)
* `commonConfig.jacoco.check.classcov` (80% default)

You may disable the check by setting `commonConfig.jacoco.check.disable` to `true`.

### Reference to Project Root

If you need to use e.g. a file that lives within your project (e.g. the keystore file for jar-signing) make sure you
use the correct base path. There are two useful variables to help you:

* `${project.basedir}` is the path of your current module
* `${session.executionRootDirectory}` is the root path of your projects (and all your modules) - can be used in
  submodules

### Deploy

To deploy use activate the profile `deploy` and then you can use the nexus-staging plugin which deploys to
sonatype staging, closes the staging repo, then releases it to Maven Central:

```bash
./mvnw -B verify nexus-staging:deploy -P deploy && \
./mvnw -B nexus-staging:release -P deploy
```

The `verify` is necessary so that the correct lifecycle phase is called and gpg sign is activated.
This will also activate gpg sign which needs proper setup in `settings.xml`.
As side effect, this will also set property `commonConfig.deployMode.active` if you want to activate other profiles in accordance for example.

See also https://github.com/sonatype/nexus-maven-plugins/tree/main/staging/maven-plugin

## Built-In Plugins Explained

### Analyze

Check the created `pom` with

```bash
./mvnw help:effective-pom
```

You may check for updates of any plugins or dependencies with

```bash
./mvnw versions:display-dependency-updates
```

### Versions-Plugin

Check for possible dependency updates

```bash
./mvnw versions:display-dependency-updates
./mvnw versions:display-plugin-updates
./mvnw versions:display-property-updates
```

Set version through command line (or ci script)

```bash
./mvnw versions:set -DnewVersion=1.2.3-SNAPSHOT
```

## Related Projects

* externalized [checkstyle-config](https://github.com/patrickfav/checkstyle-config)

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
