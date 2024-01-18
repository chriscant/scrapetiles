// node scrapetiles.js https://tiles.ilovefreegle.org/tile 5 9 data

import fs from 'fs'
import path from 'path'
import https from 'https'
import { Buffer } from 'node:buffer'

import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const packageJson = fs.readFileSync('./package.json')
const version = JSON.parse(packageJson).version || 0
console.log('version', version)
const now = new Date()
const fullversion = 'scrapetiles ' + version + ' - run at ' + now.toLocaleString()

function exiterror (r, ...msg) {
  console.log(r, ...msg)
  return 0
}

/// ////////////////////////////////////////////////////////////////////////////////////

export async function run (argv) {
  const rv = 1
  try {
    // Display usage
    if (argv.length <= 5) {
      console.error('usage: node scrapetiles.js url zoomfrom zoomto directory')
      return 0
    }
    console.log(fullversion)

    const baseurl = argv[2]
    console.log('baseurl', baseurl)
    const zoomfrom = parseInt(argv[3])
    if (isNaN(zoomfrom)) return exiterror('duff zoomfrom', argv[3])
    console.log('zoomfrom', zoomfrom, typeof zoomfrom)
    const zoomto = parseInt(argv[4])
    if (isNaN(zoomto)) return exiterror('duff zoomto', argv[4])
    console.log('zoomto', zoomto, typeof zoomto)
    let outputFolder = argv[5]
    console.log('outputFolder', outputFolder)
    if (zoomfrom > zoomto) return exiterror('duff zoomfrom and zoomto', zoomfrom, zoomto)

    outputFolder = path.join(__dirname, outputFolder)
    fs.mkdirSync(outputFolder, { recursive: true })

    for (let zoom = zoomfrom; zoom <= zoomto; zoom++) {
      const maxtileno = Math.pow(2, zoom)
      console.log('zoom', zoom, 'maxtileno', maxtileno)
      const zoomFolder = path.join(outputFolder, zoom.toString())
      fs.mkdirSync(zoomFolder, { recursive: true })
      // https://tiles.ilovefreegle.org/tile/5/15/10.png
      for (let y = 0; y < maxtileno; y++) {
        const tilefolder = path.join(zoomFolder, y.toString())
        fs.mkdirSync(tilefolder, { recursive: true })

        for (let z = 0; z < maxtileno; z++) {
          const url = baseurl + '/' + zoom + '/' + y + '/' + z + '.png'
          console.log('url', url)

          const readTile = new Promise((resolve, reject) => {
            const req = https.request(url, {}, function (res) {
              const chunks = []
              res.on('data', function (chunk) {
                console.log('data', chunk.length)
                chunks.push(chunk)
              })
              res.on('end', function () {
                console.log('end', chunks.length)
                const allchunks = Buffer.concat(chunks)
                console.log('allchunks', allchunks.length)
                const tilepath = path.join(tilefolder, z + '.png')
                console.log('tilepath', tilepath)
                fs.writeFileSync(tilepath, allchunks, 'binary', function (e) {
                  console.log(e.message)
                  reject(new Error('write error'))
                })
                resolve()
              })
            })
            req.on('error', function (e) {
              console.log(e.message)
              reject(new Error('read error'))
            })
            req.end()
          })
          await readTile
        }
      }
    }

    if (rv) console.log('SUCCESS')
    return 1
  } catch (e) {
    console.error('run EXCEPTION', e)
    return 2
  }
}

/// ////////////////////////////////////////////////////////////////////////////////////
// If called from command line, then run now.
// If jest testing, then don't.
if (process.env.JEST_WORKER_ID === undefined) {
  run(process.argv)
}
