import express, { Request, Response } from 'express'
import { createReadStream, statSync } from 'node:fs'

const app = express()
app.use('/', express.static(__dirname + '/public/html'))

const TYPE: 'AUDIO' | 'VIDEO' = 'VIDEO'

enum MimeType {
  'VIDEO' = 'video/mp4',
  'AUDIO' = 'audio/mpeg'
}

enum MimeTypeExtensions {
  'VIDEO' = 'mp4',
  'AUDIO' = 'mp3'
}

app.use('/api/streaming', (req: Request, res: Response) => {
  const mediaRange = req.headers.range
  const downloadRate = Number(req.query.download_rate ?? 3)

  const mediaPath = `${__dirname}\\public\\media\\${TYPE.toLowerCase()}\\${strategyDownloadRate(downloadRate)}`

  const stat = statSync(mediaPath)
  const totalMediaSize = stat.size

  if (mediaRange) {
    const [start, end] = getRange(mediaRange)
    const startNumeric = parseInt(start)

    if (!isNaN(startNumeric)) {
      const endNumeric = end ? parseInt(end) : totalMediaSize - 1
      const lengthOfRange = (endNumeric - startNumeric) + 1

      res
        .status(206)
        .header({
          'Content-Type': MimeType[TYPE],
          'Content-Length': lengthOfRange,
          'Content-Range': `bytes ${startNumeric}-${endNumeric}/${totalMediaSize}`
        })

      createReadStream(mediaPath, {
        start: startNumeric,
        end: endNumeric
      })
        .pipe(res)

      return
    }
  }

  res.header({
    'Content-Type': MimeType[TYPE],
    'Content-Length': totalMediaSize
  })

  createReadStream(mediaPath)
    .pipe(res)
})

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

app.listen(80, () => console.log('Server up in port 80'))