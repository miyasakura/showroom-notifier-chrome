save_options = ->
  no_fav_flag = 0
  if document.getElementById('nofav').checked
    no_fav_flag = 1
  localStorage['nofav'] = no_fav_flag

  no_fan_room_flag = 0
  if document.getElementById('nofanroom').checked
    no_fan_room_flag = 1
  localStorage['nofanroom'] = no_fan_room_flag

  remain_flag = 0
  if document.getElementById('remain').checked
    remain_flag = 1
  localStorage['remain'] = remain_flag

  sound_flag = 0
  if document.getElementById('sound').checked
    sound_flag = 1
  localStorage['sound'] = sound_flag

  document.getElementById('status').innerHTML = 'Options Saved.'
  setTimeout (->
    document.getElementById('status').innerHTML = ''
    return
  ), 1000
  return

restore_options = ->
  no_fav_flag = localStorage['nofav']
  if no_fav_flag == '1'
    document.getElementById('nofav').checked = true

  no_fan_room_flag = localStorage['nofanroom']
  if no_fan_room_flag == '1'
    document.getElementById('nofanroom').checked = true

  remain_flag = localStorage['remain']
  if remain_flag == '1'
    document.getElementById('remain').checked = true

  sound_flag = localStorage['sound']
  if sound_flag == '1'
    document.getElementById('sound').checked = true

  return

l = (str) ->
 chrome.i18n.getMessage(str)

localize = ->
  document.title = l("settingPageTitle")
  document.getElementById("noFavLabel").innerHTML = l("settingNoFav")
  document.getElementById("noFanRoomLabel").innerHTML = l("settingNoFanRoom")
  document.getElementById("remainLabel").innerHTML = l("settingRemain")
  document.getElementById("soundLabel").innerHTML = l("settingSound")
  document.getElementById("save").innerHTML = l("settingSave")

window.onload = ->
  restore_options()

  document.getElementById('save').onclick = ->
    save_options()
    return

  localize()

  return
