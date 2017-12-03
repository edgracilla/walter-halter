'use strict'

const _ = require('lodash')
const restify = require('restify')
const BPromise = require('bluebird')

const schema = require('./schema')
const halter = require('../index')

const server = restify.createServer({
  name: 'myapp',
  version: '1.0.0'
});

server.use(restify.plugins.acceptParser(server.acceptable))
server.use(restify.plugins.queryParser())
server.use(restify.plugins.bodyParser())

server.use(halter({
  customValidators: {
    unique: (value, modelName, field) => {
      return new BPromise((resolve, reject) => {
        return setTimeout(() => {
          console.log('x--', value, modelName, field)
          resolve()
        }, 1000)
      })
    }
  }
}))

server.post('/xx/:_id', function (req, res, next) {
  req.halt(schema).then(result => {
    console.log('\nFIN:', result)
    res.send(req.params)
    return next()
  })
});

server.listen(8080, function () {
  // console.log('%s listening at %s', server.name, server.url);
});