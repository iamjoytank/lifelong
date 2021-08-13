const axios = require('axios');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

const OPTIONS = require('../options/option');
const zohoRepository = require('../zohoCredentails');
const fs = require('fs');
const path = require('path');

dotenv.load({ path: '.env' });
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(3000, () => {
	console.log('Server listening at port 3000');
});
const getZohoTickets = async (req, res) => {
	let from = 0;
	let limit = 10;
	let url = `${OPTIONS.zoho.API1}tickets?include=contacts&from=${from}&limit=${limit}`;
	let token = await zohoRepository.createAccessToken();
	const options = {
		Authorization: `Zoho-oauthtoken ${token}`,
	};
	const resultData = await axios.get(url, { headers: options });
	return resultData;
};
const getAZohoTickets = async (req, res) => {
	let url = `${OPTIONS.zoho.API1}tickets/${req.query.id}`;
	let token = await zohoRepository.createAccessToken();
	const options = {
		Authorization: `Zoho-oauthtoken ${token}`,
	};
	const resultData = await axios.get(url, { headers: options });
	return resultData;
};
const getZohoTicketsByContactId = async (req, res) => {
	let from = 0;
	let limit = 10;
	let contactId = req.query.id;
	let url = `${OPTIONS.zoho.API1}contacts/${contactId}/tickets?include=contacts&from=${from}&limit=${limit}`;
	let token = await zohoRepository.createAccessToken();
	const options = {
		Authorization: `Zoho-oauthtoken ${token}`,
	};
	const resultData = await axios.get(url, { headers: options });
	return resultData;
};
const getZohoContact = async (req, res) => {
	let from = 0;
	let limit = 10;
	let url = `${OPTIONS.zoho.API1}contacts?from=${from}&limit=${limit}`;
	let token = await zohoRepository.createAccessToken();
	const options = {
		Authorization: `Zoho-oauthtoken ${token}`,
	};
	const resultData = await axios.get(url, { headers: options });
	return resultData;
};
const getZohoTicketAttachment = async (req, res) => {
	let from = 0;
	let limit = 100;
	let ticket_id = req.query.id;
	let url = `${OPTIONS.zoho.API1}tickets/${ticket_id}/attachments?from=${from}&limit=${limit}`;
	let token = await zohoRepository.createAccessToken();
	const options = {
		Authorization: `Zoho-oauthtoken ${token}`,
	};
	const resultData = await axios.get(url, { headers: options });
	for (let i = 0; i < resultData.data.data.length; i++) {
		await downloadFile(resultData.data.data[i]);
	}
	return resultData;
};
const getZohoTicketComments = async (req, res) => {
	let from = 0;
	let limit = 10;
	let ticket_id = req.query.id;
	let url = `${OPTIONS.zoho.API1}tickets/${ticket_id}/comments?from=${from}&limit=${limit}`;
	let token = await zohoRepository.createAccessToken();
	const options = {
		Authorization: `Zoho-oauthtoken ${token}`,
	};
	const resultData = await axios.get(url, { headers: options });
	return resultData;
};
const getZohoTicketThreads = async (req, res) => {
	let from = 0;
	let limit = 10;
	let ticket_id = req.query.id;
	let url = `${OPTIONS.zoho.API1}tickets/${ticket_id}/threads?from=${from}&limit=${limit}`;
	let token = await zohoRepository.createAccessToken();
	const options = {
		Authorization: `Zoho-oauthtoken ${token}`,
	};
	const resultData = await axios.get(url, { headers: options });
	return resultData;
};
const getAZohoTicketComments = async (req, res) => {
	let ticket_id = req.query.id;
	let comment_id = req.query.commentId;
	let url = `${OPTIONS.zoho.API1}tickets/${ticket_id}/comments/${comment_id}`;
	let token = await zohoRepository.createAccessToken();
	const options = {
		Authorization: `Zoho-oauthtoken ${token}`,
	};
	const resultData = await axios.get(url, { headers: options });
	return resultData;
};
const downloadFile = async (data) => {
	try {
		let token = await zohoRepository.createAccessToken();
		const options = {
			Authorization: `Zoho-oauthtoken ${token}`,
		};
		let url = `${data.href}?orgId=${process.env.ZOHO_ORG_ID}`;
		const response = await axios.get(url, { responseType: 'stream', headers: options });
		const newPath = path.resolve(__dirname, data.name);

		// pipe the result stream into a file on disc
		response.data.pipe(fs.createWriteStream(newPath));
		// return a promise and resolve when download finishes
		new Promise((resolve, reject) => {
			response.data.on('end', () => {
				resolve();
			});

			response.data.on('error', () => {
				reject();
			});
		});
	} catch (e) {
		console.log(e);
	}
};

const getAZohoTicketThreads = async (req, res) => {
	let ticket_id = req.query.id;
	let thread_id = req.query.threadId;
	let url = `${OPTIONS.zoho.API1}tickets/${ticket_id}/threads/${thread_id}?include=plainText`;
	let token = await zohoRepository.createAccessToken();
	const options = {
		Authorization: `Zoho-oauthtoken ${token}`,
	};
	const resultData = await axios.get(url, { headers: options });
	return resultData;
};
const getZohoTicketConversations = async (req, res) => {
	let from = 0;
	let limit = 10;
	let ticket_id = req.query.id;
	let url = `${OPTIONS.zoho.API1}tickets/${ticket_id}/conversations?from=${from}&limit=${limit}`;
	let token = await zohoRepository.createAccessToken();
	const options = {
		Authorization: `Zoho-oauthtoken ${token}`,
	};
	const resultData = await axios.get(url, { headers: options });
	return resultData;
};
app.get('/zoho-atickets', async (req, res) => {
	try {
		const data = await getAZohoTickets(req, res);
		res.send(data.data);
	} catch (e) {
		res.send(e);
	}
});
app.get('/zoho-tickets', async (req, res) => {
	try {
		const data = await getZohoTickets(req, res);
		res.send(data.data);
	} catch (e) {
		res.send(e);
	}
});
app.get('/zoh-contact', async (req, res) => {
	try {
		const data = await getZohoContact(req, res);
		res.send(data.data);
	} catch (e) {
		res.send(e);
	}
});
app.get('/zoho-ticketByContact', async (req, res) => {
	try {
		const data = await getZohoTicketsByContactId(req, res);
		res.send(data.data);
	} catch (e) {
		res.send(e);
	}
});
app.get('/zoho-attachment', async (req, res) => {
	try {
		const data = await getZohoTicketAttachment(req, res);
		res.send(data.data);
	} catch (e) {
		res.send(e);
	}
});
app.get('/zoho-comments', async (req, res) => {
	try {
		const data = await getZohoTicketComments(req, res);
		res.send(data.data);
	} catch (e) {
		res.send(e);
	}
});
app.get('/zoho-acomments', async (req, res) => {
	try {
		const data = await getAZohoTicketComments(req, res);
		res.send(data.data);
	} catch (e) {
		res.send(e);
	}
});
app.get('/zoho-threads', async (req, res) => {
	try {
		const data = await getZohoTicketThreads(req, res);
		res.send(data.data);
	} catch (e) {
		res.send(e);
	}
});
app.get('/zoho-athreads', async (req, res) => {
	try {
		const data = await getAZohoTicketThreads(req, res);
		res.send(data.data);
	} catch (e) {
		res.send(e);
	}
});
app.get('/zoho-conversations', async (req, res) => {
	try {
		const data = await getZohoTicketConversations(req, res);
		res.send(data.data);
	} catch (e) {
		res.send(e);
	}
});
