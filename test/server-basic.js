const supertest = require('supertest')
const should = require('should')
const fs = require('fs')
const path = require('path')

module.exports = schsrch =>
  describe('Basic pages', function () {
    it('200 for schsrch.xyz/', function (done) {
      supertest(schsrch)
        .get('/')
        .set('Host', 'schsrch.xyz')
        .expect('Content-Type', /html/)
        .expect(200)
        .end(done)
    })
    it('200 for beta.schsrch.xyz/', function (done) {
      supertest(schsrch)
        .get('/')
        .set('Host', 'beta.schsrch.xyz')
        .expect('Content-Type', /html/)
        .expect(200)
        .end(done)
    })
    it('beta.schsrch.xyz/robots.txt', function (done) {
      supertest(schsrch)
        .get('/robots.txt')
        .set('Host', 'beta.schsrch.xyz')
        .expect('Content-Type', /text\/plain/)
        .expect(200)
        .expect(res => res.text.should.match(/Disallow: \//))
        .end(done)
    })
    it('schsrch.xyz/robots.txt', function (done) {
      supertest(schsrch)
        .get('/robots.txt')
        .set('Host', 'schsrch.xyz')
        .expect('Content-Type', /text\/plain/)
        .expect(200)
        .expect(res => res.text.should.have.length(0))
        .end(done)
    })
    it('www.schsrch.xyz', function (done) {
      supertest(schsrch)
        .get('/whatever')
        .set('Host', 'www.schsrch.xyz')
        .expect(302)
        .expect('Location', 'https://schsrch.xyz/whatever')
        .end(done)
    })
    it('/status', function (done) {
      supertest(schsrch)
        .get('/status')
        .set('Host', 'schsrch.xyz')
        .expect(200)
        .expect(res => res.body.should.be.an.Object())
        .expect(res => res.body.docCount.should.be.a.Number())
        .expect(res => res.body.indexCount.should.be.a.Number())
        .expect(res => res.body.requestCount.should.be.a.Number())
        .end(done)
    })
    it('/sw.js', function (done) {
      fs.readFile(path.join(__dirname, '../dist/sw.js'), {encoding: 'utf-8'}, (err, data) => {
        if (err) return done(err)
        supertest(schsrch)
          .get('/sw.js')
          .set('Host', 'schsrch.xyz')
          .expect(200)
          .expect('Content-Type', /javascript/)
          .expect(res => res.text.should.equal(data))
          .end(done)
      })
    })
    it('/opensearch.xml', function (done) {
      fs.readFile(path.join(__dirname, '../view/opensearch.xml'), {encoding: 'utf-8'}, (err, data) => {
        if (err) return done(err)
        supertest(schsrch)
          .get('/opensearch.xml')
          .set('Host', 'schsrch.xyz')
          .expect(200)
          .expect('Content-Type', /opensearchdescription\+xml/)
          .expect(res => res.text.should.equal(data))
          .end(done)
      })
    })
    it('/disclaim/', function (done) {
      supertest(schsrch)
        .get('/disclaim/')
        .set('Host', 'schsrch.xyz')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => res.text.length.should.be.above(0))
        .end(done)
    })
    it('/help/', function (done) {
      supertest(schsrch)
        .get('/help/')
        .set('Host', 'schsrch.xyz')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => res.text.length.should.be.above(0))
        .end(done)
    })
    it('/search/?as=page', function (done) {
      const tQuery = `whateverqueryhere${Math.random()}`
      supertest(schsrch)
        .get('/search/?as=page&query=' + encodeURIComponent(tQuery))
        .set('Host', 'schsrch.xyz')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => res.text.indexOf(`<input type="text" class="querybox border" value=${JSON.stringify(tQuery)} name="query" autocomplete="off"`).should.be.aboveOrEqual(0))
        .end(done)
    })
    it('/search/?as=page&query=(empty)', function (done) {
      supertest(schsrch)
        .get('/search/?as=page&query=')
        .set('Host', 'schsrch.xyz')
        .expect(302)
        .expect('Location', '/')
        .end(done)
    })
    it('/search/?as=page&query=(space)', function (done) {
      supertest(schsrch)
        .get('/search/?as=page&query=%20')
        .set('Host', 'schsrch.xyz')
        .expect(302)
        .expect('Location', '/')
        .end(done)
    })
    it('/redbook', function (done) {
      supertest(schsrch)
        .get('/redbook')
        .set('Host', 'schsrch.xyz')
        .expect(302)
        .expect('Location', 'https://static.maowtm.org/redbook.pdf')
        .end(done)
    })
    it('/subjects/', function (done) {
      supertest(schsrch)
        .get('/subjects/?as=json')
        .set('Host', 'schsrch.xyz')
        .expect(200)
        .expect(res => {
          res.body.should.be.an.Array()
          res.body.map(x => x._id).sort().should.deepEqual(['0450', '0470', '0610', '0611', '0612', '9699', '9701', '9702', '9708', '9709'])
          let deepTested = false
          res.body.forEach(s => {
            s.times.should.be.an.Array()
            if (s._id === '9709') {
              s.times.slice().sort().should.deepEqual(['s10', 'w11'])
              s.totalPaper.should.equal(2)
              deepTested = true
            }
          })
          deepTested.should.be.true()
        })
        .end(done)
    })
  })
