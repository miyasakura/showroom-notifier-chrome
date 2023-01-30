function l(key) {
    return chrome.i18n.getMessage(key);
}
function saveOptions() {
    const notifyAll = document.querySelector('#notifyAll').checked;
    const noTalk = document.querySelector('#noTalk').checked;
    const remain = document.querySelector('#remain').checked;
    const noSound = document.querySelector('#noSound').checked;
    chrome.storage.local.set({notifyAll, noTalk, remain, noSound})

    document.querySelector('#status').innerHTML = 'Options Saved.';
    setTimeout((function () {
        document.querySelector('#status').innerHTML = '';
    }), 1000);
}

async function restoreOptions() {
    const items = await chrome.storage.local.get(['notifyAll', 'noTalk', 'remain', 'noSound']);
    document.querySelector('#notifyAll').checked = items.notifyAll;
    document.querySelector('#noTalk').checked = items.noTalk;
    document.querySelector('#remain').checked = items.remain;
    document.querySelector('#noSound').checked = items.noSound;
}

function localize() {
    document.title = l("settingPageTitle");
    document.querySelector("#notifyAllLabel").innerHTML = l("settingNotifyAll");
    document.querySelector("#noTalkLabel").innerHTML = l("settingNoTalk");
    document.querySelector("#remainLabel").innerHTML = l("settingRemain");
    document.querySelector("#noSoundLabel").innerHTML = l("settingSound");
    document.querySelector("#save").innerHTML = l("settingSave");
}

window.onload = function () {
    restoreOptions();
    document.querySelector('#save').onclick = function () {
        saveOptions();
    };
    localize();
};
