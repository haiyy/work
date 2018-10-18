import { GET_ATTENTION, ATTENTION_LIST, UNSUBSCRIBE, SUBSCRIBE, REPOET_VALUE } from '../../model/vo/actionTypes';
import { pie_nestData } from '../../components/kpi/kpiService/nestedPie.js'
import { bar_clusteredData } from '../../components/kpi/kpiService/barClusteredData.js'
import { barData } from '../../components/kpi/kpiService/barData.js'
import { bar_hData } from '../../components/kpi/kpiService/barHData.js'
import { dashboardData } from '../../components/kpi/kpiService/dashboardData.js'
import { gridData } from '../../components/kpi/kpiService/gridData.js'
import { numberData } from '../../components/kpi/kpiService/numberData.js'

let newData = [];
export default function attentionList(state = {}, action) {
	// console.log(action);
	switch(action.type)
	{
		case GET_ATTENTION:
			newData = action.result;
			return {
				data: action.result
			}
		case ATTENTION_LIST:
			newData = action.result;
			return {
				data: action.result
			}
		case REPOET_VALUE:
			// console.log(newData);
			
			let ui, rpt_type;
			for(let i = 0; i < newData.length; i++)
			{
				if(newData[i].name == action.name)
				{
					ui = newData[i].ui;
					rpt_type = newData[i].rpt_type;
					switch(ui)
					{
						case "grid":
							newData[i].option = changeOption(rpt_type, action.result)
							console.log("newData[i].option>>>", newData[i].option);
							return {
								data: [...newData]
							}
						case "bar":
							newData[i].option = barData(action.result);
							//console.log("option>>>>",newData[i].option);
							return {
								data: [...newData]
							}
						case "bar-h":
							newData[i].option = bar_hData(action.result);
							//console.log(newData);
							return {
								data: [...newData]
							}
						case "bar-clustered":
							newData[i].option = bar_clusteredData(action.result);
							//console.log(newData);
							return {
								data: [...newData]
							}
						case "dashboard":
							newData[i].option = dashboardData(action.result);
							//console.log(newData);
							return {
								data: [...newData]
							}
						case "pie-nest":
							newData[i].option = pie_nestData(action.result);
							//console.log(newData);
							return {
								data: [...newData]
							}
						case "number":
							newData[i].option = numberData(action.result);
							//console.log(newData);
							return {
								data: [...newData]
							}
					}
				}
			}
		default:
			return state;
	}
	return state;
}

function changeColumns(data)
{
	for(let i = 0; i < data.length; i++)
	{
		if(data[i] != null)
		{
			data[i].key = data[i].name;
			data[i].dataIndex = data[i].name;
		}
	}
	return data;
}

function changeOption(rpt_type, result)
{
	let option = {};
	if(rpt_type == "detail")
	{
		option.rows = result.result.rows;
		option.columns = changeColumns(result.result.columns);
	}
	else
	{
		option = gridData(result);
	}
	
	return option;
}