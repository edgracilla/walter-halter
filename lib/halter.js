'use strict'

const _ = require('lodash')

const Validator = require('./validator')
// const Sanitizer = require('./sanitizer')

class Halter {
  constructor (options) {
    this.validator = new Validator(options.customValidators)    
  }

  check (schema, req) {
    // console.log('\n', schema)
    // this.sanitizer.sanitize(req)
    return this.validator.check(req, this.group(req, schema))
  }

  group (req, schema) {
    let group = {
      body: {},
      query: {},
      params: {}
    }

    Object.keys(schema).forEach(path => {
      let item = _.clone(schema[path])
      let location = _.get(item, 'in')

      if (_.isNil(location)) {
        Object.keys(req).forEach(loc => {
          let value = _.get(req[loc], path)

          if(_.isNil(value)) {
            if (path.match(/\.\*/)) {
              value = _.get(req[loc], path.split('.')[0])

              if(!_.isNil(value)) {
                group[loc][path] = item
              }
            }
          } else {
            group[loc][path] = item
          }
        })
      } else {
        delete item['in']
        group[location][path] = item
      }
    })

    return group
  }
}

module.exports = Halter
