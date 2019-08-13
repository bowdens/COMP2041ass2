import {clearFeed, postError} from './main_tools.js';
import {unixToDateTime, sendRequestToBackend, resolveUserId} from './general_tools.js';
import {getAuthToken, getUserInfo} from './login.js';
import { createInlineUserLink } from './user.js';
import { setError } from './errors.js';

let feed = document.getElementById("feed");
let nextPost = 0;
let currentPost = 0;
let homeFeed = true;

function leaveHomeFeed() {
    homeFeed = false;
}

function joinHomeFeed() {
    homeFeed = true;
}

function setupFeed() {
    clearFeed();
    nextPost = 0;
    currentPost = 0;
    extendFeed();
    setupInfiniteScroll();
}

function extendFeed() {
    let authToken = getAuthToken();
    if (authToken === null) {
        clearFeed();
        nextPost = 0;
        currentPost = 0;
        let elem = document.querySelector("h3.feed-title");
        if (elem) {
            elem.innerText = "Popular Posts";
        } else {
            postError("Could not find feed title to update!");
        }
        loadFeed("/post/public", {});
    } else {
        currentPost = nextPost;
        loadFeed("/user/feed", {
            Authorization: "Token " + authToken,
            p: nextPost,
            n: 10
        });
    }
}

function loadFeed(endpoint, headers) {
    console.log("loading feed at " + endpoint);
    console.log(headers);
    sendRequestToBackend(endpoint, "get", headers, null, null)
    .then(response => {
        if (response.status !== 200) {
            postError("Could not load feed. Status code " + response.status);
            console.log(response);
        }
        return response.json()
    })
    .then(feed => {
        console.log(feed);
        if (! feed) {
            return;
        }
        nextPost += feed.posts.length;
        for (let post of feed.posts.sort((a,b) => b.meta.published - a.meta.published)) {
            appendPost(post);
        }

        if (getUserInfo() !== null) {
            updateAllPostUpvotes(getUserInfo().id);
        }
    });
}

function updateVoteDiv(voteDiv, upvoteCount, userHasUpvoted) {
    let voteCount = voteDiv.getElementsByClassName("upvote-count")[0];
    let voteIcon = voteDiv.getElementsByClassName("upvote-icon")[0];

    voteCount.innerText = getUpvoteText(upvoteCount);
    if (userHasUpvoted) {
        voteIcon.classList.add("active");
    } else {
        voteIcon.classList.remove("active");
    }
}

function updateAllPostUpvotes(userId) {
    let posts = document.getElementsByClassName("post");
    for (let post of posts) {
        let postId = post.getAttribute("data-id-post");
        console.log("updating icon for post #" +postId);
        let voteDiv = post.getElementsByClassName("vote-container")[0];
        userHasUpvotedPost(postId, userId, (upvotes) => {
            updateVoteDiv(voteDiv, upvotes, true);
        }, (upvotes) => {
            updateVoteDiv(voteDiv, upvotes, false);
        });
    }
}

function userHasUpvotedPost(postId, userId, hasUpvoted, hasNotUpvoted) {
    sendRequestToBackend("/post/", "get", {}, null, {id:postId}, getAuthToken())
    .then(response => response.json())
    .then(json => {
        if (json.meta.upvotes.indexOf(userId) > -1) {
            hasUpvoted(json.meta.upvotes.length);
        } else {
            hasNotUpvoted(json.meta.upvotes.length);
        }
    });
}

function upvotePost(postId, voteDiv) {
    if (getUserInfo() === null) {
        postError("You cannot upvote a post if you're not logged in");
        return;
    }
    console.log("voting on div:");
    console.log(voteDiv);
    userHasUpvotedPost(postId, getUserInfo().id, (numUpvotes) => {
        console.log("yay upvoted! num upvotes = " + numUpvotes);
        sendRequestToBackend("/post/vote", "delete", {}, null, {id: postId}, getAuthToken())
        .then(response => {
            if (response.status === 200) {
                updateVoteDiv(voteDiv, Number(numUpvotes) - 1, false);
            } else {
                postError("Could not upvote post: response status " + response.status);
            }
        });
    }, (numUpvotes) => {
        console.log("boo not upvoted! num upvotes = " + numUpvotes);
        sendRequestToBackend("/post/vote", "put", {}, null, {id: postId}, getAuthToken())
        .then(response => {
            if (response.status === 200) {
                updateVoteDiv(voteDiv, Number(numUpvotes) + 1, true);
            } else {
                postError("Could not upvote post: response status " + response.status);
            }
        });
    });
}

function getUpvoteText(numUpvotes) {
    let upvotes = Number(numUpvotes);
    if (upvotes < 1000) {
        return upvotes.toString();
    } else {
        let thousands = Math.floor(upvotes/1000);
        let hundreds = Math.floor((upvotes-thousands)/100);
        return thousands + "." + hundreds + "k";
    }
}

function toggleExtra(extraDiv) {
    if (extraDiv.classList.contains("active")) {
        extraDiv.classList.remove("active");
    } else {
        extraDiv.classList.add("active");
    }
}

function createPost(postData) {
    let postLi = document.createElement("li");
    postLi.classList.add("post");
    postLi.setAttribute("data-id-post", postData.id);

    let postContainer = document.createElement("div");
    postContainer.classList.add("post-container");

    let voteDiv = document.createElement("div");
    voteDiv.classList.add("vote");
    voteDiv.classList.add("post-grid-vote")
    let voteContainer = document.createElement("div");
    voteContainer.classList.add("vote-container");
    let upvoteIcon = document.createElement("i");
    upvoteIcon.classList.add("material-icons");
    upvoteIcon.classList.add("upvote-icon");
    upvoteIcon.innerText = "arrow_upward";
    voteContainer.appendChild(upvoteIcon);
    voteContainer.appendChild(document.createElement("br"));
    let upvoteCount = document.createElement("div");
    upvoteCount.classList.add("upvote-count");
    upvoteCount.setAttribute("data-id-upvotes", postData.meta.upvotes.length);
    upvoteCount.innerText = getUpvoteText(postData.meta.upvotes.length);
    voteContainer.appendChild(upvoteCount);
    upvoteIcon.addEventListener("click", () => upvotePost(postData.id, voteDiv));
    voteDiv.appendChild(voteContainer);

    let titleDiv = document.createElement("div");
    titleDiv.classList.add("post-grid-title");
    let postTitle = document.createElement("h4");
    postTitle.classList.add("post-title");
    postTitle.classList.add("alt-text");
    postTitle.setAttribute("data-id-title", postData.title);
    postTitle.innerText = postData.title;
    titleDiv.appendChild(postTitle);

    let contentDiv = document.createElement("div");
    contentDiv.classList.add("post-grid-content");
    contentDiv.innerText = postData.text;
    
    let metaDiv = document.createElement("div");
    metaDiv.classList.add("post-grid-meta");
    let authorP = document.createElement("p");
    authorP.classList.add("post-author");
    authorP.appendChild(document.createTextNode("Posted by @"));
    let loadingNode = document.createElement("span");
    loadingNode.setAttribute("data-id-author", postData.meta.author);
    loadingNode.innerText = postData.meta.author;
    if (getAuthToken() !== null) {
        authorP.appendChild(loadingNode);
        createInlineUserLink(postData.meta.author, null, usernameDiv => {
            authorP.insertBefore(usernameDiv, loadingNode);
            loadingNode.remove();
        }, errors => {
            for (let error of errors) {
                postError(error);
            }
        });
    } else {
        authorP.appendChild(loadingNode);
    }
    
    let authorText = 
        " at " 
        + unixToDateTime(postData.meta.published)
        + " to " 
        + "/s/" + postData.meta.subseddit;
    authorP.appendChild(document.createTextNode(authorText));
    
    if (getUserInfo() !== null && getUserInfo().username === postData.meta.author) {
        // the logged in user made this post so we will add a button allowing it to be removed
        let removeIcon = document.createElement("i");
        removeIcon.classList.add("material-icons");
        removeIcon.classList.add("post-remove-icon");
        removeIcon.classList.add("clickable");
        removeIcon.classList.add("remove-post-icon");
        removeIcon.innerText = "close";
        removeIcon.addEventListener("click", () => {
            if (confirm("Are you sure you want to remove your post?\nThis cannot be undone.")) {
                sendRequestToBackend("/post/", "delete", {}, {}, {id:postData.id}, getAuthToken())
                .then(response => {
                    if (response.status !== 200) {
                        postError("Error deleting post: Reponse status " + response.status);
                    } else {
                        postLi.remove();
                    }
                })
            }
        });
        authorP.appendChild(removeIcon);
    }
    metaDiv.appendChild(authorP);

    let thumbDiv = document.createElement("div");
    thumbDiv.classList.add("post-grid-thumb");
    if (postData.thumbnail) {
        let img = document.createElement("img");
        img.classList.add("post-thumb");
        img.setAttribute("src", "data:image/png;base64," + postData.thumbnail);
        thumbDiv.appendChild(img);
    } else {
        let textIcon = document.createElement("i");
        textIcon.classList.add("material-icons")
        textIcon.innerText = "notes";
        thumbDiv.appendChild(textIcon);
    }

    let extraDiv = document.createElement("div");
    extraDiv.classList.add("post-grid-extra");
    if (postData.image !== null) {
        let img = document.createElement("img");
        img.classList.add("post-image");
        img.setAttribute("src", "data:image/jpg;base64," + postData.image);
        extraDiv.appendChild(img);

        thumbDiv.addEventListener("click", () => {
            toggleExtra(extraDiv);
        });
        extraDiv.addEventListener("click", () => {
            toggleExtra(extraDiv);
        });
    }

    postContainer.appendChild(voteDiv);
    postContainer.appendChild(thumbDiv);
    postContainer.appendChild(titleDiv);
    postContainer.appendChild(contentDiv);
    postContainer.appendChild(metaDiv);
    postContainer.appendChild(extraDiv);

    if (getAuthToken() !== null) {
        let commentsDiv = document.createElement("div");
        commentsDiv.classList.add("post-grid-comments");


        let iconDiv = document.createElement("div");
        iconDiv.classList.add("icon-container");
        iconDiv.classList.add("clickable");
        let expandIcon = document.createElement("i");
        expandIcon.classList.add("material-icons");
        expandIcon.classList.add("comment-expander");
        expandIcon.innerText = "expand_more";
        iconDiv.appendChild(expandIcon);
        iconDiv.appendChild(document.createTextNode("Comments"));
        commentsDiv.appendChild(iconDiv);

        let commentsContent = document.createElement("div");
        commentsContent.classList.add("comment-content");
        commentsContent.classList.add("hide");

        let commentsList = document.createElement("ul");
        commentsList.classList.add("comments-list");
        commentsList.setAttribute("resolved", "false");
        commentsContent.appendChild(commentsList);

        let leaveCommentDiv = document.createElement("div");
        leaveCommentDiv.classList.add("comment-add-container");
        leaveCommentDiv.appendChild(document.createTextNode("Leave a comment"));
        leaveCommentDiv.appendChild(document.createElement("br"));
        let commentBox = document.createElement("input");
        commentBox.classList.add("comment-box");
        commentBox.setAttribute("type", "text");
        commentBox.setAttribute("placeholder", "Comment");
        leaveCommentDiv.appendChild(commentBox);
        leaveCommentDiv.appendChild(document.createElement("br"));
        let submitComment = document.createElement("button");
        submitComment.classList.add("button");
        submitComment.classList.add("button-secondary");
        submitComment.classList.add("clickable");
        submitComment.innerText = "Add Comment";

        submitComment.addEventListener("click", () => {
            let commentText = commentBox.value
            if (! commentText) {
                setError(leaveCommentDiv, "You must enter a comment to post", "You must enter a comment to post");
                return;
            }
            sendRequestToBackend("/post/comment/", "put", {}, {
                comment: commentText
            }, {id: postData.id}, getAuthToken())
            .then(request => {
                if (request.status !== 200) {
                    postError("Error submitting comment: Status code " + request.status);
                } else {
                    let comment = document.createElement("li");
                    comment.appendChild(document.createTextNode("Comment by "));
                    let usernameLoading = document.createTextNode(getUserInfo().username);
                    comment.appendChild(usernameLoading);
                    createInlineUserLink(getUserInfo().username, getUserInfo().id, usernameDiv => {
                        comment.insertBefore(usernameDiv, usernameLoading);
                        usernameLoading.remove();
                    }, errors => {
                        for (let error of errors) {
                            postError(error);
                        }
                    });
                    comment.appendChild(document.createElement("br"));
                    comment.appendChild(document.createTextNode(commentText));
                    commentsList.appendChild(comment);
                }
            });
        });

        leaveCommentDiv.appendChild(submitComment);
        commentsContent.appendChild(leaveCommentDiv);

        let upvoteListContainer = document.createElement("div");
        upvoteListContainer.classList.add("upvote-list-container");
        upvoteListContainer.appendChild(document.createTextNode("Users who upvoted this post:"));
        upvoteListContainer.appendChild(document.createElement("br"));
        let upvoteList = document.createElement("ul");
        upvoteList.classList.add("upvote-list");
        upvoteList.setAttribute("resolved", "false");
        upvoteListContainer.appendChild(upvoteList);
        commentsContent.appendChild(upvoteListContainer);

        commentsDiv.appendChild(commentsContent);

        iconDiv.addEventListener("click", () =>  {
            if (commentsContent.classList.contains("hide")) {
                commentsContent.classList.remove("hide");
                if (upvoteList.getAttribute("resolved") === "false") {        
                    for (let upvoter of postData.meta.upvotes) {
                        let upvote = document.createElement("li");
                        upvote.innerText = "...loading...";
                        resolveUserId(upvoter, getAuthToken(), user => {
                            upvote.innerText = "";
                            createInlineUserLink(user.username, user.id, usernameDiv => {
                                upvote.appendChild(usernameDiv);
                            }, errors => {
                                for (let error of errors) {
                                    postError(error);
                                }
                            });
                        });
                        upvoteList.appendChild(upvote);
                    }
                    upvoteList.setAttribute("resolved", "true");
                }
                if (commentsList.getAttribute("resolved") === "false") {
                    for (let commentData of postData.comments) {
                        let comment = document.createElement("li");
                        comment.appendChild(document.createTextNode("Comment by "));
                        let usernameLoading = document.createTextNode(commentData.author);
                        comment.appendChild(usernameLoading);
                        createInlineUserLink(commentData.author, null, usernameDiv => {
                            comment.insertBefore(usernameDiv, usernameLoading);
                            usernameLoading.remove();
                        }, errors => {
                            for (let error of errors) {
                                postError(error);
                            }
                        });
                        comment.appendChild(document.createElement("br"));
                        comment.appendChild(document.createTextNode(commentData.comment));
                        commentsList.appendChild(comment);
                    }
                    commentsList.setAttribute("resolved", "true");
                }

                expandIcon.innerText = "expand_less";
            } else {
                commentsContent.classList.add("hide");
                expandIcon.innerText = "expand_more";
            }
        });
        

        postContainer.appendChild(commentsDiv);
    }


    postLi.appendChild(postContainer);

    return postLi;
}

function appendPost(postData) {
    if (! feed) {
        postError("Could not find feed on page!");
        return;        
    }
    let post = createPost(postData);
    feed.appendChild(post);
    return(post);
}

function setupInfiniteScroll() {
    // scrolled to the bottom code snipped from
    // https://stackoverflow.com/a/40370876
    window.onscroll = function(ev) {
        if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight) {
            if (getAuthToken() !== null && homeFeed === true) {
                console.log("extending feed");
                console.log("current post = " + currentPost);
                console.log("next post = " + nextPost);
                extendFeed();
            }
        }
    };
}

export {setupFeed, updateAllPostUpvotes, appendPost, userHasUpvotedPost, updateVoteDiv, leaveHomeFeed, joinHomeFeed};
