import {applyEventListenerToSelector} from "./general_tools.js";
import {clearMain, addToMain, postError} from "./main_tools.js";

function createLoginDiv() {
    let div = document.createElement("div");
    div.id = "login";
    div.classList.add("login");
    let loginForm = document.createElement("div");
    loginForm.classList.add("login-form");

    let title = document.createElement("h3");
    title.appendChild(document.createTextNode("Login"));

    let errormessage = document.createElement("div");
    errormessage.id = "login-error-anchor";
    

    let username = document.createElement("input");
    username.id = "login-username";
    username.type = "text";
    username.name = "username";
    username.placeholder = "username";

    let password = document.createElement("input");
    password.id = "login-password";
    password.type = "password";
    password.name = "password";
    password.placeholder = "password";

    let submit = document.createElement("button");
    submit.innerText = "Login";
    submit.classList.add("button");
    submit.classList.add("button-secondary");
    submit.addEventListener("click", clickLogin);


    loginForm.appendChild(title);
    loginForm.appendChild(errormessage);
    loginForm.appendChild(document.createTextNode("Username"));
    loginForm.appendChild(document.createElement("br"));
    loginForm.appendChild(username);
    loginForm.appendChild(document.createElement("br"));
    loginForm.appendChild(document.createTextNode("Password"));
    loginForm.appendChild(document.createElement("br"));
    loginForm.appendChild(password);
    loginForm.appendChild(document.createElement("br"));
    loginForm.appendChild(submit);
    
    
    div.appendChild(loginForm);
    return div;
}

function createSignupDiv() {
    let div = document.createElement("div");
    div.id = "signup";
    div.classList.add("login");
    let signupForm = document.createElement("div");
    signupForm.classList.add("login-form");

    let title = document.createElement("h3");
    title.appendChild(document.createTextNode("Sign Up"));


    let errormessage = document.createElement("div");
    errormessage.id = "login-error-anchor";


    let username = document.createElement("input");
    username.id = "signup-username";
    username.type = "text";
    username.name = "username";
    username.placeholder = "username";

    let password = document.createElement("input");
    password.id = "signup-password";
    password.type = "password";
    password.name = "password";
    password.placeholder = "password";
    
    let repeatpassword = document.createElement("input");
    repeatpassword.id = "signup-repeat-password";
    repeatpassword.type = "password";
    repeatpassword.name = "repeatpassword";
    repeatpassword.placeholder = "repeat password";
    repeatpassword.addEventListener("keyup", (ev) => {
        let r = matching_passwords(password.value, repeatpassword.value);
        let errdiv = document.getElementById("login-error-anchor");
        if (! errdiv) {
            postError("could not find errdiv to post error about passwords matching");
        }
        if (r.same === false) {
            setError(errdiv, "Passwords do not match", "password-error");
        } else if (r.same === true) {
            removeError(errdiv, "password-error");
        } else {
            setError(errdiv, "Password matching failed unexpectedly. same = " + r.same + ", error = " + r.error, "password-error");
        }
    });
    
    let submit = document.createElement("button");
    submit.type = "submit";
    submit.innerText = "Sign Up";
    submit.classList.add("button");
    submit.classList.add("button-secondary");
    submit.addEventListener("click", clickSignup);


    signupForm.appendChild(title);
    signupForm.appendChild(errormessage);
    signupForm.appendChild(document.createTextNode("Username"));
    signupForm.appendChild(document.createElement("br"));
    signupForm.appendChild(username);
    signupForm.appendChild(document.createElement("br"));
    signupForm.appendChild(document.createTextNode("Password"));
    signupForm.appendChild(document.createElement("br"));
    signupForm.appendChild(password);
    signupForm.appendChild(document.createElement("br"));
    signupForm.appendChild(document.createTextNode("Repeat Password"));
    signupForm.appendChild(document.createElement("br"));
    signupForm.appendChild(repeatpassword);
    signupForm.appendChild(document.createElement("br"));
    signupForm.appendChild(submit);
    
    
    div.appendChild(signupForm);
    return div;
}

function clickLogin() {
    let usernameinput = document.getElementById("login-username");
    if (! usernameinput) {
        postError("could not find username on page");
    }
    let username = usernameinput.value;

    let passwordinput = document.getElementById("login-password");
    if (! passwordinput) {
        postError("could not find password on page");
    }
    let password = passwordinput.value;

    verifyLogin(username, password, () => {}, (err) => {
        let errdiv = document.getElementById("login-error-anchor");
        if (! errdiv) {
            postError("could not find login error anchor to post error " + err);
            return;
        }
        setError(errdiv, err, "login");
        console.log(err);
    });
}

function verifyLogin(username, password, success, failure) {
    failure("Error logging in: log in not yet implemented");
}

function toggleLoginPrompt(loginButton) {
    if (document.getElementById("login") === null) {
        clearMain();
        let loginForm = createLoginDiv();
        addToMain(loginForm);
    } else {
        clearMain();
    }
}


function clickSignup() {
    let usernameinput = document.getElementById("signup-username");
    if (! usernameinput) {
        postError("could not find username on page");
        return;
    }
    let username = usernameinput.value;

    let passwordinput = document.getElementById("signup-password");
    if (! passwordinput) {
        postError("could not find password on page");
        return;
    }
    let password = passwordinput.value;

    let repeatpasswordinput = document.getElementById("signup-repeat-password");
    if (! repeatpasswordinput) {
        postError("could not find repeat password on page");
        return;
    }
    let repeatpassword = repeatpasswordinput.value;

    verifySignup(username, password, repeatpassword, () => {}, (err) => {
        let errdiv = document.getElementById("login-error-anchor");
        if (! errdiv) {
            postError("could not find login error anchor to post error " + err);
            return;
        }
        setError(errdiv, err, "login-err");
        console.log(errdiv);
        console.log(err);
    });
}

function createError(err, id) {
    let errdiv = document.createElement("div");
    errdiv.id = "errormsg-" + id;
    errdiv.classList.add("error-message");

    let messagediv = document.createElement("div");
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

function verifySignup(username, password, repeatpassword, success, failure) {
    failure("Error signing up: not implemented");
}

function toggleSignupPrompt(signupButton) {
    if (document.getElementById("signup") === null) {
        clearMain();
        let signupForm = createSignupDiv();
        addToMain(signupForm);
    } else {
        clearMain();
    }
}

function matching_passwords(pass1, pass2) {
    if (pass1 === pass2) {
        return {same: true};
    } else {
        return {same: false, error: "Passwords do not match"};
    }
}

function setupLogin() {
    applyEventListenerToSelector("[data-id-login]", "click", (e) => toggleLoginPrompt(e.target));
    applyEventListenerToSelector("[data-id-signup]", "click", (e) => toggleSignupPrompt(e.target));
}

export {setupLogin};