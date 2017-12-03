/* global describe it before after */
'use strict'

const axios = require('axios')

describe('Server Test', function () {
  let host = 'http://localhost:8080'
  let conf = {}

  before('init', function (done) {
    require('./server')
    done()
  })

  after('terminate', function () {
    setTimeout(() => {
      process.exit(1)
    }, 300)
  })
  
  it('postive test', function (done) {
    this.timeout(5000)
    
    let data = {
      ref: '80cd7077-cbd9-5a2a-96a4-9f1ca2013482',
      schemaObj: {
        title: 'title',
        content: 'content'
      },
      arrRef: ['80cd7077-cbd9-5a2a-96a4-9f1ca2013482'],
      arrObjDeep:[{
        foo: [{
          bar: 'nested'
        }]
      },{
        foo: [{
          bar: 'deep'
        },{
          bar: 'value'
        }]
      }]
    }

    let _id = '80cd7077-cbd9-5a2a-96a4-9f1ca2013487'

    axios.post(`${host}/xx/${_id}?email=foo@bar.com&enums=jhon`, data, conf).then(ret => {
      if (ret.status === 200) {
        if (!ret.data.length) {
          done()
        } else {
          console.log('\nFIN:', ret.data)
        }
      }
    }).catch(err => {
      console.log(err)
    })
  })

  it('negative test', function (done) {
    this.timeout(5000)
    
    let data = {
      ref: '',
      schemaObj: {
        title: '',
        content: ''
      },
      arrRef:[],
      arrObj:[{
        foo:'bar',
        status: 'bar'
      }],
      arrObjDeep:[{
        foo: [{
          bar: ''
        }]
      },{
        foo: [{
          bar: ''
        },{
          bar: ''
        }]
      }],

      // used in deeper testing
      aa: [
        {
          bb: {
            xx: 'xx0',
            cc: [{
              dd: ['80cd7077-cbd9-5a2a-96a4-9f1ca2013481x', '80cd7077-cbd9-5a2a-96a4-9f1ca2013482']
            }]
          }
        },
        {
          bb: {
            xx: 'xx1',
            cc: [{
              dd: ['80cd7077-cbd9-5a2a-96a4-9f1ca2013483x', '80cd7077-cbd9-5a2a-96a4-9f1ca2013484']
            }]
          }
        }
      ]
    }

    let _id = ''

    axios.post(`${host}/xx/${_id}?email=&enums=dd`, data, conf).then(ret => {
      if (ret.status === 200) {
        console.log('\nFIN:', ret.data)
        if (ret.data.length) {
          done()
        }
      }
    }).catch(err => {
      console.log(err)
    })
  })
})

