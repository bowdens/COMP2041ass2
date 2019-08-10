import {applyEventListenerToSelector, sendPostToBackend} from "./general_tools.js";
import {clearMain, addToMain, postError, setSignedInUser} from "./main_tools.js";
import {setError, removeError, clearErrors} from "./errors.js";
import {setupFeed} from "./feed.js";

let apiUrl = null;
let authToken = null;

function getAuthToken() {
    return authToken;
}

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
    username.addEventListener("keyup", (ev) => {
        if (ev.key === "Enter" && document.activeElement === username) {
            clickLogin();
        }
    });

    let password = document.createElement("input");
    password.id = "login-password";
    password.type = "password";
    password.name = "password";
    password.placeholder = "password";
    password.addEventListener("keyup", (ev) => {
        if (ev.key === "Enter" && document.activeElement === password) {
            clickLogin();
        }
    });

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
    username.addEventListener("keyup", (ev) => {
        if (ev.key === "Enter" && document.activeElement === username) {
            clickSignup();
        }
    });

    let password = document.createElement("input");
    password.id = "signup-password";
    password.type = "password";
    password.name = "password";
    password.placeholder = "password";
    password.addEventListener("keyup", (ev) => {
        if (ev.key === "Enter" && document.activeElement === password) {
            clickSignup();
        }
    });
    
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
            setError(errdiv, "Passwords do not match", "Passwords do not match");
        } else if (r.same === true) {
            removeError(errdiv, "Passwords do not match");
        } else {
            setError(errdiv, "Password matching failed unexpectedly. same = " + r.same + ", error = " + r.error, "password-error");
        }
    });
    repeatpassword.addEventListener("keyup", (ev) => {
        if (ev.key === "Enter" && document.activeElement === repeatpassword) {
            clickSignup();
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
    let errdiv = document.getElementById("login-error-anchor");
    if (! errdiv) {
        postError("could not find login error anchor to post error " + err);
        return;
    }
    clearErrors(errdiv);

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

    verifyLogin(username, password, (token) => {
        console.log("token: " + token);
        authToken = token;
        setupFeed(apiUrl);
        console.log(setSignedInUser(username));
        clearMain();
    }, (errors) => {
        for (let error of errors) {
            setError(errdiv, error, error);
            console.log("login error: " + error);
        }
    });
}

function verifyLogin(username, password, success, failure) {
    let errors = [];

    if (username.length === 0) {
        errors.push("Enter a username");
    }
    if (password.length === 0) {
        errors.push("Enter a password");
    }

    if (errors.length > 0) {
        failure(errors);
        return;
    }

    sendPostToBackend(apiUrl+"/auth/login", {
        username: username,
        password: password
    })
    .then(response => {
        if (response.status === 403) {
            // wrong password

            errors.push("Incorrect password!");
        } else if (response.status === 400) {
            errors.push("Internal error: Missing username/password");
        } else {
            return response.json();
        }
    })
    .then(json => {
        console.log(json);

        if (errors.length > 0) {
            failure(errors);
        } else {
            success(json.token);
        };
    });
}

function toggleLoginPrompt() {
    if (document.getElementById("login") === null) {
        clearMain();
        let loginForm = createLoginDiv();
        addToMain(loginForm);
    } else {
        clearMain();
    }
}


function clickSignup() {
    let errdiv = document.getElementById("login-error-anchor");
    clearErrors(errdiv);
    if (! errdiv) {
        postError("could not find login error anchor to post error " + errors);
        return;
    }

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

    verifySignup(username, password, repeatpassword, () => {}, (errors) => {
        for (let error of errors) {
            setError(errdiv, error, error);
            console.log(error);
        }
    });
}


function verifySignup(username, password, repeatpassword, success, failure) {
    let errors = [];
    if (username.length === 0) {
        errors.push("Enter a username");
    } else if (username.length < 3) {
        errors.push("Username must be 3 characters or longer");
    }
    if (/[^A-Za-z0-9\-_.]/.test(username)) {
        errors.push("Username must only contain alphanumeric characters and - _ .");
    }
    if (password !== repeatpassword) {
        errors.push("Passwords do not match");
    }
    if (password.length === 0) {
        errors.push("Enter a password");
    } else if (password.length < 8) {
        errors.push("Password must be 8 characters or longer");
    }

    if (password.length !== 0 && !(/[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password))) {
        errors.push("Password must have at least one uppercase letter, at least one digit, and at least one special character");
    }

    errors.push("backend not implemented yet");
    
    if (errors.length > 0) {
        failure(errors);
        return false;
    } else {
        success()
        // todo
        console.log("did a thing");
    }
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

function setupLogin(url) {
    apiUrl = url;
    applyEventListenerToSelector("[data-id-login]", "click", toggleLoginPrompt);
    applyEventListenerToSelector("[data-id-signup]", "click", toggleSignupPrompt);
}

export {setupLogin, getAuthToken};