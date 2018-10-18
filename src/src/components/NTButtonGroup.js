import React from 'react';
import { getLangTxt, shallowEqual } from "../utils/MyUtil";
import classNames from 'classnames';
import cloneDeep from "lodash/cloneDeep";

class NTButtonGroup extends React.PureComponent {

	static defaultProps = {
		options: [],
		prefixCls: 'nt-button-group'
	};

	constructor(props)
	{
		super(props);

		this.state = {
			value: props.value || props.defaultValue || [],
		};
	}

	componentWillReceiveProps(nextProps)
	{
		if('value' in nextProps)
		{
			this.setState({
				value: nextProps.value || [],
			});
		}
	}

	//[{value, label}] || ["j", "k"]
	getOptions()
	{
		const {options} = this.props;
        let opts = cloneDeep(options);

		return Array.from(opts)
		.map(option => {
			if(typeof option === 'string')
			{
				return {
					label: option,
					value: option,
				};
			}

            option.label = getLangTxt(option.label) || option.label;
			return option;
		});
	}

	handleMouseUp(e)
	{
		if(this.props.onMouseUp)
		{
			this.props.onMouseUp(e);
		}
	}

	handleClick(option, e)
	{
		const optionIndex = this.state.value.indexOf(option.value),
			value = [...this.state.value];

		if(optionIndex === -1)
		{
			value.push(option.value);
		}
		else
		{
			value.splice(optionIndex, 1);
		}

		if(!('value' in this.props))
		{
			this.setState({value});
		}

		const onChange = this.props.onChange;

		if(onChange)
		{
			onChange(value);
		}
	}

	render()
	{
		const {prefixCls, className, options, itemClassName} = this.props,
			{value} = this.state;

		let children;

		if(options && options.length > 0)
		{
			children = this.getOptions()
			.map(option => (
				<button key={option.key || option.value} type={'button'}
				        disabled={option.disabled}
				        className={classNames(prefixCls, {
					        [`${prefixCls}-item-checked`]: value.indexOf(option.value) !== -1,
				        }, itemClassName)}
				        onMouseUp={this.handleMouseUp.bind(this)}
				        onClick={this.handleClick.bind(this, option)}>
					{
						option.label
					}
				</button>
			));
		}

		//"nt-button-group nt-button-group-item-checked &itemClassName"
		//"nt-button-group $itemClassName"1

		const classString = classNames(prefixCls, className); //nt-button-group ""

		return (
			<div className={classString}>
				{children}
			</div>
		);
	}
}

export default NTButtonGroup;
