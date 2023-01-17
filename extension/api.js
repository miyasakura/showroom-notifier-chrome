import {wait} from "./util.js";

const BASE_URL = 'https://www.showroom-live.com/api'

export async function fetchLives() {
    const response = await fetch(BASE_URL + '/live/onlives')
    const json = await response.json();
    return json.onlives.flatMap((genre) => genre.lives)
}

export async function fetchTalks() {
    const response = await fetch(BASE_URL + '/talk/talks')
    const json = await response.json();
    return json.talks.flatMap((talk) => talk.talk_list.filter((t) => t.is_online))
}

export async function fetchFollowingRoomIds() {
    let page = 1;
    const followings = []
    while (true) {
        const response = await fetch(BASE_URL + `/follow/rooms?page=${page}&count=90`)
        const json = await response.json();
        if(!json.rooms) {
            break;
        }
        json.rooms.forEach((room) => followings.push(room.room_id))
        if (!json.next_page) {
            break;
        }
        page += 1;
        await wait(3000)
    }

    return followings;
}
