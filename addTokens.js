/*

Blooket's network protocols:
*) The plaintext is JSON data of an object representing the required task
*) Blooket uses AES/GCM encryption with a static key defined in the .js files of the page
*) The ciphertext is in the following format:
	*)12 random bytes, used as a nonce
	*)The ciphertext                   \These two are generated together using the standard library function crypto.subtle.encrypt
	*)A 16 byte checksum               /
*) The encrypted bytes are encoded using base64 encoding before being sent to the server

*/

//adds currencies using endpoint /api/users/add-rewards
export async function addTokens() {

	//blooket overrides the default window.alert function, so this is needed to access it
	function customAlert(msg)
	{
		let appdiv = document.getElementById("app");
		let iframe = document.createElement("iframe");
		appdiv.appendChild(iframe);
		iframe.contentWindow.alert(msg);
		iframe.remove();
	}

	//fetches daily reward info from endpoint /api/users/bonuses
	//used for addedTokens and addedXp fields of payload (so that the program does not request more than the quotas per day)
	async function getRewardInfo() {
		const response = await fetch('https://api.blooket.com/api/users/bonuses', {
			method: "GET",
			headers: {
				"accept": "application/json, text/plain, */*",
				"accept-language": "en-US,en;q=0.9,ru;q=0.8",
			},
			credentials: "include"
		});
		return await response.json();
	};

	let rewardData = await getRewardInfo();
	
	if(rewardData.tokensAvailable == undefined || rewardData.xpAvailable == undefined)
	{
		customAlert("Error collecting user info");
		return;
	}
	
	//no point sending request if already at max tokens and xp
	if(!(rewardData.tokensAvailable || rewardData.xpAvailable))
	{
		customAlert("Already at max tokens and xp");
		return;	
	}
	
	let JSONBody = {
		addedTokens:rewardData.tokensAvailable,
		//addedTokens:10,
		addedXp:rewardData.xpAvailable
	};

	let payload = (new TextEncoder).encode(JSON.stringify(JSONBody));

	//this key string is taken from the blooket js source code
	//I believe this changes with each build of blooket, so make sure this is taken from the same build as the build id below
	//To find it, either search for '(new TextEncoder)' or set a breakpoint on the standard library function btoa (redefine it with a wrapper function that calls the debugger and then the real btoa function) and then scroll up a bit
	let keybytes = (new TextEncoder).encode("6l3jj1Ibxfec2ZX3qVhcrOs6Z9Xeypw5");
	let digest = await window.crypto.subtle.digest("SHA-256", keybytes);

	let key = await window.crypto.subtle.importKey("raw", digest, {
		name: "AES-GCM"
	}, false, ["encrypt"]);

	//generate random nonce
	let nonce = window.crypto.getRandomValues(new Uint8Array(12));
	nonceString = Array.from(nonce).map((function(e) {
		return String.fromCharCode(e)
	}
	)).join("");

	//encrypt payload
	let encrypted = await window.crypto.subtle.encrypt({
		name: "AES-GCM",
		iv: nonce
	}, key, payload);

	//convert encrypted payload to byte string
	encArray = Array.from(new Uint8Array(encrypted)),
	encString = encArray.map((function(e) {
		return String.fromCharCode(e)
	})).join("");
	
	//base64 encode encrypted payload
	let payloadBase64 = btoa(nonceString + encString);
	console.log(payloadBase64);


	//send request to blooket api
	const response = await fetch('https://api.blooket.com/api/users/add-rewards', {
		method: "PUT",
		headers: {
			"referer": "https://www.blooket.com/",
			"content-type": "application/json",
		//taken from blooket source code
		//I dont know if this will become invalid in future
		//To find a more recent one, look at the request headers of the network request send on opening a box
		//The current build id should be on the same line
			"X-Blooket-Build": "f385bfe9-ff6f-44db-b912-715a3b42c80b"
		},
		credentials: "include",
		body: payloadBase64
	});
	
	if(response.status != 200)
	{
		customAlert("Error adding tokens");
		return;
	}
	
	//reload page to sync changes with server
	location.reload();
	
};

//await addTokens();
