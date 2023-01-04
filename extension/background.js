import {currentTime, l, notify} from "./util.js";
import {fetchFollowingRoomIds, fetchLives, fetchTalks} from "./api.js";

const TYPE_LIVE = '1';
const TYPE_TALK = '2';

function notifyLive(id, key, name) {
    console.debug('notifyLive', id, key, name);
    notify(
        `${TYPE_LIVE}:${key}:${id}`,
        name + l('liveStart'),
        name + l('liveStart')
    )
}

function notifyTalk(roomId, name) {
    console.debug('notifyTalk', roomId);
    notify(
        `${TYPE_TALK}:${roomId}:${currentTime()}`,
        name + l('talkEnter'),
        name + l('talkEnter')
    );
}

function init() {
    console.debug('init');
    chrome.storage.local.set({
        followings: {},
        notifiedLives: {},
        notifiedTalks: {},
        notifyAll: false,
        noTalk: false,
        remain: true,
    })
}

async function expireNotifiedLives() {
    console.debug('expireNotifiedLives');
    const items = await chrome.storage.local.get(['notifiedLives'])
    const notifiedLives = items.notifiedLives;
    const expire = currentTime() - 60 - 600;
    for (let k in notifiedLives) {
        if (notifiedLives[k] < expire) {
            delete notifiedLives[k];
        }
    }
}

async function checkNewLive() {
    console.debug('checkNewLive')
    const items = await chrome.storage.local.get(['notifiedLives', 'notifyAll', 'followings'])
    const expire = currentTime() - 60 - 600;
    const notifiedLives = items.notifiedLives;
    const lives = await fetchLives();
    lives.forEach((live) => {
        const roomId = live.room_id;
        if (!items.followings[roomId] && !items.notifyAll) {
            return;
        }
        if (notifiedLives[live.live_id]) {
            return;
        }
        if (live.started_at < expire) {
            return;
        }
        notifiedLives[live.live_id] = currentTime();
        notifyLive(live.live_id, live.room_url_key, live.main_name);
    })
    chrome.storage.local.set({notifiedLives})
}

async function checkNewTalk() {
    console.debug('checkNewTalk')
    const items = await chrome.storage.local.get(['notifiedTalks', 'notifyAll', 'followings', 'noTalk'])
    const notifiedTalks = items.notifiedTalks;
    const newNotifiedTalks = {}
    if (items.noTalk) {
        return;
    }
    const talks = await fetchTalks();
    talks.forEach((talk) => {
        const roomId = talk.room_id;
        if (!items.followings[roomId] && !items.notifyAll) {
            return;
        }
        newNotifiedTalks[roomId] = currentTime();
        if (notifiedTalks[roomId]) {
            return;
        }
        notifyTalk(roomId, talk.name);
    })
    console.log(notifiedTalks)
    chrome.storage.local.set({notifiedTalks: newNotifiedTalks})
}

async function updateFollowings() {
    console.debug('updateFollowings')
    const roomIds = await fetchFollowingRoomIds();
    const followings = roomIds.reduce((prev, curr) => ({...prev, [curr]: true}), {})
    await chrome.storage.local.set({followings});
}

chrome.alarms.create("check", {periodInMinutes: 1});
chrome.alarms.create("update", {periodInMinutes: 60});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'check') {
        expireNotifiedLives();
        checkNewLive();
        checkNewTalk();
    } else if (alarm.name === 'update') {
        updateFollowings();
    }
});

chrome.runtime.onInstalled.addListener(async function (details) {
    if (details.reason === "install") {
        updateFollowings();
        init()
    } else if (details.reason === "update") {
        updateFollowings();
        const items = await chrome.storage.local.get(['followings', 'notifyAll', 'noTalk', 'remain'])
        if (items.notifyAll === undefined) {
            init()
        }
    }
});

chrome.notifications.onClicked.addListener(function (notificationId) {
    console.debug("notification clicked:" + notificationId);
    const keys = notificationId.split(':');
    let url = 'https://www.showroom-live.com/';
    if (keys[0] === TYPE_LIVE) {
        url += keys[1];
    } else {
        url += 'room/fan_club?room_id=' + keys[1];
    }
    chrome.tabs.create({url, active: true})
    chrome.notifications.clear(notificationId);
});

chrome.action.onClicked.addListener(function (tab) {
    chrome.tabs.create({url: 'https://www.showroom-live.com/', active: true});
});
