
function removeChildren(elem, removeCondition) {
    let toRemove = [];
    for (let child of elem.children) {
        if (removeCondition(child)) {
            toRemove.push(child);
        }
    }
    toRemove.map(e=>e.remove());
}

function applyEventListenerToSelector(selector, eventType, f) {
    for (let elem of document.querySelectorAll(selector)) {
        elem.addEventListener(eventType, f);
    }
}


function sleep(ms) {
    // from https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep#39914235
    return new Promise(resolve => setTimeout(resolve, ms));
}

function unixToDateTime(unix) {
    return new Date(unix * 1000).toLocaleString();
}

function sendPostToBackend(endpoint, body) {
    return fetch(endpoint, {
        method: "post",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    })
}

function validEmail(email) {
    return /^[A-Za-z0-9!#+-=_.]{1,64}@[A-Za-z0-9\-.]+\.[A-Za-z.]+$/.test(email);
}

export {
    removeChildren, 
    applyEventListenerToSelector, 
    sleep, 
    unixToDateTime,
    sendPostToBackend,
    validEmail
};