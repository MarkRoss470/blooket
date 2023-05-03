// Adds currencies using endpoint /api/users/add-rewards
export async function addTokens() {

	// Blooket overrides the default window.alert function, so this is needed to access it
	function customAlert(msg)
	{
		let appdiv = document.getElementById("app");
		let iframe = document.createElement("iframe");
		appdiv.appendChild(iframe);
		iframe.contentWindow.alert(msg);
		iframe.remove();
	}
	
	// Make blooket think we're starting a solo game of tower defense, so we can get an access token to be allowed to use get-rewards
	const session_token_response = await fetch("https://play.blooket.com/api/playersessions/solo", {
		"headers": {
			"accept": "application/json",
		},
		// This question set is one called 'farm'
		// It's already designed for farming tokens, so it should be alright to use in this extension
		body: "{\"gameMode\":\"Defense2\",\"questionSetId\":\"62211ec298c56fd0b8de9eb7\"}",
		method: "POST",
		credentials: "include"
	});

	// Extract the token from the response
	const session_token = (await session_token_response.json()).t;

	console.log(session_token);

	let JSONBody = {
		addedTokens: 500,
		addedXp: 300,
		t: session_token,
	};

	let payload = (new TextEncoder).encode(JSON.stringify(JSONBody));

	// Send request to blooket API
	const response = await fetch('https://play.blooket.com/api/users/add-rewards', {
		method: "PUT",
		headers: {
			"content-type": "application/json",
		},
		credentials: "include",
		body: payload
	});
	
	console.log(response.json());

	if(response.status != 200)
	{
		customAlert("Error adding tokens");
		return;
	}
	
	// Reload page to sync changes with server
	location.reload();
};

//await addTokens();