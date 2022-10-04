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

	//send request to blooket api
	const response = await fetch('https://api.blooket.com/api/users/add-rewards', {
		method: "PUT",
		headers: {
			"content-type": "application/json",
		},
		credentials: "include",
		body: payload
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
