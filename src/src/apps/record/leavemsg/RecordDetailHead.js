import React from 'react';
import { Icon, Popover } from 'antd';
import '../../../public/styles/enterpriseSetting/recordDetailHead.scss';

import Logo from '../../../components/Logo';
import {truncateToPop} from "../../../utils/StringUtils";

class recordDetailHead extends React.Component {
	constructor(props)
	{
		super(props);

		this.state = {
			username: this.props.username || ''
		};
	}

	componentWillReceiveProps(props)
	{
		this.state = {
			username: props.username || ''
		};
	}

	render()
	{
        let { url } = this.props,
            {username} = this.state,
            typeEle = document.querySelector(".constuom"),
            titleWidth = typeEle && typeEle.clientWidth,
            titleInfo = truncateToPop(username, titleWidth, 16) || {};

		return (
			<div className="recordDetailHead">
				<div onClick={this.props.backCilck} className="backContainer">
					<Icon type="left"/>
					<span> 返回 </span>
				</div>
				<div className="AvatarAndSelected">
					<div className="ASLeft">
						<Logo url={ url } link={ "visitor" }/>
                        {
                            titleInfo.show ?
                                <Popover content={<div style={{
                                            maxWidth: "4rem", maxHeight: "4rem", overflow:"auto", wordBreak: "break-word"
                                        }}>{username}</div>} placement="topLeft">
                                    <div className="constuom"> {titleInfo.content} </div>
                                </Popover>
                                :
                                <div className="constuom"> {username} </div>
                        }

					</div>
				</div>
			</div>
		);
	}
}

export default recordDetailHead;
