---
title: Bandwidth Hero Proxy
emoji: 🦸
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
---

# Bandwidth Hero Proxy

Image compression proxy for the [Bandwidth Hero](https://github.com/ayastreb/bandwidth-hero) browser extension.

Fetches remote images, compresses them on the fly (grayscale + WebP/JPEG via `sharp`), and returns the smaller version.

---

## Usage with the Extension

1. Copy your Space URL — it looks like:  
   `https://<your-username>-bandwidth-hero-proxy.hf.space`

2. Open the **Bandwidth Hero** browser extension settings.

3. Paste the URL into the **Compression server** field.

4. Done!

---

## API

| Endpoint | Description |
|---|---|
| `GET /health` | Health check — returns `200 OK` |
| `GET /?url=<image_url>&bw=1&l=40` | Compress an image |

### Query Parameters

| Param | Default | Description |
|---|---|---|
| `url` | — | URL of the image to compress (required) |
| `bw` | `1` | Grayscale: `1` = on, `0` = off |
| `l` | `40` | Quality level (10–100) |
| `jpeg` | — | Force JPEG output (default is WebP) |
