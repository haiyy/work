import React from 'react'
import {Card, Switch, Popover} from 'antd';
import './style/distributionItem.scss';
import {truncateToPop} from "../../../utils/StringUtils";
import { getLangTxt } from "../../../utils/MyUtil";

class DistributionItemReadOnly extends React.PureComponent {
	constructor(props)
	{
		super(props);
		this.state = {
			show: false,
			check: true,
            isCopyTempId: false
		}
	}

    showTemplateId(){
        this.setState({
            isCopyTempId: !this.state.isCopyTempId
        })
    }

    //input自动全选value
    selectInputValue(e)
    {
        e.target.select();
    }

	render()
	{
		let {distributionData: data = {}} = this.props,
            {isCopyTempId} = this.state,
			{name = "", status = 0, supplierPoolName, allocationName = "", templateid = ""} = data,
            templateidInfo = truncateToPop(templateid, 100) || {},
            nameInfo = truncateToPop(name, 100) || {},
            supplierPoolNameInfo = truncateToPop(supplierPoolName, 100) || {},
            allocationNameInfo = truncateToPop(allocationName, 100) || {};

		return (
			<div className='distribution-item'>
				<Card className="distribution-item-card">
					<Switch disabled defaultChecked={status == 1}/>
					<div className="msgShow clearFix">
                        <i className="iconfont icon-ren itemIcon"/>
						<div className="itemCon supplierPoolName" onDoubleClick={this.showTemplateId.bind(this)}>
                            {
                                isCopyTempId ?
                                    <input className="itemConId_ipt_Name"
                                        autoFocus="autofocus"
                                        onFocus={this.selectInputValue.bind(this)}
                                        onBlur={this.showTemplateId.bind(this)} value={templateid}
                                    />
                                    :
                                    templateidInfo.show ?
                                        <Popover
                                            content={
                                                <div style={{maxWidth: "100px", height: "auto", wordBreak: "break-word"}}>
                                                    {templateid}
                                                </div>
                                         }
                                            placement="top"
                                        >
                                            <div className="itemConId_Name">{templateidInfo.content}</div>
                                        </Popover>
                                        :
                                        <div className="itemConId_Name">
                                            {
                                                templateid
                                            }
                                        </div>

                            }

                            {
                                nameInfo.show ?

                                    <Popover
                                        content={
                                                <div style={{maxWidth: "100px", height: "auto", wordBreak: "break-word"}}>
                                                    {name}
                                                </div>
                                         }
                                        placement="top"
                                    >
                                        <div className="itemConId_Name">{nameInfo.content}</div>
                                    </Popover>
                                    :
                                    <div className="itemConId_Name">
                                        {
                                            name
                                        }
                                    </div>
                            }

						</div>
					</div>
                    <span className="item-arrow"/>
					<span className="item-card supplierPoolName">
						<i className="iconfont icon-ren_"/>
                        {
                            supplierPoolNameInfo.show ?
                                <Popover
                                    content={
                                            <div style={{maxWidth: "100px", height: "auto", wordBreak: "break-word"}}>
                                                {supplierPoolName}
                                            </div>
                                         }
                                    placement="top"
                                >
                                    {supplierPoolNameInfo.content}
                                </Popover>
                                :
                                supplierPoolName
                        }
					</span>
					<span className="item-arrow"/>
					<span className="item-card supplierPoolName">
						<i className="iconfont icon-fenpei"/>
                        {
                            allocationNameInfo.show ?
                                <Popover
                                    content={
                                            <div style={{maxWidth: "100px", height: "auto", wordBreak: "break-word"}}>
                                                {allocationName}
                                            </div>
                                         }
                                    placement="top"
                                >
                                    {allocationNameInfo.content}
                                </Popover>
                                :
                                allocationName
                        }
					</span>
					{
						status == 0 ?
						<div className="distribution-item-operate">
							<span className='distribut'>
								<i className="iconfont icon-bianji"/>
							</span>
							<span className='remove'>
								<i className="iconfont icon-shanchu"/>
							</span>
						</div> : null
					}

				</Card>
			</div>
		)
	}
}

export default DistributionItemReadOnly;
