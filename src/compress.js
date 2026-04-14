'use strict'

const sharp = require('sharp')

function redirect(req, res) {
  if (res.headersSent) return
  res.setHeader('content-length', 0)
  res.removeHeader('cache-control')
  res.removeHeader('expires')
  res.removeHeader('date')
  res.removeHeader('etag')
  res.setHeader('location', encodeURI(req.params.url))
  res.status(302).end()
}

function compress(req, res, input) {
  // Priority: forced format from route > query param > default WebP
  let format
  if (req.forceFormat === 'avif') {
    format = 'avif'
  } else {
    format = req.params.webp ? 'webp' : 'jpeg'
  }

  const formatOptions = {
    quality: req.params.quality,
    progressive: true,
  }

  // AVIF-specific options
  if (format === 'avif') {
    delete formatOptions.progressive // not supported in AVIF
    formatOptions.effort = 4 // 0 (fastest) – 9 (slowest). 4 is a balanced default
  }

  sharp(input)
    .grayscale(req.params.grayscale)
    .toFormat(format, formatOptions)
    .toBuffer((err, output, info) => {
      if (err || !info) return redirect(req, res)

      res.setHeader('content-type', `image/${format}`)
      res.setHeader('content-length', info.size)
      res.setHeader('x-original-size', req.params.originSize)
      res.setHeader('x-bytes-saved', req.params.originSize - info.size)
      res.status(200)
      res.end(output)
    })
}

module.exports = compress
