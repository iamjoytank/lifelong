const OPTIONS = require('./options/option');
const axios = require('axios');

exports.createAccessToken = async () => {
	const url = `${OPTIONS.zoho.ACCOUNT_API}`;
	const params = {
		refresh_token: process.env.ZOHO_REFRESH_TOKEN,
		grant_type: OPTIONS.zoho.GRANT_TYPE_REFRESH,
		client_id: process.env.ZOHO_CLIENT_ID,
		client_secret: process.env.ZOHO_CLIENT_SECRET,
		scope: OPTIONS.zoho.scope,
	};
	const resultData = await axios.post(url, null, { params: params });
	console.log(resultData.data.access_token);
	return resultData.data.access_token;
};
