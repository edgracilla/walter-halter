# walter-halter

Highly influenced by [ctavan/express-validator](https://github.com/ctavan/express-validator) and relying from [chriso/validator.js](https://github.com/chriso/validator.js), walter-halter does almost the same goal. The edge is, it supports auto validation for arrays, nested arrays, and/or nested arrays of objects without using `customValidator` workaround.

walter-halter will not support chaining as it is intended to use the schema based method, which [walter-builder](https://github.com/edgracilla/walter-builder) can help (he does a very good job in validation schema generation straigth from your mongoose model and/or by defining the rules manually).

## Installation
`npm install --save walter-halter walter-builder`

## Usage
Check [tests](https://github.com/edgracilla/walter-halter/tree/master/test) for an in depth usage.

```js
require('./model')()
const restify = require('restify')
const mongoose = require('mongoose')

const halter = require('walter-halter')
const WalterBuilder = require('walter-builder')

const server = restify.createServer({ name: 'myapp', version: '1.0.0'});
let builder = new WalterBuilder({uuid: true, model: mongoose.model('TestModel')})

server.use(restify.plugins.acceptParser(server.acceptable))
server.use(restify.plugins.queryParser())
server.use(restify.plugins.bodyParser())

server.use(halter({
  customValidators: {
    // sample custom validator, supporting mongoose 'unique')
    unique: (value, modelName, field) => {
      return new Promise((resolve, reject) => {
        return setTimeout(() => {
          resolve()
        }, 500)
      })
    }
  }
}))

server.post('/test', function (req, res, next) {

  // check walter-builder page for usage
  let schema = builder
    .location('body')
    .exclude(['arr.*.foo'])
    .addRule('email', 'unique', ['modelName', 'email']) // custom validator above
    .build()

  req.halt(schema).then(result => {
    if (result.length) {
      res.send(400, result)
    } else {
      res.send(200)
    }
    
    return next()
  })
})
```
