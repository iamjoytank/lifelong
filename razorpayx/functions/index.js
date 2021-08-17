const functions = require('firebase-functions');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const app = require('express')();
const bodyParser = require('body-parser');
const OPTIONS = require('./options/option');
const unirest = require('unirest');

const PORT = 3000;
dotenv.load({ path: '.env' });
const apiId = process.env.RAZORPAYX_KEY_ID;
const apiSecret = process.env.RAZORPAYX_KEY_SECRET;

const auth = 'Basic ' + new Buffer.from(`${apiId}:${apiSecret}`).toString('base64');
const headers = {
	Authorization: auth,
	'Content-Type': 'application/json',
};
const generateLink = async (req) => {
	console.log(req.body.freshdesk_webhook, new Date());
	// console.log(req.body.freshdesk_webhook.ticket_id);
	let data = req.body.freshdesk_webhook;
	let body = {
		account_number: process.env.RAZORPAY_ACCOUNT,
		contact: {
			name: data.ticket_contact_name,
			type: 'customer',
			contact: data.ticket_contact_phone
				? data.ticket_contact_phone
				: data.ticket_contact_mobile,
			email: data.ticket_contact_email,
		},
		amount: data.ticket_cf_refund_amount * 100,
		currency: 'INR',
		purpose: 'refund',
		description: `${data.ticket_id} ticket`,
		receipt: `${data.cf_invoiceorder_no}`,
		send_sms: true,
		send_email: true,
		notes: {
			random_key_1: `Refund payment link for ticket id ${data.ticket_id}`,
			random_key_2: `Invoice order no ${data.cf_invoiceorder_no}`,
		},
	};
	let url = `${OPTIONS.raazorpay.API}/payout-links`;
	const resultData = await axios.post(url, body, { headers: headers });
	// console.log(resultData.data);
	return resultData;
};
const fetchPayouts = async (req) => {
	let order = req.query.order;
	let url = `${OPTIONS.raazorpay.API}/payout-links?receipt=${order}`;
	const resultData = await axios.get(url, { headers: headers });
	if (resultData.data.items.length > 0) {
		console.log('checked with invoice number',new Date());
		const result = await updateTickets(req.query.ticket_id, resultData.data);
		return { razorpay: resultData.data, freshDesk: result.body };
	} else {
		let email = req.query.email;
		let url = `${OPTIONS.raazorpay.API}/payout-links?contact_email=${email}`;
		const resultData = await axios.get(url, { headers: headers });
		if (resultData.data.items.length > 0) {
			console.log('checked with email', new Date());
			const result = await updateTickets(req.query.ticket_id, resultData.data);
			return { razorpay: resultData.data, freshDesk: result.body };
		} else {
			let phone = req.query.phone ? req.query.phone : req.query.mobile;
			let url = `${OPTIONS.raazorpay.API}/payout-links?contact_phone_number=${phone}`;
			const resultData = await axios.get(url, { headers: headers });
			if (resultData.data.items.length > 0) {
				console.log('checked with phone number', new Date());
				const result = await updateTickets(req.query.ticket_id, resultData.data);
				return { razorpay: resultData.data, freshDesk: result.body };
			} else return resultData.data;
		}
	}
};
const updateTickets = async (ticketId, data) => {
	let id = ticketId;
	let url = `${OPTIONS.freshDesk.API}tickets/${id}`;
	let payload = {
		'custom_fields[cf_razor_pay_refund_status]': data.items[0].status,
		status: 3,
	};
	let token = process.env.FRESH_DESK_API_KEY;
	const auth = 'Basic ' + new Buffer.from(token + ':' + 'X').toString('base64');
	const headers = {
		Authorization: auth,
	};
	console.log('ur;', url, new Date());
	const resultData = await unirest.put(url).headers(headers).field(payload);
	return resultData;
};
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/generate-link', async (req, res) => {
	try {
		const data = await generateLink(req);
		res.json(data.data);
	} catch (e) {
		console.log(e);
		res.send(e);
	}
});
app.get('/status', async (req, res) => {
	try {
		const data = await fetchPayouts(req);
		res.json(data);
	} catch (e) {
		console.log(e);
		res.send(e);
	}
});

exports.webApi = functions.https.onRequest(app);

// exports.helloWorld = functions.https.onRequest((request, response) => {
// 	functions.logger.info('Hello logs!', { structuredData: true });
// 	response.send('Hello from Firebase!');
// });