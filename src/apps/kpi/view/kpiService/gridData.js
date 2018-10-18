//表格
import {formatData} from '../../../../utils/FormatData'

export function gridData(data,kpiTitle) {
    if (!data.columns) {
        return
    }
    let option = {
            columns: [],
            rows: [],
            title:kpiTitle
        },
        cols = data.columns,
        rows = data.rows;

    let tableRows = function (rows) {
        let row;
        for (let m = 0; m < rows.length; m++) {
            row = rows[m];
            row["key"] = `${Math.floor(Math.random() * 10)}-${row.rowKey}-${Math.random()}`;
            // row["index"] = m+1;
            if (row.children) {
                delete row.children
            }
            option.rows.push(row);
        }
    }

    tableRows(rows);

    let tableColumns = function (cols) {
        let col, length = cols.length,
            rowWidth = (1 / cols.length * 100) + "%";

        if (length !== 0) {
            // option.columns.push({/*width:'50px', */dataIndex:'index',title:''});
        }

        for (let i = 0; i < length; i++) {
            col = cols[i];
            col["dataIndex"] = col.name;
            col["width"] = col.width || 120;
            formatData(col);
            option.columns.push(col);
        }
    }
    tableColumns(cols);
    return option;
}
