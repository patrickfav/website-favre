---
title: 'docker-minipaint'
date: 2022-07-17
lastmod: 2023-01-30
lastfetch: 2023-02-05T10:49:25.080Z
description: 'This is a dockerized version of the miniPaint project by viliusle, a web/node based paint tool to self host.'
summary: 'This is a dockerized version of the miniPaint project by viliusle, a web/node based paint tool to self host.'
slug: docker-minipaint
tags: ["docker", "node", "self-hosted"]
keywords: ["docker", "node", "self-hosted"]
alltags: ["docker", "node", "self-hosted", "github", "Dockerfile"]
categories: ["opensource"]
editURL: https://github.com/patrickfav/docker-minipaint
originalContentLink: https://github.com/patrickfav/docker-minipaint
originalContentType: github
githubStars: 0
githubForks: 0
githubLanguage: Dockerfile
githubLicense: Apache License 2.0
---
# miniPaint Dockerized

[![Build Status](https://app.travis-ci.com/patrickfav/docker-minipaint.svg?branch=main)](https://app.travis-ci.com/patrickfav/docker-minipaint)

This is a dockerized version of the [miniPaint](https://github.com/viliusle/miniPaint) project by [viliusle](https://github.com/viliusle). To optimize for space and security this project only serves from [Alpine](https://www.alpinelinux.org/) with [nginx](https://www.nginx.com/) webserver.

## Quickstart

Use it as follows to run it locally on port 8080:

```bash
docker run -p 8080:80  pfav/minipaint:latest   
```

## Build

This image uses multi-stage docker to build and serve the application. It uses a node container to build and a simple nginx one to serve your files (i.e. no application server is in place while running):

```bash
docker build -t local/minipaint .
docker run -p 8080:80  local/minipaint
```

Per default, it uses port `80` and the version is fixed to a tag that can be found in the Dockerfile.

### Prepare Travis-CI

To set the encrypted env variables do

```bash
travis login --pro --debug --github-token=....
```
(Token needs `read:org, repo, user:email, write:repo_hook` [more here.](https://docs.travis-ci.com/user/github-oauth-scopes/#travis-ci-for-private-projects))


To attach the encrypted credentials do

```bash
travis encrypt --pro DOCKER_USERNAME="..."
travis encrypt --pro DOCKER_PASSWORD="..."
```
and add the data to the travis.yml.

## Deploy

By default, every commit will build and deploy `latest` tag. If you want to build and deploy a specific version, tag the
commit with the very same tag as is [used here](https://github.com/viliusle/miniPaint/releases).

# Credits

* [viliusle](https://github.com/viliusle) for providing miniPaint ([MIT License](https://github.com/viliusle/miniPaint/blob/master/MIT-LICENSE.txt))

# License

Copyright 2022 Patrick Favre-Bulle

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

```
http://www.apache.org/licenses/LICENSE-2.0
```

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
