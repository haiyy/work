import React from 'react';
import Draft from 'draft-js';
import EditorToolbar from './editor/EditorToolbar';
import Color from './editor/Color';
import StyleButton from './StyleButton.js';
import '../../../../public/styles/chatpage/send/textEditor.scss';
import SmileyDict from "../../../../utils/SmileyDict";
import VersionControl from "../../../../utils/VersionControl";
import '../../../../public/styles/chatpage/send/sendText.scss';
import Trigger from 'rc-trigger';
import { getLangTxt } from "../../../../utils/MyUtil";
import TranslateProxy from "../../../../model/chat/TranslateProxy";

const {EditorState, Modifier, RichUtils, Entity, AtomicBlockUtils, convertToRaw} = Draft;
let kfStyle = {},
	visitorStyle = {},
	fontSize = "header-five",
	visitorFontSize = "14px",
	inlineStyles = new Map();

class TextEditorBase extends React.Component {

	inlineStyles = new Map();
	fontSize = "header-five";
	visitorFontSize = "14px";
	visitorStyle = VersionControl.VISITOR_FONT_STYLE;

	constructor(props)
	{
		super(props);

		this.state = {
			editorState: EditorState.createEmpty(),
			kfBoxStyle: {backgroundColor: '#000000'},
			visitorBoxStyle: {backgroundColor: '#000000'},
		};

		this.style = {};
	}

	componentDidCatch(error, info)
	{
		this.setState({editorState: EditorState.createEmpty()}, this.focus.bind(this));
	}

	componentWillMount()
	{
		this.state.kfBoxStyle = kfStyle;
		this.state.visitorBoxStyle = visitorStyle;
		this.fontSize = fontSize;
		this.inlineStyles = inlineStyles;
		this.visitorFontSize = visitorFontSize;
	}

	componentDidUpdate()
	{
		kfStyle = this.state.kfBoxStyle;
		visitorStyle = this.state.visitorBoxStyle;
		fontSize = this.fontSize;
		visitorFontSize = this.visitorFontSize;
		inlineStyles = this.inlineStyles;
	}

	/**
	 * 清理sendTexts，清除空Block和整理表情
	 * */
	_clearBlocks(sendTexts)
	{
		let blocks = sendTexts.blocks,
			entityMap = sendTexts.entityMap,
			text, inlineStyleRanges, entityRanges, type,
			offset, entity, block, smileBlock = null,
			canClear = true,
			hasAtomic = false;

		for(let i = blocks.length - 1; i >= 0; i--)
		{
			block = blocks[i];
			text = block.text;
			type = block.type;
			inlineStyleRanges = block.inlineStyleRanges;
			entityRanges = block.entityRanges;

			if(!text && (inlineStyleRanges.length <= 0 && entityRanges.length <= 0 && canClear || i == 0) )
			{
				blocks.splice(i, 1);
				continue;
			}
			
			canClear = false;

			if(SmileyDict.hasSmile(text) && entityRanges && entityRanges.length > 0)
			{
				if(smileBlock)
				{
					smileBlock.text = text + smileBlock.text;
					blocks.splice(i, 1);
					continue;
				}

				offset = entityRanges[0]["key"];
				entity = entityMap[offset];

				if(entity && entity.type === "image")
				{
					smileBlock = block;
					smileBlock.type = "header-five";

					delete entityMap[offset];
					delete block.data;
					delete block.inlineStyleRanges;
					delete block.entityRanges;
				}
				else
				{
					smileBlock = null;
				}
			}
			else
			{
				if(type === "atomic")
				{
					hasAtomic = true;
				}
				
				smileBlock = null;
			}
		}
		
		return hasAtomic;
	}

	_checkEmpty(blocks)
	{
		if(!blocks || blocks.length <= 0)
			return true;

		for(let i = 0, block, notEmpty, len = blocks.length; i < len; i++)
		{
			block = blocks[i];

			notEmpty = block.text.trim() || block.entityRanges.length > 0; //|| block.inlineStyleRanges.length > 0

			if(notEmpty)
				return false;
		}

		return true;
	}

	_getColorComp()
	{
		if(this.state.colorOff && this.props.isOpenTool)
		{
			if(this.state.nameColor === "customer")
			{
				return <div style={{position: 'absolute', top: '-395px', left: '0px', zIndex: '9999'}}>
					<Color onClose={this.focus.bind(this)} selectColor={this.setColor.bind(this)}/>
				</div>;
			}
			else
			{
				return <div style={{position: 'absolute', top: '-395px', right: '0px', zIndex: '9999'}}>
					<Color onClose={() => {
					}} selectColor={this._toggleVisitorStyle.bind(this, "color")}/>
				</div>;
			}
		}

		return null;
	}

	replayInlineStyle(editorState, currentStyle)
	{
		if(this.inlineStyles.size > 0)
		{
			this.inlineStyles.forEach((value, key) => {
				if(value && !currentStyle.has(key))
				{
					editorState = RichUtils.toggleInlineStyle(editorState, key);
				}
			});
		}

		return editorState;
	}

	//整合颜色
	toggleColor(toggledColor, colorStyleMap)
	{
		const {editorState} = this.state,
			selection = editorState.getSelection(),
			nextContentState = Object.keys(colorStyleMap)
			.reduce((contentState, color) => {
				return Modifier.removeInlineStyle(contentState, selection, color)
			}, editorState.getCurrentContent());

		let nextEditorState = EditorState.push(
			editorState,
			nextContentState,
			'change-inline-style'
		);

		const currentStyle = editorState.getCurrentInlineStyle();

		if(selection.isCollapsed())
		{
			nextEditorState = currentStyle.reduce((state, color) => {
				return RichUtils.toggleInlineStyle(state, color);
			}, nextEditorState);
		}

		if(!currentStyle.has(toggledColor))
		{
			nextEditorState = RichUtils.toggleInlineStyle(
				nextEditorState,
				toggledColor
			);
		}

		this.onChange(nextEditorState);
	}

	editorEmp()
	{
		let nextEditorState = EditorState.createEmpty();

		this.onChange(nextEditorState);
	}

	//媒体相关 image audio video
	mediaBlockRenderer(block)
	{ // 固定写法 赋值给Editor组件的 blockRendererFn属性
		if(block.getType() === 'atomic')
		{
			return {
				component: Media,  // 为JSX 已在全局定义
				editable: false,
			};
		}
		return null;
	}

	confirmMedia(src, text = " ", alt = "", isEmpty)
	{
		if(typeof src !== "string")
			return;

		let editorState;

		if(isEmpty)
		{
			editorState = EditorState.createEmpty();
		}
		else
		{
			editorState = this.state.editorState;
		}

		text = text ? text : " ";

		//主函数,整合 atomic 对象 （图片，音视频）
		const entityKey = Entity.create("image", "IMMUTABLE", {src, alt}),
			newEditorState = AtomicBlockUtils.insertAtomicBlock(
				editorState,
				entityKey,
				text
			);

		this.chatData.inputtingTranslate = "";
		this.setState({
				editorState: newEditorState
			},
			() => {
				setTimeout(() => this.focus(), 0);
			});
	}

	insertImage(url, isEmpty = false)
	{
		if(Array.isArray(url) && url.length === 3)
		{
			let tip = url[0],
				fileName = url[2] + ".png",
				imgPath = require("../../../../public/images/emoji/" + fileName);

			this.confirmMedia(imgPath, tip, tip, isEmpty);
		}
		else if(Array.isArray(url) && url.length === 2)
		{
			let tip = url[1],
				imgPath = url[0];

			this.confirmMedia(imgPath, " ", tip, isEmpty);
		}
		else
		{
			this.confirmMedia(url, " ", "", isEmpty);
		}

	}

	// 字体相关
	toggleInlineStyle(inlineStyle, selected)
	{
		this.inlineStyles.set(inlineStyle, selected);

		if(selected)
		{
			let kfBoxStyle = {...this.state.kfBoxStyle, [inlineStyle]: inlineStyle};

			this.state.kfBoxStyle = kfBoxStyle;
		}
		else
		{
			let kfBoxStyle = {...this.state.kfBoxStyle};

			delete kfBoxStyle[inlineStyle];

			this.state.kfBoxStyle = kfBoxStyle;

			//return;
		}

		this.focus();

		this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, inlineStyle));
	}

	_onVisitorChange(style)
	{
		this.visitorFontSize = style;

		if(this.visitorStyle)
		{
			this.visitorStyle.fontSize = style;
		}
	}

	_toggleVisitorStyle(inlineStyle, selected)
	{
		if(inlineStyle === "color")
		{
			this.setState({visitorBoxStyle: {backgroundColor: selected}});
		}

		let prop = inlineStyle.toLowerCase();
		if(this.visitorStyle)
		{
			this.visitorStyle[prop] = selected;

			if(selected)
			{
				let visitorBoxStyle = {...this.state.visitorBoxStyle, [inlineStyle]: inlineStyle};

				this.state.visitorBoxStyle = visitorBoxStyle;
			}
			else
			{
				let visitorBoxStyle = {...this.state.visitorBoxStyle};

				delete visitorBoxStyle[inlineStyle];

				this.state.visitorBoxStyle = visitorBoxStyle;
			}
		}
	}

	setColor()
	{

	}

	_getEditorTool()
	{
		if(this.props.isOpenTool)
		{
			const {editorState, kfBoxStyle, visitorBoxStyle} = this.state;

			return <div className="control-box">
				<div className="control user-box" style={{padding: '0 0 8px 0'}}>
					<span>{getLangTxt("kf_font")}</span>

					<EditorToolbar ref="kfTool" editorState={editorState} style={this.fontSize}
					               onChange={this.onChange.bind(this)} focusEditor={this.focus.bind(this)}/>

					<InlineStyleControls key="kfBox" boxStyle={this.state.kfBoxStyle}
					                     onToggle={this.toggleInlineStyle.bind(this)}/>

					<Trigger popupPlacement="top" showAction={["click"]} hideAction={['click']}
					         builtinPlacements={{top: {points: ['bc', 'tc'],}}} popupAlign={{offset: [-98, -8]}}
					         popup={<Color onClose={this.focus.bind(this)} selectColor={this.setColor.bind(this)}/>}>
						<button className='colorBtn' style={kfBoxStyle}
						        onClick={this.editorColor.bind(this, 'customer')}/>
					</Trigger>
				</div>

				<div className="control self-box" style={{padding: '0 0 8px 0'}}>
					<span>{getLangTxt("fk_font")}</span>

					<EditorToolbar mode="1" style={this.visitorFontSize} onChange={this._onVisitorChange.bind(this)}/>

					<InlineStyleControls key="visitorBox" editorState={editorState}
					                     boxStyle={this.state.visitorBoxStyle}
					                     onToggle={this._toggleVisitorStyle.bind(this)}/>

					<Trigger popupPlacement="top" showAction={["click"]} hideAction={['click']}
					         builtinPlacements={{top: {points: ['bc', 'tc'],}}} popupAlign={{offset: [-98, -8]}}
					         popup={<Color onClose={() => {
					         }} selectColor={this._toggleVisitorStyle.bind(this, "color")}/>}>
						<button className='colorBtn' style={visitorBoxStyle}
						        onClick={this.editorColor.bind(this, 'visitor')}/>
					</Trigger>
				</div>
			</div>;
		}

		return null;
	}

	focus()
	{
		if(this.refs.editor)
		{
			this.refs.editor.focus();
		}
	}

	logState()
	{
		const content = this.state.editorState.getCurrentContent(),
			rawContentState = convertToRaw(content);

		return rawContentState;
	}

	onChange(editorState)
	{
		try
		{
			const currentStyle = editorState.getCurrentInlineStyle();

			editorState = this._replayColor(editorState);

			if(currentStyle.size <= 0 && this.inlineStyles.size > 0)
			{
				editorState = this.replayInlineStyle(editorState, currentStyle);
			}

			if(this.refs.kfTool)
			{
				this.fontSize = this.refs.kfTool.style;
			}

			if(RichUtils.getCurrentBlockType(editorState) !== this.fontSize)
			{
				editorState = RichUtils.toggleBlockType(editorState, this.fontSize);
			}

			this.setState({editorState});
		}
		catch(e)
		{

		}
	}

	render()
	{
		return null;
	}

}

export default TextEditorBase;

const Image = (props) => {
	return <img src={props.src} style={{maxWidth: "100px", maxHeight: "100px"}}/>;
};

const Media = (props) => {
	const entityKey = props.block.getEntityAt(0);
	if(entityKey === null || entityKey === undefined)
	{
		return null;
	}

	const entity = Entity.get(entityKey);
	const {src} = entity.getData();
	const type = entity.getType();

	let media;
	if(type === 'audio')
	{
		media = <Audio src={src}/>;
	}
	else if(type === 'image')
	{
		media = <Image src={src}/>;
	}
	else if(type === 'video')
	{
		media = <Video src={src}/>;
	}

	return media;
};

let INLINE_STYLES = [
	{label: <i className="iconfont icon-jiacu"/>, style: 'BOLD'},
	{label: <i className="iconfont icon-xieti"/>, style: 'ITALIC'},
	{label: <i className="iconfont icon-xiahuaxian"/>, style: 'UNDERLINE'}
];

const InlineStyleControls = (props) => {
	return (
		<div className="RichEditor-controls" style={{display: 'inline-block', marginBottom: 0}}>
			{
				INLINE_STYLES.map(type => {
						let boxStyle = props.boxStyle, border = false;

						if(boxStyle)
							border = boxStyle[type.style] === type.style;

						return <StyleButton
							key={type.style}
							label={type.label}
							onToggle={props.onToggle}
							border={border}
							style={type.style}/>
					}
				)}
		</div>
	);
};
