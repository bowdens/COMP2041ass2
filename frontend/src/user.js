import { sendRequestToBackend } from "./general_tools.js";
import { getAuthToken, getUserInfo } from "./login.js";
import { postError, clearMain, addToMain, clearFeed } from "./main_tools.js";
import { appendPost, setupFeed, userHasUpvotedPost, updateVoteDiv, leaveHomeFeed, joinHomeFeed } from "./feed.js";

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

function createUserDiv(userData) {
    let userDiv = document.createElement("div");
    userDiv.id = "user-div";
    userDiv.classList.add("login");

    let userForm = document.createElement("div");
    userForm.classList.add("login-form");

    let title = document.createElement("h3");
    title.innerText = "Details of @" + userData.username;
    let closeIcon = document.createElement("i");
    closeIcon.classList.add("material-icons");
    closeIcon.classList.add("clickable");
    closeIcon.classList.add("user-close-icon");
    closeIcon.style.float = "right";
    closeIcon.innerText = "close";
    closeIcon.addEventListener("click", () => {
        joinHomeFeed();
        clearMain();
        setupFeed();
        document.querySelector("h3.feed-title").innerText = getUserInfo().name + "'s feed";
    });
    title.appendChild(closeIcon);


    userForm.appendChild(title);

    let name = document.createElement("p");
    name.innerText = "Name: " + userData.name;
    
    let email = document.createElement("p");
    email.innerText = "Email Address: " + userData.email;

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