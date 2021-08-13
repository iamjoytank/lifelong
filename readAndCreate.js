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
let dataList = [];
const filePath = 'read-data.xlsx';
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
const createTicket = async (data, attachment) => {
	console.log('original data', data);
	let url = `${OPTIONS.freshDesk.API}tickets`;
	let body = {
		// email: '',
		subject: data.subject,
		email: data.requester_id,
		name: data.name,
		'custom_fields[cf_category]': capitalize(data.category),
		'custom_fields[cf_subcategory]': capitalize(data.subCategory),
		'custom_fields[cf_model]':
			data.category && data.subCategory ? data.cf_product_model_number : null,
		'custom_fields[cf_level1]': data.cf_level1,
		'custom_fields[cf_purchased_on]': data.purchased_on,
		'custom_fields[cf_warranty_status]': data.cf_warranty_status,
		'custom_fields[cf_issue_date]': data.cf_issue_date ? data.cf_issue_date : null,
		'custom_fields[cf_courier_partner]': data.cf_courier_partner
			? data.cf_courier_partner
			: null,
		'custom_fields[cf_state237507]': data.cf_state,
		'custom_fields[cf_city]': data.cf_city,
		'custom_fields[cf_pincode]': parseInt(data.cf_pin_code) ? parseInt(data.cf_pin_code) : null,
		'custom_fields[cf_address]': data.address,
		'custom_fields[cf_serviceability]': data.cf_serviceability,
		'custom_fields[cf_reason]': data.cf_reason,
		'custom_fields[cf_action]': data.cf_action,
		'custom_fields[cf_pending_on]': data.cf_pending_on,
		'custom_fields[cf_invoiceorder_no]': data.cf_order_number,
		'custom_fields[cf_invoiceorder_number]': data.cf_invoice_number,
		'custom_fields[cf_serial_number995088]': data.cf_product_serial_number,
		'custom_fields[cf_awbtracking_number]': data.cf_awbtracking_number,
		'custom_fields[cf_zoho_id]': data.zohoId,
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
	if (data.priority.match('Low')) {
		body.priority = 1;
	} else if (data.priority.match('Medium')) {
		body.priority = 2;
	} else if (data.priority.match('High')) {
		body.priority = 3;
	} else {
		body.priority = 4;
	}
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
const readExcelFile = async (filePath) => {
	try {
		const Excel = require('exceljs');
		const workbook = new Excel.Workbook();
		//Use then function to executed code that need to perform immediately after readFile
		workbook.xlsx
			.readFile(filePath)
			.then(() => {
				//Use sheetName in getWorksheet function
				const worksheet = workbook.getWorksheet('read-data');
				//Use nested iterator to read cell in rows
				//First iterator for rows in sheet
				worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
					console.log('Current Row:' + rowNumber);
					let obj = {};
					//Second iterator for cells in row
					if (rowNumber > 1) {
						row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
							//print row number, column number and cell value at[row][col]
							// if (colNumber === 0) {
							// 	obj.subject = cell.value;
							// }
							if (colNumber === 2) {
								obj.subject = cell.value;
							}
							if (colNumber === 3) {
								obj.status = cell.value;
							}
							if (colNumber === 4) {
								obj.priority = cell.value;
							}
							if (colNumber === 5) {
								obj.source = cell.value;
							}
							if (colNumber === 6) {
								obj.type = cell.value;
							}
							if (colNumber === 7) {
								obj.internal_agent_id = cell.value;
							}
							if (colNumber === 8) {
								obj.product = cell.value;
							}
							if (colNumber === 9) {
								obj.purchased_on = cell.value;
							}
							if (colNumber === 10) {
								obj.category = cell.value;
							}
							if (colNumber === 11) {
								obj.subCategory = cell.value;
							}
							if (colNumber === 12) {
								obj.cf_product_model_number = cell.value;
							}
							if (colNumber === 13) {
								obj.cf_serviceability = cell.value;
							}
							if (colNumber === 14) {
								obj.cf_pending_on = cell.value;
							}
							if (colNumber === 15) {
								obj.cf_invoice_number = cell.value;
							}
							if (colNumber === 16) {
								obj.cf_awbtracking_number = cell.value;
							}
							if (colNumber === 17) {
								obj.cf_warranty_status = cell.value;
							}
							if (colNumber === 18) {
								obj.cf_level1 = cell.value;
							}
							if (colNumber === 19) {
								obj.address = cell.value;
							}
							if (colNumber === 20) {
								obj.cf_state = cell.value;
							}
							if (colNumber === 21) {
								obj.cf_city = cell.value;
							}
							if (colNumber === 22) {
								obj.cf_pin_code = cell.value;
							}
							if (colNumber === 23) {
								obj.zohoId = cell.value;
							}
							if (colNumber === 24) {
								obj.name = cell.value;
							}
							if (colNumber === 25) {
								obj.requester_id = cell.value;
							}
							if (colNumber === 26) {
								obj.description = cell.value;
							}
						});
						dataList.push(obj);
						createTicket(obj, []);
					}
				});
			})
			.finally(() => {
				console.log(dataList);
			});
	} catch (e) {
		console.log(e);
	}
};

readExcelFile(filePath);
