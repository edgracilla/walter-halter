'use strict'

const _ = require('lodash')
const BPromise = require('bluebird')
const validator = require('validator')

class Validator {
  constructor (customValidators) {
    this.customValidators = customValidators || {}
  }

  check (req, group) {
    let errBag = []
    
    return BPromise.each(Object.keys(group), loc => {
      return BPromise.each(Object.keys(group[loc]), path => {
        let value = _.get(req[loc], path)
        let validators = group[loc][path]

        if (!_.isNil(value)) {
          return this.validate(loc, path, value, group[loc][path]).then(result => {
            errBag = errBag.concat(result)
          })
        } else {
          if (path.match(/\.\*/)) {
            return this.deepCrawl(path, req[loc]).then(tuples => {
              return BPromise.each(tuples, tuple => {
                return this.validate(loc, tuple.path, tuple.value, group[loc][path]).then(result => {
                  errBag = errBag.concat(result)
                })
              })
            })
          }
        }
      })
    }).then(() => {
      return errBag
    })
  }

  deepCrawl (path, data) {
    let chunks = path.split('.')
    let tuples = []

    function recurse (crumb, i) {
      for (i++; i < chunks.length; i++) {
        if (chunks[i] === '*') {
          let value = _.get(data, crumb)

          if (Array.isArray(value)) {
            for (let j = 0; j < value.length; j++) {
              if (i+1 === chunks.length) {
                // console.log(`(${i}) ${crumb}[${j}] =`, value[j], i+1 === chunks.length)
                tuples.push({path: `${crumb}[${j}]`, value: value[j]})
              }
              recurse (`${crumb}[${j}]`, i)
            }
          }
        } else {
          crumb = _.isEmpty(crumb) ? chunks[i] : `${crumb}.${chunks[i]}`
          let value = _.get(data, crumb)

          if (!_.isNil(value)) {
            if (i+1 === chunks.length) {
              // console.log(`(${i})`, crumb, '=', JSON.stringify(value), i+1 === chunks.length)
              tuples.push({path: crumb, value: value})
            }
          }
        }
      }
    }

    recurse('', -1)
    return BPromise.resolve(tuples)
  }

  validate (loc, path, value, schema) {
    let errBag = []

    if (schema.optional && _.isEmpty(value)) {
      return BPromise.resolve([])
    } else {
      delete schema.optional
    }

    return BPromise.each(Object.keys(schema), method => {
      let opt = _.clone(schema[method].options) || []; opt.unshift(value)

      if (method === 'required' && _.isEmpty(value)) {
        errBag.push(this.formatErr(loc, path, schema[method].message, value))
      }

      if (_.isFunction(validator[method])) {
        if (!validator[method](...opt)) {
          errBag.push(this.formatErr(loc, path, schema[method].message, value))
        }
      } else {
        if (method !== 'required') {
          if (_.isFunction(this.customValidators[method])) {
            return this.customValidators[method](...opt).catch(err => {
              errBag.push(this.formatErr(loc, path, schema[method].message, value))
            })
          }
        }
      }
    }).then(() => {
      return errBag
    })
  }

  formatErr (location, path, message, value) {
    let result = {
      location: location,
      message: message.replace('%path%', path)
    }

    if (!_.isNil(value)) result.value = value

    return result
  }
}

module.exports = Validator