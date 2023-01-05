export function l(key) {
    return chrome.i18n.getMessage(key)
}

export function current_time() {
    return parseInt(new Date() / 1000)
}

export async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

