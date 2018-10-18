import React, { Component } from 'react';
import { EditorState, RichUtils } from 'draft-js';
import ButtonGroup from './ButtonGroup';
import Dropdown from './Dropdown';

const BLOCK_TYPE_DROPDOWN = [
	{label: '12', style: 'header-six'},
	{label: '14', style: 'header-five'},
	{label: '16', style: 'header-four'},
	{label: '18', style: 'header-three'},
	{label: '24', style: 'header-two'},
	{label: '32', style: 'header-one'}
];
const BLOCK_TYPE_DROPDOWN_VISTOR = [
	{label: '12', style: '12px'},
	{label: '14', style: '14px'},
	{label: '16', style: '16px'},
	{label: '18', style: '18px'},
	{label: '24', style: '24px'},
	{label: '32', style: '32px'}
];

export default class EditorToolbar extends Component {
	
	_style = "header-four";
	
	constructor(props)
	{
		super(props);
		
		this._style = props.style;
		
		if(props.mode === "1")
		{
			this.mode = BLOCK_TYPE_DROPDOWN_VISTOR;
		}
		else
		{
			this.mode = BLOCK_TYPE_DROPDOWN;
		}
	}
	
	componentWillReceiveProps(nextProps)
	{
		if(nextProps.style && nextProps.style !== this._style)
		{
			this._style = nextProps.style;
		}
	}
	
	get style()
	{
		return this._style;
	}
	
	set style(value)
	{
		this._style = value;
	}
	
	_renderBlockTypeDropdown()
	{
		let blockType = this._style,
			choices = new Map(this.mode.map((type) => [type.style, type.label]));
		
		if(!choices.has(blockType))
		{
			blockType = Array.from(choices.keys())[0];
		}
		
		return <ButtonGroup>
			<Dropdown choices={choices} selectedKey={blockType} onChange={this._selectBlockType.bind(this)}/>
		</ButtonGroup>;
	}
	
	_selectBlockType(style)
	{
		this._style = style;
		if(this.props.mode == "1" && typeof this.props.onChange === "function")
		{
			this.props.onChange(style);
			
			this.forceUpdate();
			return;
		}
		
		this._toggleBlockType(style);
		this._focusEditor();
	}
	
	_toggleBlockType(blockType)
	{
		if(typeof this.props.onChange === "function")
		{
			this.props.onChange(RichUtils.toggleBlockType(this.props.editorState, blockType));
		}
	}
	
	_focusEditor()
	{
		setTimeout(() =>
		{
			if(typeof this.props.focusEditor === "function")
			{
				this.props.focusEditor();
			}
		}, 0);
	}
	
	render()
	{
		return (
			<div style={{margin: '0 10px', position: 'relative', display: 'inline-block'}}>
				{
					this._renderBlockTypeDropdown()
				}
			</div>
		);
	}
}
