export function gridData(data)
{
	// console.log(data);
	if (!data.result) {
		return
	}
	let option = {
			columns :[],
			rows : []
		},
		cols = data.result.columns,
		rows = data.result.rows.length != '0' && data.result.rows[0].children.length != '0' ? data.result.rows[0].children : [];
	
	let tableRows = function (rows) {
		if (rows.length == '0') {
			return
		}
		let row;
		for (let m = 0; m < rows.length; m++) {
			
			row = rows[m];
			row["key"] = `${Math.floor(Math.random() * 10)}-${row.rowKey}-${Math.random()}`;
			if(row.children)
			{
				tableRows(row.children);
			}
			//option.rows.push(row);
		}
	}
	tableRows(rows);
	option.rows = rows;
	
	let tableColumns = function (cols) {
		let col,length = cols.length;
		for (let i = 0; i < length; i++) {
			col = cols[i];
			col["dataIndex"] = col.name;
			col["id"] = i;
			//col["width"] = "75px";
			// delete col.columnType;
			// console.log(col.columnType);
			
			option.columns.push(col);
			
		}
		
	}
	tableColumns(cols);
	console.log(option);
	return option;
}