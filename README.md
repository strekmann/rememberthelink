Remember the link
=================

Rememberthelink is a web tool where you can save, tag and share the links you
find interesting, important or otherwise want to remember.

Do you [rememberthelink](http://rememberthelink.com)?
-----------------------------------------------------

Often hard to remember the links when you need it? This is another project
helping you to remember the important links you see.

How is this project different?
------------------------------

We do our development in public on
[Github](https://github.com/strekmann/rememberthelink), you can install
Rememberthelink on your own server, and we make sure our export and import
scripts are always tested.

We will admit we started this project because we weren't too happy about
similar tools we knew about. And we did it to learn Node.js better.

How to get started
------------------

Head over to [rememberthelink](http://rememberthelink.com) to test the running
production code. This service is intended to be free and stable.

If you want to run the code yourself, you can clone this repository, fetch
dependencies, copy the example settings and modify them, and run `node
cluster.js`:

    git clone https://github.com/strekmann/rememberthelink
    cd rememberthelink
    npm install
    cp server/settings.example.js server/settings.js  # remember to modify this
    node cluster.js

How to contribute
-----------------
We are very happy for pull requests, issues created and other contributions. We
also welcome anonymous contributions. At this point we are very happy to get
new translations.

Dependencies
------------

This is a Node.js project and relies on express, mongoose, redis, i18n, and a
lot more specified in the [packages.json](./blob/master/packages.json).
Rememberthelink is based on our own node-boilerplate, which we intend to keep
updated as this project evolves.

Contributors
------------

- Jørgen Bergquist (developer)
- Sigurd Gartmann (developer)

License
-------

[AGPL](./blob/master/LICENSE)
