const axios = require('axios');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const FormData = require('form-data');
const unirest = require('unirest');

const OPTIONS = require('../options/option');
const fs = require('fs');
dotenv.load({ path: '.env' });
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(3000, () => {
	console.log('Server listening at port 3000');
});

const getTickets = async (req, res) => {
	let from = 0;
	let limit = 10;
	let url = `${OPTIONS.freshDesk.API}tickets`;
	let token = process.env.FRESH_DESK_API_KEY;
	const options = {
		username: `${token}:X`,
		password: ``,
	};
	console.log(url)
	const resultData = await axios.get(url, { auth: options });
	return resultData;
};
const postTicket = async (req, res) => {
	let url = `${OPTIONS.freshDesk.API}tickets`;
	let token = process.env.FRESH_DESK_API_KEY;
	const auth = 'Basic ' + new Buffer.from(token + ':' + 'X').toString('base64');

	const fields = {
		email: req.body.email,
		subject: req.body.subject,
		description: req.body.description,
		status: req.body.status,
		priority: 1,
		unique_external_id: req.body.unique_external_id,
	};
	const headers = {
		Authorization: auth,
	};
	unirest
		.post(url)
		.headers(headers)
		.field(fields)
		.attach('attachments[]', fs.createReadStream(`${__dirname}/car.jpg`))
		.end(function (response) {
			console.log(response.body);
			console.log('Response Status : ' + response.status);
			if (response.status == 201) {
				console.log('Location Header : ' + response.headers['location']);
			} else {
				console.log('X-Request-Id :' + response.headers['x-request-id']);
			}
		});
};
const getContact = async (req, res) => {
	let from = 0;
	let limit = 10;
	let url = `${OPTIONS.freshDesk.API}contacts`;
	let token = process.env.FRESH_DESK_API_KEY;
	const options = {
		username: `${token}:X`,
		password: ``,
	};
	const resultData = await axios.get(url, { auth: options });
	return resultData;
};
const postContact = async (req, res) => {
	let from = 0;
	let limit = 10;
	let url = `${OPTIONS.freshDesk.API}contacts`;
	let token = process.env.FRESH_DESK_API_KEY;
	const options = {
		username: `${token}:X`,
		password: ``,
	};
	const resultData = await axios.post(url, req.body, { auth: options });
	return resultData;
};
//** conversation replies */
// if we pass user_id then we can say that this reply came from this user
const postReply = async (req, res) => {
	let url = `${OPTIONS.freshDesk.API}tickets/${req.query.id}/reply`;
	let token = process.env.FRESH_DESK_API_KEY;
	const options = {
		username: `${token}:X`,
		password: ``,
	};
	const resultData = await axios.post(url, req.body, { auth: options });
	return resultData;
};
const postNotes = async (req, res) => {
	let url = `${OPTIONS.freshDesk.API}tickets/${req.query.id}/notes`;
	let token = process.env.FRESH_DESK_API_KEY;
	const options = {
		username: `${token}:X`,
		password: ``,
	};
	const resultData = await axios.post(url, req.body, { auth: options });
	return resultData;
};
app.get('/fresh-tickets', async (req, res) => {
	try {
		const data = await getTickets(req, res);
		res.send(data.data);
	} catch (e) {
		res.send(e);
	}
});
app.post('/fresh-tickets', async (req, res) => {
	try {
		const data = await postTicket(req, res);
		console.log('response', data);
		res.send(data);
	} catch (e) {
		console.log('error', e);
		res.send(e);
	}
});

app.get('/fresh-contact', async (req, res) => {
	try {
		const data = await getContact(req, res);
		res.send(data.data);
	} catch (e) {
		res.send(e);
	}
});
app.post('/fresh-contact', async (req, res) => {
	try {
		const data = await postContact(req, res);
		res.send(data.data);
	} catch (e) {
		res.send(e);
	}
});
app.post('/fresh-reply', async (req, res) => {
	try {
		const data = await postReply(req, res);
		res.send(data.data);
	} catch (e) {
		res.send(e);
	}
});
app.post('/fresh-notes', async (req, res) => {
	try {
		const data = await postNotes(req, res);
		res.send(data.data);
	} catch (e) {
		res.send(e);
	}
});
