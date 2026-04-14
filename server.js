'use strict'

const http = require('http')
const express = require('express')
const proxy = require('./src/proxy')

const app = express()

app.enable('trust proxy')

app.get('/favicon.ico', (req, res) => res.sendStatus(204))

app.get('/health', (req, res) => res.sendStatus(200))

// AVIF route — forces AVIF format regardless of extension params
app.get(['/avif', '/avif/*'], (req, res) => {
  req.forceFormat = 'avif'
  proxy(req, res)
})

// Default route — WebP (or JPEG if ?jpeg=1)
app.get('/*', (req, res) => {
  proxy(req, res)
})

const PORT = process.env.PORT || 8080

http.createServer(app).listen(PORT, () => {
  console.log(`Bandwidth Hero Proxy listening on port ${PORT}`)
})
