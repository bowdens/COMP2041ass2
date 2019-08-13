import { sendRequestToBackend } from "./general_tools.js";
import { getAuthToken, getUserInfo, updateUserInfo } from "./login.js";
import { postError, clearMain, addToMain, clearFeed } from "./main_tools.js";
import { appendPost, setupFeed, userHasUpvotedPost, updateVoteDiv, leaveHomeFeed, joinHomeFeed } from "./feed.js";
import { setError } from "./errors.js";

function makeInlineUserLink(username, userId) {
    let userDiv = document.createElement("div");
    userDiv.classList.add("inline-user-link");
    userDiv.classList.add("clickable");
    userDiv.setAttribute("userId", userId);
    userDiv.innerText = "@" + username;
    userDiv.addEventListener("click", () => {
        leaveHomeFeed();
        getAndCreateUserDiv(userId);
    });
    return userDiv;
}

function createInlineUserLink(username, userId, success, failure) {
    if (username !== null && userId !== null) {
        success(makeInlineUserLink(username, userId));
    } else if (username === null && userId === null) {
        failure(["Error: Username and userId were null when trying to create inline user link!"]);
    } else if (username === null) {
        sendRequestToBackend("/user/", "get", {}, null, {id:userId}, getAuthToken())
        .then(reponse => {
            if (response.status !== 200) {
                failure(["Error fetching user with id " + userId + ": Status code " + reponse.status]);
            } else {
                return response.json();
            }
        })
        .then(userData => {
            success(makeInlineUserLink(userData.username, userData.id));
        });
    } else if (userId === null) {
        sendRequestToBackend("/user/", "get", {}, null, {username:username}, getAuthToken())
        .then(response => {
            if (response.status !== 200) {
                failure(["Error fetching user with id " + userId + ": Status code " + response.status]);
            } else {
                return response.json();
            }
        })
        .then(userData => {
            success(makeInlineUserLink(userData.username, userData.id));
        });
    }

   
}

function getAndCreateUserDiv(userId) {
    sendRequestToBackend("/user/", "get", {}, null, {id:userId}, getAuthToken())
    .then(response => {
        if (response.status !== 200) {
            postError("There was a problem getting user data: Reponse status " + response.status);
        } else {
            return response.json();
        }
    })
    .then(userData => {
        let userDiv = createUserDiv(userData);
        clearMain();
        addToMain(userDiv);
        location.hash = "nav";

        clearFeed();
        document.querySelector("h3.feed-title").innerText = "Posts made by @" + userData.username;
        for (let postId of userData.posts) {
            sendRequestToBackend("/post/", "get", {}, null, {id: postId}, getAuthToken())
            .then(response => {
                if (response.status !== 200) {
                    postError("Error when getting post with id " + postId + ": Error status " + response.status);
                } else {
                    return response.json();
                }
            })
            .then(postData => {
                let newPost = appendPost(postData);
                userHasUpvotedPost(postData.id, userData.id, (upvotes) => {
                    updateVoteDiv(newPost, upvotes, true);
                }, (upvotes) => {
                    updateVoteDiv(newPost, upvotes, false);
                });
            });
        }
    });
}

function createEditIcon() {
    let editNameIcon = document.createElement("i");
    editNameIcon.classList.add("material-icons");
    editNameIcon.classList.add("clickable");
    editNameIcon.classList.add("edit-user-attribute");
    editNameIcon.innerText = "edit";
    return editNameIcon;
}

function pressEditIcon(toEditDiv, parentDiv, editIcon, attribute, oldAttributeValue) {
    let newInput = document.createElement("input");
    if (attribute === "email") {
        newInput.setAttribute("type", "email");
    } else if (attribute === "password") {
        newInput.setAttribute("type", "password");
    } else {
        newInput.setAttribute("type", "text");
    }
    newInput.setAttribute("value", oldAttributeValue);

    let submitButton = document.createElement("button");
    submitButton.classList.add("button");
    submitButton.classList.add("button-secondary");
    submitButton.classList.add("clickable");
    submitButton.innerText = "Update " + attribute;

    let newSpan = document.createElement("span");

    submitButton.addEventListener("click", () => {
        let newValue = newInput.value;
        if (!newValue) {
            setError(parentDiv, "You can't leave the " + attribute + " blank!");
            return;
        }
        let body = {};
        body[attribute] = newValue;
        sendRequestToBackend("/user/", "put", {}, body, {}, getAuthToken())
        .then(response => {
            if (response.status !== 200) {
                postError("There was an internal error updating your " + attribute + ": status code " + response.status);
                return;
            } else {
                if (attribute !== "password") {
                    toEditDiv.innerText = newInput.value;
                } else {
                    toEditDiv.innerText = "";
                }
                toEditDiv.classList.remove("hide");
                editIcon.removeAttribute("style");
                newSpan.remove();
            }
        })

        console.log("submitted");
    });

    newSpan.appendChild(newInput);
    newSpan.appendChild(submitButton);

    parentDiv.insertBefore(newSpan, toEditDiv);
    toEditDiv.classList.add("hide");
    editIcon.setAttribute("style", "display: none");
    console.log("editing " + attribute);
}

function createUserDiv(userData) {
    let userDiv = document.createElement("div");
    userDiv.id = "user-div";
    userDiv.classList.add("login");

    let userForm = document.createElement("div");
    userForm.classList.add("login-form");

    let titleContainer = document.createElement("div");
    titleContainer.classList.add("user-title-container");

    let followSpan = document.createElement("span");
    if (userData.username !== getUserInfo().username) {
        followSpan.classList.add("user-follow-span");
        followSpan.classList.add("clickable");
        let followIcon = document.createElement("i");
        followIcon.classList.add("material-icons");
        let followSpanText = document.createElement("span");
        if (getUserInfo().following.indexOf(userData.id) > -1) {
            followIcon.innerText = "person_add_disabled";
            followSpan.appendChild(followIcon);
            followSpanText.innerText = "Unfollow " + userData.name;
            followSpan.appendChild(followSpanText);
        } else {
            followIcon.innerText = "person_add";
            followSpan.appendChild(followIcon);
            followSpanText.innerText = "Follow " + userData.name;
            followSpan.appendChild(followSpanText);
        }

        followSpan.addEventListener("click", () => {
            let endpoint = "";
            let toFollow = true;
            if (getUserInfo().following.indexOf(userData.id) > -1) {
                // we are following, stop following
                endpoint = "/user/unfollow";
                toFollow = false;
            } else {
                // we are not following, start following
                endpoint = "/user/follow";
                toFollow = true;
            }
            sendRequestToBackend(endpoint, "put", {}, null, {username: userData.username}, getAuthToken())
            .then(response => {
                if (response.status !== 200) {
                    postError("Error performing follow action: status code " + response.status);
                } else {
                    if (toFollow) {
                        followIcon.innerText = "person_add_disabled";
                        followSpanText.innerText = "Unfollow " + userData.name;
                    } else {
                        followIcon.innerText = "person_add";
                        followSpanText.innerText = "Follow " + userData.name;
                    }
                    updateUserInfo();
                }
            })
        });

    }
    
    titleContainer.appendChild(followSpan);


    let title = document.createElement("h3");
    title.appendChild(document.createTextNode("Details of @" + userData.username));
    titleContainer.appendChild(title);

    let closeSpan = document.createElement("span");
    closeSpan.classList.add("clickable");
    closeSpan.classList.add("user-close-span");

    let closeIcon = document.createElement("i");
    closeIcon.classList.add("material-icons");
    closeIcon.classList.add("user-close-icon");
    closeIcon.innerText = "close";
    closeSpan.appendChild(closeIcon);
    closeSpan.addEventListener("click", () => {
        joinHomeFeed();
        clearMain();
        setupFeed();
        document.querySelector("h3.feed-title").innerText = getUserInfo().name + "'s feed";
    });
    titleContainer.appendChild(closeSpan);


    userForm.appendChild(titleContainer);

    let name = document.createElement("p");
    name.innerText = "Name: "
    let nameContent = document.createElement("span");
    nameContent.innerText = userData.name;
    name.appendChild(nameContent);
    if (getUserInfo().username == userData.username) {
        let editNameIcon = createEditIcon();
        editNameIcon.addEventListener("click", () => {
            pressEditIcon(nameContent, name, editNameIcon, "name", nameContent.innerText);
        });
        name.appendChild(editNameIcon);
    }
    
    let email = document.createElement("p");
    email.innerText = "Email Address: ";
    let emailContent = document.createElement("span");
    emailContent.innerText = userData.email;
    email.appendChild(emailContent);
    if (getUserInfo().username == userData.username) {
        let editEmailIcon = createEditIcon();
        editEmailIcon.addEventListener("click", () => {
            pressEditIcon(emailContent, email, editEmailIcon, "email", userData.email);
        });
        email.appendChild(editEmailIcon);
    }

    let password = null;
    if (getUserInfo().username == userData.username) {
        password = document.createElement("p");
        password.innerText = "Password: ";
        let passwordContent = document.createElement("span");
        password.appendChild(passwordContent);
        let editPasswordIcon = createEditIcon();
        editPasswordIcon.addEventListener("click", () => {
            pressEditIcon(passwordContent, password, editPasswordIcon, "password", "");
        });
        password.appendChild(editPasswordIcon);
    }

    let totalPosts = document.createElement("p");
    totalPosts.innerText = userData.username + " has made " + userData.posts.length + " posts in total";
    
    let totalUpvotes = document.createElement("p");
    totalUpvotes.appendChild(document.createTextNode(userData.username + " has recieved "));
    let upvoteCount = document.createElement("span");
    upvoteCount.innerText = "0";
    totalUpvotes.appendChild(upvoteCount);
    totalUpvotes.appendChild(document.createTextNode(" upvotes across all their posts."));
    countTotalUpvotes(userData.posts, partialCount => {
        console.log("adding " + partialCount);
        upvoteCount.innerText = Number(upvoteCount.innerText) + partialCount;
    }, error => {
        postError(error);
    })

    userForm.appendChild(name);
    userForm.appendChild(email);
    if (password) {
        userForm.appendChild(password);
    }
    userForm.appendChild(totalPosts);
    userForm.appendChild(totalUpvotes);

    userDiv.appendChild(userForm);
    return userDiv;
}

function countTotalUpvotes(postIds, success, failure) {
    for (let postId of postIds) {
        sendRequestToBackend("/post/", "get", {}, null, {id:postId}, getAuthToken())
        .then(response => {
            if (response.status !== 200) {
                failure("Error loading post with id #" + postId + ": status code " + response.status);
            } else {
                return response.json();
            }
        }).then(postData => {
            console.log("got " + postData.meta.upvotes.length + " upvotes for post " + postData.id);
            success(postData.meta.upvotes.length);
        });
    }
}

export {createInlineUserLink};