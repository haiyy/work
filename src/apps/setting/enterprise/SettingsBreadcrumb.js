import React from 'react';
import { Breadcrumb, Icon } from 'antd';
import './style/settingsBreadcrumb.scss';
import { getLangTxt } from "../../../utils/MyUtil";
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';

const Item = Breadcrumb.Item;

class SettingsBreadcrumb extends React.Component {

	constructor(props)
	{
		super(props);
	}

	render()
	{
		let {path, screenFLag, braedCurnbFLag, iconClass} = this.props;
		if(!path || screenFLag || braedCurnbFLag)
			return null;

		return (
			<div className="SettingsBreadcrumb" style={{borderBottom: '1px solid #e9e9e9'}}>
				<Breadcrumb>
					<Item key="0">
						<i className={iconClass}/>
					</Item>
					{
						path.map(item => {
							return (
								<Item key={item.key}>{getLangTxt(item.title) || item.title}</Item>
							)
						})
					}
				</Breadcrumb>
			</div>
		);
	}
}

function mapStateToProps(state)
{
	let {telephonyScreenReducer} = state;
	return {
		screenFLag: telephonyScreenReducer.get("screenFLag"),
		braedCurnbFLag: telephonyScreenReducer.get("braedCurnbFLag"),
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsBreadcrumb);
