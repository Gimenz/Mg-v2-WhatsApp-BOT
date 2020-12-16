require('dotenv').config()
const { decryptMedia } = require('@open-wa/wa-automate')
const fs = require('fs')
const yts = require('yt-search')
const gTTs = require('gtts');
const axios = require('axios')
const fetch = require('node-fetch')
const google = require('google-it')
const path = require('path')
const { default: translate } = require('google-translate-open-api')
const { spawn } = require('child_process')
const { downloader, urlShortener, meme, removebg, stext, cariKasar, scraper } = require('../lib')
const { uploadImages } = require('../util/fetcher')
const { msgFilter, color, processTime, isUrl } = require('../util/msgFilter')
const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Jakarta').locale('id')
const scdl = require('soundcloud-downloader').default
const CLIENT_ID = 'Cari sendiri di soundcloud.com! kalo bingung kontak saya via wa :D'
const brainly = require('brainly-scraper');
const botset = JSON.parse(fs.readFileSync('./lib/helper/bot.json'))
let ban = JSON.parse(fs.readFileSync('./lib/database/banned.json'))
let prem = JSON.parse(fs.readFileSync('./lib/database/premium.json'))
let dbcot = JSON.parse(fs.readFileSync('./lib/database/bacot.json'))
let info = fs.readFileSync('./lib/info.txt', {encoding: 'utf-8'});
let update = fs.readFileSync('./lib/update.txt', {encoding: 'utf-8'});
let pengirim = JSON.parse(fs.readFileSync('./lib/database/user.json'))
let setting = JSON.parse(fs.readFileSync('./lib/helper/settings.json'))
let limit = JSON.parse(fs.readFileSync('./lib/helper/limit.json'));
let badword = JSON.parse(fs.readFileSync('./lib/helper/badword.json'))
let antilink = JSON.parse(fs.readFileSync('./lib/helper/antilink.json'))
let antisticker = JSON.parse(fs.readFileSync('./lib/helper/antisticker.json'))
let stickerspam = JSON.parse(fs.readFileSync('./lib/helper/stickerspam.json'))
let msgBadword = JSON.parse(fs.readFileSync('./lib/helper/msgBadword.json'))
let db_badword = JSON.parse(fs.readFileSync('./lib/database/katakasar.json'))
let { banChats, limitCount, owner } = setting
const menuId = require('./text/menu')


module.exports = msgHandler = async (client, message) => {
    try {
        const { type, id, from, t, sender, isGroupMsg, chatId, chat, caption, isMedia, mimetype, quotedMsg, quotedMsgObj, mentionedJidList } = message
        let { body } = message
        const serial = sender.id
        const { name, formattedTitle } = chat
        let { pushname, verifiedName, formattedName } = sender
        pushname = pushname || verifiedName || formattedName // verifiedName is the name of someone who uses a business account
        const botNumber = await client.getHostNumber() + '@c.us'
        const groupId = isGroupMsg ? chat.groupMetadata.id : ''
        const groupAdmins = isGroupMsg ? await client.getGroupAdmins(groupId) : ''
        const groupMembers = isGroupMsg ? await client.getGroupMembersId(groupId) : ''
        const isGroupAdmins = groupAdmins.includes(sender.id) || false
        const isBotGroupAdmins = groupAdmins.includes(botNumber) || false
        const isBanned = ban.includes(sender.id)
        const isOwner = sender.id === owner
        const isPremium = prem.includes(sender.id)
        const isBadword = badword.includes(chatId)
        const GroupLinkDetector = antilink.includes(chatId)
        const AntiStickerSpam = antisticker.includes(chatId)
        const isPrivate = sender.id === chat.contact.id
        const tgl = await scraper.tanggal()
        const chats = (type === 'chat') ? body : (type === 'image' || type === 'video') ? caption : ''
        const stickermsg = message.type === 'sticker'
        const argx = chats.toLowerCase()
        const isKasar = await cariKasar(chats)

        let state = {
            status: () => {
                if(banChats){
                    return 'Nonaktif'
                }else{
                    return 'Aktif'
                }
            }
        }

        function isStickerMsg(id){
            if (isOwner) {return false;}
            let found = false;
            for (let i of stickerspam){
                if(i.id === id){
                    if (i.msg >= 12) {
                        found === true 
                        client.reply(from, '*[ANTI STICKER SPAM]*\nKamu telah SPAM STICKER di grup, kamu akan di kick otomatis oleh bot', message.id).then(() => {
                            client.removeParticipant(groupId, id)
                        }).then(() => {
                            const cus = id
                            var found = false
                            Object.keys(stickerspam).forEach((i) => {
                                if(stickerspam[i].id == cus){
                                    found = i
                                }
                            })
                            if (found !== false) {
                                stickerspam[found].msg = 1;
                                const result = '✅ DB Sticker Spam has been reset'
                                console.log(stickerspam[found])
                                fs.writeFileSync('./lib/helper/stickerspam.json',JSON.stringify(stickerspam));
                                client.sendText(from, result)
                            } else {
                                    client.reply(from, `${monospace(`Di database ngga ada nomer itu dik`)}`, id)
                            }
                        })
                        return true;
                    }else{
                        found === true
                        return false;
                    }   
                }
            }
            if (found === false){
                let obj = {id: `${id}`, msg:1};
                stickerspam.push(obj);
                fs.writeFileSync('./lib/helper/stickerspam.json',JSON.stringify(stickerspam));
                return false;
            }  
        }
        function addStickerCount(id){
            if (isOwner) {return;}
            var found = false
            Object.keys(stickerspam).forEach((i) => {
                if(stickerspam[i].id == id){
                    found = i
                }
            })
            if (found !== false) {
                stickerspam[found].msg += 1;
                fs.writeFileSync('./lib/helper/stickerspam.json',JSON.stringify(stickerspam));
            }
        }

        function isBadwordMsg(id){
            if (isOwner) {return false;}
            let kasar = false;
            for (let i of msgBadword){
                if(i.id === id){
                    let msg = i.msg
                    if (msg >= 12) {
                        kasar === true 
                        client.reply(from, '*[ANTI-BADWORD]*\nKamu telah berkata kasar di grup lebih dari 10x, kamu akan di kick otomatis oleh bot!', message.id).then(() => {
                            client.removeParticipant(groupId, id)
                        }).then(() => {
                            const cus = id
                            var found = false
                            Object.keys(msgBadword).forEach((i) => {
                                if(msgBadword[i].id == cus){
                                    found = i
                                }
                            })
                            if (found !== false) {
                                msgBadword[found].msg = 1;
                                const result = '✅ DB Badword Spam has been reset'
                                console.log(msgBadword[found])
                                fs.writeFileSync('./lib/helper/msgBadword.json',JSON.stringify(msgBadword));
                                client.sendText(from, result)
                            } else {
                                    client.reply(from, `${monospace(`Di database ngga ada nomer itu dik`)}`, id)
                            }
                        })
                        return true;
                    }else{
                        kasar === true
                        return false;
                    }   
                }
            }
            if (kasar === false){
                let obj = {id: `${id}`, msg:1};
                msgBadword.push(obj);
                fs.writeFileSync('./lib/helper/msgBadword.json',JSON.stringify(msgBadword));
                return false;
            }  
        }
        function addBadCount(id){
            if (isOwner) {return;}
            var kasar = false
            Object.keys(msgBadword).forEach((i) => {
                if(msgBadword[i].id == id){
                    kasar = i
                }
            })
            if (kasar !== false) {
                msgBadword[kasar].msg += 1;
                fs.writeFileSync('./lib/helper/msgBadword.json',JSON.stringify(msgBadword));
            }
        }

        function isLimit(id){
            if (isPremium) {return false;}
            let found = false;
            for (let i of limit){
                if(i.id === id){
                    let limits = i.limit;
                    if (limits >= limitCount) {
                        found = true;
                        client.reply(from, 'Quota penggunaan bot anda sudah habis, coba lagi besok.\nQuota akan di reset kembali setiap pukul 12 malam WIB\n', id)
                        return true;
                    }else{
                        limit
                        found = true;
                        return false;
                    }
                }
            }
            if (found === false){
                let obj = {id: `${id}`, limit:1};
                limit.push(obj);
                fs.writeFileSync('./lib/helper/limit.json',JSON.stringify(limit));
                return false;
            }  
        }
        function limitAdd (id) {
            if (isPremium) {return;}
            var found = false;
            Object.keys(limit).forEach((i) => {
                if(limit[i].id == id){
                    found = i
                }
            })
            if (found !== false) {
                limit[found].limit += 1;
                fs.writeFileSync('./lib/helper/limit.json',JSON.stringify(limit));
            }
        }

        function convertToRupiah(angka)
        {
            var rupiah = '';		
            var angkarev = angka.toString().split('').reverse().join('');
            for(var i = 0; i < angkarev.length; i++) if(i%3 == 0) rupiah += angkarev.substr(i,3)+'.';
            return 'Rp. '+rupiah.split('',rupiah.length-1).reverse().join('');
        }
        
		
        function timeConvert(millis) {
            var minutes = Math.floor(millis / 60000);
            var seconds = ((millis % 60000) / 1000).toFixed(0);
            return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
          }
        function secToMin(seconds) {
        const format = val => `0${Math.floor(val)}`.slice(-2)
        const minutes = (seconds % 3600) / 60

        return [minutes, seconds % 60].map(format).join(':')
        }
      
        const sleep = async (ms) => {
            return new Promise(resolve => setTimeout(resolve, ms));
        } 

        function banChat () {
            if(banChats == true) {
                return false
            }else{
                return true
            }
        }

        const isMuted = (chatId) => {
            if(botset.includes(chatId)){
                return false
            }else{
                return true
            }
        }

        var nmr = sender.id
        var obj = pengirim.some((val) => {
            return val.id === nmr
        })
        var cekage = pengirim.some((val) => {
            return val.id === nmr && val.umur >= 15
        })


        function isReg(obj){
            if (obj === true){
                return false
            } else {     
                return client.reply(from, 'Kamu belum terdaftar sebagai user mg-BOT\nuntuk mendaftar kirim #daftar nama.umur\n\ncontoh format: #daftar ahmad.17\n\ncukup gunakan nama depan/panggilan saja', id) //if user is not registered
            }
        }

        function cekumur(obj){
            if (obj === true){
                return false
            } else {
                return client.reply(from, 'Kamu belum cukup umur untuk mengunakan bot ini, min 16 tahun\n\nKamu bisa mendaftar ulang dengan cara donasi terlebih dahulu, bales #donasi', id) //if user is not registered
            }
        }

        function monospace(string) {
            return '```' + string + '```'
        }

        // Serial Number Generator
        function GenerateRandomNumber(min,max){
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        // Generates a random alphanumberic character
        function GenerateRandomChar() {
            var chars = "1234567890ABCDEFGIJKLMNOPQRSTUVWXYZ";
            var randomNumber = GenerateRandomNumber(0,chars.length - 1);
            return chars[randomNumber];
        }
        // Generates a Serial Number, based on a certain mask
        function GenerateSerialNumber(mask){
            var serialNumber = "";
            if(mask != null){
                for(var i=0; i < mask.length; i++){
                    var maskChar = mask[i];
                    serialNumber += maskChar == "0" ? GenerateRandomChar() : maskChar;
                }
            }
            return serialNumber;
        }
        if(chats.match("Assalamualaikum") || chats.match("Assalamu'alaikum") || chats.match("assalamualaikum")){
            client.reply(from, 'Waalaikumsalam', id)
        }
        if(chats.match("Makasih") || chats.match("Terima kasih") || chats.match("Thanks") || chats.match("makasih") || chats.match("terima kasih")){
            client.reply(from, 'Sama - sama, semoga bermanfaat :)', id)
        }
        if(chats.match("curhat")){
            client.reply(from, 'Bot gabisa diajak curhat ya dik! Karna bot bukan manusia :)', id)
        }
        if(!isGroupMsg){
            if(chats.match("Donasi") || chats.match("donasi")){
                client.reply(from, 'Untuk melihat info donasi, kirim #donasi')
            }
        }
        // Anti group link chat. bot will kick out group members while sending msg contains group chat invite link
        if (isGroupMsg && GroupLinkDetector && !isGroupAdmins && !isPremium && !isOwner){
            if (chats.match(/(https:\/\/chat.whatsapp.com)/gi)) {
                const check = await client.inviteInfo(chats);
                if (!check) {
                    return
                } else {
                    client.reply(from, '*[GROUP LINK DETECTOR]*\nKamu mengirimkan link grup chat, maaf kamu di kick dari grup :(', id).then(() => {
                        client.removeParticipant(groupId, sender.id)
                    })
                }
            }
        }
        // Anti sticker spam. bot will kick out group members while spamming sticker msg more than 12x
        if (isGroupMsg && AntiStickerSpam && !isGroupAdmins && !isPremium && !isOwner){
            if(stickermsg === true){
                if(isStickerMsg(serial)) return
                addStickerCount(serial)
            }
        }

        const prefix = '#'
        body = (type === 'chat' && body.startsWith(prefix)) ? body : (((type === 'image' || type === 'video') && caption) && caption.startsWith(prefix)) ? caption : ''
        const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
        const arg = body.substring(body.indexOf(' ') + 1)
        const args = body.trim().split(/ +/).slice(1)
        const isCmd = body.startsWith(prefix)
        const uaOverride = process.env.UserAgent
        const url = args.length !== 0 ? args[0] : ''
        const SN = GenerateSerialNumber("000000000000000000000000")
        const isQuotedImage = quotedMsg && quotedMsg.type === 'image'
        const isQuotedVideo = quotedMsg && quotedMsg.type === 'video'
        const isQuotedFile = quotedMsg && quotedMsg.type === 'document'

        // [BETA] Avoid Spam Message
        if (isCmd && msgFilter.isFiltered(from) && !isGroupMsg) { return console.log(color('[SPAM]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname)) }
        if (isCmd && msgFilter.isFiltered(from) && isGroupMsg) { return console.log(color('[SPAM]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle)) }
        //
        if(!isCmd && isKasar && isGroupMsg && isBadword && !isGroupAdmins) { 
            console.log(color('[BADWORD]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${argx}`), 'from', color(pushname), 'in', color(name || formattedTitle)) 
            if(isBadwordMsg(serial)) return
                addBadCount(serial)
        }
        if (!isCmd && !isGroupMsg) { return console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Message from', color(pushname)) }
        if (!isCmd && isGroupMsg) { return console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Message from', color(pushname), 'in', color(name || formattedTitle)) }
        if (isCmd && !isGroupMsg) {console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname))}
        if (isCmd && isGroupMsg) {console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle))}

        // [BETA] Avoid Spam Message
        msgFilter.addFilter(from)

        if(body === prefix+'off' && isMuted(chatId) == true){
            if (!isGroupMsg) return client.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id);  {
                if (!isGroupAdmins) return client.reply(from, 'Maaf, perintah ini hanya dapat dilakukan oleh admin grup!', id)
                botset.push(chatId)
                fs.writeFileSync('./lib/helper/bot.json', JSON.stringify(botset, null, 2))
                client.reply(from, `Bot telah di nonaktifkan pada grup ini! ${prefix}on untuk mengaktifkan!`, id)
            }
        }
        if(body === prefix+'on' && isMuted(chatId) == false){
            if (!isGroupMsg) return client.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id);  {
                if (!isGroupAdmins) return client.reply(from, 'Maaf, perintah ini hanya dapat dilakukan oleh admin grup!', id)
                let index = botset.indexOf(chatId);
                botset.splice(index,1)
                fs.writeFileSync('./lib/helper/bot.json', JSON.stringify(botset, null, 2))
                client.reply(from, `Bot telah di aktifkan!`, id)         
            }
        }
        if(body == prefix+'ping'){
            if(isReg(obj)) return
            if(cekumur(cekage)) return
            const batteryLevel = await client.getBatteryLevel()
            const charged = await client.getIsPlugged();
            await client.sendText(from, `Status bot : *${'%state'.replace('%state', state.status)}*\nSpeed: ${processTime(t, moment())} _detik_\n\n*Bot Device Battery Info*\nBattery Level : ${batteryLevel}%\nIs Charging : ${charged}\n\n_*Waktu Server Bot :*_ ${moment(t * 1000).format('HH:mm:ss')} WIB`)
        }

        if (isMuted(chatId) && banChat() && !isBanned || isOwner) {
            switch (command) {

                case 'joox':{
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    const lagune = body.slice(6)
                    axios.get('https://api.vhtear.com/music?query='+lagune+'&apikey=tumbas dewe', {
                        headers: {
                        'Content-Type':'application/json'}
                    })
                    .then(async(res) => {
                        const eror = res.data.result.response
                        const data = res.data.result[0]
                        if (eror == 403) {
                            client.reply(from, 'Error', id) 
                        } else {      
                            const capt = `Joox Music request by @${sender.id.replace(/[@c.us]/g, '')}\n\n● Judul : ${data.judul}\n● Artist : ${data.penyanyi}\n● Album : ${data.album}\n● File size : ${data.filesize}\n● Durasi : ${data.duration}\n\n_sedang mengirim audio_`
                            client.sendTextWithMentions(from, capt)
                            await client.sendFileFromUrl(from, data.linkMp3, `${data.judul}.${data.ext}`, id)
                            limitAdd(serial)
                        }
                    })
                    .catch(err => {
                        reject(err)
                    })
                    }
                    break
                case 'igs':{
                    // Premium content! Contact me on WhatsApp
                    client.sendText(from, 'Hmmm... Premium content')
                }
                break
                case 'tumbas':{
                    const jual = await client.getBusinessProfilesProducts(botNumber)
                        let hasil = `*_Iklan mg - bot_*\nMonggo di tumbas jajanan @${botNumber.replace('@c.us','')}`
                        hasil += `\n`;
                        let nm = 1;
                        for (let i = 0; i < jual.length; i++) {
                            const harga = jual[i].priceAmount1000.toString()
                            var pric = harga.substring(0, harga.length-3); 
                            const ling = jual[i].imageCdnUrl.rawUrl
                            const gbr = await urlShortener(ling)
                            hasil += `\n*${nm}.* Nama Barang : ${jual[i].name}\n● Kode barang : ${jual[i].retailerId}\n● Deskripsi : ${jual[i].description}\n● Harga: ${convertToRupiah(pric)}\n● Gambar : ${gbr}\n_posted on ${moment(jual[i].t * 1000).format('dddd, DD MMMM YYYY')}_\n`;  
                            nm++
                        }
                        hasil += `\n*Mau pasang iklan juga bisa.*\nchat owner bot kirim #min [isi iklanmu]\nTotal pengguna bot sekarang : *${pengirim.length}*`
                        await client.sendTextWithMentions(from, hasil)
                        limitAdd(serial)
                }
                break
                case 'gifstiker':
                case 'gifsticker':
                case 'stikergif':
                case 'gif': {
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if ((isMedia || isQuotedVideo || isQuotedFile) && args.length === 0) {
                        client.reply(from, '_Processing gif sticker, please wait ..._', id)
                        const encryptMedia = isQuotedVideo || isQuotedFile ? quotedMsg : message
                        const _mimetype = isQuotedVideo || isQuotedFile ? quotedMsg.mimetype : mimetype
                        console.log(color('[WAPI]', 'green'), 'Downloading and decrypt media...')
                        const mediaData = await decryptMedia(encryptMedia, uaOverride)
                        let temp = './media/'
                        let name = new Date() * 1
                        let fileInputPath = path.join(temp, 'webp', `${name}.${_mimetype.replace(/.+\//, '')}`)
                        console.log(color('[fs]', 'green'), `Downloading media into '${fileInputPath}'`)
                        fs.writeFile(fileInputPath, mediaData.toString('binary'), 'binary', (err) => {
                            if (err) return client.sendText(from, 'Error, coba ulangi lagi dik!') && console.log(color('[ERROR]', 'red'), err)
                            try {
                            client.sendMp4AsSticker(from, fileInputPath, {fps: 6,startTime: `00:00:00.0`,endTime : `00:00:05.0`,loop: 0})
                            limitAdd(serial)
                            } catch{
                                client.reply(from, '_Error, coba ubah ke GIF dulu_', id)
                            }
                        })
                        setTimeout(() => {
                            try {fs.unlinkSync(fileInputPath)
                            } catch (e) {console.log(color('[ERROR]', 'red'), e)
                            }
                        }, 15000)
                        } else {
                            client.reply(from, 'Untuk membuat stiker gif, kirim video/gif dengan caption #gif', id)
                        }
                    }
                    break
                case 'phdl':{
                    // Premium content! Contact me on WhatsApp
                    client.sendText(from, 'Hmmm... Premium content')
                    }
                    break
                case 'phfind':{
                    // Premium content! Contact me on WhatsApp
                    client.sendText(from, 'Hmmm... Premium content')
                    }
                    break
                case 'ph':{
                    // Premium content! Contact me on WhatsApp
                    client.sendText(from, 'Hmmm... Premium content')
                    }
                    break
                case 'gift':{
                    //if (!isGroupMsg) return client.reply(from, 'Gift hanya dapat dipakai didalam grup ya dik!', id); 
                    if (!isPremium) return client.reply(from, 'Gift hanya untuk member premium ya dik!', id)  
                    const nomer = args[0]
                    if(!nomer) return client.reply(from, 'Masukkan nomor yang akan di gift, #gift [NOMOR] [Jumlah]\n=> Contoh : #gift 6281234567890 15', id)
                    let text = nomer.replace(/[@c.us]/g,'')
                    const cus = text + '@c.us'
                    const jml = args[1]
                    if(!jml) return client.reply(from, 'Masukkan Jumlah gift quota, #gift [NOMOR] [Jumlah]\n=> Contoh : #gift 6281234567890 15', id)
                    if(jml > 20) return await client.reply(from, 'Gift terlalu banyak, max 20 yaa :)', id)
                        var found = false
                        Object.keys(limit).forEach((i) => {
                            if(limit[i].id == cus){
                                found = i
                            }
                        })
                        if (found !== false) {
                            limit[found].limit = Math.max(0, limit[found].limit);
                            if(limit[found].limit <= 20) return client.reply(from, 'Quota bot pada nomor tersebut masih penuh\nUntuk gift pastikan quota target sudah habis', id)
                            if(limit[found].limit <= 0) {
                                return client.reply(from, 'Quota bot pada nomor tersebut sudah penuh :)', id)
                            }else{
                            limit[found].limit -= jml
                            const updated = limit[found]
                            const result = `${monospace(`Gift quota bot sukses dengan SN: ${SN} pada ${moment().format('DD/MM/YY HH:mm:ss')}`)}
₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋
[User]: @${updated.id.replace('@c.us','')}
[Limit]: ${limitCount-updated.limit}
⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻
Terima kasih. Gunakan dengan sebaik mungkin :)`
                            console.log(limit[found])
                            fs.writeFileSync('./lib/database/limit.json',JSON.stringify(limit));
                            client.sendTextWithMentions(from, result)
                            }
                        } else {
                                client.reply(from, `${monospace(`Di database ngga ada nomer itu dik!`)}`, id)
                        }
                    }
                break
                case 'limit':
                    if(isPremium) {
                        client.reply(from, 'Kamu adalah member premium, Quota penggunaan bot kamu unlimited', id)
                    }else{
                        var found = false
                        for(let lmt of limit){
                            if(lmt.id === serial){
                                let limitCounts = limitCount-lmt.limit
                                if(limitCounts <= 0) return client.reply(from, `quota penggunaan bot kamu sudah habis, coba lagi besok\nReset quota setiap jam 00.00 WIB`, id)
                                client.reply(from, `Sisa quota penggunaan bot kamu tersisa : *${limitCounts}*`, id)
                                found = true
                            }
                        }
                        if (found === false){
                            let obj = {id: `${serial}`, limit:1};
                            limit.push(obj);
                            fs.writeFileSync('./lib/helper/limit.json',JSON.stringify(limit, 2));
                            client.reply(from, `Sisa quota penggunaan bot kamu tersisa : *${limitCount}*`, id)
                        }
                    }
                    break                
                case 'emo':{
                    // Premium content! Contact me on WhatsApp
                    client.sendText(from, 'Hmmm... Premium content')
                    }
                    break
                case 'groupinfo':{
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!isGroupMsg) return client.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id); 
                    const adminlst = groupAdmins.length
                    const memlst = chat.groupMetadata.participants
                    const timestp = chat.groupMetadata.creation
                    const date = moment(timestp * 1000).format('dddd, DD MMMM YYYY')
                    const time = moment(timestp * 1000).format('HH:mm:ss')
                    const owner = chat.groupMetadata.owner
                    const botsts = botset.includes(chat.id)
                    const grplink = antilink.includes(chat.id)
                    const bdwrd = badword.includes(chat.id)
                    const stckr = antisticker.includes(chat.id)
                    const botadmin = isBotGroupAdmins ? 'Iya' : 'Tidak'
                    const result = `Informasi Group *${chat.formattedTitle || chat.name}*
Group ini didirikan sejak *${date}* Pukul *${time}* oleh @${owner.replace('@c.us','')} 
₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋
● ${monospace(`Total Admin :`)} *${adminlst}*
● ${monospace(`Total Member :`)} *${memlst.length}*
● ${monospace(`Bot Group Status :`)} *${botsts ? 'Off' : 'On'}*
● ${monospace(`Anti Link Status :`)} *${grplink ? 'On' : 'Off'}*
● ${monospace(`Anti Badword Status :`)} *${bdwrd ? 'On' : 'Off'}*
● ${monospace(`Anti Spam Sticker Status :`)} *${stckr ? 'On' : 'Off'}*
● ${monospace(`Bot Group Admin :`)} *${botadmin}*
⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻
● ${monospace(`Desc Group :`)}
${chat.groupMetadata.desc}
₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋
_Desc di update oleh : @${chat.groupMetadata.descOwner.replace('@c.us','')} pada *${moment(chat.groupMetadata.descTime * 1000).format('dddd, DD MMMM YYYY')}* pukul ${moment(chat.groupMetadata.descTime * 1000).format('HH:mm:ss')}_
⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻
_*ᴍɢ ʙᴏᴛ ɢʀᴏᴜᴘ ɪɴꜰᴏʀᴍᴀᴛɪᴏɴ*_`
                    client.sendTextWithMentions(from, result)
                    limitAdd(serial)
                }
                break
                case 'regulang':{
                    if (!isOwner) return client.reply(from, 'Command ini hanya dapat digunakan oleh admin bot')  
                    const nomer = args[0]
                    let text = nomer.replace(/[-\s+@c.us]/g,'')
                    const cus = text + '@c.us'
                    const umur = args[1]
                    if(umur >= 40) return await client.reply(from, 'Umur terlalu tua kak, max 40 yaa :D', id)
                        var found = false
                        Object.keys(pengirim).forEach((i) => {
                            if(pengirim[i].id == cus){
                                found = i
                            }
                        })
                        if (found !== false) {
                            pengirim[found].umur = umur;
                            const updated = pengirim[found]
                            const result = monospace(`Update data berhasil dengan SN: ${SN} pada ${moment().format('DD/MM/YY HH:mm:ss')}
₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋
[Nama]: ${updated.nama} | @${updated.id.replace(/[@c.us]/g, '')}
[Nomor]: wa.me/${updated.id.replace('@c.us', '')}
[Umur]: ${updated.umur}
⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻
Total Pengguna yang telah terdaftar ${pengirim.length}`)
                            console.log(pengirim[found])
                            fs.writeFileSync('./lib/database/user.json',JSON.stringify(pengirim));
                            client.sendTextWithMentions(from, result)
                        } else {
                                client.reply(from, `${monospace(`Di database ngga ada nomer itu kak`)}`, id)
                        }
                    }
                break
                case 'resetstiker':
                case 'resetsticker':{
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!isGroupAdmins) return client.reply(from, 'Command ini hanya dapat digunakan oleh admin grup')  
                    if (!args.length >= 1) return client.reply(from, 'Masukkan nomornya, *GUNAKAN AWALAN 62*\ncontoh: #resetsticker 62852262236155 / #resetsticker @member') 
                    const nomer = args[0]
                    let text = nomer.replace(/[-\s+@c.us]/g,'')
                    const cus = text + '@c.us'
                        var found = false
                        Object.keys(stickerspam).forEach((i) => {
                            if(stickerspam[i].id == cus){
                                found = i
                            }
                        })
                        if (found !== false) {
                            stickerspam[found].msg = 1;
                            const result = 'DB Sticker Spam has been reset'
                            console.log(stickerspam[found])
                            fs.writeFileSync('./lib/helper/stickerspam.json',JSON.stringify(stickerspam));
                            client.reply(from, result, from)
                            limitAdd(serial)
                        } else {
                                client.reply(from, `${monospace(`Di database ngga ada nomer itu dik`)}`, id)
                        }
                    }
                break
                case 'resetbadword':{
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!isGroupAdmins) return client.reply(from, 'Command ini hanya dapat digunakan oleh admin grup')  
                    if (!args.length >= 1) return client.reply(from, 'Masukkan nomornya, *GUNAKAN AWALAN 62*\ncontoh: #resetbadword 6285112554122 / #resetbadword @member') 
                    const nomer = args[0]
                    let text = nomer.replace(/[-\s+@c.us]/g,'')
                    const cus = text + '@c.us'
                        var found = false
                        Object.keys(msgBadword).forEach((i) => {
                            if(msgBadword[i].id == cus){
                                found = i
                            }
                        })
                        if (found !== false) {
                            msgBadword[found].msg = 1;
                            const result = 'DB Badword Spam has been reset'
                            console.log(msgBadword[found])
                            fs.writeFileSync('./lib/helper/msgBadword.json',JSON.stringify(msgBadword));
                            client.reply(from, result, from)
                            limitAdd(serial)
                        } else {
                                client.reply(from, `${monospace(`Di database ngga ada nomer itu dik`)}`, id)
                        }
                    }
                break
                case 'cekprem':
                    var cek = sender.id
                    idx = prem.findIndex(x => x === cek);
                    //console.log(prem[idx])
                    const dt = (prem[idx])
                    if(dt === undefined){
                        return client.reply(from, 'Kamu belum terdaftar sebagai member premium :(\n\nuntuk menjadi member premium, kamu bisa donasi seikhlasnya terlebih dahulu, kirim #donasi untuk melihat info donasi', id) //if user is not registered
                    } else {
                        client.sendText(from, `*Premium User Checker*\n\nNo Wa Kamu : *${dt.replace('@c.us', '')}* ada di database, dan kamu sudah terdaftar member premium :)\n\nTerima kasih sudah donasi, semoga dengan adanya bot ini bisa membantu :)`)
                    }
                    break   
                case 'banchat':
                    if (!isOwner) return await client.reply(from, 'Fitur ini hanya dapat digunakan oleh admin bot')
                    if(args[0] === 'on'){
                        if(setting.banChats === true) return
                        if(!isOwner) return
                        setting.banChats = true
                        banChats = true
                        fs.writeFileSync('./lib/helper/settings.json', JSON.stringify(setting, null, 2))
                        client.reply(from, 'Global chat has been disabled!', id)
                    } else if (args[0] === 'off'){
                        if(setting.banChats === false) return
                        if(!isOwner) return
                        setting.banChats = false
                        banChats = false
                        fs.writeFileSync('./lib/helper/settings.json', JSON.stringify(setting, null, 2))
                        client.reply(from, 'Global chat has been enabled!', id)
                    }
                    break
                case 'filter':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!isGroupMsg) return client.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
                    if (!isGroupAdmins) return client.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
                    if (!isBotGroupAdmins) return client.reply(from, 'Wahai admin, jadikan saya sebagai admin grup dahulu :)', id)
                    if (args[0] == 'on') {
                        var cek = badword.includes(chatId);
                        if(cek){
                            return client.reply(from, '*Anti Badword Detector* sudah aktif di grup ini', id) //if number already exists on database
                        } else {
                            badword.push(chatId)
                            fs.writeFileSync('./lib/helper/badword.json', JSON.stringify(badword))
                            client.reply(from, '*[Anti BadWord]* telah di aktifkan', id)
                            limitAdd(serial)
                        }
                    } else if (args[0] == 'off') {
                        var cek = badword.includes(chatId);
                        if(!cek){
                            return client.reply(from, '*Anti Badword Detector* sudah non-aktif di grup ini', id) //if number already exists on database
                        } else {
                            let nixx = badword.indexOf(chatId)
                            badword.splice(nixx, 1)
                            fs.writeFileSync('./lib/helper/badword.json', JSON.stringify(badword))
                            client.reply(from, '*[Anti BadWord]* telah di nonaktifkan', id)
                            limitAdd(serial)
                        }
                    } else {
                        client.reply(from, `pilih on / off\n\n*[Anti BadWord]*\nSetiap member grup yang mengirim pesan mengandung badword lebih dari 10x akan di kick oleh bot!`, id)
                    }
                    break  
                case 'antilink':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!isGroupMsg) return client.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
                    if (!isGroupAdmins) return client.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
                    if (!isBotGroupAdmins) return client.reply(from, 'Wahai admin, jadikan saya sebagai admin grup dahulu :)', id)
                    if (args[0] == 'on') {
                        var cek = antilink.includes(chatId);
                        if(cek){
                            return client.reply(from, '*Anti Group Link Detector* sudah aktif di grup ini', id) //if number already exists on database
                        } else {
                            antilink.push(chatId)
                            fs.writeFileSync('./lib/helper/antilink.json', JSON.stringify(antilink))
                            client.reply(from, '*[Anti Group Link]* telah di aktifkan\nSetiap member grup yang mengirim pesan mengandung link grup akan di kick oleh bot!', id)
                            limitAdd(serial)
                        }
                    } else if (args[0] == 'off') {
                        var cek = antilink.includes(chatId);
                        if(!cek){
                            return client.reply(from, '*Anti Group Link Detector* sudah non-aktif di grup ini', id) //if number already exists on database
                        } else {
                            let nixx = antilink.indexOf(chatId)
                            antilink.splice(nixx, 1)
                            fs.writeFileSync('./lib/helper/antilink.json', JSON.stringify(antilink))
                            client.reply(from, '*[Anti Group Link]* telah di nonaktifkan\n', id)
                            limitAdd(serial)
                        }
                    } else {
                        client.reply(from, `pilih on / off\n\n*[Anti Group Link]*\nSetiap member grup yang mengirim pesan mengandung link grup akan di kick oleh bot!`, id)
                    }
                    break    
                case 'antisticker':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!isGroupMsg) return client.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
                    if (!isGroupAdmins) return client.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
                    if (!isBotGroupAdmins) return client.reply(from, 'Wahai admin, jadikan saya sebagai admin grup dahulu :)', id)
                    if (args[0] == 'on') {
                        var cek = antisticker.includes(chatId);
                        if(cek){
                            return client.reply(from, '*Anti Spam Sticker Detector* sudah aktif di grup ini', id) //if number already exists on database
                        } else {
                            antisticker.push(chatId)
                            fs.writeFileSync('./lib/helper/antisticker.json', JSON.stringify(antisticker))
                            client.reply(from, '*[Anti Sticker SPAM]* telah di aktifkan\nSetiap member grup yang spam sticker akan di kick oleh bot!', id)
                            limitAdd(serial)
                        }
                    } else if (args[0] == 'off') {
                        var cek = antilink.includes(chatId);
                        if(cek){
                            return client.reply(from, '*Anti Spam Sticker Detector* sudah non-aktif di grup ini', id) //if number already exists on database
                        } else {
                            let nixx = antisticker.indexOf(chatId)
                            antisticker.splice(nixx, 1)
                            fs.writeFileSync('./lib/helper/antisticker.json', JSON.stringify(antisticker))
                            client.reply(from, '*[Anti Sticker SPAM]* telah di nonaktifkan\n', id)
                            limitAdd(serial)
                        }
                    } else {
                        client.reply(from, `pilih on / off\n\n*[Anti Sticker SPAM]*\nSetiap member grup yang spam sticker akan di kick oleh bot!`, id)
                    }
                    break                                                          
                case 'daftar':  //menambahkan nomor ke database 
                    if (args.length === 1){
                    const no = sender.id
                    const name = arg.split('.')[0]
                    const mur = arg.split('.')[1]
                    if(isNaN(mur)) return await client.reply(from, 'Umur harus berupa angka!!', id)
                    if(mur >= 40) return await client.reply(from, 'Kamu terlalu tua, kembali lagi ke masa muda untuk menggunakan bot', id)
                    const jenenge = name.replace(' ','')
                    var cek = no
                        var obj = pengirim.some((val) => {
                            return val.id === cek
                        })
                        if (obj === true){
                            return client.reply(from, 'kamu sudah terdaftar', id) //if number already exists on database
                        } else {
                            const mentah = await client.checkNumberStatus(no) //VALIDATE WHATSAPP NUMBER
                            const msg = monospace(`Pendaftaran berhasil dengan SN: ${SN} pada ${moment().format('DD/MM/YY HH:mm:ss')}
₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋
[Nama]: ${jenenge} [@${no.replace(/[@c.us]/g, '')}]
[Nomor]: wa.me/${no.replace('@c.us', '')}
[Umur]: ${mur}
⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻
Untuk menggunakan bot silahkan kirim #menu
Total Pengguna yang telah terdaftar ${pengirim.length}`)
                            const hasil = mentah.canReceiveMessage ? msg : false
                            if (!hasil) return client.reply(from, 'Nomor WhatsApp tidak valid [ Tidak terdaftar di WhatsApp ]', id) 
                            {
                            const register = ({
                                id: mentah.id._serialized,
                                nama: jenenge,
                                umur: mur
                            })
                            pengirim.push(register)
                            fs.writeFileSync('./lib/database/user.json', JSON.stringify(pengirim))
                                client.sendTextWithMentions(from, hasil)
                            }
                        }
                    } else {
                        await client.reply(from, 'Format yang kamu masukkan salah, kirim #daftar nama.umur\n\ncontoh format: #daftar ahmad.17\n\ncukup gunakan nama depan/panggilan saja', id) //if user is not registered
                    }
                break   
                case 'nuliskiri': 
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    //if (!isPremium) return client.reply(from, 'Maaf, ini adalah fitur premium, untuk menggunakan fitur ini silahkan donasi, Kirim #donasi untuk melihat info donasi', id)
                    if (!args.length >= 1) return client.reply(from, 'Kirim #nuliskiri teks', id) 
                        const tulisan = body.slice(11)
                        client.sendText(from, '_sek yo gek nulis.._')
                        const splitText = tulisan.replace(/(\S+\s*){1,9}/g, '$&\n')
                        const fixHeight = splitText.split('\n').slice(0, 31).join('\n')
                        spawn('convert', [
                            './media/images/buku/sebelumkiri.jpg',
                            '-font',
                            './lib/font/Indie-Flower.ttf',
                            '-size',
                            '960x1280',
                            '-pointsize',
                            '22',
                            '-interline-spacing',
                            '2',
                            '-annotate',
                            '+140+153',
                            fixHeight,
                            './media/images/buku/setelahkiri.jpg'
                        ])
                        .on('error', () => client.reply(from, 'Error gan', id))
                        .on('exit', () => {
                            client.sendImage(from, './media/images/buku/setelahkiri.jpg', 'after.jpg', `Wes rampung dik, donasi dong buat biaya server. bales #donasi untuk melihat cara donasi\nDitulis selama: ${processTime(t, moment())} _detik_`, id)
                            limitAdd(serial)
                        })
                    break
                case 'nuliskanan': {
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    //if (!isPremium) return client.reply(from, 'Maaf, ini adalah fitur premium, untuk menggunakan fitur ini silahkan donasi, Kirim #donasi untuk melihat info donasi', id)
                    if (!args.length >= 1) return client.reply(from, 'Kirim #nuliskanan teks', id) 
                    const tulisan = body.slice(12)
                    client.sendText(from, '_sek yo gek nulis.._')
                    const splitText = tulisan.replace(/(\S+\s*){1,9}/g, '$&\n')
                    const fixHeight = splitText.split('\n').slice(0, 31).join('\n')
                    spawn('convert', [
                        './media/images/buku/sebelumkanan.jpg',
                        '-font',
                        './lib/font/Indie-Flower.ttf',
                        '-size',
                        '960x1280',
                        '-pointsize',
                        '23',
                        '-interline-spacing',
                        '2',
                        '-annotate',
                        '+128+129',
                        fixHeight,
                        './media/images/buku/setelahkanan.jpg'
                    ])
                    .on('error', () => client.reply(from, 'Error gan', id))
                    .on('exit', () => {
                        client.sendImage(from, './media/images/buku/setelahkanan.jpg', 'after.jpg', `Wes rampung dik, donasi dong buat biaya server. bales #donasi untuk melihat cara donasi\nDitulis selama: ${processTime(t, moment())} _detik_`, id)
                        limitAdd(serial)
                    })
                }
                    break
                case 'foliokiri': {
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    //if (!isPremium) return client.reply(from, 'Maaf, ini adalah fitur premium, untuk menggunakan fitur ini silahkan donasi, Kirim #donasi untuk melihat info donasi', id)
                    if (!args.length >= 1) return client.reply(from, 'Kirim #foliokiri teks', id) 
                    const tulisan = body.slice(11)
                    client.sendText(from, '_sek yo gek nulis.._')
                    const splitText = tulisan.replace(/(\S+\s*){1,13}/g, '$&\n')
                    const fixHeight = splitText.split('\n').slice(0, 38).join('\n')
                    spawn('convert', [
                        './media/images/folio/sebelumkiri.jpg',
                        '-font',
                        './lib/font/Indie-Flower.ttf',
                        '-size',
                        '1720x1280',
                        '-pointsize',
                        '23',
                        '-interline-spacing',
                        '4',
                        '-annotate',
                        '+48+185',
                        fixHeight,
                        './media/images/folio/setelahkiri.jpg'
                    ])
                    .on('error', () => client.reply(from, 'Error gan', id))
                    .on('exit', () => {
                        client.sendImage(from, './media/images/folio/setelahkiri.jpg', 'after.jpg', `Wes rampung dik, donasi dong buat biaya server. bales #donasi untuk melihat cara donasi\nDitulis selama: ${processTime(t, moment())} _detik_`, id)
                        limitAdd(serial)
                    })
                }
                    break
                case 'foliokanan': {
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    //if (!isPremium) return client.reply(from, 'Maaf, ini adalah fitur premium, untuk menggunakan fitur ini silahkan donasi, Kirim #donasi untuk melihat info donasi', id)
                    if (!args.length >= 1) return client.reply(from, 'Kirim #foliokanan teks', id) 
                    const tulisan = body.slice(12)
                    client.sendText(from, '_sek yo gek nulis.._')
                    const splitText = tulisan.replace(/(\S+\s*){1,13}/g, '$&\n')
                    const fixHeight = splitText.split('\n').slice(0, 38).join('\n')
                    spawn('convert', [
                        './media/images/folio/sebelumkanan.jpg',
                        '-font',
                        './lib/font/Indie-Flower.ttf',
                        '-size',
                        '960x1280',
                        '-pointsize',
                        '23',
                        '-interline-spacing',
                        '3',
                        '-annotate',
                        '+89+190',
                        fixHeight,
                        './media/images/folio/setelahkanan.jpg'
                    ])
                    .on('error', () => client.reply(from, 'Error gan', id))
                    .on('exit', () => {
                        client.sendImage(from, './media/images/folio/setelahkanan.jpg', 'after.jpg', `Wes rampung dik, donasi dong buat biaya server. bales #donasi untuk melihat cara donasi\nDitulis selama: ${processTime(t, moment())} _detik_`, id)
                        limitAdd(serial)
                    })
                }
                    break
                case 'update': {
                    client.sendText(from, update.replace('%state', state.status))
                }       
                    break     
                case 'nulis': {
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    client.sendText(from, menuId.textNulis())
                }
                    break                             
                case 'screen': {
                    if (!isOwner) return await client.reply(from, 'Fitur ini hanya dapat digunakan oleh admin bot')
                    const snap = await client.getSnapshot()
                    client.sendImage(from, snap, 'snapshot.png', 'Session Snapshot')
                }
                    break
                case 'info': {
                    const charged = await client.getIsPlugged();
                    const device = await client.getMe() 
                    const deviceinfo = `- Battery Level : ${device.battery}%\n  ├ Is Charging : ${charged}\n  └ 24 Hours Online : ${device.is24h}\n- Phone : ${device.phone.device_manufacturer}\n  ├ OS Version : ${device.phone.os_version}\n  └ Build Number : ${device.phone.os_build_number}\n\n _*Jam :*_ ${moment(t * 1000).format('HH:mm:ss')}`
                    await client.sendText(from, info.replace('%state', state.status) + `\n\n*Device Info*\n${deviceinfo}`)
                }   
                    break
                // About
                /*case 'ping': {
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    const batteryLevel = await client.getBatteryLevel()
                    const charged = await client.getIsPlugged();
                    await client.sendText(from, `Status bot : *${'%state'.replace('%state', state.status)}*\nSpeed: ${processTime(t, moment())} _detik_\n\n*Bot Device Battery Info*\nBattery Level : ${batteryLevel}%\nIs Charging : ${charged}\n\n_*Jam :*_ ${moment(t * 1000).format('HH:mm:ss')}`)
                    limitAdd(serial)
                }
                    break*/
                case 'about': {
                    client.sendText(from, menuId.textAbout())
                }
                    break
                case 'donasi': {
                    client.sendText(from, menuId.textDonasi(pushname))
                }
                    break
                case 'rules': {
                    client.sendText(from, menuId.textRules())
                }
                    break
                //daftar menu
                case 'help':
                case 'menu': {
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    client.sendText(from, menuId.textMenu(monospace(pushname), monospace(tgl), monospace(moment(t * 1000).format('HH:mm:ss'))))
                }
                    break
                // menu Group (group admin only)
                case 'menuadmin': {
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!isGroupMsg) return client.reply(from, 'perintah ini hanya dapat digunakan di dalam grup', id)
                    client.sendText(from, menuId.textAdmin())
                    break
                }
                case 'igp': {
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    client.sendLinkWithAutoPreview(from, 'https://apps.masgimenz.com/\n', 'Untuk mendownload post instagram yang private, kunjung website diatas')
                }
                    break
                // Sticker Creator
                case 'stext':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    const tk = body.slice(7)
                    if (!tk) return await client.reply(from, 'Text tidak boleh kosong', id)
                    if (args.length >= 6) return await client.reply(from, 'Ups. Maks 5 kata ya sob!', id)
                    const txt = await stext(tk)
                    client.sendImageAsSticker(from, txt)                       
                        limitAdd(serial)
                    break
                case 'sticker':
                case 'stiker': {
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if ((isMedia || isQuotedImage) && args.length === 0) {
                        const encryptMedia = isQuotedImage ? quotedMsg : message
                        const _mimetype = isQuotedImage ? quotedMsg.mimetype : mimetype
                        const mediaData = await decryptMedia(encryptMedia, uaOverride)
                        //await client.reply(from, '_Sedang memproses..._', id)
                        const imageBase64 = `data:${_mimetype};base64,${mediaData.toString('base64')}`
                        client.sendImageAsSticker(from, imageBase64).then(() => {
                            client.reply(from, `Di proses dalam ${processTime(t, moment())} detik\nJangan lupa donasi kak, untuk biaya server agar bot tetap aktif\nkirim *#donasi* untuk info donasi`)
                            //console.log(`Sticker Processed for ${processTime(t, moment())} Second`)
                            limitAdd(serial)
                        })
                    } else if (args[0] === 'nobg') {
                        if (!isPremium) return client.reply(from, 'Maaf, ini adalah fitur premium, untuk menggunakan fitur ini silahkan donasi seikhlasnya, Kirim #donasi untuk melihat info donasi', id)
                        try {
                            const encryptMedia = isQuotedImage ? quotedMsg : message
                            const _mimetype = isQuotedImage ? quotedMsg.mimetype : mimetype
                            const mediaData = await decryptMedia(encryptMedia, uaOverride)
                            //await client.reply(from, '_Sedang memproses..._', id)
                            const imageBase64 = `data:${_mimetype};base64,${mediaData.toString('base64')}`
                            const nobg = await removebg(imageBase64)
                            const hasil = `data:${_mimetype};base64,${nobg}`
                            client.sendImageAsSticker(from, hasil).then(() => {
                                client.reply(from, `Di proses dalam ${processTime(t, moment())} detik\nJangan lupa donasi kak, untuk biaya server agar bot tetap aktif\nkirim *#donasi* untuk info donasi`)
                                //console.log(`Sticker Processed for ${processTime(t, moment())} Second`)
                            })
                        } catch(err) {
                            client.reply(from, `Gambar tidak dapat terbaca, pastikan objek gambar jelas`, id)
                            console.log(err)
                        }
                    } else if (args[0] === 'toimg') {
                        if (quotedMsg) {
                        if(quotedMsg.type === 'sticker') {
                            const mediaData = await decryptMedia(quotedMsg, uaOverride)
                            await client.sendFile(from, `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`, 'toimg.jpg', `Success. Sticker converted to image!`, id)
                            limitAdd(serial)
                            } else {client.reply(from, `Gagal, kirim stiker dulu lalu reply #stiker toimg`, id)}
                        } else {
                            client.reply(from, `Gagal, kirim stiker dulu lalu reply #stiker toimg`, id)
                        }
                    } else if (args.length === 1) {
                        if (!isUrl(url)) { await client.reply(from, 'Maaf, link yang kamu kirim tidak valid. [Invalid Link]', id) }
                        client.sendStickerfromUrl(from, url).then((r) => (!r && r !== undefined)
                            ? client.sendText(from, 'Maaf, link yang kamu kirim tidak memuat gambar. [No Image]')
                            : client.reply(from, `Di proses dalam ${processTime(t, moment())} detik\nJangan lupa donasi kak, untuk biaya server agar bot tetap aktif\nkirim *#donasi* untuk info donasi`)).then(() => console.log(`Sticker Processed for ${processTime(t, moment())} Second`))
                            limitAdd(serial)
                    } else {
                        await client.reply(from, 'Gambar nya mana dik? Penggunaan : kirim gambar dengan caption #sticker', id)
                    }}
                    break                   
                case 'covid':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    const cvd = await scraper.covid()
                    client.sendText(from, cvd)
                    limitAdd(serial)
                    break
                case 'lirik':{
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!args.length >= 1) return client.reply(from, 'format salah. #lirik judul lagu/potongan lirik\ncontoh: #lirik aku iseh tresno koe', id)
                    const nama = body.slice(8)
                    const hasil = await scraper.lirik1(nama)
                    await client.sendText(from, hasil)
                    limitAdd(serial)
                    }
                    break
                case 'lirik2': {
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!args.length >= 1) return client.reply(from, 'format salah. #lirik2 artis - judul lagu\ncontoh: #lirik2 guyonwaton - menepi', id)
                    const nama = body.slice(8)
                    const hasil = await scraper.lirik2(nama)
                    await client.sendText(from, hasil)
                    limitAdd(serial)
                    }
                    break  					
                case 'findlyrics':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!args.length >=1 ) return await client.reply(from, 'Masukkan keyword pencarian!', id);{
                    const keyword = body.slice(12)
                    const hasil = await scraper.finder(keyword)
                    await client.sendText(from, hasil)
                    limitAdd(serial)
                    }
                    break
                case 'getlirik': {
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!args.length >=1 ) return await client.reply(from, 'format salah. cari link lirik nya dulu, kirim #findlyrics judul - artis\nAtau gunakan #lirik / #lirik2', id)
                    if (!isUrl(url)) return client.reply(from, 'format salah. cari link lirik nya dulu, kirim #findlyrics judul - artis\nAtau gunakan #lirik / #lirik2', id)
                    const hasil = await scraper.getlirik(url)
                    await client.sendText(from, hasil)
                    limitAdd(serial)
                        .catch((err) =>{
                            console.error(err)
                            client.reply(from, `Error, Api initialization failed. Please contact admin!`, id);
                        })
                    }
                    break  
                case 'google':
                    if(isLimit(serial)) return
                    if(!args.length >= 1) return await client.reply(from, 'Query tidak boleh kosong', id)
                    var googleQuery = body.slice(8)
                    const isKasar = await cariKasar(googleQuery)
                    if(isKasar) return await client.reply(from, 'Jangan badword bodoh, kalo sange ngentot sama kambing sana', id)
                    if(googleQuery == undefined || googleQuery == ' ') return await client.reply(from, 'Ngga ketemu :(', id)
                        google({ 'query': googleQuery, 'limit': '8' }).then(results => {
                        let hasil = `🔎hasil pencarian google *'${googleQuery}'*🔍`
                        hasil += `\n`;
                        let nm = 1;
                        Object.keys(results).forEach(function (i) {
                            hasil += `\n● Judul : ${results[i].title}\n● Deskripsi : ${results[i].snippet}\n● Link : ${results[i].link}\n`;
                            nm++
                        });
                        hasil += '\n_*ᴍɢ ʙᴏᴛ ɢᴏᴏɢʟᴇ ꜱᴇᴀʀᴄʜ*_';
                            client.sendText(from, hasil)
                            limitAdd(serial)
                        }).catch(e => {
                            client.sendText(from, e);
                        })
                    break	
                case 'goimg':{
                    if(isLimit(serial)) return
                    const qwery = arg.split('.')[0]
                    const jum = arg.split('.')[1]
                    const isKasar = await cariKasar(qwery)
                    if(isKasar && !isOwner) return await client.reply(from, 'Jangan badword bodoh, kalo sange ngentot sama kambing sana', id)
                    if(!qwery) return await client.reply(from, 'Masukkan keyword, contoh = #goimg gambar jerapah.3', id)
                    if(!jum) return await client.reply(from, 'Jumlah gambar diperlukan, contoh = #goimg gambar jerapah.3', id)
                    if(jum >= 5) return await client.reply(from, 'Jumlah terlalu banyak! Max 4', id)
                    var gis = require('g-i-s');
                    var opts = {
                        searchTerm: qwery
                      };
                      gis(opts, logResults);
                    
                    function logResults(error, results) {
                        if (error) {
                          client.reply(from, 'Error dik', id)
                        }
                        else {
                          const item = results.slice(0, jum)
                          item.forEach(async(res) => {
                              console.log(res)
                            const yurl = await urlShortener(res.url)
                            client.sendImage(from, res.url, null, `Link : ${yurl}\nImage size : ${res.height} x ${res.width}`)  
                            limitAdd(serial) 
                            })
                         }
                      }		
                    }
                    break		
                case 'prem': { //menambahkan member premium
                    if (!isOwner) return client.reply(from, 'Maaf, hanya admin bot yang dapat memasukkan member premium', id)
                    if (!args.length >= 1) return client.reply(from, 'Nomornya mana kak?\ncontoh: #prem 6285226236155')  
                    const texnum = body.slice(6)
                    let text = texnum.replace(/[-\s+]/g,'').replace('@','') + '@c.us'
                    var cek = prem.includes(text);
                    if(cek){
                        return client.reply(from, 'Nomor sudah ada di database', id) //if number already exists on database
                    } else {
                        const mentah = await client.checkNumberStatus(text) //VALIDATE WHATSAPP NUMBER
                        const hasil = mentah.canReceiveMessage ? `Register member premium berhasil dengan SN: ${SN} pada ${moment().format('DD/MM/YY HH:mm:ss')}\nTotal member premium sekarang : *${prem.length}*` : false
                        if (!hasil) return client.reply(from, 'Nomor WhatsApp tidak valid [ Tidak terdaftar di WhatsApp ]', id) 
                        {
                        prem.push(mentah.id._serialized)
                        fs.writeFileSync('./lib/database/premium.json', JSON.stringify(prem))
                            client.sendText(from, hasil)}
                        }
                    }
                    break
                case 'listprem': {
                    if (!isOwner) return client.reply(from, 'Fitur ini hanya dapat digunakan oleh admin bot')  
                    const num = fs.readFileSync('./lib/database/premium.json')
                    const liste = JSON.parse(num)
                    //const hasil = liste.replace(/@c.us/g,'')
                    let list = '💎 *Daftar Member Premium* 💎\n'
                    list += `*Total (${liste.length})*`
                    let nomre = 1
                        for (let i = 0; i < liste.length; i++){
                            list += `\n*${nomre}.* ${liste[i].replace(/[@c.us]/g,'')}`
                            nomre++
                        }
                        client.sendText(from, list) 
                    }
                    break   
                case 'listbadword': {
                    const bad = fs.readFileSync('./lib/database/katakasar.json')
                    const liste = JSON.parse(bad)
                    let list = '☠️ *Daftar Badword* ☠️\nJika filter anti badword di aktifkan, setiap member yang mengirimkan pesan mengandung badword lebih dari 10x maka akan di kick oleh bot\n'
                    list += `*Total (${liste.length})*\n`
                    let nomre = 1
                        for (let i = 0; i < liste.length; i++){
                            list += `\n*${nomre}.* ${liste[i]}`
                            nomre++
                        }
                        client.sendText(from, list) 
                    }
                    break                                         
                case 'clearall':
                    if (!isOwner) return
                    client.sendText(from, 'Sek Tak mbusaki chat!')
                    const groupCount = await client.getAllChatIds()
                    const lkist = await client.getAllGroups()
                    for (let gcList of lkist) {
                        client.clearChat(gcList.contact.id)
                    }
                    for (let xchat of groupCount) {
                        client.clearChat(xchat)
                    }
                    client.sendText(from, 'Wes rampung, saiki micek!')
                    break
                case 'delchat': {
                    if (!isOwner) return
                    client.sendText(from, 'Sek Tak mbusaki chat!')
                    let chatsb = await client.getAllChatIds()
                    for(let chatnya of chatsb){
                        client.deleteChat(chatnya)
                    }
                    client.sendText(from, 'Wes rampung, saiki micek!')
                    }
                    break                    
                case 'tr':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!args.length >= 1) return client.reply(from, 'Format salah,#tr <kode bahasa> text\natau reply dengan caption #tr <kode bahasa>\ncontoh : #tr id i love you nisa\natau reply (geser ke kanan pesan) dg caption #tr id', id)
                    if (quotedMsg){
                        const quoteText = quotedMsg.type == 'chat' ? quotedMsg.body : quotedMsg.type == 'image' ? quotedMsg.caption : ''
                        var codelang = args[0]
                        await translate(quoteText, { tld: 'cn',to: codelang })
                        .then((result) => {
                            client.sendText(from, result.data[0])
                            limitAdd(serial)})
                        .catch((err) => {
                            console.log(err)
                            client.sendText(from, 'Error, atau Kode bahasa salah. untuk melihat kode bahasa kirim #lang')
                        })
                    } else {
                        var codelang = args[0]
                        var str = body.slice(7);
                        await translate(str, { tld: 'cn',to: codelang })
                            .then((result) => {
                                client.sendText(from, result.data[0])
                                limitAdd(serial)})
                            .catch((err) => {
                                console.log(err)
                                client.sendText(from, 'Error, atau Kode bahasa salah. untuk melihat kode bahasa kirim #lang')
                        })
                    }
                    break
                case 'lang':
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    await client.sendText(from, menuId.textLang())
                    break
                case 'memestiker':
                case 'memesticker':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if ((isMedia || isQuotedImage) && args.length >= 2) {
                        const top = arg.split('|')[0]
                        const bottom = arg.split('|')[1]
                        const encryptMedia = isQuotedImage ? quotedMsg : message
                        const mediaData = await decryptMedia(encryptMedia, uaOverride)
                        const getUrl = await uploadImages(mediaData, false)
                        await client.reply(from, '_Sedang memproses..._', id)
                        const gbr = await meme.custom(getUrl, top, bottom)
                        client.sendImageAsSticker(from, gbr)
                            .then((serialized) => {
                                console.log(`Sukses Mengirim File dengan id: ${serialized} diproses selama ${processTime(t, moment())}`)
                                limitAdd(serial)
                            })
                            .catch((err) => console.error(err))
                    } else {
                        await client.reply(from, 'Tidak ada gambar! Untuk membuka cara penggnaan kirim #menu [Wrong Format]', id)
                    }
                    break
                case 'giphy': {
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (args.length !== 1) return client.reply(from, 'Kirim #giphy link', id)
                    const isGiphy = url.match(new RegExp(/https?:\/\/(www\.)?giphy.com/, 'gi'))
                    const isMediaGiphy = url.match(new RegExp(/https?:\/\/media.giphy.com\/media/, 'gi'))
                    if (isGiphy) {
                        const getGiphyCode = url.match(new RegExp(/(\/|\-)(?:.(?!(\/|\-)))+$/, 'gi'))
                        if (!getGiphyCode) { return client.reply(from, 'Gagal mengambil kode giphy', id) }
                        const giphyCode = getGiphyCode[0].replace(/[-\/]/gi, '')
                        const smallGifUrl = 'https://media.giphy.com/media/' + giphyCode + '/giphy-downsized.gif'
                        client.sendGiphyAsSticker(from, smallGifUrl).then(() => {
                            client.reply(from, `Di proses dalam ${processTime(t, moment())} _detik_ \nJangan lupa donasi kak, untuk biaya server agar bot tetap aktif\nkirim *#donasi* untuk info donasi`)
                        }).catch((err) => console.log(err))
                    } else if (isMediaGiphy) {
                        const gifUrl = url.match(new RegExp(/(giphy|source).(gif|mp4)/, 'gi'))
                        if (!gifUrl) { return client.reply(from, 'Gagal mengambil kode giphy', id) }
                        const smallGifUrl = url.replace(gifUrl[0], 'giphy-downsized.gif')
                        client.sendGiphyAsSticker(from, smallGifUrl).then(() => {
                            client.reply(from, `Di proses dalam ${processTime(t, moment())} _detik_ \nJangan lupa donasi kak, untuk biaya server agar bot tetap aktif\nkirim *#donasi* untuk info donasi`)
                        }).catch((err) => console.log(err))
                    } else if (args.length === 1) {
                        if (!isUrl(url)) { await client.reply(from, 'Maaf, link yang kamu kirim tidak valid. [Invalid Link]', id) }
                        client.sendStickerfromUrl(from, url).then((r) => (!r && r !== undefined)
                            ? client.sendText(from, 'Maaf, link yang kamu kirim tidak memuat gambar. [No Image]')
                            : client.reply(from, `Di proses dalam ${processTime(t, moment())} detik\nJangan lupa donasi kak, untuk biaya server agar bot tetap aktif\nkirim *#donasi* untuk info donasi`))
                    } else {
                        await client.reply(from, 'maaf, untuk saat ini sticker gif hanya bisa menggunakan link dari giphy.  [Giphy Only]', id)
                    }
                    break
                }
                // Video Downloader
                case 'tiktok': {
                    if(isLimit(serial)) return
                    //if(!isOwner) return client.reply(from, '_Fitur ini sedang dalam perbaikan..._', id)
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (args.length !== 1) return client.reply(from, 'kirim #tiktok https://vt.tiktok.com/xnxnxn', id)
                    if (!isUrl(url) && !url.includes('tiktok.com')) return client.reply(from, 'Maaf, link yang kamu kirim tidak valid. [Invalid Link]', id)
                    await client.reply(from, '_Scraping Metadata..._', id)
                    await downloader.tik(url).then(async(res)=> {
                            const capt = `Sukses download Video TikTok\n\n● Title : ${res.title}\n● Durasi ${res.duration}`
                            await client.sendFileFromUrl(from, res.video, `${res.title}.mp4`, capt, id)
                        }).catch(err => {
                            console.log(err)
                            client.reply(from, `Gagal, server errorrrrrrrrrrrr beroo!`, id)
                        })
                    }
                    break
                case 'ig':
                case 'instagram': 
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    //if (!isOwner) return await client.reply(from, 'Sedang dalam perbaikan...')
                    if (args.length !== 1) return client.reply(from, 'kirim #ig https://www.instagram.com/p/BlaHbLah', id)
                    if (!isUrl && !url.includes('instagram.com')) return client.reply(from, 'Maaf, link yang kamu kirim tidak valid. [Invalid Link]', id)
                    await client.reply(from, `_Scraping Metadata..._`, id);
                    await downloader.ig(url).then(async(res) => {
                        let nama = res.name;
                        let username = res.username;
                        let jumlah_media = res.media_count;
                        for (let i = 0; i < res.data.length; i++) {
                        if (res.data[i].type == "image") {
                                await client.sendFileFromUrl(from, res.data[i].data, "ig.jpg", `Sukses Download Foto Instagram\n\nNama : ${nama} | @${username}\n\nTotal : ${jumlah_media} media`, id);
                                limitAdd(serial)
                            } else {
                                await client.sendFileFromUrl(from, res.data[i].data, "ig.mp4", `Sukses Download Video Instagram\n\nNama : ${nama} | @${username}\n\nTotal : ${jumlah_media} media`, id);
                                limitAdd(serial)
                            }
                        }
                    }).catch((err) => {
                        console.log(err);
                        client.reply(from, 'Error dik', id)
                    })
                    break                     
                case 'tw':
                case 'twitter':{
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (args.length !== 1) return client.reply(from, 'kirim #tw https://twitter.com/blAHbLahBlah', id)
                    if (!isUrl(url) && !url.includes('twitter.com') || url.includes('t.co')) return client.reply(from, 'Maaf, url yang kamu kirim tidak valid. [Invalid Link]', id)
                    await client.reply(from, `_Scraping Metadata..._`, id); {
                    downloader.tweet(url).then(async(res) => {
                        const vid = await client.download(res.video_url)
                        const dl = await urlShortener(res.video_url)
                        const caption = `Sukses Download Video Twitter\n\nUsername : @${res.username}\nCaption : ${res.caption}\nLink download : ${dl}`
                        client.sendFile(from, vid, 'video.mp4', caption, id)
                        limitAdd(serial)
                    })
                        .catch(() => client.sendText(from, 'Maaf, link tidak valid atau tidak ada media di link yang kamu kirim. [Invalid Link]'))
                    }}
                    break
                case 'fb':
                case 'facebook': {
                    if(isLimit(serial)) return
                    //if(!isOwner) return client.reply(from, '_Fitur Downloader sedang dalam perbaikan..._', id)
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    const url = args[0]
                    if (args.length !== 1) return client.reply(from, 'kirim #fb https://www.facebook.com/videos/383383883382983', id)
                    if (!isUrl(url) && !url.includes('facebook.com')) return client.reply(from, 'Maaf, url yang kamu kirim tidak valid. [Invalid Link]', id)
                    await client.reply(from, '_Scraping Metadata..._', id); {
                    const baseurl = 'https://api.i-tech.id'
                    const key = '???'
                        axios.get(baseurl + '/dl/fb?key=' + key + '&link=' + url, {
                            headers: {
                            'Content-Type':'application/json'}
                        })
                        .then(async (res) => {
                            const data = res.data
                            const dl = await urlShortener(data.link)
                            const caption = `Sukses Download Video Facebook\n\n● Title : ${data.title}\n● Link Download : ${dl}\ndiproses selama ${processTime(t, moment())} _detik_`
                            client.sendFileFromUrl(from, dl, 'video.mp4', caption, id)
                            limitAdd(serial)
                        })
                        .catch((err) => client.reply(from, `Error, url tidak valid atau tidak memuat video. [Invalid Link or No Video] \n\n${err}`, id))
                    }}
                    break
                case 'yt':{
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!args.length == 1) return await client.reply(from, 'Link nya mana dik? contoh penggunaan : #yt https://youtu.be', id);
                    const ytlink = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi)
                    if (!isUrl(url) && !ytlink) return client.reply(from, 'Maaf, url yang kamu kirim tidak valid. [Invalid Link]', id)
                        await client.sendText(from, "_Scraping Metadata..._");
                        const baseuri = 'https://scrap.terhambar.com/yt?link='
                        axios.get(baseuri + url, {
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }).then(async (res) => {
                            const mentah = res.data
                            if(mentah.status === false){
                                client.reply(from, 'Error dik!', id)
                            }else{
                            const linke = await urlShortener(mentah.linkVideo)
                            const waktu = (mentah.duration.minute)
                                if(waktu >= 5){
                                    limitAdd(serial)
                                    return client.reply(from, `● Judul : ${mentah.title}\n● Durasi : ${mentah.duration.inText}\n\nDurasi terlalu panjang dik max 5 menit, silahkan kamu download sendiri via browser, klik link ini ${linke}`, id)
                                }else{
                                    const capt = `Sukses Download video youtube\n\n● Judul : ${mentah.title}\n● Link Download : ${linke}\n● Durasi : ${mentah.duration.inText}`
                                    await client.sendFileFromUrl(from, mentah.linkVideo, `${mentah.title}`, capt, id)
                                    limitAdd(serial)
                                }
                            }
                        }).catch(err => {
                            console.log(err)
                            client.reply(from, 'Error dik, coba lagi', id)
                        })
                    }
                    break
                case 'ytmp3':{
                    if(isLimit(serial)) return
                        if(isReg(obj)) return
                        if(cekumur(cekage)) return
                        if (args.length !== 1) return client.reply(from, 'kirim #ytmp3 https://www.youtube.com/watch?v=iDNMn3usn', id)
						const tautan = args[0]
                        const ytlink = tautan.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi)
                        if (!isUrl(tautan) && !ytlink) return client.reply(from, 'Maaf, url yang kamu kirim tidak valid. [Invalid Link]', id)
                            const api = 'https://test.mumetndase.my.id/yta?url=' + tautan
                            axios.get(api,{
                                headers: {
                                'Content-Type':'application/json'}
                            })
                            .then(async(res) => {
                                const { title, dl_link, filesizeF} = res.data.result
                                if (Number(filesizeF.split(' MB')[0]) >= 20.00) return client.reply(from, 'Durasi max 10 menit', id)
                                const text = (`● Judul : ` + title + `\n● Bitrate : 128kbps\n● File size : `+ fil(body.result.filesize) + `\n\n_Sedang mengirim audio_`)
                                await client.sendText(from, text)
                                client.sendFile(from, dl_link, title + '.mp3', null, id)
                                limitAdd(serial)
                            })
                            .catch(err => {
                                console.log(err)
                                client.reply(from, err, id)
                            })
                        }
                    break
                case 'scfind':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    const namalagu = body.slice(8) 
                    if(!namalagu) return await client.reply(from, 'Masukkan judul lagu nya dik!', id)
                    scdl.search("tracks", namalagu, CLIENT_ID).then(res => {
                        const data = res.collection.slice(0, 5)
                        let hasil = `● hasil pencarian SoundCloud *'${namalagu}'*\nCara mendownload lagu, copy link dan kirim #scdl link, atau kirim #scplay judul'`
                        hasil += `\n`;
                        let iki = 1;
                        Object.keys(data).forEach(function (i) {
                            const durasi = data[i].full_duration
                            const dur = timeConvert(durasi)
                            hasil += '\n'+ iki+`.Judul : ${data[i].title}\n● Link : ${data[i].permalink_url}\n● Durasi : ${dur}\n● Username : ${data[i].user.username}\n`;
                            iki++
                        });
                        hasil += '\n_*ᴍɢ ʙᴏᴛ ꜱᴏᴜɴᴅᴄʟᴏᴜᴅ ꜱᴇᴀʀᴄʜ*_';
                        client.sendText(from, hasil)
                        limitAdd(serial)
                    })
                    break
                case 'scplay':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    const judulagu = body.slice(8)
                    if(!judulagu) return await client.reply(from, 'Masukkan judul lagu nya dik!', id)
                    scdl.search("tracks", judulagu, CLIENT_ID).then(res => {
                        const urllagu = res.collection[0].permalink_url  
                        scdl.getInfo(urllagu, CLIENT_ID).then(info =>{
                            const dur = timeConvert(info.full_duration)
							if (info.full_duration >= 900000) return client.reply(from, "Lagu lebih dari 15 menit tidak diperbolehkan!", id)
                            const captione = `SoundCloud request by @${sender.id.replace(/[@c.us]/g, '')}\n\n● Judul : ${info.title}\n● Profile  : ${info.user.username}\n● Durasi : ${dur}\n● Diputar : ${info.playback_count}\n● Likes : ${info.likes_count}\n\n_sek dik gek ngirim lagune_`
                            client.sendTextWithMentions(from, captione)
                        })
                        scdl.download(urllagu, CLIENT_ID)
                        .then(stream => {
                            stream.pipe(fs.createWriteStream('./media/audio/audio.mp3'))
                        })
                    })
                        await sleep(15000)
                        await client.sendFile(from, './media/audio/audio.mp3', 'audio.mp3', id)
                        limitAdd(serial)
                        await sleep(30000)
                        .then(() => fs.unlinkSync('./media/audio/audio.mp3'))
                    .catch(() => client.reply(from, 'Link salah, coba cari link dulu menggunakan #scfind judul lagu', id))
                    break    
                case 'scdl':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    const linklagu = body.slice(6)
                    if(!linklagu) return await client.reply(from, 'Masukkan url soundcloud nya !', id)
                    scdl.getInfo(linklagu, CLIENT_ID).then(info =>{
                        const dur = timeConvert(info.full_duration)
                        if (info.full_duration >= 900000) return client.reply(from, "Lagu lebih dari 15 menit tidak diperbolehkan!", id)
                        const captione = `SoundCloud request by @${sender.id.replace(/[@c.us]/g, '')}\n\n● Judul : ${info.title}\n● Profile  : ${info.user.username}\n● Durasi : ${dur}\n● Diputar : ${info.playback_count}\n● Likes : ${info.likes_count}\n\n_sek dik gek ngirim lagune_`
                        client.sendText(from, captione)
                    })
                    scdl.download(linklagu, CLIENT_ID)
                    .then(stream => {
                        stream.pipe(fs.createWriteStream('./media/audio/audio.mp3'))
                    })
                        await sleep(15000)
                        await client.sendFile(from, './media/audio/audio.mp3', info.title+'.mp3', id)
                        limitAdd(serial)
                    await sleep(30000)
                    .then(() => fs.unlinkSync('./media/audio/audio.mp3'))
                    .catch(() => client.reply(from, 'Link salah, coba cari link dulu menggunakan #scfind judul lagu', id))
                    break  	
                case 'ytfind':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!args.length >=1 ) return await client.reply(from, 'Masukkan keyword pencarian!', id);{
                    const nama = body.slice(8)
                    const isKasar = await cariKasar(nama)
                    if(isKasar && !isOwner) return await client.reply(from, 'Jangan badword bodoh, kalo sange ngentot sama kambing sana', id)
                    await yts(nama, function ( err, r ) {
                        const videos = r.videos.slice( 0, 10 )
                        let hasil = `🔎 hasil pencarian youtube *'${nama}'* 🔍\nCara mendownload lagu, copy link dan kirim *#ytmp3 link*, atau kirim *#play judul*`
                        hasil += `\n`;
                        Object.keys(videos).forEach(function (i) {
                            hasil += `\n● Judul : ${videos[i].title}\n● Channel : ${videos[i].author.name}\n● Durasi : ${videos[i].timestamp}\n● Link : https://www.youtube.com/watch?v=${videos[i].videoId}\n`;
                        });
                        hasil += '\n_*ᴍɢ ʙᴏᴛ ʏᴏᴜᴛᴜʙᴇ ꜱᴇᴀʀᴄʜ*_';
                            client.sendText(from, hasil)
                            limitAdd(serial)
                        })
                    }         
                    break      
                case 'ytvid':{
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!args.length >= 1) return client.reply(from, 'kirim #ytvid judul, contoh #ytvid video lucu ngakak', id)
                    const golek = body.slice(6)
                    const isKasar = await cariKasar(nama)
                    if(isKasar) return await client.reply(from, 'Jangan badword bodoh, kalo sange ngentot sama kambing sana', id)
                    await client.sendText(from, "_Scraping Metadata..._");
                        yts(golek)
                        .then(async (r) =>  {
                            const videos = r.videos
                            const { videoId } = videos[0];
                            const lagune = `https://www.youtube.com/watch?v=${videoId}`
                            const baseuri = 'https://scrap.terhambar.com/yt?link='
                            axios.get(baseuri + lagune, {
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }).then(async (res) => {
                                const mentah = res.data
                                if(mentah.status === false){
                                    client.reply(from, 'Error dik!', id)
                                }else{
                                const linke = await urlShortener(mentah.linkVideo)
                                const capt = `sukses download video youtube\n\n● Judul : ${mentah.title}\n● Link Download : ${linke}\n● Durasi : ${mentah.duration.minute}:${mentah.duration.second}`
                                const waktu = (mentah.duration.minute)
                                    if(waktu >= 5){
                                        limitAdd(serial)
                                        return client.reply(from, `${caption}\n\nDurasi terlalu panjang dik max 5 menit\nsilahkan kamu download sendiri via browser, buka link ini ${linke}`, id)
                                    }else{
                                        await client.sendFileFromUrl(from, mentah.linkVideo, `${mentah.title}`, capt)
                                        limitAdd(serial)
                                    }
                                }
                            }).catch(err => {
                                console.log(err)
                                client.reply(from, 'Error dik, coba lagi', id)
                            })
                        }) .catch(err => {
                            client.reply(from, `Error, Api initialization failed. Please contact admin!`, id);
                          });
                    }
                    break                    
                case 'lagu':
                case 'play':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    //if (!isPremium) return client.reply(from, 'Ini fitur premium? yuk #donasi seikhlasnya untuk jadi member premium\nkirim #premium untuk membaca fitur member premium', id)
                    if (!args.length >= 1) return client.reply(from, 'Format salah, #play judul lagu - artis', id)
                    {
                        const golek = body.slice(6)
                        yts(golek)
                        .then((r) =>  {
                            const videos = r.videos
                            const { videoId, title, duration } = videos[0];
                            const lagune = `https://www.youtube.com/watch?v=${videoId}`
                                fetch(`https://test.mumetndase.my.id/yta?url=${lagune}`)
                                .then((res) => {
                                    status = res.status
                                    return res.json()
                                }).then(async (body) => {
                                    const link = (body.result.dl_link)
                                    const dono = await urlShortener(link)
                                    const text = (`Music request by @${sender.id.replace(/[@c.us]/g, '')}\n\n● Judul : ` + title + `\n● Bitrate : 128kbps\n● Durasi : ${duration}\n● File size : ${timeConvert(body.result.filesize)}\n\n_Sedang mengirim audio_`)
                                    if (duration.seconds >= 800) {
                                        limitAdd(serial)
                                        return client.sendTextWithMentions(from, `Music request by @${sender.id.replace(/[@c.us]/g, '')}\n\nJudul: ${title}\n\nDurasi ${duration} terlalu panjang.\nkamu bisa download sendiri menggunakan link ini dik. ${dono}`)
                                    }else{
                                        client.sendTextWithMentions(from, text)
                                        client.sendFile(from, link, `${title}.mp3`, null, id)
                                        limitAdd(serial)
                                    }
                                }).catch((err) => {
                                    console.log(err)
                                       client.sendText(from, `Error, Api initialization failed. Please contact admin!`)
                                })
                        }) .catch(err => {
                            client.reply(from, `Error, Api initialization failed. Please contact admin!`, id);
                          });
                    }
                    break
                // Other Command
                case 'ptl':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    function repeat(str, num) { 
                        return (new Array(num+1)).join(str); 
                        }
                    let emot = ["✌","😂","😝","😁","😱","👉","🙌","🍻","🔥","🌈","☀","🎈","🌹","💄","🎀","⚽","🎾","🏁","😡","👿","🐻","🐶","🐬","🐟","🍀","👀","🚗","🍎","💝","💙","👌","❤","😍","😉","😓","😳","💪","💩","🍸","🔑","💖","🌟","🎉","🌺","🎶","👠","🏈","⚾","🏆","👽","💀","🐵","🐮","🐩","🐎","💣","👃","👂","🍓","💘","💜","👊","💋","😘","😜","😵","🙏","👋","🚽","💃","💎","🚀","🌙","🎁","⛄","🌊","⛵","🏀","🎱","💰","👶","👸","🐰","🐷","🐍","🐫","🔫","👄","🚲","🍉","💛","💚"];
                    let random = Math.floor(Math.random() * emot.length);
                    let randomemot =  repeat(emot[random], Math.floor(Math.random() * 5));
                    if(args[0] === 'cans'){
                        q2 = Math.floor(Math.random() * 100) + 1;
                        client.sendFileFromUrl(from, 'your web or store image locally' + q2 + '.jpg', 'halo.jpg', `Hai ${pushname} :) ${randomemot}`);
                        limitAdd(serial)
                    }else if (args[0] === 'gans'){
                        q2 = Math.floor(Math.random() * 65) + 1;
                        client.sendFileFromUrl(from, 'your web or store image locally' + q2 + '.jpg', 'halo.jpg', `Hai ${pushname} :) ${randomemot}`,);
                        limitAdd(serial)
                    }else{
                        client.reply(from, 'Pilih cans / gans\ncontoh : #ptl cans\n\n=> cans : cewek\n=> gans : cowok')
                    }
                    break
                case 'stalk':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (args.length == 1) {
                    const username = args[0]
                    const { user } = await meme.stalk(username)
                    console.log(user)
                    if (user == null) {
                        return await client.reply(from, 'Username tidak ditemukan', id) 
                    } else {
                    const dp = (user.hd_profile_pic_url_info.url)
                    const data = `_*ᴍɢ ʙᴏᴛ ɪɴꜱᴛᴀɢʀᴀᴍ ꜱᴄʀᴀᴘᴇʀ*_\n● Username : @${user.username}\n● Nama : ${user.full_name}\n● Private : ${user.is_private ? 'Iya' : 'Tidak'}\n● Jumlah Post : ${user.media_count}\n● Mengikuti : ${user.following_count}\n● Pengikut : ${user.follower_count}\n● Bio : ${user.biography ? user.biography : '-'}\n${user.external_url ? '● Url : ' + user.external_url + '\n' : ''}● Profil : https://www.instagram.com/${user.username}\n_*ᴍɢ ʙᴏᴛ ɪɴꜱᴛᴀɢʀᴀᴍ ꜱᴄʀᴀᴘᴇʀ*_`
                        await client.sendFileFromUrl(from, dp, 'profil.jpg', `${data}`)
                        limitAdd(serial)
					}
                    } else {
                        await client.reply(from, 'kirim #stalk username', id)
                    }
                    break  
                case 'cuaca':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if(quotedMsg){
                        if(quotedMsg.type == 'location'){
                        const hasil = await scraper.accuweatherloc(quotedMsg.lat, quotedMsg.lng)
                        if (hasil == undefined) {
                            return await client.reply(from, 'kota tidak ada dalam database', id) 
                        } else {
                            limitAdd(serial)
                            client.sendText(from, hasil)
                        .catch((err) => {
                            console.error(err)
                            client.reply(from, 'Error, kota tidak ada dalam database', id)
                        })}
                        }
                    } else {
                        const kota = body.slice(7)
                        if (!kota) return client.reply(from, 'Untuk menggunakan fitur ini, kirim #cuaca lokasi\ncontoh: #cuaca magelang', id)
                        const hasil = await scraper.accuweather(kota)
                        if (hasil == undefined) {
                            return await client.reply(from, 'kota tidak ada dalam database', id) 
                        } else {
                            limitAdd(serial)
                            client.sendText(from, hasil)
                        .catch((err) => {
                            console.error(err)
                            client.reply(from, 'Error, kota tidak ada dalam database', id)
                        })
                        }
                    }
                    break                    
                case 'kbbi':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!args.length >= 1) return client.reply(from, 'Untuk menggunakan fitur ini, kirim #kbbi kata\ncontoh: #kbbi jerapah', id)
                    {
                        const kata = body.slice(6)
                        const hasil = await scraper.kbbi(kata)
                        client.sendText(from, hasil)
                        limitAdd(serial)
                    }
                    break
                case 'wiki':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!args.length >= 1) return client.reply(from, 'Untuk menggunakan fitur ini, kirim #kbbi kata\ncontoh: #kbbi jerapah', id)
                    {
                        const kata = body.slice(6)
                        const hasil = await scraper.wiki(kata)
                        client.sendText(from, hasil)
                        limitAdd(serial)
                    }
                    break
                case 'shopee':{
                    if (!args.length >= 1) return client.reply(from, 'Kamu mau cari apa? masukkan keyword pencarian\n=> contoh : #shopee kabel data murah', id)
                    // Premium content! Contact me on WhatsApp
                    client.sendText(from, 'Hmmm... Premium content')
                    }
                break
                case 'img':{
                    if (!args.length >= 1) return client.reply(from, 'urlnya mana dik?\n=> contoh : #img https://cf.shopee.co.id/file/9d6ee34e1cd7e506cfc25698d90f2aea', id)
                    if (!isUrl(url)) return client.reply(from, 'Link tidak valid, mungkin tidak memuat gambar!', id)
                    const image_res = await client.download(url)
                    client.sendImage(from, image_res, 'image.jpg', `Image successfully downloaded\nDiproses selama : ${processTime(t, moment())} _detik_`, id)
                }
                break
                case 'jooxdl':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!args.length >= 1) return client.reply(from, 'Kirim #jooxdl judul lagu - artis\nContoh : #jooxdl pujaan hati - kangen band', id)
                    // Premium content! Contact me on WhatsApp
                    client.sendText(from, 'Hmmm... Premium content')
                    break  
                case 'jooxlyrics':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!args.length >= 1) return client.reply(from, 'Kirim #jooxlyrics judul lagu - artis\nContoh : #jooxlyrics pujaan hati - kangen band', id)
                    // Premium content! Contact me on WhatsApp
                    client.sendText(from, 'Hmmm... Premium content')
                    break  
                case 'jooxfind':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!args.length >= 1) return client.reply(from, 'Kirim #jooxfind judul lagu - artis\nContoh : #jooxfind pujaan hati - kangen band', id)
                    // Premium content! Contact me on WhatsApp
                    client.sendText(from, 'Hmmm... Premium content')
                    break                                      
                case 'film':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!args.length >= 1) return client.reply(from, 'Kirim #film judul film\nContoh : #film milea suara dari dilan\njudulnya yang lengkap ya kak, biar ngga salah', id)
                    // Premium content! Contact me on WhatsApp
                    client.sendText(from, 'Hmmm... Premium content')
                    break                    
                case 'lk21':{
                    if(isLimit(serial)) return 
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    // Premium content! Contact me on WhatsApp
                    client.sendText(from, 'Hmmm... Premium content')
                    }
                    break
                case 'tgl':
                    client.sendText(from, `*_${tgl}_*`)
                    break
                case 'gempa':
                    const gmpa = await scraper.gempa()
                    client.reply(from, gmpa, id)
                    break                    
                case 'sholat':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!args.length >= 1) return client.reply(from, 'Untuk menggunakan fitur ini, kirim #sholat lokasi\ncontoh: #sholat magelang', id)
                    {
                        const kota = body.slice(8)
                        const hasil = await scraper.sholat(kota)
                        client.reply(from, hasil, id)
                        limitAdd(serial)
                    }
                    break;
                //Islam Command
                case 'listsurah':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    try {
                        axios.get('https://raw.githubusercontent.com/ArugaZ/scraper-results/main/islam/surah.json')
                        .then((response) => {
                            let hehex = '📜 *ᴅᴀꜰᴛᴀʀ ꜱᴜʀᴀʜ* 📜\n₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋\n'
                            let nmr = 1
                            for (let i = 0; i < response.data.data.length; i++) {
                                hehex += nmr + '. ' +  monospace(response.data.data[i].name.transliteration.id.toLowerCase()) + '\n'
                                nmr++
                                    }
                                hehex += '⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻\n_*ᴍɢ ʙᴏᴛ ɴɢᴀᴊɪ*_'
                            client.reply(from, hehex, id)
                        })
                    } catch(err) {
                        client.reply(from, err, id)
                    }
                    break
                case 'infosurah':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (args.length == 0) return client.reply(from, `*_${prefix}infosurah <nama surah>_*\nMenampilkan informasi lengkap mengenai surah tertentu. Contoh penggunan: ${prefix}infosurah al-jinn`, message.id)
                        var responseh = await axios.get('https://raw.githubusercontent.com/ArugaZ/scraper-results/main/islam/surah.json')
                        var { data } = responseh.data
                        var idx = data.findIndex(function(post, index) {
                        if((post.name.transliteration.id.toLowerCase() == args[0].toLowerCase())||(post.name.transliteration.en.toLowerCase() == args[0].toLowerCase()))
                            return true;
                        });
                        try {
                            var pesan = "📜 *ɪɴꜰᴏʀᴍᴀꜱɪ ꜱᴜʀᴀʜ* 📜\n₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋₋\n"
                            pesan = pesan + "Nama : "+ data[idx].name.transliteration.id + "\n" + "Asma : " +data[idx].name.short+"\n"+"Arti : "+data[idx].name.translation.id+"\n"+"Jumlah ayat : "+data[idx].numberOfVerses+"\n"+"Nomor surah : "+data[idx].number+"\n"+"Jenis : "+data[idx].revelation.id+"\n"+"Keterangan : "+data[idx].tafsir.id
                            pesan += '\n\n⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻\n_*ᴍɢ ʙᴏᴛ ɴɢᴀᴊɪ*_'
                            client.reply(from, pesan, message.id)
                            limitAdd(serial)
                        }catch{
                            client.reply(from, 'Data tidak ditemukan, atau nama surah salah', id)
                        }
                    break
                case 'surah':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (args.length == 0) return client.reply(from, `*_${prefix}surah <nama surah> <ayat>_*\nMenampilkan ayat Al-Quran tertentu beserta terjemahannya dalam bahasa Indonesia. Contoh penggunaan : ${prefix}surah al-baqarah 1\n\n*_${prefix}surah <nama surah> <ayat> en/id_*\nMenampilkan ayat Al-Quran tertentu beserta terjemahannya dalam bahasa Inggris / Indonesia. Contoh penggunaan : ${prefix}surah al-baqarah 1 id`, message.id)
                        var responseh = await axios.get('https://raw.githubusercontent.com/ArugaZ/scraper-results/main/islam/surah.json')
                        var { data } = responseh.data
                        var idx = data.findIndex(function(post, index) {
                        if((post.name.transliteration.id.toLowerCase() == args[0].toLowerCase())||(post.name.transliteration.en.toLowerCase() == args[0].toLowerCase()))
                            return true;
                        });
                        try{
                            nmr = data[idx].number
                            if(!isNaN(nmr)) {
                            var responseh2 = await axios.get('https://api.quran.sutanlab.id/surah/'+nmr+"/"+args[1])
                                var {data} = responseh2.data
                                var last = function last(array, n) {
                                    if (array == null) return void 0;
                                    if (n == null) return array[array.length - 1];
                                    return array.slice(Math.max(array.length - n, 0));
                                };
                                bhs = last(args)
                                pesan = ""
                                pesan = pesan + data.text.arab + "\n\n"
                                if(bhs == "en") {
                                    pesan = pesan + data.translation.en
                                } else {
                                    pesan = pesan + data.translation.id
                                }
                                pesan = pesan + "\n\n(Q.S. "+data.surah.name.transliteration.id+":"+args[1]+")"
                                pesan += '\n\n⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻\n_*ᴍɢ ʙᴏᴛ ɴɢᴀᴊɪ*_'
                                client.reply(from, pesan, message.id)
                                limitAdd(serial)
                            }
                        }catch{
                            client.reply(from, 'Data tidak ditemukan, mungkin nama surah/ayat salah', id)
                        }
                    break
                case 'tafsir':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (args.length == 0) return client.reply(from, `*_${prefix}tafsir <nama surah> <ayat>_*\nMenampilkan ayat Al-Quran tertentu beserta terjemahan dan tafsirnya dalam bahasa Indonesia. Contoh penggunaan : ${prefix}tafsir al-baqarah 1`, message.id)
                        var responsh = await axios.get('https://raw.githubusercontent.com/ArugaZ/scraper-results/main/islam/surah.json')
                        var {data} = responsh.data
                        var idx = data.findIndex(function(post, index) {
                        if((post.name.transliteration.id.toLowerCase() == args[0].toLowerCase())||(post.name.transliteration.en.toLowerCase() == args[0].toLowerCase()))
                            return true;
                        });
                    try{
                        nmr = data[idx].number
                        if(!isNaN(nmr)) {
                        var responsih = await axios.get('https://api.quran.sutanlab.id/surah/'+nmr+"/"+args[1])
                            var {data} = responsih.data
                            pesan = ""
                            pesan = pesan + "Tafsir Q.S. "+data.surah.name.transliteration.id+":"+args[1]+"\n\n"
                            pesan = pesan + data.text.arab + "\n\n"
                            pesan = pesan + "_" + data.translation.id + "_" + "\n\n" +data.tafsir.id.long
                            pesan += '\n\n⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻⁻\n_*ᴍɢ ʙᴏᴛ ɴɢᴀᴊɪ*_'
                            client.reply(from, pesan, message.id)
                            limitAdd(serial)
                        }
                    }catch{
                        client.reply(from, 'Data tidak ditemukan, mungkin nama surah/ayat salah', id)
                    }
                    break                   
                case 'cerpen':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    axios.get('https://test.mumetndase.my.id/cerpen', {
                        headers: {
                        'Content-Type':'application/json'}
                    })
                    .then(res => {
                        const eror = res.data.status
                        const data = res.data.data
                        if (eror == false) {
                            resolve('Error') 
                        } else {      
                            client.reply(from, data, id)
                            limitAdd(serial)
                        }
                    })
                    .catch(err => {
                        reject(err)
                    })
                    break
                case 'igdp':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (args.length == 1) {
                        const username = args[0]
                        const { user } = await meme.stalk(username)
                        if (user == null) {
                            return await client.reply(from, 'Username tidak ditemukan', id) 
                        } else {
                        const dp = (user.hd_profile_pic_url_info.url)
                        limitAdd(serial)
                        await client.sendFileFromUrl(from, dp, 'profil.jpg', `*Username :* @${user.username}`, id)
                            .catch((err) => {
                                client.reply(from, 'Error, username tidak ditemukan', id)
                            })
						}
                        } else {
                            await client.reply(from, 'Format salah, kirim #igdp username', id)
                        }
                        break  
                case 'gdrive': {
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    const regex = new RegExp("\/d\/(.+)\/", 'gi')
                    //if (!isPrivate) return client.reply(from, 'Fitur ini hanya dapat digunakan di private chat', id)
                    if (!args[0].match(regex)) { await client.reply(from, 'url google drive mu salah, contoh link: https://drive.google.com/file/d/1Cd8KjB9-cUU_Jy8Q/view', id) }
                        const url = args[0]
                        const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
                        function niceBytes(x){
                          let l = 0, n = parseInt(x, 10) || 0;
                          while(n >= 1024 && ++l){
                              n = n/1024;
                          }
                          return(n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
                        }

                        const m = url.match(regex)
                        const fileid = m.toString().trimStart('/', 'd').trim('/');
                        const link = 'https://drive.google.com/file' + fileid + 'view?usp=sharing'

                        fetch('https://gdbypass.host/api/?link='+link)
                            .then((res) => {
                                status = res.status
                                return res.json()
                            })
                            .then(async(body) => {
                                const fileName = body.data.Filename
                                const size = body.data.Filesize
                                const newLink = body.data.NewUnlimitedURL
                                const ling = await urlShortener(newLink)
                                    client.reply(from, `● Nama file : ${fileName}\n● File size : ${niceBytes(size)}\n● Link Bypass : ${ling}`, id)
                                    limitAdd(serial)
                            })
                            .catch((err) => {
                                client.reply(from, 'Error gan, sepertinya linkmu gdrive rate limit exceeded, tidak bisa di bypass\n' + err, id)
                            })
                }       
                break                     
                case 'tts':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if(args.length >= 50) return client.reply(from, 'Teks terlalu panjang kak! max 250 kata', id)
                    const codebahasa = args[0]
                    if(!codebahasa) return client.reply(from, 'Kode bahasa di perlukan, contoh: #tts id\nkode bahasa bisa dilihat dengan mengirimkan #lang')
                    if (quotedMsg){
                        try {
                        const quoteText = quotedMsg.type == 'chat' ? quotedMsg.body : quotedMsg.type == 'image' ? quotedMsg.caption : ''
                        var gtts = new gTTs(quoteText, codebahasa);
                        gtts.save('./media/audio/gtts/gtts.mp3', function () {
                                client.sendPtt(from, './media/audio/gtts/gtts.mp3')
                                limitAdd(serial)
                        })
                        } catch (error){
                            client.sendText(from, 'Error, atau Kode bahasa salah. untuk melihat kode bahasa kirim #lang')
                        }
                    } else {
                        try {
                        let gttsText = body.slice(8);
                        var gtts = new gTTs(gttsText, codebahasa);
                        gtts.save('./media/audio/gtts/gtts.mp3', function () {
                            client.sendPtt(from, './media/audio/gtts/gtts.mp3')
                            limitAdd(serial)
                        })
                        } catch (error){
                            client.sendText(from, 'Error, atau Kode bahasa salah. untuk melihat kode bahasa kirim #lang')
                        }
                    } 
                    break   
                case 'mock':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!args.length >= 1) return client.reply(from, 'kirim #mock kalimat\ncontoh: #mock nisa cantik', id)
                    const teksnya = body.slice(6)
                    const mcok = teksnya.replace((/[aueo]/gi),'i')
                    client.sendText(from, mcok)
                    limitAdd(serial)
                    break
                case 'brainly':
                    if(isLimit(serial)) return
                    if (!isPremium) return client.reply(from, 'Maaf, ini adalah fitur premium, untuk menggunakan fitur ini silahkan donasi seikhlasnya, balas #donasi untuk melihat info donasi', id)
                    if (args.length === 0) return client.reply(from, 'Harap masukan pertanyaan yang di cari!', id)
                    const tanya = body.slice(9)
                    brainly(tanya, 4)
                        .then((result) => {
                            console.log(result)
                            const bro = result.data
                            let hasil = `🔎 *hasil pencarian brainly '${tanya}'* 🔍`
                            hasil += `\n`;
                            let nume = 1;
                            Object.keys(bro).forEach(function (i) {
                                Object.keys(bro[i].jawaban).forEach(function (iki) {
                                    hasil += '\n_*'+nume+`.*_ *● Pertanyaan :* ${bro[i].pertanyaan}\n${bro[i].questionMedia ? '*● Gambar pertanyaan :* ' + bro[i].questionMedia : 'tidak tersedia'}\n*● Jawaban :* ${bro[i].jawaban[iki].text}\n${bro[iki].jawaban.media ? '*● Gambar jawaban :* ' + bro[i].jawaban[i].media : ''}\n-----------------------------------\n`;
                                    nume++
                                })
                            });
                            hasil += '\n_*ᴍɢ ʙᴏᴛ ʙʀᴀɪɴʟʏ ꜱᴇᴀʀᴄʜ*_';
                            client.sendText(from, hasil)
                            limitAdd(serial)
                        })
                        .catch((err) => {
                            client.reply(from, 'Server error kawans', id)
                            console.log(err)
                        })
                    break
                case 'addbadword':{
                    if (!isPremium) return client.reply(from, 'Untuk menghindari penyalahgunaan, fitur ini hanya tersedia untuk user premium', id)
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!args.length >= 1) return client.reply(from, 'Masukkan kata kasar yang akan di blacklist ', id) 
                    const word = body.slice(12)
                    var cek = db_badword.includes(word);
                    if(cek){
                        return client.reply(from, 'Badword sudah ada di database', id) //if number already exists on database
                    } else { 
                        db_badword.push(word)
                        fs.writeFileSync('./lib/database/katakasar.json', JSON.stringify(db_badword))
                        client.reply(from, `Sukses memblacklist kata kasar\nTotal data badword sekarang : *${db_badword.length - 1}*`, id)
                        }
                    }
                    break                       
                case 'addbacot':{
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!args.length >= 1) return client.reply(from, 'BACOTAN NYA MANA ANJING?? DASAR BODOH!', id)  
                        const bacot = body.slice(10)
                        dbcot.push(bacot)
                        fs.writeFileSync('./lib/database/bacot.json', JSON.stringify(dbcot))
                        client.reply(from, `Sukses menambahkan Kata bacot ke database\nTotal data bacot sekarang : *${dbcot.length - 1}*`, id)
                        limitAdd(serial)
                    }
                    break            
                case 'bacot':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if(args.length == 1) {
                        const no = args[0]
                        const cekdb = dbcot.length
                        if(cekdb <= no) return await client.reply(from, `Total data saat ini hanya sampai *${cekdb - 1}*`, id)
                        const res =  dbcot[no]
                        client.sendText(from, res)
                        limitAdd(serial)
                        } else {
                            const kata = dbcot[Math.floor(Math.random()*dbcot.length)];
                            client.sendText(from, kata)
                            limitAdd(serial)
                        }
                    break                    
                case 'simi':{
                    if(isLimit(serial)) return
                    if (!isPremium) return client.reply(from, 'Maaf, ini adalah fitur premium, untuk menggunakan fitur ini silahkan donasi seikhlasnya, balas #donasi untuk melihat info donasi', id)
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!args.length >= 1) return client.reply(from, 'pesan tidak boleh kosong, contoh #simi lg apa', id)  
                    const text = body.slice(6)
                    function repeat(str, num) { 
                        return (new Array(num+1)).join(str); 
                        }
                    let emot = ["✌","😂","😝","😁","😱","👉","🙌","🍻","🔥","🌈","☀","🎈","🌹","💄","🎀","⚽","🎾","🏁","😡","👿","🐻","🐶","🐬","🐟","🍀","👀","🚗","🍎","💝","💙","👌","❤","😍","😉","😓","😳","💪","💩","🍸","🔑","💖","🌟","🎉","🌺","🎶","👠","🏈","⚾","🏆","👽","💀","🐵","🐮","🐩","🐎","💣","👃","👂","🍓","💘","💜","👊","💋","😘","😜","😵","🙏","👋","🚽","💃","💎","🚀","🌙","🎁","⛄","🌊","⛵","🏀","🎱","💰","👶","👸","🐰","🐷","🐍","🐫","🔫","👄","🚲","🍉","💛","💚"];
                    let random = Math.floor(Math.random() * emot.length);
                    let randomemot =  repeat(emot[random], Math.floor(Math.random() * 5));
                    const regex = /[&\/\\#,+()$~%.'":*?<>{}]/g
                    const pesan = text.replace(regex, '')
                    const hasil = await scraper.simi(pesan)
                    client.sendText(from, `*Simi :* ${hasil} ${randomemot}`)
                    limitAdd(serial)
                    }
                    break                    
                case 'mojok':{
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    const hasil = await scraper.mojok()
                    client.sendText(from, hasil)}
                    limitAdd(serial)
                    break
                case 'puisi1':{
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    const hasil = await scraper.puisi1()
                    client.sendText(from, hasil)}
                    limitAdd(serial)
                    break
                case 'puisi2':{
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    const hasil = await scraper.puisi2()
                    client.sendText(from, hasil)}
                    limitAdd(serial)
                    break
                case 'puisi3':{
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    const hasil = await scraper.puisi2()
                    client.sendText(from, hasil)}
                    limitAdd(serial)
                    break                                                        
                case 'min':
                    if (!isPrivate) return await client.reply(from, 'Fitur ini hanya dapat digunakan di private chat')
                    if (!args.length >= 1) return client.reply(from, 'Pesan tidak boleh kosong', id)
                    if (isMedia){
                        const opo = body.slice(5)
                        const mediaData = await decryptMedia(message)
                        const imageBase64 = `data:${message.mimetype};base64,${mediaData.toString('base64')}`
                        client.sendImage(owner, imageBase64, 'gambar.jpeg', `${opo}\n\npesan dari : wa.me/${sender.id.replace(/[@c.us]/g, '').replace(/[-]/g, '\n ')}`)
                            .then(() => client.reply(from, 'Berhasil mengirim pesan ke admin', id))
                    } else {
                        const opo = body.slice(5)
                        client.sendText(owner, `${opo}\n\npesan dari : wa.me/${sender.id.replace(/[@c.us]/g, '')}`)
                            .then(() => client.reply(from, 'Berhasil mengirim pesan ke admin', id))
                    }
                    break
                case 'req':
                    if (!args.length >= 1) return client.reply(from, 'Pesan tidak boleh kosong', id)
                    if (isMedia){
                        const opo = body.slice(5)
                        const mediaData = await decryptMedia(message)
                        const imageBase64 = `data:${message.mimetype};base64,${mediaData.toString('base64')}`
                        client.sendImage(owner, imageBase64, 'gambar.jpeg', `_*ᴍɢ ʙᴏᴛ ꜰᴇᴀᴛᴜʀᴇ ʀᴇQᴜᴇꜱᴛ*_\n\n${opo}\n\nFeature Request from : wa.me/${sender.id.replace(/[@c.us]/g, '').replace(/[-]/g, '\n ')}`)
                            .then(() => client.reply(from, 'Berhasil mengirim pesan request fitur ke admin!', id))
                    } else {
                        const opo = body.slice(5)
                        client.sendText(owner, `_*ᴍɢ ʙᴏᴛ ꜰᴇᴀᴛᴜʀᴇ ʀᴇQᴜᴇꜱᴛ*_\n\n${opo}\n\nFeature Request from : wa.me/${sender.id.replace(/[@c.us]/g, '')}`)
                            .then(() => client.reply(from, 'Berhasil mengirim pesan request fitur ke admin!', id))
                    }
                    break
                case 'bug':
                    if (!args.length >= 1) return client.reply(from, 'Pesan tidak boleh kosong', id)
                    if (isMedia){
                        const opo = body.slice(5)
                        const mediaData = await decryptMedia(message)
                        const imageBase64 = `data:${message.mimetype};base64,${mediaData.toString('base64')}`
                        client.sendImage(owner, imageBase64, 'gambar.jpeg', `_*ᴍɢ ʙᴏᴛ ʙᴜɢ ʀᴇᴘᴏʀᴛ*_\n\n${opo}\n\nBug Reported by : wa.me/${sender.id.replace(/[@c.us]/g, '')}`)
                            .then(() => client.reply(from, 'Berhasil melaporkan bug pesan ke admin\nLaporan main - main tidak akan di tanggapi. dan kamu akan di blok oleh bot!', id))
                    } else {
                        const opo = body.slice(5)
                        client.sendText(owner, `_*ᴍɢ ʙᴏᴛ ʙᴜɢ ʀᴇᴘᴏʀᴛ*_\n\n${opo}\n\npesan dari : wa.me/${sender.id.replace(/[@c.us]/g, '')}`)
                            .then(() => client.reply(from, 'Berhasil melaporkan bug pesan ke admin\nLaporan main - main tidak akan di tanggapi. dan kamu akan di blok oleh bot!', id))
                    }
                    break
                case 'reader': 
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!isGroupMsg) return client.reply(from, 'Perintah ini hanya bisa di gunakan dalam group!', id)                
                    if (!quotedMsg) return client.reply(from, 'Balas/reply pesan saya kak', id)
                    if (!quotedMsgObj.fromMe) return client.reply(from, 'Balas/reply pesan saya kak', id)
                    try {
                        const reader = await client.getMessageReaders(quotedMsgObj.id)
                        let list = ''
                        for (let pembaca of reader) {
                        list += `- @${pembaca.id.replace(/@c.us/g, '')}\n` 
                        }
                        client.sendTextWithMentions(from, `Heyy. dia telah melihat pesan\n${list}`)
                        limitAdd(serial)
                    } catch(err) {
                        console.log(err)
                        client.reply(from, 'Belum ada yang membaca pesan bot/mereka menonaktifkan read receipts ', id)    
                    }
                break
                case 'adminlist':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!isGroupMsg) return client.reply(from, 'Perintah ini hanya bisa di gunakan dalam group!', id)
                        let mimin = ''
                        for (let admin of groupAdmins) {
                            mimin += `● @${admin.replace(/@c.us/g, '')}\n` 
                        }
                        client.sendTextWithMentions(from, `Daftar admin di grup ini:\n${mimin}`)
                        limitAdd(serial)
                    break                       
                case 'bc':
                    if (!isOwner) return
                    let dict = body.slice(4)
                    const chatsz = await client.getAllChatIds();
                    if (isMedia){
                        const mediaData = await decryptMedia(message)
                        const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                        for (let ids of chatsz) {
                            var chk = await client.getChatById(ids)
                            if (!chk.isReadOnly) client.sendImage(ids, imageBase64, 'gambar.jpeg', `*[ mg-BOT Broadcast ]*\n\n${dict}`)
                        }
                        client.reply(from, 'Broadcast sukses!', id)
                    } else if (quotedMsg && quotedMsg.type == 'image') {
                        const mediaData = await decryptMedia(quotedMsg)
                        const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
                        for (let ids of chatsz) {
                            var chk = await client.getChatById(ids)
                            if (!chk.isReadOnly) client.sendImage(ids, imageBase64, 'gambar.jpeg', `*[ mg-BOT Broadcast ]*\n\n${dict}`)
                        }
                        client.reply(from, 'Broadcast sukses!', id)
                    } else {
                        for (let ids of chatsz) {
                            var chk = await client.getChatById(ids)
                            if (!chk.isReadOnly) client.sendText(ids, `*[ mg-BOT Broadcast ]*\n\n${dict}`)
                        }
                        client.reply(from, 'Broadcast sukses!', id)
                    }
                    break
                case 'ban':
                    if (!isOwner) return client.reply(from, 'Perintah *#ban* hanya untuk owner bot!', message.id)
                    for (let i = 0; i < mentionedJidList.length; i++) {
                        ban.push(mentionedJidList[i])
                        fs.writeFileSync('./lib/database/banned.json', JSON.stringify(ban))
                        client.reply(from, 'Succes ban target!', message.id)
                    }
                    break
                case 'addban': 
                    if (!isOwner) return client.reply(from, 'Perintah *#addban* hanya untuk owner bot!', message.id)
                    if (!args.length >= 1) return client.reply(from, 'Masukkan nomornya, *GUNAKAN AWALAN 62* contoh: 6285226236155')  
                    {
                    const texnum = body.slice(6)
                    let text = texnum.replace(/[-\s+]/g,'').replace('@','') + '@c.us'
                    var cek = ban.includes(text);
                    if(cek){
                        return client.reply(from, 'Nomor sudah terbanned', id) //if number already exists on database
                    } else {
                        const mentah = await client.checkNumberStatus(text) //VALIDATE WHATSAPP NUMBER
                        const hasil = mentah.canReceiveMessage ? `Banned sukses\nTotal user banned sekarang : *${ban.length}*` : false
                        if (!hasil) return client.reply(from, 'Nomor WhatsApp tidak valid [ Tidak terdaftar di WhatsApp ]', id) 
                        {
                        ban.push(mentah.id._serialized)
                        fs.writeFileSync('./lib/database/banned.json', JSON.stringify(ban))
                            client.sendText(from, hasil)}
                        }
                    }
                    break     
                case 'remove': //menghapus nomor dari database
                    if (!isOwner) return client.reply(from, 'Fitur ini hanya dapat digunakan oleh admin bot')  
                    if (!args.length >= 1) return client.reply(from, 'Masukkan nomornya, *GUNAKAN AWALAN 62* contoh: 6285226236155')  
                    {
                        const text = body.slice(8).replace(/[-\s+]/g,'')
                        let inx = ban.indexOf(text+'@c.us')
                        ban.splice(inx,1)
                        fs.writeFileSync('./lib/database/banned.json', JSON.stringify(ban))
                        client.reply(from, 'Sukses menghapus nomor dari database', id)
                    }
                    break                     
                case 'unban':
                    if (!isOwner) return client.reply(from, 'Perintah *#unban* hanya untuk owner bot!', message.id)
                    let inx = ban.indexOf(mentionedJidList[0])
                    ban.splice(inx, 1)
                    fs.writeFileSync('./lib/database/banned.json', JSON.stringify(ban))
                    client.reply(from, 'Succes unban target!', message.id)
                    break
                case 'unblock': { //menambahkan nomor ke database 
                    if (!isOwner) return client.reply(from, 'Maaf, hanya admin bot yang dapat unblok user', id)
                    if (!args.length >= 1) return client.reply(from, 'Nomornya mana kak?')  
                    const text = body.slice(9)
                    let bloknum = text.replace(/[-\s+]/g,'').replace('@','') + '@c.us'
                    const blockedlist = await client.getBlockedIds()
                    var cek = blockedlist.includes(bloknum);
                    if(!cek){
                        return client.reply(from, 'Nomor ini sudah ter unblock', id) //if number already exists on database
                    } else {
                        const mentah = await client.checkNumberStatus(bloknum) //VALIDATE WHATSAPP NUMBER
                        const hasil = mentah.canReceiveMessage ? `Unblocked success\nTotal Nomor terblokir sekarang : *${blockedlist.length}*` : false
                        if (!hasil) return client.reply(from, 'Nomor WhatsApp tidak valid [ Tidak terdaftar di WhatsApp ]', id); {
                            await client.contactUnblock(mentah.id._serialized)
                            client.sendText(from, hasil)
                        }
                    }
                    }
                    break  
                case 'block': { //menambahkan nomor ke database 
                    if (!isOwner) return client.reply(from, 'Maaf, hanya admin bot yang dapat memblokir user', id)
                    if (!args.length >= 1) return client.reply(from, 'Nomornya mana kak?\ncontoh: #daftar 6285226236155')  
                    const text = body.slice(7)
                    let bloknum = text.replace(/[-\s+]/g,'').replace('@','') + '@c.us'
                    const blockedlist = await client.getBlockedIds()
                    var cek = blockedlist.includes(bloknum);
                    if(cek){
                        return client.reply(from, 'Nomor ini sudah terblokir', id) //if number already exists on database
                    } else {
                        const mentah = await client.checkNumberStatus(bloknum) //VALIDATE WHATSAPP NUMBER
                        const hasil = mentah.canReceiveMessage ? `Blocked success\nTotal Nomor terblokir sekarang : *${blockedlist.length}*` : false
                        if (!hasil) return client.reply(from, 'Nomor WhatsApp tidak valid [ Tidak terdaftar di WhatsApp ]', id); {
                            await client.contactBlock(mentah.id._serialized)
                            client.sendText(from, hasil)
                        }
                    }
                    }
                    break 
                //groups coding
                case 'santet': //work
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!isGroupMsg) return client.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
                    if (mentionedJidList.length === 0) return client.reply(from, 'Tag member yang mau disantet', id)
                    if (args.length === 1) return client.reply(from, 'Masukkan alasan kenapa menyantet dia!!', id)
                        const target = arg.split('|')[0]
                        const alasan = arg.split('|')[1]
                        await client.sendTextWithMentions(from, `Santet terkirim ke ${target}, Dengan alasan${alasan}`)
                        limitAdd(serial)
                break
                case 'jadian':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!isGroupMsg) return client.reply(from, 'perintah ini hanya dapat digunakan di dalam grup', id)
                    const mem = groupMembers
                    const aku = mem[Math.floor(Math.random() * mem.length)];
                    const kamu = mem[Math.floor(Math.random() * mem.length)];
                    const sapa = `Cieee... @${aku.replace(/[@c.us]/g, '')} (💘) @${kamu.replace(/[@c.us]/g, '')} baru jadian nih\nBagi pj nya dong`
                    await client.sendTextWithMentions(from, sapa)
                    limitAdd(serial)
                    break                  
                case 'tag':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!isGroupMsg) return client.reply(from, 'perintah ini hanya dapat digunakan di dalam grup', id)
                    if (!args.length >= 1) return await client.reply(from, 'pesan tidak boleh kosong', id) ;{
                        const text = body.slice(5)
                        const mem = groupMembers
                        const randMem = mem[Math.floor(Math.random() * mem.length)];
                        const sapa = `${text} 👉 @${randMem}`
                        await client.sendTextWithMentions(from, sapa)
                        limitAdd(serial)
                    }
                    break                    
                case 'getpic': //work
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                        try {
                            var jnck = await client.getProfilePicFromServer(from)
                            client.sendFileFromUrl(from, jnck, `awok.jpg`)
                            limitAdd(serial)
                        } catch {
                            client.reply(from, 'Pp lu gada anying, di private atau gimana?', message)
                        }
                    break
                case 'me':{
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    const userid = sender.id
                    const banned = ban.includes(userid)
                    const premi = prem.includes(userid)
                    const blocked = await client.getBlockedIds()
                    const isblocked = blocked.includes(userid)
                    const ct = await client.getContact(userid)
                    const isOnline = await client.isChatOnline(userid) ? '✔' : '❌'
                    var sts = await client.getStatus(userid)
                    const bio = sts
                    const admins = groupAdmins.includes(userid) ? 'Admin' : 'Member biasa'
                    var found = false
                        Object.keys(pengirim).forEach((i) => {
                            if(pengirim[i].id == userid){
                                found = i
                            }
                        })
                        if (found !== false) {
                            pengirim[found].id = userid;
                            var regist = '✔'
                        } else {
                            var regist = '❌'
                        }
                    var masih = false
                        for(let lmt of limit){
                            if(lmt.id === serial){
                                let limitCounts = limitCount-lmt.limit
                                if(isPremium){
                                    var sisa = 'Unlimited'
                                }else{
                                    if(limitCounts <= 0){
                                        var sisa = 'habis'
                                    } else {
                                        var sisa = `${limitCounts}`
                                    }
                                }
                                masih = true
                            }
                        }     
                        if (masih === false){
                            let obj = {id: `${serial}`, limit:1};
                            limit.push(obj);
                            fs.writeFileSync('./lib/helper/limit.json',JSON.stringify(limit, 2));
                            var sisa = `${limitCount}`
                        }                
                    var adm = admins
                    if (ct == null) {
                        return await client.reply(from, 'Nomor WhatsApp tidak valid [ Tidak terdaftar di WhatsApp ]', id) 
                    } else {
                    const contact = ct.pushname
                    const dp = await client.getProfilePicFromServer(userid)
                    if (dp == undefined) {
                        var pfp = 'https://raw.githubusercontent.com/Gimenz/line-break/master/profil.jpg'
                        } else {
                        var pfp = dp
                        } 
                    if (contact == undefined) {
                        var nama = '_Dia pemalu, tidak mau menampilkan namanya_' 
                        } else {
                        var nama = contact
                        } 
                    const caption = `*Detail Member* ✨ \n\n● *Name :* ${nama}\n● *Bio :* ${bio.status}\n● *Chat link :* wa.me/${sender.id.replace('@c.us', '')}\n● *Role :* ${adm}\n● *Banned by Bot :* ${banned ? '✔' : '❌'}\n● *Blocked by Bot :* ${isblocked ? '✔' : '❌'}\n● *Chat with bot :* ${isOnline}\n● *User Premium :* ${premi ? '✔' : '❌'}\n● *Registered User :* ${regist}\n● *Sisa Quota :* ${sisa}`
                    client.sendFileFromUrl(from, pfp, 'dp.jpg', caption)
                    limitAdd(serial)
                    }
                    }
                break
                case 'profile':{
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!args.length === 1) return await client.reply(from, 'Mention salah satu member!', id) 
                    const texnum = body.slice(9)
                    const getnumber =  await client.checkNumberStatus(texnum)
                    const userid = getnumber.id.replace('@','') + '@c.us'
                    const banned = ban.includes(userid)
                    const premi = prem.includes(userid)
                    const blocked = await client.getBlockedIds()
                    const isblocked = blocked.includes(userid)
                    const ct = await client.getContact(userid)
                    const isOnline = await client.isChatOnline(userid) ? '✔' : '❌'
                    var sts = await client.getStatus(userid)
                    const bio = sts
                    const admins = groupAdmins.includes(userid) ? 'Admin' : 'Member biasa'
                    var found = false
                        Object.keys(pengirim).forEach((i) => {
                            if(pengirim[i].id == userid){
                                found = i
                            }
                        })
                        if (found !== false) {
                            pengirim[found].id = userid;
                            var regist = '✔'
                        } else {
                            var regist = '❌'
                        }
                    var adm = admins
                    if (ct == null) {
                        return await client.reply(from, 'Nomor WhatsApp tidak valid [ Tidak terdaftar di WhatsApp ]', id) 
                    } else {
                    const contact = ct.pushname
                    const dp = await client.getProfilePicFromServer(userid)
                    if (dp == undefined) {
                        var pfp = 'https://raw.githubusercontent.com/Gimenz/line-break/master/profil.jpg'
                        } else {
                        var pfp = dp
                        } 
                    if (contact == undefined) {
                        var nama = '_Dia pemalu, tidak mau menampilkan namanya_' 
                        } else {
                        var nama = contact
                        } 
                    const caption = `*Detail Member* ✨ \n\n● *Name :* ${nama}\n● *Bio :* ${bio.status}\n● *Chat link :* wa.me/${getnumber.id.replace('@', '')}\n● *Role :* ${adm}\n● *Banned by Bot :* ${banned ? '✔' : '❌'}\n● *Blocked by Bot :* ${isblocked ? '✔' : '❌'}\n● *Chat with bot :* ${isOnline}\n● *User Premium :* ${premi ? '✔' : '❌'}\n● *Registered User :* ${regist}`
                    client.sendFileFromUrl(from, pfp, 'dp.jpg', caption)
                    limitAdd(serial)
                    }
                    }
                break
                case 'ava':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!isGroupMsg) return client.reply(from, 'Fitur ini hanya bisa diugnakan di dalam grup', id)
                    if (!quotedMsg) return client.reply(from, 'Quote/reply pesan seseorang yang akan di download fotonya!!', id)
                    try {
                        const dp = await client.getProfilePicFromServer(quotedMsgObj.sender.id)
                        if (dp == undefined) {
                            var pfp = client.reply(from, 'Dia ini pemalu, mungkin sedang depresi tidak berani memasang foto profil', id)
                            } else {
                            var pfp = client.sendFileFromUrl(from, dp, 'profile.png')
                            limitAdd(serial)
                            } 
                    } catch {
                        client.reply(from, 'Tidak ada foto profil/private', id)
                    }
                    break
                case 'getlink': //work 
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!isGroupAdmins) return client.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
                    if (!isGroupMsg) return client.reply(from, 'Perintah ini hanya bisa di gunakan dalam grup', id)
                    if (!isBotGroupAdmins) return client.reply(from, 'Wahai admin, jadikan saya sebagai admin grup dahulu :)', id)
                    if (isGroupMsg) {
                        const inviteLink = await client.getGroupInviteLink(groupId);
                        client.sendLinkWithAutoPreview(from, inviteLink, `\nLink group *${name}*`)
                        limitAdd(serial)
                    }
                    break
                case 'resetlink': //work 
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!isGroupAdmins) return client.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
                    if (!isGroupMsg) return client.reply(from, 'Perintah ini hanya bisa di gunakan dalam grup', id)
                    if (!isBotGroupAdmins) return client.reply(from, 'Wahai admin, jadikan saya sebagai admin grup dahulu :)', id)
                    if (isGroupMsg) {
                        await client.revokeGroupInviteLink(groupId);
                        client.sendTextWithMentions(from, `Link group telah direset oleh admin @${sender.id.replace('@c.us', '')}`)
                        limitAdd(serial)
                    }
                    break
                case 'kick':
                    if (!isGroupMsg) return client.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
                    if (!isGroupAdmins) return client.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
                    if (!isBotGroupAdmins) return client.reply(from, 'Wahai admin, jadikan saya sebagai admin grup dahulu :)', id)
                    if (mentionedJidList.length === 0) return client.reply(from, 'Tag member yang akan di kick', id)
                    if (mentionedJidList[0] === botNumber) return await client.reply(from, 'Bot tidak dapat mengeluarkan dirinya sendiri', id)
                    await client.sendTextWithMentions(from, `${mentionedJidList.map(x => `@${x.replace('@c.us', '')} Telah dikick dari grup, karena baperan`).join('\n')}`)
                    for (let i = 0; i < mentionedJidList.length; i++) {
                        if (groupAdmins.includes(mentionedJidList[i])) return await client.sendText(from, 'Gagal, kamu tidak bisa mengeluarkan admin grup.')
                        await client.removeParticipant(groupId, mentionedJidList[i])
                    }
                    break
                case 'add': //work
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!isGroupMsg) return client.reply(from, 'Fitur ini hanya bisa di gunakan dalam group', id)
                    if (args.length !== 1) return client.reply(from, 'Untuk menggunakan fitur ini, kirim perintah *#add* 628xxxxx', id)
                    if (!isGroupAdmins) return client.reply(from, 'Perintah ini hanya bisa di gunakan oleh admin group', id)
                    if (!isBotGroupAdmins) return client.reply(from, 'Wahai admin, jadikan saya sebagai admin grup dahulu :)', id)
                    try {
                        await client.addParticipant(groupId, `${args[0]}@c.us`)
                        limitAdd(serial)
                    } catch {
                        client.reply(from, `Gagal menambahkan ${args[0]}, coba save dulu ke kontak kamu`, id)
                    }
                    break
                case 'promote': //work
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!isGroupMsg) return await client.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
                    if (!isGroupAdmins) return await client.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
                    if (!isBotGroupAdmins) return await client.reply(from, 'Wahai admin, jadikan saya sebagai admin grup dahulu :)', id)
                    if (mentionedJidList.length === 0) return await client.reply(from, 'Maaf, format pesan salah silahkan periksa menu.', id)
                    if (mentionedJidList.length >= 2) return await client.reply(from, 'Maaf, perintah ini hanya dapat digunakan kepada 1 user.', id)
                    if (groupAdmins.includes(mentionedJidList[0])) return await client.reply(from, 'Maaf, user tersebut sudah menjadi admin.', id)
                    await client.promoteParticipant(groupId, mentionedJidList[0])
                    await client.sendTextWithMentions(from, `Sekarang @${mentionedJidList[0].replace('@c.us', '')} adalah admin.`)
                    limitAdd(serial)
                    break
                case 'demote': //work
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!isGroupMsg) return client.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
                    if (!isGroupAdmins) return client.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
                    if (!isBotGroupAdmins) return client.reply(from, 'Wahai admin, jadikan saya sebagai admin grup dahulu :)', id)
                    if (mentionedJidList.length === 0) return client.reply(from, 'Tag admin yang akan di demote.', id)
                    if (mentionedJidList.length >= 2) return await client.reply(from, 'Maaf, perintah ini hanya dapat digunakan kepada 1 user.', id)
                    if (!groupAdmins.includes(mentionedJidList[0])) return await client.reply(from, 'Maaf, user tersebut tidak menjadi admin.', id)
                    await client.demoteParticipant(groupId, mentionedJidList[0])
                    await client.sendTextWithMentions(from, `Wahai @${mentionedJidList[0].replace('@c.us', '')}, sekarang kamu bukan admin lagi :(.`)
                    limitAdd(serial)
                    break
                case 'getbot':
                    client.sendText(from, `Nomor Bot WA : wa.me/${botNumber.replace('@c.us', '')}`)
                    limitAdd(serial)
                    break
                case 'all': //work
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    const caption = body.slice(5)
                    if (!isGroupAdmins) return client.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
                    if (!isGroupMsg) return client.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
                    if (args.length >= 1){
                    await client.sendTextWithMentions(from, `@${sender.id.replace(/[@c.us]/g, '')} : ❝ ${caption} ❞\n\n@${groupMembers.toString().replace(/[@c.us]/g, '').replace(/[,]/g, '\n@')}`)
                    limitAdd(serial)
                    } else {
                        await client.sendTextWithMentions(from, `@${groupMembers.toString().replace(/[@c.us]/g, '').replace(/[,]/g, '\n@')}`)
                        limitAdd(serial)
                    }
                    break
                case 'premium': {
                    client.sendText(from, menuId.textPrem())
                    break
                }
                case 'grouplock': //work
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!isGroupMsg) return client.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
                    if (!isGroupAdmins) return client.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
                    if (!isBotGroupAdmins) return client.reply(from, 'Wahai admin, jadikan saya sebagai admin grup dahulu :)', id)
                        await client.setGroupToAdminsOnly(groupId, true)
                        await client.sendTextWithMentions(from, `Group telah ditutup oleh admin @${sender.id.replace('@c.us','')}\nSekarang *hanya admin* yang dapat mengirim pesan`)
                    limitAdd(serial)
                    break
                case 'groupunlock': //work
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!isGroupMsg) return client.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
                    if (!isGroupAdmins) return client.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
                    if (!isBotGroupAdmins) return client.reply(from, 'Wahai admin, jadikan saya sebagai admin grup dahulu :)', id)
                        await client.setGroupToAdminsOnly(groupId, false)
                        await client.sendTextWithMentions(from, `Group telah dibuka oleh admin @${sender.id.replace('@c.us','')}\nSekarang *semua member* dapat mengirim pesan`)
                    limitAdd(serial)
                    break
                case 'join': //work
                    //if (!isPremium) return client.reply(from, 'Join via link saat ini dimatikan, Save nomor bot, baru tambahkan ke grupmu', id)
                    if (!isOwner) return client.reply(from, 'Maaf, untuk menambahkan bot ke group, silahkan donasi seikhlasnya, balas #donasi untuk melihat info donasi', id)
                    if (args.length >= 1) {
                        const link = body.slice(6)
                        const invite = link.replace('https://chat.whatsapp.com/', '')
                        if (link.match(/(https:\/\/chat.whatsapp.com)/gi)) {
                            const check = await client.inviteInfo(invite);
                            if (!check) {
                                client.reply(from, 'Sepertinya link grup bermasalah', message.id)
                            } else {
                                await client.joinGroupViaLink(invite)
                                client.reply(from, 'Otw join gan', message.id)
                            }
                        } else {
                            client.reply(from, 'Link chat grup salah atau sudah expired', message.id)
                        }
                    } else {
                        client.reply(from, 'Kirim perintah *#join* link group\n\nEx:\n#join https://chat.whatsapp.com/blablablablablabla', message.id)
                    }
                    break
                case 'setdp': //work
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!isGroupMsg) return client.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
                    if (!isGroupAdmins) return client.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
                    if (!isBotGroupAdmins) return client.reply(from, 'Wahai admin, jadikan saya sebagai admin grup dahulu :)', id)
                    if (isMedia) {
                            const mediaData = await decryptMedia(message)
                            const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                            await client.setGroupIcon(from, imageBase64)
                        } else if (quotedMsg && quotedMsg.type == 'image') {
                            const mediaData = await decryptMedia(quotedMsg)
                            const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
                            await client.setGroupIcon(from, imageBase64)
                        } else {
                            client.reply(from, 'Gambar nya mana kak?', message.id)
                        }
                    break
                case 'stat': {
                    if(isLimit(serial)) return
                    const loadedMsg = await client.getAmountOfLoadedMessages()
                    const chatIds = await client.getAllChatIds()
                    const groups = await client.getAllGroups()
                    const botadmins = await client.iAmAdmin()
                    const blocked = await client.getBlockedIds()
                    client.sendText(from, `Message Status :\n- *${loadedMsg}* Loaded Messages\n- *${chatIds.length - groups.length}* Total Chats\n  ├ *${groups.length}* Group Chats\n  └ *${chatIds.length}* Personal Chats\n- *${groups.length}* Groups Joined\n- *${botadmins.length}* Groups is BOT Admin\n\nBot User Status :\n- *${pengirim.length}* Registered User\n  ├ *${ban.length}* Banned User\n  ├ *${blocked.length}* Blocked User\n  └ *${prem.length}* Premium User`)
                    limitAdd(serial)
                    break
                }
                case 'del':
                    if(isLimit(serial)) return
                    if(isReg(obj)) return
                    if(cekumur(cekage)) return
                    if (!quotedMsg) return client.reply(from, 'Balas/reply pesan saya dik!', id)
                    if (!quotedMsgObj.fromMe) return client.reply(from, 'Hanya dapat menghapus chat dari bot dik!', id)
                    client.deleteMessage(quotedMsgObj.chatId, quotedMsgObj.id, false)
                    limitAdd(serial)
                    break
                case 'leave':
                    if (!isGroupMsg) return client.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
                    if (!isGroupAdmins) return client.reply(from, 'Maaf, perintah ini hanya dapat dilakukan oleh admin grup!', id)
                    await client.sendText(from, `Good bye... saya mau pamit\nkalau butuh saya lagi ini nomor saya wa.me/${botNumber.replace('@c.us', '')}`).then(() => client.leaveGroup(groupId))
                    limitAdd(serial)
                    break
                default:
                    console.log(color('[ERROR]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Unregistered Command from', color(pushname))
                    break
            }
        }
    } catch (err) {
        console.log(color('[ERROR]', 'red'), err)
    }
}
