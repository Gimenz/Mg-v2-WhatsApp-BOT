const { create, Client } = require('@open-wa/wa-automate')
const { color, messageLog } = require('./util')
const msgHandler = require('./msg')
const cron = require('node-cron')
const fs = require('fs')
let settings = JSON.parse(fs.readFileSync('./lib/helper/settings.json'))

const start = (client = new Client()) => {
        console.log('[DEV]', color('masgimenz', 'yellow'))
        console.log('[CLIENT] CLIENT Started!')

            // Message log for analytic
        client.onAnyMessage((fn) => messageLog(fn.fromMe, fn.type))

        // Force it to keep the current session
        client.onStateChanged((state) => {
            console.log('[Client State]', state)
            if (state === 'CONFLICT' || state === 'DISCONNECTED') client.forceRefocus()
        })
        
        // listening on message
        client.onMessage((message) => {
            // Cut message Cache if cache more than 3K
            client.getAmountOfLoadedMessages().then((msg) => (msg >= 3000) && client.cutMsgCache())
            // Message Handler
            msgHandler(client, message)
        })
        // listen group invitation
        client.onAddedToGroup((chat) => {
            //let totalMem = chat.groupMetadata.participants.length
            /*if (totalMem < 25) {
                client.sendText(chat.id, `Maaf, untuk menambahkan bot ini, grup harus melebihi 25 member`).then(() => client.leaveGroup(chat.id))
                client.deleteChat(chat.id)
            } else {
               
            }*/
            client.sendText(chat.groupMetadata.id, `Halo warga grup *${chat.contact.name}* terimakasih sudah menginvite bot ini, sebelum menggunakan bot baca rules dulu ya\nkirim #rules untuk membaca rules penggunaan bot`)
        })
        // listen paricipant event on group (wellcome message)
        /*client.onGlobalParicipantsChanged((async (event) => {
            try {
                const idgrup = await client.getChatById(event.chat)
                const { name, formattedTitle } = idgrup
                const datagrup = (name || formattedTitle)
                if (event.action === 'add') {
                    client.sendText(event.chat, `Halo, Selamat datang di grup *${datagrup}* \n\Silahkan memperkenalkan diri dan baca deskripsi grup`)
                } else {
                    if (event.action === 'remove')
                    client.sendText(event.chat, 'yah keluar, pasti baperan')
                }
            } catch (err) {
                console.log(err)
            }
        }))*/
        // listening on Incoming Call
        client.onIncomingCall((call) => {
            client.sendText(call.peerJid, 'Maaf, bot tidak bisa menerima panggilan. Bot otomatis memblokir apabila menerima panggilan')
            .then(() => client.contactBlock(call.peerJid))
        })
            .catch ((err) => {
        console.error(err)
        })
}
const options = {
    sessionId: 'Imperial',
    headless: true,
    qrTimeout: 0,
    authTimeout: 0,
    restartOnCrash: start,
    cacheEnabled: false,
    useChrome: true,
    killProcessOnBrowserClose: true,
    throwErrorOnTosBlock: false,
    chromiumArgs: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--aggressive-cache-discard',
        '--disable-cache',
        '--disable-application-cache',
        '--disable-offline-load-stale-cache',
        '--disk-cache-size=0'
    ]
}

create(options)
    .then((client) => {
        start(client)
        // Auto on / off BOT & CMD Limiter => Thanks to ItzNgga - XyZ BOT
        cron.schedule("0 0 0 * * *", function(){
            settings.banChats = true
            fs.writeFileSync('./lib/helper/settings.json',JSON.stringify(settings,null,2))
            client.sendText('Bot Owner Number@c.us', 'Waktunya istirahat :)')
        }, {
            scheduled: true,
            timezone: "Asia/Jakarta"
          });
      
        cron.schedule("0 0 6 * * *", function(){
            settings.banChats = false
            fs.writeFileSync('./lib/helper/settings.json',JSON.stringify(settings,null,2))
            client.sendText('Bot Owner Number@c.us', 'Waktunya Bekerja :)')
        }, {
            scheduled: true,
            timezone: "Asia/Jakarta"
          });
        
        cron.schedule("0 59 23 * * *", function(){
          let obj = [];
          fs.writeFileSync('./lib/helper/limit.json', JSON.stringify(obj));
            console.log('[INFO] Limit restarted!');
        }, {
            scheduled: true,
            timezone: "Asia/Jakarta"
          });
        // Auto on / off BOT & CMD Limiter => Thanks to ItzNgga - XyZ BOT
    })
    .catch((err) => new Error(err))