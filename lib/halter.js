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
    return this.validator.check(req, this.group(req, schema))
  }

  group (req, schema) {
    let groupLen = Object.keys(req).length -1
    let empties = {}

    let group = {
      body: {},
      query: {},
      params: {},
      empty: {}
    }

    Object.keys(schema).forEach(path => {
      let item = _.clone(schema[path])
      let location = _.get(item, 'in')

      if (_.isNil(location)) {
        let hasRequired = /"required":/.test(JSON.stringify(item))

        Object.keys(req).forEach((loc, i) => {
          let value = _.get(req[loc], path)

          if(_.isNil(value)) {
            if (path.match(/\.\*/)) {
              value = _.get(req[loc], path.split('.')[0])

              if(!_.isNil(value)) {
                group[loc][path] = item
              } else {
                if (groupLen === i && hasRequired) {
                  empties[path] = item
                }
              }
            } else {
              if (groupLen === i && hasRequired) {
                empties[path] = item
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

    Object.keys(empties).forEach(path => {
      Object.keys(req).forEach(loc => {
        if (!_.isNil(group[loc][path])) {
          delete empties[path]
        }
      })
    })

    group.empty = empties
    return group
  }
}

module.exports = Halter
