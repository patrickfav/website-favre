# Static Site Gen Repo for my Personal Website

A simple website with a list of all of my open source projects and articles I wrote. Can be found on [favr.dev](https://favr.dev). Currently uses [CodeDoc](https://github.com/CONNECT-platform/codedoc/) as static code generator.

[![Build Status](https://travis-ci.com/patrickfav/website-favre.svg?branch=master)](https://travis-ci.com/patrickfav/website-favre)

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

optinally update the content with

```bash
hugo-content-downloader
```

# License

Proprietary: Patrick Favre-Bulle 2020
