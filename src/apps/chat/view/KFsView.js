import React, { Fragment } from "react";
import { Popover } from 'antd';
import { drawCompose } from "../../../utils/ImageUtils";
import { getUserName } from "../../../model/vo/RosterUser";
import { truncateToPop } from "../../../utils/StringUtils";

class KFsView extends React.Component {
	
	constructor(props)
	{
		super(props);
		
		this.defaultPortrait = require("../../../public/images/kfPortrait.png");
	}
	
	componentDidUpdate(prevProps)
	{
		let {kfs} = this.props;
		if(prevProps.kfs != kfs && kfs && this.canvas)
		{
			let imgs = kfs.map(value => value.portrait || this.defaultPortrait);
			drawCompose(imgs, this.canvas);
		}
	}
	
	getKFsComp(value)
	{
		return value.map(userInfo => {
			let contentInfo = truncateToPop(getUserName(userInfo, true), 60) || {};
			
			return (
				<div className="kfItemInfoBox">
					<img className="kfPortrait" src={userInfo.portrait || this.defaultPortrait}/>
					<div className="kfNameInfo">
						{
							contentInfo.show ?
								<Popover content={<div style={{
									maxWidth: "1.4rem", height: "auto", wordBreak: "break-word"
								}}>{contentInfo.popString}</div>} placement="topLeft">
									<span>{contentInfo.content}</span>
								</Popover>
								:
								<span>{contentInfo.popString}</span>
						}
					</div>
				</div>
			);
		})
	}
	
	render()
	{
		let {kfs} = this.props;
		
		if(!kfs || !kfs.length || kfs.length <= 1)
			return null;
		return (
			<div className="kfGroupMemberWrapper">
				<div className="kfGroupThumbnails">
					<canvas ref={node => this.canvas = node} width="60" height="60"/>
				</div>
				<div className="kfMemberItem">
					{
						this.getKFsComp(kfs)
					}
				</div>
			</div>
		);
	}
	
}

export default KFsView;
