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

  describe('# hot testing', function () {
    it('should ok', function (done) {
      let data = {
        // _id: '2218f0ad-c5e3-50dc-afcc-26325fd77398',
        // obj: {
        //   foo: 'foo'
        // },
        arrnest1: [
          {
            foo: {
              bar: 'foobar0',
              x: 'x'
            }
          },
          {
            foo: {
              bar: 'foobar1'
            }
          }
        ],
        arrnest2: [
          {
            foo: {
              bar: {
                nar: 'foobarnar0'
              }
            }
          },
          {
            foo: {
              bar: {
                nar: 'foobarnar1'
              }
            }
          }
        ],
        arrnest3: [
          {
            foo: [
              {
                bar: [
                  {
                    nar: ['a', 'b']
                  },
                  {
                    nar: ['c', 'd', 'dd']
                  }
                ]
              },
              {
                bar: [
                  {
                    nar: ['e', 'f', 'ff']
                  },
                  {
                    nar: ['g', 'h']
                  }
                ]
              }
            ]
          },
          {
            foo: [
              {
                bar: [
                  {
                    nar: ['i', 'j', {x: 'x'}]
                  },
                  {
                    nar: ['k', 'l']
                  }
                ]
              },
              {
                bar: [
                  {
                    nar: ['m', 'n']
                  },
                  {
                    nar: ['o', 'p']
                  }
                ]
              }
            ]
          },
        ],

        arr1d: ['a', 'b', 'c', {x: 'x'}, 'd'],
        arr2d: [
          ['a', 'b'], 
          ['c', 'd', {x: 'x'}],
          ['e', 'f','g']
        ],
        arr3d: [
          [
            ['a', 'b', 'bc'],
            ['c', 'd'],
            ['x']
          ],
          [
            ['e', 'f'],
            ['g', 'h', {x: 'x'}],
          ],
        ],
        arr4d: [
          [
            [
              ['a', 'b', 'bc'],
              ['c', 'd'],
              ['x']
            ],
            [
              ['e', 'f'],
              ['g', 'h', {x: 'x'}],
            ],
          ],
          [
            [
              ['aa', 'bb', 'bbcc'],
              ['cc', 'dd'],
              ['xx']
            ],
            [
              ['ee', 'ff'],
              ['gg', 'hh', {xx: 'xx'}],
            ],
          ],
        ],
      }

      axios.post(`${host}/hot-test`, data, conf).then(ret => {
        if (ret.status === 200 && Array.isArray(ret.data)) {
          console.log(ret.data)
          // done()
        }
        done()
      }).catch(console.log)
    })
  })
})

