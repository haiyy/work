import { formatData } from '../../../utils/FormatData'

export function gridData(data)
{

	if (!data.result) {
		return
	}
	let option = {
			columns :[],
			rows : []
		},
		cols = data.result.columns,
		rows = data.result.rows;

	let tableRows = function (rows) {
		if (!rows || rows.length == '0') {
			return
		}
		let row;
		for (let m = 0; m < rows.length; m++) {

			row = rows[m];
			row["key"] = `${Math.floor(Math.random() * 10)}-${row.rowKey}-${Math.random()}`;
			// row["index"] = m+1;
			if(row.children)
			{
				tableRows(row.children);
			}
			//option.rows.push(row);
		}
	}
	tableRows(rows);
	option.rows = rows;

	let tableColumns = function (cols = []) {
		let col,length = cols.length;
		if(length !== 0)
		{
			// option.columns.push({/*width:'50px', */dataIndex:'index',title:''});
		}
		for (let i = 0; i < length; i++) {
			col = cols[i];
			// col["width"] = "100px";
			col["dataIndex"] = col.name;
			col["id"] = i;
			formatData(col);
			option.columns.push(col);

		}

	}
	tableColumns(cols);

	return option;
}
