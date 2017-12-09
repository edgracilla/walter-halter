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

    // console.log(group)
    
    return BPromise.each(Object.keys(group), loc => {
      return BPromise.each(Object.keys(group[loc]), path => {
        let value = _.get(req[loc], path)
        let validators = group[loc][path]

        if (!_.isNil(value)) {
          return this.validate(loc, path, value, validators, path).then(result => {
            errBag = errBag.concat(result)
          })
        } else {
          if (path.match(/\.\*/) && loc !== 'empty') {
            return this.deepCrawl(path, req[loc]).then(tuples => {
              return BPromise.each(tuples, tuple => {
                
                // if entry is array of objects but it is empty
                // restore path with '*' e.g. (foo.*.bar.beer)
                if (/\*/.test(tuple.path)) {
                  tuple.path = path
                }
                
                return this.validate(loc, tuple.path, tuple.value, validators, path)
                  .then(result => {
                    errBag = errBag.concat(result)
                  })
              })
            })
          } else {
            return this.validate(loc, path, value || '', validators, path).then(result => {
              errBag = errBag.concat(result)
            })
          }
        }
      })
    }).then(() => {
      return BPromise.resolve(errBag)
    })
  }
  deepCrawl (path, data) {
    let cpaths = path.split('.')
    let tuples = []

    // console.log('\n---', path, '\n')

    dig(cpaths.shift(), cpaths)

    function dig (crumb, clone) {
      if (_.isNil(crumb)) return
      let chunks = clone.slice(0)
      let value = _.get(data, crumb)
      
      // console.log('>>', crumb, chunks, value)
      if (chunks[0] === '*') {
        if (Array.isArray(value)) {
          chunks.shift()
          for (let j = 0; j < value.length; j++) {
            dig(`${crumb}[${j}]`, chunks)
          }
        } else if (_.isPlainObject(value)) {
          dig(`${crumb}.${chunks.shift()}`, chunks)
        } else {
          console.log('xx', crumb, value)
        }
      } else {
        if (_.isPlainObject(value)) {
          let chunk = chunks.shift()

          if (_.isNil(chunk)) {
            // console.log(`STORE`, `${crumb}`, '=', value)
            tuples.push({path: `${crumb}`, value: value})
          } else {
            dig(`${crumb}.${chunk}`, chunks)
          }
        } else if (!_.isNil(value)) {
          // console.log(`STORE`, `${crumb}`, '=', value)
          tuples.push({path: `${crumb}`, value: value})
        } else {
          console.log('x', crumb, value)
        }
      }

      // dig(chunks.shift(), chunks)
    }

    return BPromise.resolve(tuples)
  }

  deepCrawlY (path, data) {
    let chunks = path.split('.')
    let tuples = []
    let i = 0

    console.log('\n---', path, '\n')

    function plow (crumb) {
      let value
      console.log('~', i, chunks[i])
      if (_.isNil(chunks[i])) return
      crumb = _.isEmpty(crumb) ? chunks[i] : `${crumb}.${chunks[i]}`
      value = _.get(data, crumb)

      console.log('-->', {crumb: crumb, chunk: chunks[i]})

      if (chunks[i] === '*') { // dbl star
        crumb = crumb.substring(0, crumb.length -2)
        value = _.get(data, crumb)

        console.log('x', crumb, '=', value)

        if (Array.isArray(value)) {
          let holdIndex = i + 1
          for (let j = 0; j < value.length; j++) {
            let item = _.get(data, `${crumb}[${j}]`)

            if (Array.isArray(item)) {
              console.log(`z[${i}] ARR`, `${crumb}[${j}]`, '=', item)
              i = holdIndex + 1
              plow(`${crumb}[${j}]`)
            } else if (_.isPlainObject(item)) {
              console.log(`z[${i}] OBJ`, `${crumb}[${j}]`, '=', item)
              i = holdIndex + 1
              plow(`${crumb}[${j}]`)
            } else if (!_.isNil(item)) {
              console.log(`z[${i}] STORE`, `${crumb}[${j}]`, '=', item)
            } else {
              console.log('zz')
            }
          }
        } else {
          console.log('zzz')
        }

      } else {
        if (Array.isArray(value)) {
          if (chunks[i+1] === '*') {
            let holdIndex = i + 1
            for (let j = 0; j < value.length; j++) {
              let item = _.get(data, `${crumb}[${j}]`)

              if (Array.isArray(item)) {
                console.log(`[${i}] ARR`, `${crumb}[${j}]`, '=', item)
                i = holdIndex + 1
                plow(`${crumb}[${j}]`)
              } else if (_.isPlainObject(item)) {
                console.log(`[${i}] OBJ`, `${crumb}[${j}]`, '=', item)
                i = holdIndex + 1
                plow(`${crumb}[${j}]`)
              } else if (!_.isNil(item)) {
                console.log(`[${i}] STORE`, `${crumb}[${j}]`, '=', item)
              } else {
                console.log('x')
              }
            }
          } else {
            console.log('xx')
          }
        } else if (_.isPlainObject(value)) {
          console.log(`[${i}] xxx`, value)
          i++; plow(crumb)
        } else if (!_.isNil(value)) {
          console.log(`[${i}] STORE`, `${crumb}`, '=', value)
        } else {
          console.log(`[${i}] xxxx`, value)
        }
      }
    }

    plow('', i)
    console.log('\n')
    return BPromise.resolve(tuples)
  }

  deepCrawlX (path, data) {
    let chunks = path.split('.')
    let tuples = []

    function recurse (crumb, i) {
      for (i++; i < chunks.length; i++) {
        if (chunks[i] === '*') {
          let value = _.get(data, crumb)

          if (Array.isArray(value) && value.length) {
            for (let j = 0; j < value.length; j++) {
              if (i+1 === chunks.length) {
                tuples.push({path: `${crumb}[${j}]`, value: value[j]})
              }
              recurse (`${crumb}[${j}]`, i)
            }
          } else {
            tuples.push({path: `${crumb}.*`, value: ''})
          }
        } else {
          crumb = _.isEmpty(crumb) ? chunks[i] : `${crumb}.${chunks[i]}`
          let value = _.get(data, crumb)

          if (!_.isNil(value)) {
            if (i+1 === chunks.length) {
              tuples.push({path: crumb, value: value})
            }
          }
        }
      }
    }

    recurse('', -1)
    return BPromise.resolve(tuples)
  }

  validate (loc, path, value, schema, oldPath) {
    let errBag = []

    if (schema.optional && _.isEmpty(value)) {
      return BPromise.resolve([])
    } else {
      delete schema.optional
    }

    return BPromise.each(Object.keys(schema), method => {
      let opt = _.clone(schema[method].options) || []; opt.unshift(value)

      let data = {
        value: value,
        location: loc,
        errMsg: schema[method].msg.replace(oldPath, path)
      }

      if (method === 'required') {
        if (((_.isString(value) || _.isObject(value)) && _.isEmpty(value)) || _.isNil(value)) {
          errBag.push(this.formatErr(data))
        }
      }

      if (_.isFunction(validator[method])) {
        if (!validator[method](...opt)) {
          errBag.push(this.formatErr(data))
        }
      } else {
        if (method !== 'required') {
          if (_.isFunction(this.customValidators[method])) {
            return this.customValidators[method](...opt).catch(err => {
              errBag.push(this.formatErr(data))
            })
          }
        }
      }
    }).then(() => {
      return errBag
    })
  }

  formatErr (data) {
    let result = {
      message: data.errMsg
    }

    if (!_.isNil(data.value)) result.value = data.value
    if (data.location !== 'empty') result.location = data.location

    return result
  }
}

module.exports = Validator
