// workaround at 9:30 the night of submission because i implemented the entire thing assuming i'd have the given index.html page and not the blank one

let root = document.getElementById("root");

function setupPage() {
    // yes i'm using innerHTML, sue me
    root.innerHTML = `
        <header class='banner' id="nav">
            <h1 id="logo" class="flex-center">Seddit</h1>
            <ul class='nav'>
                <li class="nav-item">
                    <input id="search" data-id-search placeholder="Search Seddit" type="search" />
                </li>
                <li class='nav-item'>
                    <button data-id-login class="button button-primary">Log In</button>
                </li>
                <li class='nav-item'>
                    <button data-id-signup class="button button-secondary">Sign Up</button>
                </li>
            </ul>
        </header>
        <main role='main'>
            <ul id="feed" data-id-feed>
                <div class="feed-header">
                    <h3 class="feed-title alt-text">Popular posts</h3>
                    <button class="button button-secondary">Post</button>
                </div>
            </ul>
        </main>
    `
}

export {setupPage};