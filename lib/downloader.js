/* eslint-disable prefer-promise-reject-errors */
const axios = require('axios')
var vhtear = 'GET apikey at https://api.vhtear.com/'

/**
 * Get pornhub videos download url
 * Premium content
 * 
 * @param {string} keyword 
 */
const porn = async (keyword) => new Promise(async (resolve, reject) => {
    // Hidden content
})

/**
 * Get instagram stories
 * Premium content
 * 
 * @param {string} username
 * @param {string} jumlah
 */
const igs = async (username, jumlah) => new Promise(async (resolve, reject) => {
    // Premium content
})


const tik = async (url) => new Promise(async (resolve, reject) => {
    const api = 'https://api.vhtear.com/tiktokdl?link='+url+'&apikey='+vhtear
    axios.get(api).then(async(res) => {
        const st = res.data.result
        if(st === undefined){
            resolve(`Link tidak valid, atau mungkin akun private`)
        }else{
            resolve(st)
        }
    }).catch(err => {
        console.log(err)
        resolve(`Server error, atau akun private`)
    })
})


/**
 * Get instagram metadata
 * 
 * @param {string} url 
 */
const ig = async (url) => new Promise(async (resolve, reject) => {
    const api = 'https://test.mumetndase.my.id/igdl?url='+url
    axios.get(api).then(async(res) => {
        const st = res.data.result
        if(st.status === false){
            resolve(`Asupan tidak ditemukan!! Coba lagi`)
        }else{
            resolve(st)
        }
    }).catch(err => {
        console.log(err)
        resolve(`Server error, try again!`)
    })
})


/**
 * Get Twitter Metadata
 *
 * @param  {String} url
 */
const tweet = (url) => new Promise((resolve, reject) => {
    const api = 'https://test.mumetndase.my.id/twitter?url='+url
    axios.get(api).then((res) => {
        const st = res.data.result
        if(typeof st.status === false){
            resolve(`Errooooorrrrrrrrrrrrrr!`)
        }else{
            resolve(st)
        }
    }).catch(err => {
        console.log(err)
        resolve(`Server error, try again!`)
    })
})

module.exports = { tweet, tik, porn, igs, ig }
