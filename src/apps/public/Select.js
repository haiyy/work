import React from 'react';
import { Select as ASelect } from 'antd';
import "./css/commonSelect.scss"

class Select extends React.PureComponent {
    static Option = ASelect.Option;
	constructor(props)
	{
		super(props);
	}

	render()
	{
		return (
            <ASelect  {...this.props} dropdownClassName="commonSelectDropDown">
                {
                    this.props.option
                }
            </ASelect>
		);
	}
}

export default Select;
