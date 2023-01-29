import {addTokens} from "./addTokens.js";

let addTokensButton = document.getElementById("addtokens");

addTokensButton.addEventListener("click", async () => {
	let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	let parsedUrl = new URL(tab.url);
	if (parsedUrl.hostname != "dashboard.blooket.com")
	{
		//TODO: change to a nicer message format
		alert("You must be signed in on your dashboard to use this function");
		return;
	}

	chrome.scripting.executeScript({
		target: { tabId: tab.id },
		function: addTokens
	});
});