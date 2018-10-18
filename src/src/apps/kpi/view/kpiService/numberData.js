// 数值
export function numberData(data)
{
	let option = "",
		series = [],
		cols = data.columns,
		rows = data.rows[0],
		dataType;
	
	let optionX = function(cols) {
		let col;
		for(let i = 0; i < cols.length; i++)
		{
			col = cols[i];
			if(col.columnType == "mtc")
			{
				
				series.push(col.name);
				dataType = col.dataType;
			}
		}
	}
	
	optionX(cols);
	
	let optionSeries = function(rows) {
		let value;
		for(let m = 0; m < series.length; m++)
		{
			value = series[m];
			if(rows === undefined || rows[value] === undefined)
			{
				option = 0;
			}
			else
			{
				if(dataType === 'Percent')
				{
					option = percentage(rows[value])
				}
				else
				{
					option = rows[value]
				}
			}
		}
	}
	
	optionSeries(rows);
	return option;
}

function percentage(value)
{
	let strData = (value * 100).toString(),
		key;
	key = strData.indexOf('.');
	if(key == -1 || strData.substr(key + 1).length <= 4)
	{
		return strData + "%";
	}
	else
	{
		return strData.substr(0, key + 3) + "%";
	}
}
