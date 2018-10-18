import React from 'react';
import '../../../../public/styles/chatpage/robotAssist.scss';
import { getNoDataComp } from "../../../../utils/ComponentUtils";
import { getLangTxt } from "../../../../utils/MyUtil";
import {Collapse, Popover} from 'antd';

const Panel = Collapse.Panel;

class RobotAssist extends React.Component {

	constructor(props)
	{
		super(props);
        this.state={visible: true}
	}


    getRobotAssistList()
    {
        return <Collapse bordered={false}>
            <Panel header="查看会话生命周期详细流程" key="1">
            </Panel>
        </Collapse>
    }

    getRATips()
    {
        return <div style={{width: "280px"}}>
            <p style={{color: "#5a8dce", paddingLeft: "5px"}}>辅助客服使用小提示</p>
            <p>【发送】:直接将推送内容发送给访客</p>
            <p>【引用】:将推荐内容放置到输入框内，可编辑后发送</p>
        </div>
    }

    handleVisibleChange()
    {
        this.setState({visible: !this.state.visible})
    }

	render()
	{
		const {chatDataVo = {}} = this.props,
			{productInfo = null} = chatDataVo;


        console.log("RobotAssist render chatDataVo = ", chatDataVo)

		// if(!productInfo)
		// {
		// 	return getNoDataComp();
		// }

		return (
			<div className="robotAssistComp">
                <div className="robotAssistHeader">
                    <img className="rAImg" src={require("../../../../public/images/robot.png")}/>
                    <span className="rATitle">【小能机器人】辅助客服</span>
                    <Popover overlayClassName="rAPopover" trigger="click"
                        visible={this.state.visible}
                        onVisibleChange={this.handleVisibleChange.bind(this)} content={"sdfsdfsdfs高端的发给松岛枫合适的话sdfsdfsdfs高端的发给松岛枫合适的话sdfsdfsdfs高端的发给松岛枫合适的话sdfsdfsdfs高端的发给松岛枫合适的话sdfsdfsdfs高端的发给松岛枫合适的话sdfsdfsdfs高端的发给松岛枫合适的话sdfsdfsdfs高端的发给松岛枫合适的话sdfsdfsdfs高端的发给松岛枫合适的话sdfsdfsdfs高端的发给松岛枫合适的话sdfsdfsdfs高端的发给松岛枫合适的话sdfsdfsdfs高端的发给松岛枫合适的话sdfsdfsdfs高端的发给松岛枫合适的话sdfsdfsdfs高端的发给松岛枫合适的话sdfsdfsdfs高端的发给松岛枫合适的话sdfsdfsdfs高端的发给松岛枫合适的话sdfsdfsdfs高端的发给松岛枫合适的话sdfsdfsdfs高端的发给松岛枫合适的话sdfsdfsdfs高端的发给松岛枫合适的话sdfsdfsdfs高端的发给松岛枫合适的话sdfsdfsdfs高端的发给松岛枫合适的话sdfsdfsdfs高端的发给松岛枫合适的话sdfsdfsdfs高端的发给松岛枫合适的话sdfsdfsdfs高端的发给松岛枫合适的话sdfsdfsdfs高端的发给松岛枫合适的话sdfsdfsdfs高端的发给松岛枫合适的话sdfsdfsdfs高端的发给松岛枫合适的话sdfsdfsdfs高端的发给松岛枫合适的话sdfsdfsdfs高端的发给松岛枫合适的话sdfsdfsdfs高端的发给松岛枫合适的话sdfsdfsdfs高端的发给松岛枫合适的话sdfsdfsdfs高端的发给松岛枫合适的话sdfsdfsdfs高端的发给松岛枫合适的话sdfsdfsdfs高端的发给松岛枫合适的话"} placement="bottom">
                        <i className="iconfont icon-tishi rATips"/>
                    </Popover>
                </div>
                {
                    this.getRobotAssistList()
                }
			</div>
		);
	}
}

export default RobotAssist;
