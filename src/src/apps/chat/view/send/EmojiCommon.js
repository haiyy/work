import React from "react";
import "../../../../public/styles/chatpage/send/sendType.scss";
import SmileyDict from "../../../../utils/SmileyDict";

class CommonEmoji extends React.PureComponent {

	constructor(props)
	{
		super(props);
	}

	_onSelected(item)
	{
		if(typeof this.props.callBack === "function")
		{
			this.props.callBack();
		}
		
		this.props.getChooseEmiji(item);
	}

	_getUI()
	{
		return SmileyDict.SMILE_CODES.map((item, index) =>
		{
			return index == 34 || index == 35 ?
                <li key={ index } className="common-emoji" style={ index == 34 ? {borderRight: 0} : {} }></li>
                :
                <li key={ index } className="common-emoji" onClick={ this._onSelected.bind(this, item) }>
                    <img src={this._getSmilePath(item[2])} alt={item[0]}/>
                    <span>{item[0]}</span>
                </li>
		});
	}

	_getSmilePath(name)
	{
		let filename = name + ".png";
		
		return require("../../../../public/images/emoji/" + filename);
	}

	render()
	{
		return (
			<div className="common" id="common">
				<ul>
					{
						this._getUI()
					}
				</ul>
			</div>
		)
	}
}

export default CommonEmoji;
