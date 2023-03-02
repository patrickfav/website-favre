# Static Site Gen Repo for my Personal Website

A simple website with a list of all of my open source projects and articles I wrote. Can be found on [favr.dev](https://favr.dev). Uses [Hugo](https://gohugo.io/) as static site generator.

[![Build Status](https://github.com/patrickfav/website-favre/actions/workflows/build_deploy.yml/badge.svg)](https://github.com/patrickfav/website-favre/actions)
[![Build Status](https://github.com/patrickfav/website-favre/actions/workflows/check_site.yml/badge.svg)](https://github.com/patrickfav/website-favre/actions)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=patrickfav_website-favre&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=patrickfav_website-favre)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=patrickfav_website-favre&metric=bugs)](https://sonarcloud.io/summary/new_code?id=patrickfav_website-favre)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=patrickfav_website-favre&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=patrickfav_website-favre)

![Screenshot Website](https://github.com/patrickfav/website-favre/blob/main/.readme/banner.png?raw=true)

## Prepare

## Build & Run

### Install Hugo

* Windows `choco install hugo-extended`
* Mac `brew install hugo`

### Cloning Project with Submodule

This project uses a git submodule for including the theme. To correctly clone it you need to do

```bash
git clone https://github.com/patrickfav/website-favre.git
git submodule init
git submodule update
```

### Prepare Content

Install everything in the local script and link the cli:

```bash
cd content-downloader
npm install
npm link 
```

optionally update the content with

```bash
hugo-content-downloader
```

### Using the build & run Docker Image

A docker image that builds everything, updates the content and then can be used to locally serve the website with nginx can be created by doing:

```bash
docker build --no-cache --progress=plain -t websitefavre:latest .
docker run -p 8080:80 websitefavre:latest
```

and then you can access the page with `http://localhost:8080`

# License

Proprietary: Patrick Favre-Bulle 2023
