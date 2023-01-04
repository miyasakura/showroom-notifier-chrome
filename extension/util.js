export function l(key) {
    return chrome.i18n.getMessage(key);
}

export function currentTime() {
    return parseInt(new Date / 1000);
}

export function notify(key, title, message, requireInteraction) {
    chrome.notifications.create(key, {
        type: 'basic',
        iconUrl: '/assets/img/icon38.png',
        title: title,
        message: message,
        requireInteraction: requireInteraction,
    });
    playSound()
}

export async function wait(ms) {
    return await new Promise(resolve => setTimeout(resolve, 3000));
}

async function playSound(source = '/assets/audio/croak.mp3', volume = 1) {
    await createOffscreen();
    await chrome.runtime.sendMessage({ play: { source, volume } });
}

// Create offscreen document if one doesn't already exist
async function createOffscreen() {
    if (await chrome.offscreen.hasDocument()) return;
    await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'playing notification sound'
    });
}
