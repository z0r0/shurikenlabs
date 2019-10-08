---
layout: post
current: post
cover:  assets/images/post01-jekyll.png
navigation: True
title: Security, containers, and blogging with jekyll.
date: 2019-10-06 10:00:00
tags: [containers]
class: post-template
author: z0r0
---

Welcome to my first post! 

I've been toying with the idea of blogging for some time now, and this is ultimately my first real attempt at executing on that idea. I've got a whole bunch of idea's about the identity of this site, and the content that I'll be producing for it, but for now lets just walk through what my site is, and how it's put together.

## Security and the blogging ecosystem.
In the blogging ecosystem there are a few big players for hosted blogging platforms, and DIY CMS's to build into a blog. The most popular solutions can be distilled in a list down to:
- [Medium](https://medium.com) - A great hosted solution, and probably what I would have chosen had I not wanted to host a blog on K8s.
- [Wordpress](https://wordpress.com) - Hosted, or roll your own, it's a CMS with a robust ecosystem for plugins and extendability. 
- [Drupal](https://drupal.org)- A CMS that, in my experience, acts as a "Wordpress for superusers". A CMS that has greater extendability, with the added cost of complexity.

...
A myriad of smaller players in the CMS space.
...

- [Jekyll](https://jekyllrb.com)- A simple CMS that allows you to write your posts as markdown, and is compiled into static HTML to be served by a minimally configured webserver.

**Hint:** Jekyll is ultimately the solution I went with, and what you're actually viewing right now. 

### Attack surface == Maintenance

Before we go too far, I want to bring to light few things to keep in mind about my intention for this site as both a project, and as a playground for testing container orchestration. One of the target audiences of these posts are folks like myself, those that need to execute and balance all of the following design principals in harmony:  

- Security
- Scalability
- Orchestration
- Ease of use
- Governance

If you've ever managed a site like wordpress, drupal, joomla, etc, you know how much of a burden the actual maintenance of the site is. This is especially true when your focus is to design around with all of the above design principals in the forefront of your design decisions. Things like updates, bot/comment management, plugin management, all become a chore that distracts from the overall goal of creating content. This is why i've chosen **Jekyll** to serve this site.

## Jekyll, got it. Hows it work?

Now that we've got that design decision taken care of, I'll walk through a little bit of the build/deploy process. One final thing that I want to showcase with this site, is that all of this site's code and content can be viewed on my [Github Project](https://github.com/z0r0/shurikenlabs).
That's right, **All of my examples, and even the site itself** will be hosted on my github. Now that all of this is taken care of, lets take a look at how I'm working on, and building my site.

### Developing using docker-compose.

If you've never used docker, or docker compose, the first thing to keep in mind is that in order to execute your code,you've got to run a recipe, or a series of steps to create your container to run your code in. Here's the output of the dev service of my current (as of this post) docker-compose file, I'll add some comments here for visibility.

```
# docker-compose.yaml

services:
  dev:
    build:
      context: .
      dockerfile: ./docker/dev-dockerfile
    volumes:
      - ./site:/srv/jekyll
      - ./vendor/bundle:/usr/local/bundle
    ports:
      - 4000:4000
    environment:
      - JEKYLL_ENV=development
```

Lets go through this block by block, starting with my `docker-compose.yaml` so we can get the picture of what's going on:

```
services:
  dev:
    build:
      context: .
      dockerfile: ./docker/dev-dockerfile
```

Here, we're establishing that in order to build this container image, which we'll be using to develop the site on, we'll be telling `docker-compose` to assume that the root context for file paths within the build context start at the current directory. In addition to this, `docker-compose` is going to execute the dockerfile listed in `./docker/dev-dockerfile`, we'll be going through that below in the next section. Before that dockerfile is executed however, theres a few additional parameters that need to be passed in order for the image to be built.

```
    volumes:
      - ./site:/srv/jekyll
      - ./vendor/bundle:/usr/local/bundle
```
On the image to be built, mount the `./site`, and `./vendor/bundle` directories to the appropriate destination paths. 

```
    ports:
      - 4000:4000
```
Finally, we're forwarding on traffic passed to localhost:4000 -> the docker container at runtime. Okay, now that we've got the basic `docker-compose` arguments taken care of, now lets take a look at the dockerfile. If you're not familiar with dockerfiles, think of them as the recipe for building a container. You can read more about them [Here.](https://docs.docker.com/engine/reference/builder/)

### Dev dockerfile explained.

If you look at the different `dev` and `prod` dockerfiles, you'll notice huge differences. One of the most obvious is the utilization of supervisord in dev, vs a lack of utilization in the prod dockerfile. The key thing to realize at this point is that our dev environment contains dev tools, most notabely the utilization of gulp for javascript compilation. Because of this, it's required to run multiple child processes within the container `jekyll` and `gulp` which is why all of the configuration for supervisord is required. 

Here's that dockerfile for reference.

```
And my dockerfile that's referenced...

```
# docker/dev-dockerfile

FROM jekyll/jekyll:latest

USER root
RUN apk add --update supervisor && rm  -rf /tmp/* /var/cache/apk/*

RUN npm install -g gulp
RUN npm link gulp

ADD /docker/files/dev/supervisord.conf /etc/
USER jekyll
ENTRYPOINT ["supervisord", "--nodaemon", "--configuration", "/etc/supervisord.conf"]
```

In light of what was said above, most of this configuration should be pretty self explanatory. The steps in order can be summarized as:

1. Change to `root` user.
2. Install `supervisor`, and remove tempfiles, and apk cache.
3. Install gulp globally
4. link npm's working code to the now globlly installed gulp.
5. Copy `/docker/files/dev/supervisord.conf` into the container. This file contains our supervisord configuration.
6. Change the  the container as `jekyll`
7. Set the container entrypoint to run supervisord in the foreground. This allows for stdout for all of the child programs to be visable through stdout when you run `docker-compose up`

Alright, now that we've got that done with, the only thing left to stand up a local version of this site is running the following commands:

1. `git clone git@github.com:z0r0/shurikenlabs.git`
2. `docker-compose dev up`

And there you have it!

Thanks for reading.