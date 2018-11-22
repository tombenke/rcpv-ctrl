rcpv-ctrl
===========

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)
[![npm version][npm-badge]][npm-url]
[![Build Status][travis-badge]][travis-url]
[![Coveralls][BadgeCoveralls]][Coveralls]

## About

Project archetype for Command Line tools using Node.js

It provides only one simple command, that is: `echo`, that echoes back it s only one parameter:

```bash
    rcpv-ctrl echo -t Hi
```

This project can be used to generate a new CLI project too,
using the [kickoff](https://github.com/tombenke/kickoff) utility.

## Installation

Run the install command:

    npm install -g rcpv-ctrl

Check if rcpv-ctrl is properly installed:

    $ rcpv-ctrl --help

## Get Help

To learn more about the tool visit the [homepage](http://tombenke.github.io/rcpv-ctrl/).

## References

- [npac](http://tombenke.github.io/npac).
- [npac-example-cli](http://tombenke.github.io/npac-example-cli).

[npm-badge]: https://badge.fury.io/js/rcpv-ctrl.svg
[npm-url]: https://badge.fury.io/js/rcpv-ctrl
[travis-badge]: https://api.travis-ci.org/tombenke/rcpv-ctrl.svg
[travis-url]: https://travis-ci.org/tombenke/rcpv-ctrl
[Coveralls]: https://coveralls.io/github/tombenke/rcpv-ctrl?branch=master
[BadgeCoveralls]: https://coveralls.io/repos/github/tombenke/rcpv-ctrl/badge.svg?branch=master
