import {l, current_time, wait} from './util.js'

const TYPE_LIVE = '1';
const TYPE_TALK = '2';
const BASE_URL = 'https://www.showroom-live.com';

async function notify(id, key, name) {
    console.debug("notify")
    const items = await chrome.storage.local.get(['remain', "sound"])
    await chrome.notifications.create(`${TYPE_LIVE}:${key}:${id}`, {
        type: 'basic',
        iconUrl: '/assets/img/icon38.png',
        title: name + l('liveStart'),
        message: name + l('liveStart'),
        requireInteraction: items.remain
    })
}

async function notify_talk(room_id, name) {
    console.debug("notify talk")
    const items = await chrome.storage.local.get(['remain'])
    await chrome.notifications.create(`${TYPE_TALK}:${room_id}:${current_time()}`, {
        type: 'basic',
        iconUrl: '/assets/img/icon38.png',
        title: name + l('talkEnter'),
        message: name + l('talkEnter'),
        requireInteraction: items.remain,
        silent: items.sound,
    })
}

async function clearExpired() {
    const items = await chrome.storage.local.get(['notified_lives', 'notified_talks'])
    const notified_lives = items.notified_lives || {}
    const notified_talks = items.notified_talks || {}
    const expire = current_time() - 60 - 600

    Object.keys(notified_lives).forEach((key) => {
        if (notified_lives[key] < expire) {
            console.debug("delete live", key)
            delete notified_lives[key]
        }
    })

    const expireTalk = current_time() - 3600
    Object.keys(notified_talks).forEach((key) => {
        if (notified_talks[key] < expireTalk) {
            console.debug("delete talk", key)
            delete notified_talks[key]
        }
    })

    chrome.storage.local.set({notified_lives: notified_lives, notified_talks: notified_talks})
}

async function checkNewLive() {
    console.debug("checkNewLive")
    const items = await chrome.storage.local.get(['nofav', 'notified_lives', 'follows'])
    const notified_lives = items.notified_lives || {}
    const follows = items.follows || {}
    if (Object.keys(follows).length === 0) {
        await parseFollowers()
        if (!items.nofav) {
            console.debug("live no fav")
            return
        }
    }

    const response = await fetch(BASE_URL + '/api/live/onlives')
    const json = await response.json()
    console.debug("onlives", json)
    const expire = current_time() - 60 - 600

    if (json.onlives) {
        json.onlives.forEach((genre) => {
            genre.lives.forEach((live) => {
                if (items.nofav || follows[live.room_id]) {
                    if (!notified_lives[live.live_id]) {
                        if (live.started_at >= expire) {
                            notify(live.live_id, live.room_url_key, live.main_name)
                        }
                    }
                    notified_lives[live.live_id] = current_time()
                }
            })
        })
    }
    chrome.storage.local.set({notified_lives: notified_lives})
}

async function checkNewTalk() {
    console.debug("checkNewTalk")
    const items = await chrome.storage.local.get(['nofav', 'notified_talks', 'notalks', 'follows'])
    if (items.notalks) {
        console.debug("no talk notification")
        return;
    }
    const notified_talks = items.notified_talks || {}
    const follows = items.follows || {}
    if (Object.keys(follows).length === 0) {
        if (!items.nofav) {
            console.debug("talk no fav")
            return
        }
    }

    const response = await fetch(BASE_URL + '/api/talk/talks')
    const json = await response.json()
    console.debug("talks", json)

    if (json.talks) {
        json.talks.forEach((tab) => {
            tab.talk_list.filter((talk) => talk.is_online).forEach((talk) => {
                if (items.nofav || follows[talk.room_id]) {
                    if (!notified_talks[talk.room_id]) {
                        if (!notified_talks[talk.room_id]) {
                            notify_talk(talk.room_id, talk.name)
                        }
                    }
                    notified_talks[talk.room_id] = current_time()
                }
            })
        })
    }
    chrome.storage.local.set({notified_talks: notified_talks})
}


async function parseFollowers() {
    console.log("parseFollowers")
    let page = 1;
    const follows = {}
    while (true) {
        const response = await fetch(BASE_URL + '/api/follow/rooms?count=100&page=' + page)
        const json = await response.json()
        page = json.next_page
        if (!page) {
            break;
        }
        json.rooms.forEach((room) => {
            follows[room.room_id] = true
        })
        await wait(2000)
    }
    console.debug("follows", follows)
    chrome.storage.local.set({follows: follows})
}

function init() {
    console.log("init");
    chrome.storage.local.set({
        notified_lives: {},
        notified_talks: {},
        follows: {},
        nofav: false,
        notalk: false,
        sound: true,
        remain: true,
    })
}

// インストール時に変数を初期化してストレージに保存する
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        init();
    } else if (details.reason === 'update') {
        chrome.storage.local.get(['nofav'], (items) => {
            if (items.nofav === undefined) {
                init();
            }
        })
    }
})

chrome.alarms.create('check', {delayInMinutes: 1});
chrome.alarms.create('parseFollowers', {delayInMinutes: 60});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'check') {
        clearExpired()
        checkNewLive()
        checkNewTalk()
    } else if (alarm.name === 'parseFollowers') {
        parseFollowers()
    }
});

chrome.notifications.onClicked.addListener((notificationId) => {
    const keys = notificationId.split(':')
    let url = BASE_URL + '/'
    if (keys[0] === TYPE_LIVE) {
        url += keys[1]
    } else {
        url += 'room/fan_club?room_id=' + keys[1]
    }
    chrome.tabs.create({url})
    chrome.notifications.clear(notificationId)
});

chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({
        url: BASE_URL
    })
})