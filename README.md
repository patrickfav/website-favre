# My Private Website

A simple website with a list of all of my open source projects and articles I wrote. Can be found on [favr.dev](https://favr.dev). Currently uses [CodeDoc](https://github.com/CONNECT-platform/codedoc/) as static code generator.

[![Build Status](https://travis-ci.org/patrickfav/website-favre.svg?branch=master)](https://travis-ci.org/patrickfav/website-favre)

## Prepare

Install [CodeDoc](https://github.com/CONNECT-platform/codedoc/):

```bash
npm i -g @codedoc/cli
```

then install everything in the local script and link the cli:

```bash
cd github-dl
npm install
npm link 
```

optinally update the content with

````bash
codedoc-content-downloader
````

## Serve

In the root dir do

````bash
codedoc serve
````

or

````bash
codedoc build
```` 

# License

Proprietary: Patrick Favre-Bulle 2020
