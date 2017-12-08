'use strict'

require('./model')()
const halter = require('../index')

const _ = require('lodash')
const restify = require('restify')
const BPromise = require('bluebird')
const mongoose = require('mongoose')
const WalterBuilder = require('walter-builder')

const server = restify.createServer({ name: 'myapp', version: '1.0.0'});
let builder = new WalterBuilder({uuid: true, model: mongoose.model('TestModel')})

server.use(restify.plugins.acceptParser(server.acceptable))
server.use(restify.plugins.queryParser())
server.use(restify.plugins.bodyParser())

server.use(halter({
  customValidators: {
    unique: (value, modelName, field) => {
      return new BPromise((resolve, reject) => {
        return setTimeout(() => {
          // console.log('[executing promise custom validator (unique)]', value, modelName, field)
          resolve()
        }, 500)
      })
    }
  }
}))

server.post('/hot-test', function (req, res, next) {
  let schema = builder
    // .select(['_id', 'obj.foo' ])
    // .select('arr1d.*')
    // .select('arr2d.*.*')
    // .select('arr3d.*.*.*')
    // .select('arr4d.*.*.*.*')    
    // .select('arrnest1.*.foo.bar')
    // .select('arrnest2.*.foo.bar.nar')
    .select('arrnest3.*.foo.*.bar.*.nar.*')

    .location('params')
    .build()

    // console.log(schema)

  if (!_.isEmpty(schema)) {
    req.halt(schema).then(result => {
      res.send(result)
      return next()
    })
  } else {
    res.send([])
    return next()
  }
})

server.post('/noloc/:field', function (req, res, next) {
  let schema = builder
    .select(req.params.field)
    .build()

  if (!_.isEmpty(schema)) {
    req.halt(schema).then(result => {
      res.send(result)
      return next()
    })
  } else {
    res.send([])
    return next()
  }
})

server.post('/nolocall', function (req, res, next) {
  let schema = builder
    .build()

  if (!_.isEmpty(schema)) {
    req.halt(schema).then(result => {
      res.send(result)
      return next()
    })
  } else {
    res.send([])
    return next()
  }
})

server.post('/body', function (req, res, next) {
  let schema = builder
    .location('body')
    .build()

  if (!_.isEmpty(schema)) {
    req.halt(schema).then(result => {
      res.send(result)
      return next()
    })
  } else {
    res.send([])
    return next()
  }
})

server.post('/query', function (req, res, next) {
  let schema = builder
    .location('query')
    .build()

  if (!_.isEmpty(schema)) {
    req.halt(schema).then(result => {
      res.send(result)
      return next()
    })
  } else {
    res.send([])
    return next()
  }
})

server.post('/params', function (req, res, next) {
  let schema = builder
    .location('params')
    .build()

  if (!_.isEmpty(schema)) {
    req.halt(schema).then(result => {
      res.send(result)
      return next()
    })
  } else {
    res.send([])
    return next()
  }
})

server.listen(8080, function () {
  // console.log('%s listening at %s', server.name, server.url);
});