//Gets the game code when the user enters it so that is can be used for other functions

//gets by text rather than id so that this will hopefully not break in future builds
var inputBox = document.querySelectorAll('[placeholder="Game ID"]')[0];

var gameId = null;
var username = null;

console.log("e");

function captureCode(e)
{
	setTimeout(() => {
		gameId = inputBox.value;
		console.log(gameId);
	});
}
function captureName(e)
{
	setTimeout(() => {
		username = inputBox.value;
		console.log(gameId);
	});
}

inputBox.addEventListener("keydown", captureCode);

function detectCodeEnter()
{
	if(document.querySelectorAll('[placeholder="Nickname"]')[0])
	{
		inputBox = document.querySelectorAll('[placeholder="Nickname"]')[0];
		inputBox.addEventListener("keydown", captureName);
	}
	else
	{
		setTimeout(detectCodeEnter, 1000);
	}
}

detectCodeEnter();

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	console.log(msg);
	if(msg.text == "ping")
	{
		sendResponse('pong');
	}
	else if (msg.text == "get_game_id") {
		sendResponse({game_id: gameId});
	}
	else if (msg.text == "change_blook")
	{
		try{
			changeBlook(msg.blook, msg.username || username);
			sendResponse({success:true});
		}
		catch(e)
		{
			sendResponse({success:false, error:e});
		}
	}
	else
	{
		sendResponse("Unknown request");
	}
});

async function changeBlook(blook, username)
{
	let JSONBody = {
		path:"c/" + username,
		value:{b:blook}
	};

	console.log(JSONBody);

	let payload = (new TextEncoder).encode(JSON.stringify(JSONBody));

	let keybytes = (new TextEncoder).encode("sI6ZwhqjSmlWBP2dw6GAK9GbeY4RmPwL");
	let digest = await window.crypto.subtle.digest("SHA-256", keybytes);

	let key = await window.crypto.subtle.importKey("raw", digest, {
		name: "AES-GCM"
	}, false, ["encrypt"]);

	let nonce = window.crypto.getRandomValues(new Uint8Array(12));
	nonceString = Array.from(nonce).map((function(e) {
		return String.fromCharCode(e)
	}
	)).join("");

	let encrypted = await window.crypto.subtle.encrypt({
		name: "AES-GCM",
		iv: nonce
	}, key, payload);

	encArray = Array.from(new Uint8Array(encrypted)),
	encString = encArray.map((function(e) {
		return String.fromCharCode(e)
	})).join("");
	let payloadBase64 = btoa(nonceString + encString);
	console.log(payloadBase64);


	const response = await fetch('https://fb.blooket.com/c/firebase/games/' + gameId + '/v', {
		method: "PUT",
		headers: {
			"referer": "https://www.blooket.com/",
			"content-type": "text/plain",
			"X-Blooket-Build": "d3522079-0ea2-4a08-b810-4e50b0d12a16"
		},
		credentials: "include",
		body: payloadBase64
	});

}


