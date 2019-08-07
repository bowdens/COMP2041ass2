import {removeChildren} from "./general_tools.js";
function getMain() {
    return document.querySelector("[role=main]");
}

function addToMain(elem) {
    let main = getMain();
    main.insertBefore(elem, main.firstChild);
}

function clearMain() {
    let main = getMain();
    removeChildren(main, (elem) => elem.id == "feed");
}

function reloadPosts() {
    //todo
}

function postError(errormessage) {
    // todo
    console.log(errormessage);
}

export {addToMain, clearMain, reloadPosts, postError};