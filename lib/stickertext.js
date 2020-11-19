
const path = require('path')
const { registerFont, createCanvas } = require("canvas");
const canvasTxt = require("canvas-txt").default;
var text2png = require('text2png');

const stext = async (text) => new Promise(async (resolve, reject) => {
    function fontFile(name) {
        return path.join(__dirname, '/font/', name)
      }
      registerFont(fontFile('ObelixProBIt-cyr.ttf'), { family: 'pg' })
      //await client.reply(from, '_Sek yo... gek gawe stiker_', id)
      const canvas = createCanvas(500, 500);
      const ctx = canvas.getContext("2d");
      // alpha bg
      ctx.fillStyle = "rgba(0,0,0,0)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const txt = text
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black"
      canvasTxt.font = 'pg'
      canvasTxt.align = 'center'
      canvasTxt.lineHeight = null
      canvasTxt.justify = false
      canvasTxt.fontSize = 80;
      canvasTxt.drawText(ctx, txt, 70, 50, 400, 400)
      const mediaData = canvas.toDataURL()
      resolve(mediaData)
      const err = 'Error'
      reject(err)
})

module.exports = stext;