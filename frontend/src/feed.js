import {clearFeed, postError} from './main_tools.js';
import {unixToDateTime} from './general_tools.js';

let feed = document.getElementById("feed");

function setupFeed() {
    clearFeed();
    loadFeedLevel0('/data/feed.json');
}

function loadFeedLevel0(uri) {
    fetch(uri)
        .then(response => response.json())
        .then(feed => {
            console.log(feed);
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

function toggleImage(imageDiv) {
    if (imageDiv.classList.contains("active")) {
        imageDiv.classList.remove("active");
    } else {
        imageDiv.classList.add("active");
    }
}

function createPost(postData) {
    let postLi = document.createElement("li");
    postLi.classList.add("post");
    postLi.setAttribute("data-id-post", postData.id);

    let voteDiv = document.createElement("div");
    voteDiv.classList.add("vote");
    voteDiv.setAttribute("data-id-upvotes", postData.meta.upvotes.length);
    let upvoteIcon = document.createElement("i");
    upvoteIcon.classList.add("material-icons");
    upvoteIcon.innerText = "arrow_upward";
    voteDiv.appendChild(upvoteIcon);
    voteDiv.appendChild(document.createElement("br"));
    let upvoteCount = document.createElement("div");
    upvoteCount.classList.add("upvote-count");
    upvoteCount.appendChild(document.createTextNode(postData.meta.upvotes.length));
    voteDiv.appendChild(upvoteCount);

    upvoteIcon.addEventListener("click", event => upvotePost(postData.id, upvoteIcon));


    let contentDiv = document.createElement("div");
    contentDiv.classList.add("content");

    let postTitle = document.createElement("h4");
    postTitle.classList.add("post-title");
    postTitle.classList.add("alt-text");
    postTitle.setAttribute("data-id-title", '');
    postTitle.innerText = postData.title;
    
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

    let thumbDiv = document.createElement("div");
    thumbDiv.classList.add("post-thumb-container");
    if (postData.thumbnail !== null) {
        let img = document.createElement("img");
        img.classList.add("post-thumb");
        img.setAttribute("src", "data:image/png;base64," + postData.thumbnail);
        thumbDiv.appendChild(img);
    }

    let imageDiv = document.createElement("div");
    imageDiv.classList.add("post-image-container");
    if (postData.image !== null) {
        let img = document.createElement("img");
        img.classList.add("post-image");
        img.setAttribute("src", "data:image/jpg;base64," + postData.image);
        imageDiv.appendChild(img);
    }

    thumbDiv.addEventListener("click", () => {
        toggleImage(imageDiv);
    });
    imageDiv.addEventListener("click", () => {
        toggleImage(imageDiv);
    });

    contentDiv.appendChild(postTitle);
    contentDiv.appendChild(authorP);
    postLi.appendChild(voteDiv);
    postLi.appendChild(thumbDiv);
    postLi.appendChild(contentDiv);
    postLi.appendChild(imageDiv);

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
