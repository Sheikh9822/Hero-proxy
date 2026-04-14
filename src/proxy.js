'use strict'

const axios = require('axios')
const { getParams } = require('./params')
const compress = require('./compress')

function copyHeaders(source, target) {
  for (const [key, value] of Object.entries(source)) {
    try {
      target.setHeader(key, value)
    } catch (_) {
      // skip headers that can't be set
    }
  }
}

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

function shouldCompress(req, contentType, contentLength) {
  if (!contentType) return false
  const type = contentType.split(';')[0].toLowerCase()
  if (!type.startsWith('image/')) return false
  // Don't recompress already small images
  if (contentLength && parseInt(contentLength) < 1024) return false
  return true
}

async function proxy(req, res) {
  const params = getParams(req.query)

  if (!params.url) {
    return res.sendStatus(400)
  }

  // Validate URL scheme
  try {
    const parsed = new URL(params.url)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.sendStatus(400)
    }
  } catch (_) {
    return res.sendStatus(400)
  }

  try {
    const response = await axios.get(params.url, {
      responseType: 'arraybuffer',
      timeout: 10000,
      maxRedirects: 4,
      headers: {
        ...(req.headers.cookie ? { cookie: req.headers.cookie } : {}),
        ...(req.headers.dnt ? { dnt: req.headers.dnt } : {}),
        ...(req.headers.referer ? { referer: req.headers.referer } : {}),
        'user-agent': 'Bandwidth-Hero Compressor',
        'x-forwarded-for': req.headers['x-forwarded-for'] || req.ip,
        via: '1.1 bandwidth-hero'
      },
      validateStatus: status => status < 400
    })

    const contentType = response.headers['content-type'] || ''
    const contentLength = response.headers['content-length'] || ''

    copyHeaders(response.headers, res)
    res.setHeader('content-encoding', 'identity')

    if (shouldCompress(req, contentType, contentLength)) {
      req.params = params
      req.params.originSize = parseInt(contentLength) || 0
      compress(req, res, Buffer.from(response.data))
    } else {
      // Bypass: stream original image unchanged
      res.setHeader('x-proxy-bypass', 1)
      res.setHeader('content-length', contentLength)
      res.status(200).end(Buffer.from(response.data))
    }
  } catch (err) {
    // On any error, redirect client to the original URL
    redirect(req, res)
  }
}

module.exports = proxy
