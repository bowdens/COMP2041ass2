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

function setSignedInUser(username) {
    let userli = document.getElementById("signed-in-user");
    if (! userli) {
        userli = document.createElement("li");
        userli.id = "signed-in-user";
        userli.classList.add("nav-item");

        let usernameDiv = document.createElement("div");
        usernameDiv.classList.add("username");
        let icon = document.createElement("i");
        icon.classList.add("material-icons");
        icon.innerText = "person";
        usernameDiv.appendChild(icon);
        usernameDiv.appendChild(document.createTextNode(username));
        userli.appendChild(usernameDiv);

        let nav = document.getElementById("nav");
        if (!nav) {
            postError("couldn't find nav");
            return;
        }
        console.log(nav);
        let navlist = nav.childNodes[3];
        navlist.insertBefore(userli, navlist.firstChild);
        return userli;
    } else {
        userli.innerText = username;
        return userli;
    }
}

export {addToMain, clearMain, reloadPosts, postError, clearFeed, setSignedInUser};