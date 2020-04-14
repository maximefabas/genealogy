const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const { MongoClient, ObjectId } = require('mongodb')

const app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// Database
const dbUrl = 'mongodb://localhost:27017'
const dbName = 'genealogydb'
const dbOptions = { useNewUrlParser: true, useUnifiedTopology: true }
let db, gridfs
MongoClient.connect(dbUrl, dbOptions, (err, client) => {
  if (err) throw new Error(err)
  db = client.db(dbName)
})
app.use((req, res, next) => {
  req.db = db
  next()
})

// Visualisation
app.get('/', (req, res, next) => {
  res.redirect('/index.html')
})

// Add entries
app.get('/add', (req, res, next) => {
  res.redirect('/add.html')
})

// List humans
app.get('/api/list-humans', (req, res, next) => {
  const db = req.db
  const collection = db.collection('humans')
  collection.find({}, (err, success) => err
    ? res.json({ err })
    : success.toArray()
      .then(data => res.json({ data }))
      .catch(err => res.json({ err }))
  )
})

// Create human
app.post('/api/create-human', (req, res, next) => {
  const db = req.db
  const collection = db.collection('humans')
  const newHuman = req.body
  collection.insert(
    newHuman,
    (err, success) => err
      ? res.json({ err })
      : res.json({ data: success.ops[0] })
  )
})

// Edit human
app.post('/api/edit-human/:id', (req, res, next) => {
  const id = req.params.id
  const db = req.db
  const collection = db.collection('humans')
  const newHuman = req.body
  collection.findOneAndUpdate(
    { _id: ObjectId(id) },
    { $set: newHuman },
    { returnOriginal: false },
    (err, success) => err
      ? res.json({ err })
      : res.json({ data: success.value })
  )
})

// Errors
app.use((req, res, next) => {
  next(createError(404))
})

app.use((err, req, res, next) => {
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  res.status(err.status || 500)
  res.json({ err })
})

module.exports = app
