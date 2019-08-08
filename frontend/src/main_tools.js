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
    removeChildren(main, elem => elem.id !== "feed");
}

function clearFeed() {
    let feed = document.getElementById("feed");
    if (! feed) {
        postError("Could not locate feed!");
        return;
    }
    removeChildren(feed, elem => elem.classList.contains("post"));
}

function reloadPosts() {
    //todo
}

function postError(errormessage) {
    // todo
    console.error(errormessage);
    
}

export {addToMain, clearMain, reloadPosts, postError, clearFeed};