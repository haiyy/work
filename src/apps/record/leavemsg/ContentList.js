import React from 'react';
import '../../../public/styles/enterpriseSetting/contentList.scss';
import { formatTimestamp, getLangTxt, kfContent } from "../../../utils/MyUtil";

class ContentList extends React.Component {
	
	constructor(props)
	{
		super(props);
	}
	
	/*获取处理方式的类型*/
	getProccessmethodFun(processmethod)
	{
		let processmethodText = getLangTxt("noData5");
		
		if(processmethod === 1)
		{
			processmethodText = getLangTxt("record_message");
		}
		else if(processmethod === 2)
		{
			processmethodText = getLangTxt("rightpage_tab_email");
		}
		else if(processmethod === 3)
		{
			processmethodText = getLangTxt("other");
		}
		return processmethodText;
	}
	
	/*区分从哪个页面进来的内容块*/
	distinguishContentSourceFun(type, recordDetail)
	{
		let leaveInfo = [],
			leaveMessage = recordDetail.leaveMessage,
			kf = recordDetail.kf || {},
			dealNickName = recordDetail.dealNickName || '',
			dealExternalName = recordDetail.dealExternalName || '',
			dealKfName = dealNickName + '[' + dealExternalName + ']';
		
		if(type === "pendingDetail")
		{
			leaveInfo = [
				{
					title: getLangTxt("rightpage_tab_leave_time"),
					content: formatTimestamp(leaveMessage.time) || getLangTxt("noData5"),
					titleStyle: {
						color: '#0076d6'
					}
				},
				{
					title: getLangTxt("rightpage_tab_leave_content"),
					content: leaveMessage.content || getLangTxt("noData5"),
					titleStyle: {
						color: '#0076d6'
					}
				}
			];
		}
		else if(type === "dealedDetailTop")
		{
			leaveInfo = [
				{
					title: getLangTxt("rightpage_tab_leave_startpage"),
					isUrl: true,
					titleStyle: {
						color: '#0177d7'
					},
					urlValue: leaveMessage.startpageurl,
					content: leaveMessage.startpagetitle
				},
				{
					title: getLangTxt("rightpage_tab_leave_phone"),
					titleStyle: {
						color: '#0177d7'
					},
					content: leaveMessage.phone || getLangTxt("noData5")
				},
				{
					title: getLangTxt("rightpage_tab_leave_email"),
					titleStyle: {
						color: '#0177d7'
					},
					content: leaveMessage.email || getLangTxt("noData5")
				},
				{
					title: getLangTxt("rightpage_tab_leave_content"),
					titleStyle: {
						color: '#0177d7'
					},
					content: leaveMessage.content || getLangTxt("noData5")
				}
			];
		}
		else if(type === "dealedDetailBottom")
		{
			leaveInfo = [
				{
					title: getLangTxt("record_kf"),
					titleStyle: {
						color: '#30d380'
					},
					content: kfContent(kf.nickname, kf.showname)
				},
				{
					title: getLangTxt("rightpage_tab_leave_deal"),
					titleStyle: {
						color: '#30d380'
					},
					content: dealKfName || getLangTxt("noData5")
				},
				{
					title: getLangTxt("rightpage_tab_deal_time"),
					titleStyle: {
						color: '#30d380'
					},
					content: formatTimestamp(leaveMessage.proccesstime) || getLangTxt("noData5")
				},
				{
					title: getLangTxt("rightpage_tab_deal_mode"),
					titleStyle: {
						color: '#30d380'
					},
					content: this.getProccessmethodFun(leaveMessage.proccessmethod),
					contentStyle: {
						fontSize: '12px'
					}
				},
				{
					title: getLangTxt("rightpage_tab_deal_content"),
					titleStyle: {
						color: '#30d380'
					},
					content: leaveMessage.proccesscontent || getLangTxt("noData5")
				}
			];
		}
		return leaveInfo;
	}
	
	getChildItems()
	{
		let {data: recordDetail, type} = this.props;
		
		if(!recordDetail || !recordDetail.leaveMessage)
			return [];
		
		let result = [];
		
		this.distinguishContentSourceFun(type, recordDetail)
		.forEach((item) => {
			result.push(
				<p key={item.title} className="listItem">
                    <span className="titleOfRecord" style={item.titleStyle}>
                        {item.title} :
                    </span>
					<span className="contentOfRecord" style={{fontSize: '12px', wordWrap: 'break-word'}}>
                        {
	                        item.isUrl ?
		                        <a href={item.content ? item.urlValue : 'javascript:void(0);'}
		                           style={item.content ? {} : {color: '#ccc'}} target="_blank">
			                        {item.content || getLangTxt("noData5")}
		                        </a>
		                        :
		                        <span>
                                    {item.content || getLangTxt("noData5")}
                                </span>
                        }
                    </span>
				</p>
			);
		});
		
		return result;
	}
	
	render()
	{
		return (
			<div className="recordContentList">
				{
					this.getChildItems()
				}
			</div>
		);
	}
}

export default ContentList;
