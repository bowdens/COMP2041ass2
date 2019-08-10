import {clearFeed, postError} from './main_tools.js';
import {unixToDateTime} from './general_tools.js';
import {getAuthToken} from './login.js';

let feed = document.getElementById("feed");
let apiUrl = null;
let nextPost = 0;

function setupFeed(url) {
    apiUrl = url;
    clearFeed();
    nextPost = 0;
    extendFeed(url);   
}

function extendFeed() {
    let authToken = getAuthToken();
    if (authToken === null) {
        clearFeed();
        nextPost = 0;
        loadFeed(apiUrl + "/post/public", {});
    } else {
        loadFeed(apiUrl + "/user/feed", {
            Authorization: "Token " + authToken,
            p: nextPost,
            n: 10
        });
    }
}

function loadFeed(uri, headers) {
    fetch(uri, {
        method: "get",
        headers: headers,
    })
    .then(response => {
        if (response.status !== 200) {
            postError("Could not load feed. Status code " + response.status);
            return;
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
    });
}

function userHasUpvotedPost(postId, user) {
    return false;
}

function upvotePost(postId, upvoteElem) {
    if (upvoteElem.classList.contains("active")) {
        upvoteElem.classList.remove("active");
    } else {
        upvoteElem.classList.add("active");
    }
}

function getUpvoteText(postData) {
    let upvotes = Number(postData.meta.upvotes.length);
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
    voteDiv.setAttribute("data-id-upvotes", postData.meta.upvotes.length);
    let voteContainer = document.createElement("div");
    voteContainer.classList.add("vote-container");
    let upvoteIcon = document.createElement("i");
    upvoteIcon.classList.add("material-icons");
    upvoteIcon.innerText = "arrow_upward";
    voteContainer.appendChild(upvoteIcon);
    voteContainer.appendChild(document.createElement("br"));
    let upvoteCount = document.createElement("div");
    upvoteCount.classList.add("upvote-count");
    upvoteCount.appendChild(document.createTextNode(postData.meta.upvotes.length));
    voteContainer.appendChild(upvoteCount);
    upvoteIcon.addEventListener("click", event => upvotePost(postData.id, upvoteIcon));
    voteDiv.appendChild(voteContainer);

    let titleDiv = document.createElement("div");
    titleDiv.classList.add("post-grid-title");
    let postTitle = document.createElement("h4");
    postTitle.classList.add("post-title");
    postTitle.classList.add("alt-text");
    postTitle.setAttribute("data-id-title", '');
    postTitle.innerText = postData.title;
    titleDiv.appendChild(postTitle);

    let contentDiv = document.createElement("div");
    contentDiv.classList.add("post-grid-content");
    contentDiv.innerText = postData.text;
    
    let metaDiv = document.createElement("div");
    metaDiv.classList.add("post-grid-meta");
    let authorP = document.createElement("p");
    authorP.classList.add("post-author");
    authorP.setAttribute("data-id-author", postData.meta.author);
    let authorText = 
        "Posted by @" 
        + postData.meta.author
        + " at " 
        + unixToDateTime(postData.meta.published)
        + " to " 
        + "/s/" + postData.meta.subseddit;
    authorP.innerText = authorText;
    metaDiv.appendChild(authorP);

    let thumbDiv = document.createElement("div");
    thumbDiv.classList.add("post-grid-thumb");
    if (postData.thumbnail !== null) {
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
    }

    thumbDiv.addEventListener("click", () => {
        toggleExtra(extraDiv);
    });
    extraDiv.addEventListener("click", () => {
        toggleExtra(extraDiv);
    });

    postContainer.appendChild(voteDiv);
    postContainer.appendChild(thumbDiv);
    postContainer.appendChild(titleDiv);
    postContainer.appendChild(contentDiv);
    postContainer.appendChild(metaDiv);
    postContainer.appendChild(extraDiv);
    postLi.appendChild(postContainer);

    return postLi;
}

function appendPost(postData) {
    let feed = document.getElementById("feed");
    if (! feed) {
        postError("Could not find feed on page!");
        return;        
    }
    let post = createPost(postData);
    feed.appendChild(post);

}

export {setupFeed};
