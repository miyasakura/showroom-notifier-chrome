function save_options() {
  chrome.storage.local.set({
    nofav: document.querySelector('#nofav').checked,
    notalk: document.querySelector('#notalk').checked,
    remain: document.querySelector('#remain').checked,
    sound: document.querySelector('#sound').checked,
  });

  document.querySelector('#status').innerHTML = 'Options Saved.'
  setTimeout(() => {
    document.querySelector('#status').innerHTML = '';
  }, 1000)
}

async function restore_options() {
  const items = await chrome.storage.local.get(['nofav', 'notalk', 'remain', 'sound'])
    document.getElementById('nofav').checked = items.nofav
    document.getElementById('notalk').checked = items.notalk
    document.getElementById('remain').checked = items.remain
    document.getElementById('sound').checked = items.sound
}

function l(str) {
  return chrome.i18n.getMessage(str)
}

function localize() {
  document.title = l("settingPageTitle")
  document.querySelector("#noFavLabel").innerHTML = l("settingNoFav")
  document.querySelector("#noTalkLabel").innerHTML = l("settingNoTalk")
  document.querySelector("#remainLabel").innerHTML = l("settingRemain")
  document.querySelector("#soundLabel").innerHTML = l("settingSound")
  document.querySelector("#save").innerHTML = l("settingSave")
}

window.onload = () => {
  restore_options()

  document.querySelector('#save').addEventListener("click", () => {
    save_options()
  })

  localize()
}
