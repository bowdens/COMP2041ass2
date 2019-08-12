/**
 * Written by A. Hinds with Z. Afzal 2018 for UNSW CSE.
 * 
 * Updated 2019.
 */

// import your own scripts here.
import {setupLogin} from './login.js';
import {setupFeed} from './feed.js';
import {setApiUrl} from './general_tools.js';

// your app must take an apiUrl as an argument --
// this will allow us to verify your apps behaviour with 
// different datasets.
function initApp(apiUrl) {
  console.log(apiUrl);
  setApiUrl(apiUrl);
  setupLogin();
  setupFeed();
}

export default initApp;
