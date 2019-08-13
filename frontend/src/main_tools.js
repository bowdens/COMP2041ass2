import {removeChildren} from "./general_tools.js";
import { setupFeed } from "./feed.js";
import { logoutUser } from "./login.js";
import { setError } from "./errors.js";
import { createInlineUserLink } from "./user.js";

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
    let main = getMain();
    if (!main) {
        console.log("could not find main to post error");
    }
    setError(main, errormessage, errormessage);
    console.error(errormessage);
}

function setSignedInUser(username, userId) {
    let nav = document.getElementById("nav");
    if (!nav) {
        postError("couldn't find nav");
        return false;
    }
    let navlist = nav.childNodes[3];

    let logoutLi = document.getElementById("log-out-button");
    if (! logoutLi) {
        // create the logout button
        logoutLi = document.createElement("li");
        logoutLi.id = "log-out-button";
        logoutLi.classList.add("nav-item");
        let button = document.createElement("button");
        button.classList.add("button");
        button.classList.add("button-primary");
        button.innerText = "Log Out";
        button.addEventListener("click", () => {
            logoutUser();
            signOutUser();
        });
        logoutLi.appendChild(button);
        navlist.appendChild(logoutLi);
    } else {
        logoutLi.classList.remove("hide");
    }
    let loginButton = document.querySelector("[data-id-login]");
    if (loginButton) {
        // hide the login nav li
        loginButton.parentElement.classList.add("hide");
    }
    let signupButton = document.querySelector("[data-id-signup]");
    if (signupButton) {
        // hide the signup nav li
        signupButton.parentElement.classList.add("hide");
    }

    let userLi = document.getElementById("signed-in-user");
    if (! userLi) {
        // create the signed in user li
        userLi = document.createElement("li");
        userLi.id = "signed-in-user";
        userLi.classList.add("nav-item");

        let icon = document.createElement("i");
        icon.classList.add("material-icons");
        icon.innerText = "person";
        userLi.appendChild(icon);
        createInlineUserLink(username, userId, usernameDiv => {
            usernameDiv.classList.add("username");
            userLi.appendChild(usernameDiv);
        }, errors => {
            for (let error of errors) {
                postError(error);
            }
        });

        navlist.insertBefore(userLi, navlist.firstChild);
        return userLi;
    } else {
        if (userLi.classList.contains("hide")) {
            userLi.classList.remove("hide");
        }
        userLi.innerText = "";
        let icon = document.createElement("i");
        icon.classList.add("material-icons");
        icon.innerText = "person";
        userLi.appendChild(icon);
        createInlineUserLink(username, userId, usernameDiv => {
            usernameDiv.classList.add("username");
            userLi.appendChild(usernameDiv);
        }, errors => {
            for (let error of errors) {
                postError(error);
            }
        });
        usernameDiv.classList.add("username");
        userLi.appendChild(usernameDiv);
        return userLi;
    }
}

function signOutUser() {
    let userLi = document.getElementById("signed-in-user");
    if (userLi) {
        userLi.classList.add("hide");
    }

    let logoutLi = document.getElementById("log-out-button");
    if (logoutLi) {
        logoutLi.classList.add("hide");
    }

    // show login and signup
    let loginButton = document.querySelector("[data-id-login]");
    if (loginButton) {
        // hide the login nav li
        loginButton.parentElement.classList.remove("hide");
    }
    let signupButton = document.querySelector("[data-id-signup]");
    if (signupButton) {
        // hide the signup nav li
        signupButton.parentElement.classList.remove("hide");
    }
}

export {addToMain, clearMain, reloadPosts, postError, clearFeed, setSignedInUser, signOutUser};