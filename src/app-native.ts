import { createServer } from 'node:http'
import { createReadStream, statSync } from 'node:fs'
import { parse } from 'node:url'

const TYPE: 'AUDIO' | 'VIDEO' = 'VIDEO'

enum MimeType {
  'VIDEO' = 'video/mp4',
  'AUDIO' = 'audio/mpeg'
}

enum MimeTypeExtensions {
  'VIDEO' = 'mp4',
  'AUDIO' = 'mp3'
}

createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    const headers = {
      'access-control-allow-origin': 'localhost',
      'access-control-allow-methods': 'GET'
    }

    res.writeHead(204, headers)
    return res.end()
  }

  if (req.method !== 'GET') {
    return res.writeHead(405)
  }

  const pathToStaticMedia = `${__dirname}\\public`

  if (req.url === '/') {
    res.writeHead(200, { 'content-type': 'text/html' })
    createReadStream(`${pathToStaticMedia}\\html\\index.html`).pipe(res)
    return
  }

  if (req.url?.startsWith('/api/streaming')) {
    const mediaRange = req.headers.range
    const params = new URL(req.url).searchParams
    const downloadRate = Number(params.get('download_rate') ?? 3)

    const mediaPath = `${__dirname}\\public\\media\\${TYPE.toLowerCase()}\\${strategyDownloadRate(downloadRate)}`

    const stat = statSync(mediaPath)
    const totalMediaSize = stat.size

    if (mediaRange) {
      const [start, end] = getRange(mediaRange)
      const startNumeric = parseInt(start)

      if (!isNaN(startNumeric)) {
        const endNumeric = end ? parseInt(end) : totalMediaSize - 1
        const lengthOfRange = (endNumeric - startNumeric) + 1

        res.writeHead(206, {
          'content-type': MimeType[TYPE],
          'content-length': lengthOfRange,
          'content-range': `bytes ${startNumeric}-${endNumeric}/${totalMediaSize}`
        })

        createReadStream(mediaPath, {
          start: startNumeric,
          end: endNumeric
        })
          .pipe(res)

        return
      }
    }

    res.writeHead(206, {
      'content-type': MimeType[TYPE],
      'content-length': totalMediaSize
    })

    createReadStream(mediaPath)
      .pipe(res)
  }
})
  .listen(80)
  .on('listening', () => console.log('Server up in port 80'))


enum DOWNLOAD_RATE {
  'SLOW' = 3,
  'MID' = 6,
  'FAST' = 10
}

function strategyDownloadRate(rate: number) {
  if (rate <= DOWNLOAD_RATE.SLOW) {
    return `64kbps.${MimeTypeExtensions[TYPE]}`
  }

  if (rate <= DOWNLOAD_RATE.MID) {
    return `128kbps.${MimeTypeExtensions[TYPE]}`
  }

  return `128kbps.${MimeTypeExtensions[TYPE]}`
}

function getRange(range: string) {
  return range.replace(/bytes=/, '').split('-')
}
