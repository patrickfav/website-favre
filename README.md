# Jekyll Static Website Source for my private Website

[![Build Status](https://travis-ci.org/patrickfav/website-favre.svg?branch=master)](https://travis-ci.org/patrickfav/website-favre)

This is the source for the [Jekyll](https://jekyllrb.com) static website project for a very static website.

A [preview build](https://favre.netlify.com) can be found on [Netlify](https://app.netlify.com/sites/favre/overview).
The production site will be hosted on [Firbase Hosting](https://favre.at).

## Build

[Jekyll](https://jekyllrb.com) is a Ruby CLI and used as engine for Github Pages.

### Ruby

Jekyll requires Ruby 2.2+ so you might be required to install it.

First install all prerequisite libraries ([see also this post](https://stackoverflow.com/a/26595869/774398)):

    sudo apt-get update -y && sudo apt-get upgrade -y
    sudo apt-get install git-core curl zlib1g-dev build-essential libssl-dev libreadline-dev libyaml-dev libsqlite3-dev sqlite3 libxml2-dev libxslt1-dev libcurl4-openssl-dev python-software-properties libffi-dev

Then install Ruby itself:

    sudo apt-add-repository ppa:brightbox/ruby-ng
    sudo apt-get update
    sudo apt-get install ruby2.4 ruby2.4-dev build-essential dh-autoreconf

Then update the gems (Ruby package manager)

    sudo gem update

For details on how to do this on the [Linux subsystem for Windows 10 see here](https://jekyllrb.com/docs/windows/).

### Bundler and Jekyll

Install the `bundler`:

    gem install bundler
    
then, in the project root folder, install all the dependencies with

    bundle install

You should be able to run jekyll now with

    bundle exec jekyll -v

### Develop

With this command a development web-server will be started on [http://localhost:4000](http://localhost:4000)

    bundle exec jekyll serve --livereload

For more info see the [quick-start section](https://jekyllrb.com/docs/quickstart/).

### Build Site

With the following command the website will be packaged and copied to `_site`

    bundle exec jekyll build

## Continuous Deployment

# License

Proprietary: Patrick Favre-Bulle 2018
