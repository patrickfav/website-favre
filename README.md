# Assembles all Readmes from Github and Articles from Markdown

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
