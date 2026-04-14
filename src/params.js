'use strict'

function getParams(query) {
  let url = query.url
  if (!url) return {}

  try {
    url = decodeURIComponent(url)
  } catch (e) {
    url = query.url
  }

  return {
    url,
    webp: !query.jpeg,
    grayscale: query.bw != 0,
    quality: Math.min(Math.max(parseInt(query.l, 10) || 40, 10), 100)
  }
}

module.exports = { getParams }
