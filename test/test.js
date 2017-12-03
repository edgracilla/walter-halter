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
  
  it('should', function (done) {
    this.timeout(5000)
    
    let data = {
      aa: [
        {
          bb: {
            xx: 'xx0',
            cc: [{
              dd: ['80cd7077-cbd9-5a2a-96a4-9f1ca2013481', '80cd7077-cbd9-5a2a-96a4-9f1ca2013482']
            }]
          }
        },
        {
          bb: {
            xx: 'xx1',
            cc: [{
              dd: ['80cd7077-cbd9-5a2a-96a4-9f1ca2013483', '80cd7077-cbd9-5a2a-96a4-9f1ca2013484']
            }]
          }
        }
      ],
      price: {
        child: 1
      },
      pick: ['a','b'],
      infos: [{
        title: 'tt'
      }]
    }
    let _id = '80cd7077-cbd9-5a2a-96a4-9f1ca2013487'

    axios.post(`${host}/xx/${_id}?email=foobar.com&name=john`, data, conf).then(ret => {
      if (ret.status === 200) done()
    }).catch(err => {
      console.log(err)
    })
  })
})

