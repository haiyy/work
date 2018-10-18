import React, { Component } from 'react'
import Settings from '../../../utils/Settings'
import {loginUserProxy} from "../../../utils/MyUtil"
import { urlLoader } from '../../../lib/utils/cFetch'
import moment from 'moment'

function downloadFile(fileName, content)
{
	let aLink = document.createElement('a'),
		blob = new Blob([content], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}),
		evt = document.createEvent("HTMLEvents");

	evt.initEvent("click", false, false);
	aLink.download = fileName;
	aLink.href = URL.createObjectURL(blob);
	//aLink.dispatchEvent(evt);
	aLink.click();
}

//根据获取导出报名名字请求具体数据
function _downloadTable(name)
{
	let {siteId, userId} = loginUserProxy(),
		url = `${Settings.getPantherUrl()}/api/report/download/${name}`;

	return fetch(
		url, {
			method: 'get',
			headers: {
				'siteid': siteId,
				'userid': userId
			}
		}
	)
	.then(result =>
		{
			//导出结果
			//return result.arrayBuffer();
			result.blob()
			.then(exceldata =>
			{
				downloadFile(name, exceldata);
			});
		}
	)
	.catch(error =>
	{//UI显示问题
		return error;
	});
}

//获取报表随机id
export function getReportId(name, qry)
{
	let date1 = moment().startOf('d').subtract(1, 'd').add(1, 'days').format("YYYY-MM-DD HH:mm:ss"),
		date2 = moment().format("YYYY-MM-DD HH:mm:ss");
	let query = qry.length ? qry : `datetime|between|${date1},${date2}`;
	let body,
		{siteId, userId} = loginUserProxy(),
		url = `${Settings.getPantherUrl()}/api/report/${name}/v1`;
	query = query + '&&business|=|' + siteId;
	body = JSON.stringify({name, "qry": query});
	return urlLoader(
		url, {
			method: 'put',
			headers: {
				'siteid': siteId,
				'userid': userId,
                'isExport': 'export'
			},
			body
		}
	)
	.then(result =>
		{
            let name = result.jsonResult.result;
            _downloadTable(name);
		}
	)
}
