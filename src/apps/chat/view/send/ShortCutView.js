import React from "react";
import { Dropdown, Menu } from "antd";
import Channel from "../../../../model/vo/Channel";
import { sendToMain } from "../../../../core/ipcRenderer";
import { getLangTxt } from "../../../../utils/MyUtil";

class ShortCutView extends React.PureComponent {

	constructor(props)
	{
		super(props);

        let isShowScreen = localStorage.getItem('isShowScreen') == 1;

        this.state = {isShowScreen};
	}

	onClick()
	{
		sendToMain(Channel.SHORT_CUT);
	}

	onMenuClick({item, key})
	{
        localStorage.setItem("isShowScreen", parseInt(key));
        let isShowScreen = key == 1;

        this.setState({isShowScreen});

		sendToMain(Channel.INIT_IPC, {isShowScreen});
		this.onClick();
	}

	getMenu()
	{
        let isShowScreen = this.state.isShowScreen,
            spanClassNameOne = isShowScreen ? 'selected': '',
            spanClassNameTwo =  isShowScreen ? '': 'selected';

		return (
			<Menu onClick={this.onMenuClick.bind(this)} className="shortCutViewMenu">
				<Menu.Item key="1">
                    <i style={isShowScreen ? {display: "inline-block"} : {display: "none"}}
                        className="iconfont icon-zhengque"/>
                    <span className={"shortCutViewSpan " + spanClassNameOne}>{getLangTxt("shortCut1")}Ctrl+Alt+X</span>
				</Menu.Item>
				<Menu.Item key="2">
                    <i style={isShowScreen ? {display: "none"} : {display: "inline-block"}}
                        className="iconfont icon-zhengque"/>
                    <span className={"shortCutViewSpan " + spanClassNameTwo}>{getLangTxt("shortCut2")}</span>
				</Menu.Item>
			</Menu>
		);
	}

	render()
	{
		return (
			<Dropdown overlay={this.getMenu()} placement="topCenter">
				<i className={this.props.propsClassName} onClick={this.onClick.bind(this)}/>
			</Dropdown>
		);
	}
}

export default ShortCutView;
