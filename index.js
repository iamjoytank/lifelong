const OPTIONS = require('./options/option');
const zohoRepository = require('./zohoCredentails');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.load({ path: '.env' });
let accessToken = '1000.b0441698c2311b33f0f4348f0b13f778.47fb73c36f16a917102dc1adf286ed42';
const moment = require('moment');
const unirest = require('unirest');
const fs = require('fs');
const path = require('path');
const modelNames = OPTIONS.modelsList;
let token = process.env.FRESH_DESK_API_KEY;
	const auth = 'Basic ' + new Buffer.from(token + ':' + 'X').toString('base64');
	const headers = {
		Authorization: auth,
	};
let serviceable = [
	'Treadmill',
	'Treadmill Query',
	'Washing Machine',
	'Excercise Cycle',
	'247',
	'Qdigi',
	'Massage Chair',
	'Treadmill Other Partners',
	'Massager',
	'In-Store',
	'Chiranjeev',
	'Udaan',
	'S-Tech',
	'Jeeves',
	'Covid Restriction Zone',
	'COVID Restric - 247',
	'COVID Restric- Chiranjeevi',
	'COVID Restric- Stech',
	'247 Around',
	'Missing Parts',
	'Airtech_ - Mumbai',
	'Ajay_- Bangalore',
	'Asian Electronics_- Hyderabad',
	'Atiksha_Electronics - Pune',
	'Chaya_-Jaipur',
	'SB_Electronics - Guwhati',
	'Skanda_Enterprise - Bangalore',
	'CRM - Hyderabad',
	'Akash - Pune'
];
let nonServiceable = [
	'Refund',
	'Shopify Replacement',
	'Order Placed Shopify',
	'Customer',
	'Customer attempt 2',
	'Customer Closed',
	'Service Partner Cancelled',
	'Amazon',
	'Closed',
	'Warehouse Spares',
	'Pending Pickup',
];
const getZohoTicketComments = async (ticket_id) => {
	let from = 0;
	let limit = 100;
	let url = `${OPTIONS.zoho.API1}tickets/${ticket_id}/comments?from=${from}&limit=${limit}`;
	const options = {
		Authorization: `Zoho-oauthtoken ${accessToken}`,
	};
	const resultData = await axios.get(url, { headers: options });
	return resultData.data.data;
};
const getAllZohoTickets = async (from, limit) => {
	let url = `${OPTIONS.zoho.API1}tickets?include=contacts&from=${from}&limit=${limit}&sortBy=createdTime&status=Open`;
	const options = {
		Authorization: `Zoho-oauthtoken ${accessToken}`,
	};
	const resultData = await axios.get(url, { headers: options });
	return resultData.data.data;
};
const getAZohoTickets = async (ticket_id) => {
	let url = `${OPTIONS.zoho.API1}tickets/${ticket_id}`;
	const options = {
		Authorization: `Zoho-oauthtoken ${accessToken}`,
	};
	const resultData = await axios.get(url, { headers: options });
	return resultData.data;
};
const getAllThreads = async (id) => {
	let url = `${OPTIONS.zoho.API1}tickets/${id}/threads`;
	const options = {
		Authorization: `Zoho-oauthtoken ${accessToken}`,
	};
	const resultData = await axios.get(url, { headers: options });
	return resultData.data.data;
};
const getAZohoTicketThreads = async (ticket_id, thread_id) => {
	let url = `${OPTIONS.zoho.API1}tickets/${ticket_id}/threads/${thread_id}?include=plainText`;
	const options = {
		Authorization: `Zoho-oauthtoken ${accessToken}`,
	};
	const resultData = await axios.get(url, { headers: options });
	return resultData.data;
};
const getZohoTicketAttachment = async (ticket_id) => {
	let from = 0;
	let limit = 100;
	let url = `${OPTIONS.zoho.API1}tickets/${ticket_id}/attachments?from=${from}&limit=${limit}`;
	const options = {
		Authorization: `Zoho-oauthtoken ${accessToken}`,
	};
	const resultData = await axios.get(url, { headers: options });
	return resultData.data;
};
const downloadFile = async (data) => {
	try {
		const options = {
			Authorization: `Zoho-oauthtoken ${accessToken}`,
		};
		let url = `${data.href}?orgId=${process.env.ZOHO_ORG_ID}`;
		const response = await axios.get(url, { responseType: 'stream', headers: options });
		const newPath = path.resolve(__dirname, 'attachment', data.name);

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
const createCustomFields = (data) => {
	let newObj = {};
	if (data.cf.cf_invoice_number && data.cf.cf_invoice_number != null) {
		newObj.cf_invoiceorder_number = data.cf.cf_invoice_number;
	}
	if (data.cf.cf_issue_date && data.cf.cf_issue_date != null) {
		newObj.cf_issue_date = data.cf.cf_issue_date;
	}
	if (data.cf.cf_courier_partner && data.cf.cf_courier_partner != null) {
		newObj.cf_courier_partner = data.cf.cf_courier_partner;
	}
	if (data.cf.cf_state && data.cf.cf_state != null) {
		newObj.cf_state = data.cf.cf_state;
	}
	if (data.cf.cf_city && data.cf.cf_city != null) {
		newObj.cf_city = data.cf.cf_city;
	}
	if (data.cf.cf_pin_code && data.cf.cf_pin_code != null) {
		newObj.cf_pincode = parseInt(data.cf.cf_pin_code);
	}
	if (data.cf.cf_address_line_1 && data.cf.cf_address_line_1 != null) {
		newObj.cf_address = data.cf.cf_address_line_1 + addressLine2;
	}
	if (data.cf.cf_order_number && data.cf.cf_order_number != null) {
		newObj.cf_invoiceorder_no = data.cf.cf_order_number;
	}
	if (data.category && data.category != null) {
		newObj.cf_category = data.category;
		if (data.subCategory && data.subCategory != null) {
			newObj.cf_subcategory = data.subCategory;
			if (data.cf.cf_product_model_number && data.cf.cf_product_model_number != null) {
				newObj.cf_model = data.cf.cf_product_model_number;
			}
		}
	}
	if (data.cf.cf_pending_on && data.cf.cf_pending_on != null) {
		if (serviceable.includes(data.cf.cf_pending_on)) {
			newObj.cf_serviceability = 'Serviceable';
			if (data.cf.cf_pending_on.match('247')) {
				newObj.cf_reason = '247 Around';
			} else if (data.cf.cf_pending_on.match('S-Tech')) {
				newObj.cf_reason = 'S-Tech';
			} else if (data.cf.cf_pending_on.match('Jeeves')) {
				newObj.cf_reason = 'Jeeves';
			} else if (data.cf.cf_pending_on.match('Chiranjeev')) {
				newObj.cf_reason = 'Chiranjeev';
			} else if (
				[
					'Covid Restriction Zone',
					'COVID Restric - 247',
					'COVID Restric- Chiranjeevi',
					'COVID Restric- Stech',
				].includes(data.cf.cf_pending_on)
			) {
				// keep blank
				newObj.cf_pending_on = 'COVID Restrictions';
			} else {
				newObj.cf_reason = 'Others';
			}
		} else if (nonServiceable.includes(data.cf.cf_pending_on)) {
			newObj.cf_serviceability = 'Non- Serviceable';
			newObj.cf_reason = 'Product Non-Serviceable';
			if (data.cf.cf_pending_on.match('Refund')) {
				newObj.cf_action = 'Refund - Bank';
			} else if (
				['Shopify Replacement', 'Order Placed Shopify'].includes(data.cf.cf_pending_on)
			) {
				newObj.cf_action = 'Replaced - Lifelong Website';
			} else if (data.cf.cf_pending_on.match('Amazon')) {
				newObj.cf_action = 'Replaced - Other Portals';
			}
			if (data.cf.cf_pending_on.match('Service Partner Cancelled')) {
				newObj.cf_pending_on = 'Cancelled';
			}
			if (
				['Customer', 'Customer attempt 2', 'Customer Closed'].includes(
					data.cf.cf_pending_on
				)
			) {
				newObj.cf_pending_on = 'Customer';
			}
			if (
				[
					'Refund',
					'Shopify Replacement',
					'Order Placed Shopify',
					'Treadmill',
					'Treadmill Query',
					'Washing Machine',
					'Excercise Cycle',
					'247',
					'Qdigi',
					'Massage Chair',
					'Treadmill Other Partners',
					'Massager',
					'In-Store',
					'Amazon',
					'Closed',
					'Udaan',
					'S-Tech',
					'Warehouse Spares',
					'Jeeves',
				].includes(data.cf.cf_pending_on)
			) {
				newObj.cf_pending_on = 'Service';
			}
		}
		if (data.cf.cf_pending_on.match('Lifelong')) {
			newObj.cf_pending_on = 'Lifelong';
		}
	}
	if (data.cf.cf_awb_number && data.cf.cf_awb_number != null) {
		newObj.cf_awbtracking_number = data.cf.cf_awb_number;
	}
	if (data.cf.cf_product_serial_number && data.cf.cf_product_serial_number != null) {
		newObj.cf_serial_number995088 = data.cf.cf_product_serial_number;
	}
	newObj.cf_level1 = 'Product Complaint'; // default
	newObj.cf_warranty_status = 'Under Warranty';

	return newObj;
};
const getService = (data) => {
	if (serviceable.includes(data.cf.cf_pending_on)) {
		return 'Serviceable';
	} else if (nonServiceable.includes(data.cf.cf_pending_on)) {
		return 'Non- Serviceable';
	} else {
		return null;
	}
};
const getReason = (data) => {
	if (serviceable.includes(data.cf.cf_pending_on)) {
		if (data.cf.cf_pending_on.match('247') || data.cf.cf_pending_on.match('247 Around')) {
			return '247 Around';
		} else if (data.cf.cf_pending_on.match('S-Tech')) {
			return 'S-Tech';
		} else if (data.cf.cf_pending_on.match('Jeeves')) {
			return 'Jeeves';
		} else if (data.cf.cf_pending_on.match('Chiranjeev')) {
			return 'Chiranjeev';
		}else if (data.cf.cf_pending_on.match('Airtech_ - Mumbai')) {
			return 'Airtech_ - Mumbai';
		} else if (data.cf.cf_pending_on.match('Ajay_- Bangalore')) {
			return 'Ajay_- Bangalore';
		} else if (data.cf.cf_pending_on.match('Asian Electronics_- Hyderabad')) {
			return 'Asian Electronics_- Hyderabad';
		}else if (data.cf.cf_pending_on.match('Atiksha_Electronics - Pune')) {
			return 'Atiksha_Electronics - Pune';
		} else if (data.cf.cf_pending_on.match('Chaya_-Jaipur')) {
			return 'Chaya_-Jaipur';
		} else if (data.cf.cf_pending_on.match('SB_Electronics - Guwhati')) {
			return 'SB_Electronics - Guwhati';
		} else if (data.cf.cf_pending_on.match('Skanda_Enterprise - Bangalore')) {
			return 'Skanda_Enterprise - Bangalore';
		}else if (data.cf.cf_pending_on.match('CRM - Hyderabad')) {
			return 'CRM - Hyderabad';
		} else if (data.cf.cf_pending_on.match('Akash - Pune')) {
			return 'Chaya_-Jaipur';
		} 
		return 'Others';
	} else if (nonServiceable.includes(data.cf.cf_pending_on)) {
		return 'Product Non-Serviceable';
	}
	return null;
};
const getAction = (data) => {
	if (['Shopify Replacement', 'Order Placed Shopify'].includes(data.cf.cf_pending_on)) {
		return 'Replaced - Lifelong Website';
	}
	if (data.cf.cf_pending_on.match('Amazon')) {
		return 'Replaced - Other Portals';
	}
	return null;
};
const getPending = (data) => {
	if (data.cf.cf_pending_on.match('Lifelong') || data.cf.cf_pending_on.match('Online')) {
		return 'Lifelong';
	}
	if (
		[
			'Refund',
			'Shopify Replacement',
			'Order Placed Shopify',
			'Treadmill',
			'Treadmill Query',
			'Washing Machine',
			'Excercise Cycle',
			'247',
			'Qdigi',
			'Massage Chair',
			'Treadmill Other Partners',
			'Massager',
			'In-Store',
			'Amazon',
			'Closed',
			'Udaan',
			'S-Tech',
			'Warehouse Spares',
			'Jeeves',
			'Airtech_ - Mumbai',
			'Ajay_- Bangalore',
			'Asian Electronics_- Hyderabad',
			'Atiksha_Electronics - Pune',
			'Chaya_-Jaipur',
			'SB_Electronics - Guwhati',
			'Skanda_Enterprise - Bangalore',
			'CRM - Hyderabad',
			'Akash - Pune'
		].includes(data.cf.cf_pending_on)
	) {
		return 'Service';
	}
	if (
		[
			'Covid Restriction Zone',
			'COVID Restric - 247',
			'COVID Restric- Chiranjeevi',
			'COVID Restric- Stech',
		].includes(data.cf.cf_pending_on)
	) {
		return 'COVID Restrictions';
	}
	if (data.cf.cf_pending_on.match('Service Partner Cancelled')) {
		return 'Cancelled';
	}
	if (['Customer', 'Customer attempt 2', 'Customer Closed'].includes(data.cf.cf_pending_on)) {
		return 'Customer';
	}
	if(data.cf.cf_pending_on.match('Missing Parts')){
		return 'Missing Parts';
	}
	return null;
};
const createPath = (data) => {
	let newArr = [];
	for (let i = 0; i < data.length; i++) {
		newArr.push(fs.createReadStream(`${__dirname}/attachment/${data[i].name}`));
	}
	return newArr;
};
const capitalize = (phrase) => {
	return phrase
		.toLowerCase()
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
};
const checkCompleinType = (data)=>{
	if([
		'Service',
		'Service-Part Pending',
		'Replacement',
		'Refund'
	].includes.data.cf.cf_call_status_1){
		return 'Product Complaint';
	}
	else if(data.cf.cf_call_status_1.match('Feedback')){
		return 'Feedback';
	}
	else if(data.cf.cf_call_status_1.match('Installation Request')){
		return 'Installation Request';
	}
}
const checkAgent = (data)=>{
	if(data.assigneeId === '258372000000080000'){
		return '82019842533';
	}
	else if(data.assigneeId === '258372000002727000' || data.assigneeId === '258372000050525000'){
		return '82030837986';
	}
	else if(data.assigneeId === '258372000016938000' || data.assigneeId === '258372000021277000'){
		return '82030830417';
	}
	else if(data.assigneeId === '258372000026515000'){
		return '82030813544';
	}
	else if(data.assigneeId === '258372000055243000'){
		return '82030271558';
	}
	else if(data.assigneeId === '258372000055600000'){
		return '82030813961';
	}
	else if(data.assigneeId === '258372000082859000'){
		return '82030832581';
	}
	else if(data.assigneeId === '258372000103598000'){
		return '82030812309';
	}
	else if(data.assigneeId === '258372000105792000'){
		return '82030831398';
	}
	else if(data.assigneeId === '258372000113983000'){
		return '82030813104';
	}
}
const createTicket = async (data, attachment) => {
	console.log('original data', data);
	let url = `${OPTIONS.freshDesk.API}tickets`;
	let addressLine2 = data.cf.cf_address_line_2 ? data.cf.cf_address_line_2 : '';
	let address = data.cf.cf_address_line_1 ? data.cf.cf_address_line_1 + addressLine2 : null;

	let obj = modelNames.find(
		(x) =>
			x.modelNumber === data.cf.cf_product_model_number || x.modelNumber === data.cf.cf_model
	);

	let body = {
		email: data.email,
		phone: data.phone,
		subject: data.subject,
		unique_external_id: data.contactId,
		responder_id:checkAgent(data),
		'custom_fields[cf_category]': obj && obj.category ? capitalize(obj.category) : null,
		'custom_fields[cf_subcategory]':
			obj && obj.subCategory ? capitalize(obj.subCategory) : null,
		'custom_fields[cf_model]': obj && obj.category && obj.subCategory ? obj.modelNumber : null,
		'custom_fields[cf_level1]': checkCompleinType(data),
		'custom_fields[cf_warranty_status]': 'Under Warranty',
		'custom_fields[cf_issue_date]': data.cf.cf_issue_date,
		'custom_fields[cf_courier_partner]': data.cf.cf_courier_partner,
		'custom_fields[cf_state237507]': data.cf.cf_state,
		'custom_fields[cf_city]': data.cf.cf_city,
		'custom_fields[cf_pincode]': parseInt(data.cf.cf_pin_code)
			? parseInt(data.cf.cf_pin_code)
			: null,
		'custom_fields[cf_address]': address,
		'custom_fields[cf_serviceability]': getService(data),
		'custom_fields[cf_reason]': getReason(data),
		'custom_fields[cf_action]': getAction(data),
		'custom_fields[cf_pending_on]': getPending(data),
		'custom_fields[cf_invoiceorder_no]': data.cf.cf_order_number,
		'custom_fields[cf_invoiceorder_number]': data.cf.cf_invoice_number,
		'custom_fields[cf_serial_number995088]': data.cf.cf_product_serial_number,
		'custom_fields[cf_awbtracking_number]': data.cf.cf_awb_number,
		'custom_fields[cf_zoho_id]': data.id,
		type: 'Support', // default
		source: 2, // default,
		// created_at: moment(data.createdTime).format('YYYY-MM-DDTHH:MM:SSZ'),
		// updated_at: moment(data.modifiedTime).format('YYYY-MM-DDTHH:MM:SSZ'),
		// due_by: moment(data.dueDate).format('YYYY-MM-DDTHH:MM:SSZ'),
	};
	if (data.description != null) {
		body.description = data.description;
	} else {
		body.description = 'Empty';
	}
	if (data.type != null) {
		body.type = data.type;
	}
	if (data.productId != null) {
		body.product_id = data.productId;
	}
	// if (data.priority.match('Low')) {
	// 	body.priority = 1;
	// } else if (data.priority.match('Medium')) {
	// 	body.priority = 2;
	// } else if (data.priority.match('High')) {
	body.priority = 3; // default
	// } else {
	// 	body.priority = 4;
	// }
	if (data.status.match('Closed')) {
		body.status = 4;
	} else {
		body.status = 2;
	}
	// console.log(createCustomFields(data));
	console.log('payload send', body);
	// const resultData = await axios.post(url, body, { auth: option2 });
	// return resultData.data;
	const resultData = await unirest
		.post(url)
		.headers(headers)
		.field(body)
		.attach('attachments[]', createPath(attachment));
	console.log(resultData.body);
	return resultData.body;
};

const addData = async (from, limit) => {
	try {
		accessToken = await zohoRepository.createAccessToken();

		let data = await getAllZohoTickets(from, limit);
		console.log('length of zoho tickets', data.length);
		for (let i = 0; i < data.length; i++) {
			console.log('ticket id', data[i].id);
			let newData = await getAZohoTickets(data[i].id);

			// fetch attachments
			let attachments = await getZohoTicketAttachment(data[i].id);
			for (let i = 0; i < attachments.data.length; i++) {
				await downloadFile(attachments.data[i]);
			}
			console.log('attachment length', attachments.data.length);
			// fetch threads
			const threads = await getAllThreads(data[i].id);
			console.log('threads from zoho', threads.length);
			// create ticket in fresh desk
			const ticket = await createTicket(newData, attachments.data);
			console.log('fresh desk ticket id', ticket.id);
			// creating conversation
			let conversation = threads;
			for (let j = 0; j < conversation.length; j++) {
				let thread = await getAZohoTicketThreads(data[i].id, conversation[j].id);
				for (let a = 0; a < thread.attachments.length; a++) {
					await downloadFile(thread.attachments[a]);
				}
				console.log('thread id', thread.id);
				console.log('thread attachment length', thread.attachments.length);
				let reply = {
					body: thread.content,
					user_id: 82025059616,
					// from_email: thread.data.from,
				};
				let url = `${OPTIONS.freshDesk.API}tickets/${ticket.id}/reply`;
				// const options = {
				// 	username: `${process.env.FRESH_DESK_API_KEY}:X`,
				// 	password: ``,
				// };
				// const resultData = await axios.post(url, reply, { auth: options });
				const resultData = await unirest
					.post(url)
					.headers(headers)
					.field(reply)
					.attach('attachments[]', createPath(thread.attachments));
			}

			const comments = await getZohoTicketComments(data[i].id);
			console.log('comments length', comments.length);
			for (let k = 0; k < comments.length; k++) {
				for (let b = 0; b < comments[k].attachments.length; b++) {
					await downloadFile(comments[k].attachments[b]);
				}
				let reply = {
					body: comments[k].content,
					user_id: 82025059616,
				};
				let url = `${OPTIONS.freshDesk.API}tickets/${ticket.id}/notes`;
				// const resultData = await axios.post(url, reply, { auth: options });
				// console.log('zoho post notes id', resultData.data.id);
				const resultData = await unirest
					.post(url)
					.headers(headers)
					.field(reply)
					.attach('attachments[]', createPath(comments[k].attachments));
				console.log('zoho post replies id', resultData.body.id);
			}
		}
	} catch (e) {
		// console.log(e);
	}
};

addData(0, 3);
