import React, { Component } from 'react'
import { Switch, Popover } from 'antd';
import { SortableComposition as Sortable }  from './SortableComposition';
import {truncateToPop} from "../../utils/StringUtils";

class SortableGridItem extends Component {

	constructor(props)
	{
		super(props);

		this.state = {
			check: this.props.check
		};
	}

	componentWillReceiveProps(nextProps)
	{
		this.setState({
			check: nextProps.check
		});
	}

	onChange(checked)
	{
		let data_id = this.props["data-id"],
			updateParent = this.props.updateParent;

		if(typeof updateParent === "function")
		{
			updateParent(data_id, checked);
		}

		this.setState({check: checked});
	}

	render()
	{

        let contentInfo = truncateToPop(this.props.children, 90) || {};

		return (
			<div className="grid-item">
                {
                    contentInfo.show ?
                        <Popover content={<div style={{
									maxWidth: "1.4rem", height: "auto", wordBreak: "break-word"
								}}>{this.props.children}</div>} placement="topLeft">
                            <span className="name">{contentInfo.content}</span>
                        </Popover>
                        :
                        <span className="name">{this.props.children}</span>
                }

				<Switch checked={this.state.check} onChange={this.onChange.bind(this)}/>
			</div>
		)
	}
}

export default Sortable(SortableGridItem);
