const app = require('express')();

const dataList = [];
const filePath = 'modelNames.xlsx';
const readExcelFile = async (filePath) => {
	const Excel = require('exceljs');
	const workbook = new Excel.Workbook();
	//Use then function to executed code that need to perform immediately after readFile
	workbook.xlsx
		.readFile(filePath)
		.then(() => {
			//Use sheetName in getWorksheet function
			const worksheet = workbook.getWorksheet('Category');
			//Use nested iterator to read cell in rows
			//First iterator for rows in sheet
			worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
				// console.log('Current Row:' + rowNumber);
				let obj = {};
				//Second iterator for cells in row
				row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
					//print row number, column number and cell value at[row][col]
					if (typeof cell.value != 'object') {
						// console.log(`Cell Value=${cell.value}`);
						if (colNumber === 1) {
							obj.modelNumber = cell.value;
						}
						if (colNumber === 2) {
							obj.category = cell.value;
						}
						if (colNumber === 3) {
							obj.subCategory = cell.value;
						}
					} else {
						// console.log(`Cell Value=${cell.value.result}`);
						if (colNumber === 1) {
							obj.modelNumber = cell.value.result;
						}
						if (colNumber === 2) {
							obj.category = cell.value.result;
						}
						if (colNumber === 3) {
							obj.subCategory = cell.value.result;
						}
					}
				});
				dataList.push(obj);
			});
		})
		.finally(() => {
			return dataList;
		});
};

app.listen(3000);

app.get('/', async (req, res) => {
	try {
		const Excel = require('exceljs');
		const workbook = new Excel.Workbook();
		//Use then function to executed code that need to perform immediately after readFile
		workbook.xlsx
			.readFile(filePath)
			.then(() => {
				//Use sheetName in getWorksheet function
				const worksheet = workbook.getWorksheet('Category');
				//Use nested iterator to read cell in rows
				//First iterator for rows in sheet
				worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
					// console.log('Current Row:' + rowNumber);
					let obj = {};
					//Second iterator for cells in row
					row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
						//print row number, column number and cell value at[row][col]
						if (typeof cell.value != 'object') {
							// console.log(`Cell Value=${cell.value}`);
							if (colNumber === 1) {
								obj.modelNumber = cell.value;
							}
							if (colNumber === 2) {
								obj.category = cell.value;
							}
							if (colNumber === 3) {
								obj.subCategory = cell.value;
							}
						} else {
							// console.log(`Cell Value=${cell.value.result}`);
							if (colNumber === 1) {
								obj.modelNumber = cell.value.result;
							}
							if (colNumber === 2) {
								obj.category = cell.value.result;
							}
							if (colNumber === 3) {
								obj.subCategory = cell.value.result;
							}
						}
					});
					dataList.push(obj);
				});
			})
			.finally(() => {
				res.json({ dataList, length:dataList.length });
			});
	} catch (e) {
		console.log(e);
	}
});
