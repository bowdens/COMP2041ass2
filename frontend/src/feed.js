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

function createPost(postData) {
    let postLi = document.createElement("li");
    postLi.classList.add("post");
    postLi.setAttribute("data-id-post", '');

    let voteDiv = document.createElement("div");
    voteDiv.classList.add("vote");
    voteDiv.setAttribute("data-id-upvotes", '');
    voteDiv.innerText = postData.meta.upvotes.length;

    let contentDiv = document.createElement("div");
    contentDiv.classList.add("content");

    let postTitle = document.createElement("h4");
    postTitle.classList.add("post-title");
    postTitle.classList.add("alt-text");
    postTitle.setAttribute("data-id-title", '');
    postTitle.innerText = postData.title;
    
    let authorP = document.createElement("p");
    authorP.classList.add("post-author");
    authorP.setAttribute("data-id-author", '');
   
    let authorText = 
        "Posted by @" 
        + postData.meta.author
        + " at " 
        + unixToDateTime(postData.meta.published)
        + " to " 
        + "/s/" + postData.meta.subseddit;
    authorP.innerText = authorText;

    let imageDiv = document.createElement("div");
    imageDiv.classList.add("post-thumb-container");
    if (postData.thumbnail !== null) {
        let img = document.createElement("img");
        img.classList.add("post-thumb");
        img.setAttribute("src", "data:image/png;base64, " + postData.thumbnail);
        imageDiv.appendChild(img);
    }

    contentDiv.appendChild(postTitle);
    contentDiv.appendChild(authorP);
    postLi.appendChild(voteDiv);
    postLi.appendChild(imageDiv);
    postLi.appendChild(contentDiv);

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
