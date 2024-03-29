# SAGAMATRON

[![npm](https://img.shields.io/npm/v/sagamatron.svg)](https://www.npmjs.com/package/sagamatron)
[![CircleCI](https://circleci.com/gh/agiledigital/sagamatron.svg?style=svg)](https://circleci.com/gh/agiledigital/sagamatron)
[![Known Vulnerabilities](https://snyk.io//test/github/agiledigital/sagamatron/badge.svg?targetFile=package.json)](https://snyk.io//test/github/agiledigital/sagamatron?targetFile=package.json)
[![type-coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fagiledigital%2Fsagamatron%2Fmaster%2Fpackage.json)](https://github.com/plantain-00/type-coverage)

Take the boilerplate out of your React/Redux/Saga stack using the magic of TypeScript! 🧙

![SAGAMATRON converting side effects into happiness](https://raw.githubusercontent.com/agiledigital/sagamatron/master/docs/logo.png "SAGAMATRON Logo")

## Summary

A project to reduce the amount of boilerplate
that needs to be written for redux/redux-saga
based applications.

Developed for an Agile Digital "Fedex Day".

## Motivation

Here at Agile Digital we are big on using
[Redux](https://github.com/reduxjs/redux) and
[Sagas](https://github.com/redux-saga/redux-saga)
to manage state and side effects.

However, the benefits of redux-saga come with a downside.
There is a lot of boilerplate code that needs to be written
to support the patterns enforced by redux and redux-saga.

This can discourage developers from using these patterns,
and can sometimes make simple features to take extra time to implement.

In newer versions of React, new forms of state management
have been introduced in the form of hooks.
While they have their rightful place in a React application,
for example when managing temporary UI state,
their simplicity can tempt developers to manage more and more
of the application's state using them.
Initially this trade off might seem successful due to faster
cycle times and a perceived reduction in complexity
but their are hidden costs that will appear later in
the lifecycle of a project.

To try and avoid this trend, we decided to use the power
of TypeScript to reduce the boilerplate of redux and redux-saga.

![BEWARE THE HOOKS](https://i.imgur.com/D01096N.png "BEWARE THE HOOKS")

## Example

The unit tests are a good example of how it all works:
  * https://github.com/agiledigital/sagamatron/blob/master/src/concoctBoilerplate.test.ts
  * https://github.com/agiledigital/sagamatron/blob/master/src/concoctCrud.test.ts

We also have a basic project that demonstrates how sagamatron integrates with everything: https://github.com/agiledigital/react-redux-saga-sagamatron
