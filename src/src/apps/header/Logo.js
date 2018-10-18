import React from "react"
import MainNav from "./MainNav"
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';

class Logo extends React.PureComponent {

	constructor(props)
	{
		super(props);

		this.state = {
			isOpen: false
		}
	}

	onPopupVisibleChange(value = false)
	{
		this.setState({isOpen: value});
	}

	render()
	{
		return (
			<Trigger popupPlacement="bottom"
			         popupAlign={{offset: [0, 0]}}
			         action={["click"]}
			         popupClassName="logoTrigger"
			         popupVisible={this.state.isOpen} builtinPlacements={{bottom: {points: ['tl', 'bl'],}}}
			         popup={ <MainNav callBack={this.onPopupVisibleChange.bind(this)} visible={this.state.isOpen}/> }
			         onPopupVisibleChange={this.onPopupVisibleChange.bind(this)}>

				<div className={this.state.isOpen ? "logo" : "logo box-left"}>
					<div className="main">
                        <div className="imgDixc" style={{backgroundImage: `url(${this.props.logoUrl})`}}></div>
						<span>
							<i className="iconfont icon-sanheng"/>
						</span>
					</div>
				</div>
			</Trigger>
		);
	}
}

export default Logo;
