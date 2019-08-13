import { postError } from "./main_tools.js";

let apiUrl = null;
let userDetails = {};

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

function validEmail(email) {
    return /^[A-Za-z0-9!#+-=_.]{1,64}@[A-Za-z0-9\-.]+\.[A-Za-z.]+$/.test(email);
}

function sendRequestToBackend(endpoint, method, _headers={}, body=null, query = null, authToken=null) {
    if (apiUrl === null) {
        postError("Error: API URL has not been set in general_tools.js");
    }
    let headers = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    if (authToken) {
        headers["Authorization"] = "Token " + authToken;
        console.log(headers["Authorization"]);
    }
    for (let key in _headers) {
        headers[key] = _headers[key];
    }

    let queryString = "";
    if (query !== null) {
        for (let key in query) {
            if (queryString === "") {
                queryString = "?";
            } else {
                queryString += "&";
            }
            queryString += key + "=" + query[key];
        }

    }

    /*
    console.log("making " + method + " request to " + apiUrl + endpoint + queryString + ", with headers:");
    console.log(headers);
    console.log("and body: ");
    console.log(body);
    */
    if (method.toLowerCase() === "get" || method.toLowerCase() === "HEAD") {
        if (body !== null) {
            postError("Body must be null for a head or a get request");
            return;
        }
        return fetch(apiUrl + endpoint + queryString,  {
            method: method,
            headers: headers
        });
    } else {
        return fetch(apiUrl + endpoint + queryString,  {
            method: method,
            headers: headers,
            body: JSON.stringify(body)
        });
    }
    
}

function setApiUrl(url) {
    apiUrl = url;
}

function resolveUserId(id, authToken, success) {
    if (userDetails[id] === undefined) {
        let promise = sendRequestToBackend("/user/", "get", {}, null, {id:id}, authToken);
        userDetails[id] = {
            fulfilled: false,
            promise: promise
        };
    }
    if (userDetails[id].fulfilled === false) {
        let jsonPromise = userDetails[id].promise.then(response => response.json());
        Promise.resolve(jsonPromise).then(json => {
            userDetails[id] = {
                fulfilled: true,
                data: json
            };
            success(json);
        });
    } else if (userDetails[id].fulfilled === true) {
        console.log("cached userID");
        success(userDetails[id].data);
    }
}

export {
    removeChildren, 
    applyEventListenerToSelector, 
    sleep, 
    unixToDateTime,
    sendRequestToBackend,
    validEmail,
    resolveUserId,
    setApiUrl
};