import {addTokens} from "./addTokens.js";
import {allBlooks} from "./blooks.js";


let addTokensButton = document.getElementById("addtokens");
let changeBlookButton = document.getElementById("changeblook");
let blookNameInput = document.getElementById("blookname");
let usernameInput = document.getElementById("username");
let blooksDivParent = document.getElementById("blooks");
let kickButton = document.getElementById("kick");

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

async function changeBlook(blook=null)
{
	let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	let parsedUrl = new URL(tab.url);
	console.log(parsedUrl);
	if(parsedUrl.hostname != "dashboard.blooket.com" || parsedUrl.pathname != "/play/lobby")
	{
		//TODO: change to a nicer message format
		alert("You must be in a lobby to use this function");
		return
	}
	chrome.tabs.sendMessage(tab.id, {
		text: "change_blook", 
		blook: blook, 
		username: usernameInput.value == "" ? undefined : usernameInput.value
	});
}

changeBlookButton.addEventListener("click", (e) => {changeBlook(blookNameInput.value)});

kickButton.addEventListener("click", (e) => {
	if(usernameInput.value == "" && !confirm("kick yourself?"))return;
	changeBlook(null);
});

function loadBlooks(){
	let blooksDiv = document.createElement("div");
	for(let blookname in allBlooks)
	{
		let blookIcon = document.createElement("img");
		blookIcon.id = "blookicon-" + blookname;
		blookIcon.setAttribute("src", allBlooks[blookname]);
		blookIcon.setAttribute("class", "blookIcon");
		blookIcon.setAttribute("loading", "lazy");
		blookIcon.addEventListener("click", (e) => {
			blookIcon.style['background-color'] = "purple";
			try
			{
				document.getElementById("blookicon-" + blookNameInput.value).style['background-color'] = "white";
			}
			catch{}
			blookNameInput.value = blookname;
		});

		blooksDiv.appendChild(blookIcon);
	}
	blooksDivParent.appendChild(blooksDiv);
}
requestIdleCallback(loadBlooks);


