
function removeChildren(elem, breakCondition) {
    while(elem.firstChild) {
        if (breakCondition(elem.firstChild)) {
            break;
        }
        elem.removeChild(elem.firstChild);
    }
}

function applyEventListenerToSelector(selector, eventType, f) {
    for (let elem of document.querySelectorAll(selector)) {
        elem.addEventListener(eventType, f);
    }
}

export {removeChildren, applyEventListenerToSelector,};