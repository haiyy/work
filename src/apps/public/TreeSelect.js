import React from 'react';
import { TreeSelect as ATreeSelect } from 'antd';
import "./css/commonSelect.scss"

class TreeSelect extends React.PureComponent {

	constructor(props)
	{
		super(props);
	}

	render()
	{
		return (
            <ATreeSelect  {...this.props} dropdownClassName="commonTreeSelectDropDown">
                {
                    this.props.treeNode
                }
            </ATreeSelect>
		);
	}
}

export default TreeSelect;
