import React from "react"
import { Select } from "antd"
import TranslateProxy from "../../../../model/chat/TranslateProxy";

const Option = Select.Option;

class LangList extends React.Component {
	constructor(props)
	{
		super(props);
		
		this.langList = require("../../../../locale/lang.json") || [];
		
		if(!props.disabled)
		{
			this.destLanguage = localStorage.getItem("dest_language") || "en";
			TranslateProxy.DEST_LANGUAGE = this.destLanguage;
		}
	}
	
	componentWillReceiveProps(nextProps)
	{
		if(nextProps.disabled)
		{
			TranslateProxy.DEST_LANGUAGE = "";
		}
	}
	
	handleChange(value)
	{
		if(this.props.selectedKey)
		{
			this.props.selectedKey(value);
		}
		
		TranslateProxy.DEST_LANGUAGE = value;
		
		localStorage.setItem("dest_language", value);
	}
	
	render()
	{
		return (
			<Select showSearch style={{width: 100}} defaultValue={this.destLanguage} optionFilterProp="children" placeholder="选择语言"
			        onChange={this.handleChange.bind(this)} disabled={this.props.disabled}
			        filterOption={(input, option) => option.props.children.toLowerCase()
			        .indexOf(input.toLowerCase()) >= 0}>
				{
					this.langList.map(value => <Option value={value.key}>{value.label}</Option>)
				}
			</Select>
		);
	}
	
}

export default LangList;