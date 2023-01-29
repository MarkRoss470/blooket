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
	
	let JSONBody = {
		addedTokens: 500,
		addedXp: 300
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
	
	console.log(response)

	if(response.status != 200)
	{
		customAlert("Error adding tokens");
		return;
	}
	
	// Reload page to sync changes with server
	// This seems to be broken at the moment
	location.reload();
	
};

//await addTokens();
