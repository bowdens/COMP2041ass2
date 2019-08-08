
function createError(err, id) {
    let errdiv = document.createElement("div");
    errdiv.id = "errormsg-" + id;
    errdiv.classList.add("error-message");

    let messagediv = document.createElement("span");
    messagediv.classList.add("error-message-text");
    messagediv.innerText = err;
    errdiv.appendChild(messagediv);

    let closeIcon = document.createElement("i");
    closeIcon.innerText = "close";
    closeIcon.classList.add("material-icons");
    closeIcon.addEventListener("click", (ev) => {
        //console.log(ev);
        ev.target.parentNode.remove();
    });
    errdiv.appendChild(closeIcon);

    return errdiv;
}

function setError(elem, err, id) {
    let errid = "errormsg-" + id;
    for (let child of elem.children) {
        if (child.id === errid) {
            for (let grandchild of child.children) {
                if (grandchild.classList.contains("error-message-text")) {
                    grandchild.innerText = err;
                    console.log("updated existing error");
                    return child;
                }
            }
            child.remove();
            console.log("could not find a child of the error with error-message-text class");
            console.log("removing this error and making a new one");
            return addError(elem, err, id);
        }
    }
    console.log("creating new error");
    return addError(elem, err, id);
}

function removeError(elem, id) {
    let errid = "errormsg-" + id;
    for (let child of elem.children) {
        if (child.id === errid) {
            child.remove();
            return true;
        }
    }
    return false;
}

function addError(elem, err, id) {
    let errormessage = createError(err, id);
    console.log("made error message");
    console.log(errormessage);
    elem.appendChild(errormessage);
}

function clearErrors(elem) {
    for (let child of elem.children) {
        if (child.classList.contains("error-message")) {
            child.remove();
        }
    }
}

export {clearErrors, removeError, setError};