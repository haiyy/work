import React from 'react';
import '../../../public/styles/enterpriseSetting/recordInfomation.scss';
import { formatTimestamp } from "../../../utils/MyUtil";
import {truncateToPop} from "../../../utils/StringUtils";
import { Popover } from 'antd';
class RecordInfomation extends React.Component {

	constructor(props)
	{
		super(props)
	}

	getChildList()
	{
        let { data:recordDetail } = this.props;

        if(!recordDetail || !recordDetail.leaveMessage)
            return [];

        let leaveMessage = recordDetail.leaveMessage,
            kf = recordDetail.kf || {},
            result = [],
            leaveInfo = [
            {
                title: '留言时间',
                content: formatTimestamp(leaveMessage.time) || '暂无'
            },
            {
                title: '责任客服',
                content: leaveMessage.kfname || '暂无'
            },
            {
                title: '留言发起页面',
                isUrl: true,
                urlValue: leaveMessage.startpageurl,
                content: leaveMessage.startpagetitle
            },
            {
                title: '用户ID',
                content: leaveMessage.guestid || '暂无'
            },
            {
                title: '用户名称',
                content: leaveMessage.guestname || '访客'
            },
            {
                title: '客户电话',
                content: leaveMessage.phone || '暂无'
            },
            {
                title: '客户邮箱',
                content: leaveMessage.email || '暂无'
            },
            {
                title: '处理方式',
                content: '----'
            }
        ];

        leaveInfo.forEach((item, index) =>
		{
            let typeEle = document.querySelector(".recordListItemContent"),
                titleWidth = typeEle && typeEle.clientWidth - 12,
                titleInfo = truncateToPop(item.content, titleWidth) || {};

            result.push(
                <div key={ item.title + index } className="recordListItem">
                    <div className="recordListItemTitle" style={{color:'#212121'}}> {item.title + " :"} </div>
                    <div className="recordListItemContent">
                        {
                            item.isUrl ?
                                titleInfo.show ?
                                    <Popover content={<div style={{
                                            maxWidth: "2rem", maxHeight: "4rem", overflow: "auto", wordBreak: "break-word"
                                        }}>{item.content}</div>} placement="topLeft">
                                        <a href={item.content ? item.urlValue : 'javascript:void(0);'} target="_blank"
                                            style={ item.content ? {} : {color: '#ccc'} }>
                                            {titleInfo.content || '暂无'}
                                        </a>
                                    </Popover>
                                    :
                                    <a href={item.content ? item.urlValue : 'javascript:void(0);'} target="_blank"
                                        style={ item.content ? {} : {color: '#ccc'} }>
                                        {item.content || '暂无'}
                                    </a>
                                    :
                                titleInfo.show ?
                                    <Popover content={<div style={{
                                            maxWidth: "2rem", maxHeight: "4rem", overflow: "auto", wordBreak: "break-word"
                                        }}>{item.content}</div>} placement="topLeft">
                                        <span>
                                            {titleInfo.content}
                                        </span>
                                    </Popover>
                                    :
                                    <span>
                                        {item.content}
                                    </span>
                        }
                    </div>
                </div>
            );
		});

		return result;
	}

	render()
	{
		return (
			<div className="recordInfomation">
				{
					this.getChildList()
				}
			</div>
		);
	}
}

export default RecordInfomation;
