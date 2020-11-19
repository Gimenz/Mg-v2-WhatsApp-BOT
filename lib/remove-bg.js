const { RemoveBgResult, removeBackgroundFromImageBase64 } = require('remove.bg')
/**
 * Remove Image Background
 *
 * @param  {String} base64img
 */

var apikey = 'Get api-key at remove.bg'

const removebg = async (base64img) => new Promise(async (resolve, reject) => {
    await removeBackgroundFromImageBase64({
        base64img,
        apiKey: apikey,
        size: 'auto',
        type: 'auto',
      }).then((result) => {
        const hasil = result.base64img
        resolve(hasil)
      }).catch((err) => {
        reject(err)
      });
})

module.exports = removebg;

