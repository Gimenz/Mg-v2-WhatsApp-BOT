const axios = require('axios')
const request = require('request')
const htmlToText = require('html-to-text');
const moment = require('moment-timezone');
const { parseString } = require('xml2js');
moment.tz.setDefault('Asia/Jakarta').locale('id')
var masgi = 'https://test.mumetndase.my.id'
var baseuri = 'https://dataservice.accuweather.com'
var getkey = '/locations/v1/search?apikey='
var getloc = '/locations/v1/cities/geoposition/search?apikey='
var getdata = '/currentconditions/v1/'
var lang = '&language=id-id&details=true&offset=25'
var accuweatherkey = 'get apikey here https://developer.accuweather.com/user/register'

// get javanesse pasaran
const tanggal = () => new Promise(resolve => {
    var pasaran = new Array('Legi', 'Pahing', 'Pon', 'Wage', 'Kliwon');
    var hari = moment().format('dddd');   
    var tgal = moment().format('DD MMMM YYYY')
    var d2 = moment('2014-01-27');
    var d1 = moment();
    var selisih = Math.floor(Math.abs(d1 - d2) / 86400000);
    var pasar = pasaran[selisih % 5];
    const tgl = `${hari} ${pasar}, ${tgal}`
    resolve(tgl)
})

const lirik1 = async (judul) => new Promise(async (resolve, reject) => {
    const baseuri = 'http://scrap.terhambar.com'
    axios.get(baseuri + '/lirik?word=' + judul, {
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => {
        const hasil = res.data.result.lirik
        const status = res.data.status
        if (status == false) {
            resolve('ga ada') 
        } else {
        resolve(hasil)
        }
    }).catch(err => {
        reject(err)
    })
})

const lirik2 = async (judul) => new Promise(async (resolve, reject) => {
    axios.get(uri + '/lirik?q=' + judul, {
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => {
        const mentah = res.data.result.result[0]
        if (mentah == undefined) {
            resolve('ga ada') 
        } else {
        const hasil = mentah.url
        request.get(masgi + '/getlirik?url=' + hasil, {json: true}, (err, resp, body) => {
            const resul = body.result
            resolve(resul)
        })
        }
    }).catch(err => {
        reject(err)
    })
})

const finder = async (judul) => new Promise(async (resolve, reject) => {
    const baseurl = 'https://api.haipbis.xyz/findlyric?q='
    axios.get(baseurl + judul, {
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(async(res) => {
        const data = res.data.slice(0, 6)
        if (data == undefined) {
            resolve('ga ada') 
        } else {
        let hasil = `🔎 *hasil pencarian lirik '${judul}'* 🔍\nCara get lirik, copy link lalu kirimkan #lirik link\n`
        hasil += ``;
        Object.keys(data).forEach(function (i) {
            hasil += `\n● Judul : ${data[i].title}\n● Artis : ${data[i].artist}\n● Link : ${data[i].link.replace('/add', '')}\n`;
        });
        hasil += '\n♪ *mg_BOT* ♪';
            resolve(hasil)
        }
    }).catch(err => {
        reject(err)
    })
})

const getlirik = async (url) => new Promise(async (resolve, reject) => {
    const baseurl = 'https://api.haipbis.xyz/getlyric?url='
    axios.get(baseurl + url, {
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => {
        const body = res.data
        if (body == 'You may want to head back to the homepage.If you think something is broken, report a problem.') {
            resolve('ga ada') 
        } else {
        const hasil = body.lyric.replace('🇮🇹 Made with love & passion in Italy.\n 🌎 Enjoyed everywhere', 'Error, lirik tidak ditemukan')
        resolve(hasil)
        }
    }).catch(() => {
        reject(err)
    })
})

const cuaca = async (kota) => new Promise(async (resolve, reject) => {
    axios.get(masgi + '/cuaca?kota=' + kota, {
        headers: {
        'Content-Type':'application/json'}
    })
    .then(res => {
        const eror = res.data.status
        const body = res.data.result
        if (eror == false) {
            resolve('Kota tidak ada dalam database') 
        } else {
        const p = `🌤Prakiraan Cuaca🌦\nWilayah *_${body.kota}_*\n${body.hari}\n\n*Cuaca :* _${body.cuaca}_\n*Deskripsi :* _${body.deskripsi}_\n*Suhu Terasa :* _${body.suhu}_\n*Tekanan Udara :* _${body.tekanan}_\n*Kelembaban :* _${body.kelembapan}_\n*Kecepatan Angin :* _${body.angin}_`
        resolve(p)
        }
    })
    .catch(err => {
        reject(err)
    })
})

const sholat = async (kota) => new Promise(async (resolve, reject) => {
    axios.get(masgi + '/sholat?kota=' + kota, {
        headers: {
        'Content-Type':'application/json'}
    })
    .then(res => {
        const eror = res.data.status
        const body = res.data
        if (eror == false) {
            resolve('Kota tidak ada dalam database') 
        } else {
            const mentah = (body.data[0])
            const waktu = (body.data[0].tanggal)
            const wilayah = ('*Jadwal Sholat*\n' + `Wilayah *_${kota}_ dan sekitarnya*\n${waktu}\n\n`)
            const imsak = ('● *Imsak :* ' + `${mentah.imsak}\n`)
            const subuh = ('● *Subuh :* ' + `${mentah.subuh}\n`)
            const terbit = ('● *Terbit :* ' + `${mentah.terbit}\n`)
            const dzuhur = ('● *Dzuhur :* ' + `${mentah.dzuhur}\n`)
            const ashar = ('● *Ashar :* ' + `${mentah.ashar}\n`)
            const maghrib = ('● *Maghrib :* ' + `${mentah.maghrib}\n`)
            const isya = ('● *Isya :* ' + `${mentah.isya}\n`)
            const text = (wilayah + imsak + subuh + terbit + dzuhur + ashar + maghrib + isya + '\n\n_*ᴍɢ ʙᴏᴛ ᴊᴀᴅᴡᴀʟ ꜱʜᴏʟᴀᴛ*_')
            resolve(text)
        }
    })
    .catch(err => {
        reject(err)
    })
})

const kbbi = async (kata) => new Promise(async (resolve, reject) => {
    const baseuri = 'https://rest.farzain.com/api/kbbi.php?id='
    const apikey = '???'
    axios.get(baseuri + kata + '&apikey=' + apikey, {
        headers: {
        'Content-Type':'application/json'}
    })
    .then(res => {
        const body = res.data
        if (body === "<br><br>") {
            resolve('ga ada') 
        } else {
        const hasil = htmlToText.fromString(body, {
            wordwrap: 500
        });
        resolve(hasil)
        }
    })
    .catch(err => {
        reject(err)
    })
})

const wiki = async (kata) => new Promise(async (resolve, reject) => {
    const baseuri = 'https://api-mumetndase.herokuapp.com/api/wiki?q='
    axios.get(baseuri + kata, {
        headers: {
        'Content-Type':'application/json'}
    })
    .then(res => {
        const body = res.data.result
        const status = res.data.status
        if (status === false) {
            resolve('ga ada') 
        } else {
        resolve(body)
        }
    })
    .catch(err => {
        reject(err)
    })
})

const mojok = () => new Promise(async (resolve, reject) => {
    axios.get(masgi + '/mojok', {
        headers: {
        'Content-Type':'application/json'}
    })
    .then(res => {
        const eror = res.data.status
        const data = res.data.data
        const caption = `*Link :* ${data.url}\n*Judul :* ${data.judul}\n*Post date :* ${data.date}\n*Kategori :* ${data.category}\n\n${data.article}`
        if (eror == false) {
            resolve('Error') 
        } else {      
            resolve(caption)
        }
    })
    .catch(err => {
        reject(err)
    })
})

const puisi1 = () => new Promise(async (resolve, reject) => {
    axios.get(masgi + '/puisi1', {
        headers: {
        'Content-Type':'application/json'}
    })
    .then(res => {
        const eror = res.data.status
        const data = res.data.data
        if (eror == false) {
            resolve('Error') 
        } else {      
            resolve(data)
        }
    })
    .catch(err => {
        reject(err)
    })
})

const puisi2 = () => new Promise(async (resolve, reject) => {
    axios.get(masgi + '/puisi2', {
        headers: {
        'Content-Type':'application/json'}
    })
    .then(res => {
        const eror = res.data.status
        const data = res.data.data
        if (eror == false) {
            resolve('Error') 
        } else {      
            resolve(data)
        }
    })
    .catch(err => {
        reject(err)
    })
})

const puisi3 = () => new Promise(async (resolve, reject) => {
    axios.get(masgi + '/puisi3', {
        headers: {
        'Content-Type':'application/json'}
    })
    .then(res => {
        const eror = res.data.status
        const data = res.data.data
        if (eror == false) {
            resolve('Error') 
        } else {      
            resolve(data)
        }
    })
    .catch(err => {
        reject(err)
    })
})

const covid = () => new Promise(async (resolve, reject) => {
    const covid = 'https://coronavirus-19-api.herokuapp.com/countries/Indonesia'
    axios.get(covid, {
        headers: {
        'Content-Type':'application/json'}
    })
    .then(res => {
        const body = res.data
        const judul = ('*Update Data Covid-19 Indonesia*')
        const positif = ('\n\n😷 *Positif :* ' + body.cases)
        const todaypositif = ('\n😷 *Hari ini :* ' + body.todayCases)
        const meninggal = ('\n☠ *Meninggal :* ' + body.deaths)
        const todaymeninggal = ('\n☠ *Hari ini :* ' + body.todayDeaths)
        const sembuh = ('\n☺ *Sembuh :* ' + body.recovered)
        const kata = ('\n\nTetap jaga kesehatan dan ikuti protokol kesehatan\n_#STAYATHOME-PAKAIMASKER_')
        const hasil = judul + positif + todaypositif + meninggal + todaymeninggal + sembuh + kata
        resolve(hasil)
    })
    .catch(err => {
        reject(err)
    })
})

const accuweather = async (kota) => new Promise(async (resolve, reject) => {
    // GET KEY LOKASI BY TEXT
    const lokasi = kota
    axios.get(baseuri + getkey + accuweatherkey + '&q=' + lokasi + lang, {
        headers: {
            'Contet-Type': 'application/json'
        }
    }).then(res => {
        const mentah = res.data[0]
        if (mentah === undefined) {
            resolve('Wilayahmu tidak ada dalam database') 
        } else {
        const locKey = mentah.Key
        //console.log(locKey)
        const daerah = mentah.LocalizedName
        const prov = mentah.AdministrativeArea.LocalizedName
            //GET CUACA BY KEY
            axios.get(baseuri + getdata + locKey + '?apikey=' + apiKey + '&language=id-id&details=true', {headers:{'Content-Type':'application/json'}})
            .then(res => {
                const datamentah = res.data[0]
                const waktu = moment(datamentah.EpochTime * 1000).format('HH:mm')
                const tgl = moment(datamentah.EpochTime * 1000).format('dddd, DD MMMM YYYY')
                const info = datamentah.WeatherText
                const temp = datamentah.RealFeelTemperature.Metric.Value + ' ℃'
                const lembab = datamentah.RelativeHumidity + ' %'
                const angin = datamentah.Wind.Speed.Metric.Value + ' ' + datamentah.Wind.Speed.Metric.Unit
                const angink = datamentah.WindGust.Speed.Metric.Value + ' ' + datamentah.WindGust.Speed.Metric.Unit
                const pandang = datamentah.Visibility.Metric.Value + ' ' + datamentah.Visibility.Metric.Unit
                const tekanan = datamentah.Pressure.Metric.Value + ' ' + datamentah.Pressure.Metric.Unit
                const awan = datamentah.CloudCover + ' %'
                const data = `Kondisi cuaca _*${daerah}, ${prov}*_\n𝐉𝐚𝐦 : ${waktu}\n𝐓𝐚𝐧𝐠𝐠𝐚𝐥 : ${tgl}\n₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋\n● Deskripsi : ${info}\n● Temperatur : ${temp}\n● Kelembapan : ${lembab}\n● Angin : ${angin}\n● Angin Kencang : ${angink}\n● Jarak Pandang : ${pandang}\n● Tekanan Udara : ${tekanan}\n● Tutupan Awan : ${awan}\n⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻\n_*ᴍɢ ʙᴏᴛ ᴡᴇᴀᴛʜᴇʀ ɪɴꜰᴏʀᴍᴀᴛɪᴏɴ*_`
                //console.log(data)
                resolve(data)
            }).catch(err => {
                //console.log(err)
                reject('Wilayahmu tidak ada dalam database' + err)
            })
        }
    }).catch(err => {
        reject(err)
        console.log(err)
    })
})


const accuweatherloc = async (latitude, longitude) => new Promise(async (resolve, reject) => {
    // GET KEY LOKASI BY LONG LAT
    const lat = latitude
    const long = longitude
    axios.get(baseuri + getloc + accuweatherkey + '&q=' + lat + '%2C' + long + '&language=id-id&details=true', {
        headers: {
            'Contet-Type': 'application/json'
        }
    }).then(res => {
        //console.log(res)
        const mentah = res.data
        if (mentah === undefined) {
            resolve('Wilayahmu tidak ada dalam database') 
        } else {
        const locKey = mentah.Key
        //console.log(locKey)
        const daerah = mentah.LocalizedName
        const prov = mentah.AdministrativeArea.LocalizedName
            //GET CUACA BY KEY
            axios.get(baseuri + getdata + locKey + '?apikey=' + apiKey + '&language=id-id&details=true', {headers:{'Content-Type':'application/json'}})
            .then(res => {
                const datamentah = res.data[0]
                const waktu = moment(datamentah.EpochTime * 1000).format('HH:mm')
                const tgl = moment(datamentah.EpochTime * 1000).format('dddd, DD MMMM YYYY')
                const info = datamentah.WeatherText
                const temp = datamentah.RealFeelTemperature.Metric.Value + ' ℃'
                const lembab = datamentah.RelativeHumidity + ' %'
                const angin = datamentah.Wind.Speed.Metric.Value + ' ' + datamentah.Wind.Speed.Metric.Unit
                const angink = datamentah.WindGust.Speed.Metric.Value + ' ' + datamentah.WindGust.Speed.Metric.Unit
                const pandang = datamentah.Visibility.Metric.Value + ' ' + datamentah.Visibility.Metric.Unit
                const tekanan = datamentah.Pressure.Metric.Value + ' ' + datamentah.Pressure.Metric.Unit
                const awan = datamentah.CloudCover + ' %'
                const data = `Kondisi cuaca _*${daerah}, ${prov}*_\n𝐉𝐚𝐦 : ${waktu}\n𝐓𝐚𝐧𝐠𝐠𝐚𝐥 : ${tgl}\n₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋\n● Deskripsi : ${info}\n● Temperatur : ${temp}\n● Kelembapan : ${lembab}\n● Angin : ${angin}\n● Angin Kencang : ${angink}\n● Jarak Pandang : ${pandang}\n● Tekanan Udara : ${tekanan}\n● Tutupan Awan : ${awan}\n⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻\n_*ᴍɢ ʙᴏᴛ ᴡᴇᴀᴛʜᴇʀ ɪɴꜰᴏʀᴍᴀᴛɪᴏɴ*_`
                //console.log(data)
                resolve(data)
            }).catch(err => {
                //console.log(err)
                reject(err)
            })
        }
    }).catch(err => {
        reject(err)
        console.log(err)
    })
})

const simi = async (tanya) => new Promise(async (resolve, reject) => {
    var apiKey = 'get apikey here https://workshop.simsimi.com/en/login'
    const takon = tanya
        const headers = {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        };
        const options = {
            utext: takon,
            lang: "id",
            country: ["ID"],
            atext_bad_prob_max: 0.5,
          }
        await axios.post("https://wsapi.simsimi.com/190410/talk",options,{headers: headers,})
        .then(re => {
            resolve(re.data.atext);
            })
        .catch(error => {
            //console.log(error)
            resolve(`Simsimi Error`);
    });
})

const gempa = () => new Promise(async (resolve, reject) => {
    const uri = 'https://data.bmkg.go.id/autogempa.xml'
    axios.get(uri,).then(res => {
        parseString(res.data, function (err, result) {
            result = result.Infogempa.gempa[0];
            let hasils = `_*Informasi Gempa BMKG*_
₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋
● Tanggal : ${result.Tanggal}
● Jam : ${result.Jam}
● Magnitudo : ${result.Magnitude}
● Kedalaman : ${result.Kedalaman}
● Lintang : ${result.Lintang}
● Bujur : ${result.Bujur}
● Lokasi 1 : ${result.Wilayah1}
● Lokasi 2 : ${result.Wilayah2}
● Lokasi 3 : ${result.Wilayah3}
● Lokasi 4 : ${result.Wilayah4}
● Lokasi 5 : ${result.Wilayah5}
● Potensi : ${result.Potensi}
⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻
_*ᴍɢ ʙᴏᴛ ʙᴍᴋɢ ɪɴꜰᴏʀᴍᴀᴛɪᴏɴ*_`
    resolve(hasils)
      })
    })
})

module.exports = {
    lirik1,
    lirik2,
    finder,
    getlirik,
    cuaca,
    sholat,
    kbbi,
    wiki,
    tanggal,
    mojok,
    puisi1,
    puisi2,
    puisi3,
    covid,
    accuweather,
    accuweatherloc,
    simi,
    gempa,
};
