import {addToMain, clearMain, postError} from "./main_tools.js";
import {getUserInfo, getAuthToken} from "./login.js";
import {setupFeed} from "./feed.js";
import { setError } from "./errors.js";
import { sendRequestToBackend } from "./general_tools.js";

function previewFile() {
    let previewImg = document.getElementById("new-post-preview");
    let imgSelector = document.getElementById("new-post-img");
    let path = imgSelector.files[0];

    console.log("previewing " + path);
    let fileReader = new FileReader();

    fileReader.addEventListener("load", () => {
        previewImg.setAttribute("src", fileReader.result);
    }, false);

    if (path) {
        fileReader.readAsDataURL(path);
    }
}

function submitPost(title, text, subseddit, img, success, failure) {
    if (getUserInfo() === null) {
        postError("Post submission failed: You must be signed in to submit a post");
        return;
    }
    let errors = [];

    if (!title) {
        errors.push("You must include a title");
    }
    if (!text) {
        errors.push("You must include post text");
    }
    if (!subseddit) {
        errors.push("You must specify a subseddit");
    }

    if (errors.length > 0) {
        failure(errors);
    } else {
        let body = {
            title: title,
            text: text,
            subseddit: subseddit
        };
        if (img) {
            console.log("adding image");
            body.image = img;
        } else {
            console.log("omitting image");
        }
        
        sendRequestToBackend("/post/", "post", {}, body, {}, getAuthToken())
        .then(response => {
            if (response.status === 400) {
                errors.push("API error: malformed request/image could not be processed");
            } else if(response.status === 403) {
                errors.push("API error: Invalid Auth Token");
            } else if (response.status !== 200) {
                errors.push("Unhandled API error: status " + response.status);
            }
            if (errors.length > 0) {
                failure(errors);
                return;
            } else {
                return response.json();
            }
        })
        .then(json => {
            console.log("created new post with id=" + json.post_id);
            success(json.post_id);
        });
    }
}

function createNewPostArea() {
    let postArea = document.createElement("div");
    postArea.id = "new-post-div";
    postArea.classList.add("login");

    let errorAnchor = document.createElement("div");
    errorAnchor.id = "new-post-error-anchor";
    

    let postForm = document.createElement("div");
    postForm.classList.add("login-form");

    let title = document.createElement("h3");
    title.appendChild(document.createTextNode("Create New Post"));

    let errorMessage = document.createElement("div");
    errorMessage.id = "post-error-anchor";

    let titleInput = document.createElement("input");
    titleInput.id = "new-post-title";
    titleInput.setAttribute("type", "text");
    titleInput.setAttribute("placeholder", "Post Title");

    let textInput = document.createElement("input");
    textInput.id = "new-post-text"
    textInput.setAttribute("type", "text");
    textInput.setAttribute("placeholder", "Enter some text");
    
    let subsedditInput = document.createElement("input");
    subsedditInput.id = "new-post-subseddit";
    subsedditInput.setAttribute("type", "text");
    subsedditInput.setAttribute("placeholder", "shower-thoughts");

    let imgSelector = document.createElement("input");
    imgSelector.id = "new-post-img";
    imgSelector.setAttribute("type", "file");
    imgSelector.setAttribute("accept", "image/*");
    imgSelector.addEventListener("input", () => {
        previewFile();
    });

    let preview = document.createElement("img");
    preview.id = "new-post-preview";
    preview.addEventListener("click", () => {
        preview.setAttribute("src", "");
        imgSelector.value = null;
    });

    let submit = document.createElement("button");
    submit.id = "new-post-submit";
    submit.classList.add("button");
    submit.classList.add("button-primary");
    submit.innerText = "Submit Post";

    submit.addEventListener("click", () => {
        let imageData = preview.getAttribute("src");
        console.log("imageData = " + imageData);
        submitPost(titleInput.value, textInput.value, subsedditInput.value, preview.getAttribute("src"),
        (newPostId) => {
            setupFeed();
        },
        (errors) => {
            for (let error of errors) {
                setError(errorAnchor, error, error);
            }
        });
    });


    postForm.appendChild(title);
    postForm.appendChild(errorAnchor);
    postForm.appendChild(errorMessage);
    postForm.appendChild(document.createTextNode("Title"));
    postForm.appendChild(document.createElement("br"));
    postForm.appendChild(titleInput);
    postForm.appendChild(document.createElement("br"));
    postForm.appendChild(document.createTextNode("Post text"));
    postForm.appendChild(document.createElement("br"));
    postForm.appendChild(textInput);
    postForm.appendChild(document.createElement("br"));
    postForm.appendChild(document.createTextNode("Subseddit"));
    postForm.appendChild(document.createElement("br"));
    postForm.appendChild(subsedditInput);
    postForm.appendChild(document.createElement("br"));
    postForm.appendChild(document.createTextNode("Choose image (optional)"));
    postForm.appendChild(document.createElement("br"));
    postForm.appendChild(imgSelector);
    postForm.appendChild(document.createElement("br"));
    postForm.appendChild(preview);
    postForm.appendChild(document.createElement("br"));
    postForm.appendChild(submit);
    postArea.appendChild(postForm);
    return postArea;
}

function togglePostArea() {
    if (getUserInfo() === null) {
        postError("You must be signed in to create a post");
        return;
    }
    let postArea = document.getElementById("new-post-div");
    if (! postArea) {
        clearMain();
        addToMain(createNewPostArea());
    } else {
        clearMain();
    }
}

function setupPostButton() {
    let postButton = document.querySelector("div.feed-header button.button.button-secondary");
    postButton.addEventListener("click", togglePostArea);
}

export {setupPostButton};