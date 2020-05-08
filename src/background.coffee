server = __SERVER__
interval_sec = __INTERVAL__
expire_sec = __EXPIRE__
type_live = '1'
type_fanroom = '2'
notified_lives = {}
notified_fanrooms = {}
follows = {}

l = (key) ->
  chrome.i18n.getMessage(key)

current_time = ->
  parseInt new Date / 1000

notify = (id, key, name) ->
  chrome.notifications.create "#{type_live}:#{key}:#{id}", {
    type: 'basic'
    iconUrl: '/assets/img/icon38.png'
    title: name + l('liveStart')
    message: name + l('liveStart')
    requireInteraction: if localStorage['remain'] == '1' then true else false
  }, ->
  if localStorage["sound"] == "1"
    audio_notification()
  return

audio_notification = () ->
  sound = new Audio('/assets/audio/croak.mp3')
  sound.play()

notify_fanroom = (room_id, name) ->
  chrome.notifications.create "#{type_fanroom}:#{room_id}:#{current_time()}", {
    type: 'basic'
    iconUrl: '/assets/img/icon38.png'
    title: name + l('fanroomEnter')
    message: name + l('fanroomEnter')
    requireInteraction: if localStorage['remain'] == '1' then true else false
  }, ->
  if localStorage["sound"] == "1"
    audio_notification()
  return

checkNewLive = ->
  httpRequest = new XMLHttpRequest
  httpRequest.abort()
  httpRequest.open 'GET', server + '/api/live/onlives' , true

  httpRequest.onreadystatechange = ->
    if httpRequest.readyState == 4
      if httpRequest.status == 200
        json = JSON.parse(httpRequest.responseText)
        expire = current_time() - interval_sec - expire_sec

        if json.onlives
          for genre, index in json.onlives
            for live, index in genre.lives
              if localStorage['nofav'] == '1' or follows[live.room_url_key] == true
                if !(notified_lives[live.live_id]?)
                  if live.started_at >= expire
                    notify live.live_id, live.room_url_key, live.main_name
                notified_lives[live.live_id] = current_time()
        for k, v of notified_lives
          delete notified_lives[k] if v < expire

        if json.fan_rooms and localStorage['nofanroom'] != '1'
          for fan_room, index in json.fan_rooms
            if localStorage['nofav'] == '1' or fan_room.is_fav == 1 
              if !(notified_fanrooms[fan_room.room_id]?)
                notify_fanroom fan_room.room_id, fan_room.talk_name
              notified_fanrooms[fan_room.room_id] = current_time()
        for k, v of notified_fanrooms
          delete notified_fanrooms[k] if v < expire
    return

  httpRequest.send null
  return

parseFollowers = ->
  httpRequest = new XMLHttpRequest
  httpRequest.responseType = 'document';

  httpRequest.abort()
  httpRequest.open 'GET', server + "/follow" , true

  httpRequest.onreadystatechange = ->
    if httpRequest.readyState == 4
      if httpRequest.status == 200
        page = httpRequest.responseXML
        elems = page.getElementsByClassName("room-url")
        follows = {}
        for i in [0..elems.length]
          e = elems[i]
          if !e
            continue
          console.log(e)
          follows[e.getAttribute("href").replace(/\//, "")] = true
          console.log(e.getAttribute("href").replace(/\//, ""))
    return

  httpRequest.send null
  return

window.onload = ->
  parseFollowers()
  setInterval (->
    checkNewLive()
    return
  ), 600 * 1000
  setInterval (->
    checkNewLive()
    return
  ), interval_sec * 1000
  chrome.notifications.onClicked.addListener (notificationId) ->
    keys = notificationId.split(':')
    url = server + '/'
    if keys[0] == type_live
      url += keys[1]
    else
      url += 'room/fan_club?room_id=' + keys[1]
    window.open url
    chrome.notifications.clear(notificationId)
    return
  chrome.browserAction.onClicked.addListener (tab) ->
    window.open server + '/'
    return
  return
