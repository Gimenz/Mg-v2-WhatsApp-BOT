// NezukoChan
const axios = require('axios')
const apitobz = 'https://tobz-api.herokuapp.com'
const keytobz = '' // You Can Get Key From https://tobz-api.herokuapp.com/

// Bismillah
// Jika Tidak Bisa,, Bisa Lapor Ke Issues

const kusonime = async (kusoname) => new Promise(async (resolve) => {
      axios.get(`${apitobz}/api/kuso?q=${kusoname}&apikey=${keytobz}`)
      .then(res => {
      resolve(res.data)
   })
})

module.exports = {
    kusonime
}
