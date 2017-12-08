'use strict'

const _ = require('lodash')

const Validator = require('./validator')
// const Sanitizer = require('./sanitizer')

class Halter {
  constructor (options) {
    this.validator = new Validator(options.customValidators)    
  }

  check (schema, req) {
    // this.sanitizer.sanitize(req)
    // console.log(this.group(req, schema))
    // return Promise.resolve()
    return this.validator.check(req, this.group(req, schema))
  }

  group (req, schema) {
    let locations = Object.keys(req)
    let exist = false

    let group = {
      body: {},
      query: {},
      params: {},
      empty: {}
    }

    Object.keys(schema).forEach(path => {
      let item = _.clone(schema[path])
      let inLoc = _.get(item, 'in')
      let getPath = ''

      delete item['in']

      if (inLoc && _.get(req[inLoc], path)) {
        group[inLoc][path] = item
      } else {
        exist = false

        for (let i = 0; i < locations.length; i++) {
          getPath = path.match(/\.\*/) ? path.replace(/\*/g, '[0]') : path
          if (!_.isNil(_.get(req[locations[i]], getPath))) {
            group[locations[i]][path] = item
            exist = true; break
          }
        }

        if (!exist) {
          group.empty[path] = item
        }
      }
    })

    return group
  }
}

module.exports = Halter
