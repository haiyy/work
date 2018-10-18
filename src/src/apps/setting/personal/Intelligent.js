import React from 'react'
import ReactDOM from "react-dom";
import { Select, Button, Form, Modal } from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getIntelligent, setIntelligent, clearIntelligentProgress } from './action/personalSetting';
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";
import { _getProgressComp, getLangTxt } from "../../../utils/MyUtil";
import Keyboard from "../../../utils/Keyboard";

const Option = Select.Option,
	noContainKeys = ["Shift", "Alt", "Control", "Enter"];

class Intelligent extends React.Component {
	
	constructor(props)
	{
		super(props);
		
		this.state = {ctrl: "", key: ""};
	}
	
	componentDidMount()
	{
		this.props.getIntelligent();
	}
	
	componentDidUpdate()
	{
		if(this.intelligent)
		{
			this.intelligent.innerText = this.state.key;
		}
	}
	
	onCancel()
	{
		this.props.onCancel(false);
	}
	
	onOk()
	{
		let {ctrl, key} = this.state,
			obj = {
				intelligent: ctrl + "+" + key
			};
		
		this.props.setIntelligent(obj)
		.then(({jsonResult}) => {
			if(jsonResult && jsonResult.code === "200")
			{
				this.props.getIntelligent();
			}
		});
	}
	
	componentWillReceiveProps(nextProps)
	{
		let {progress: nextProgress} = nextProps,
			{progress: thisProgress} = this.props;
		
		if(thisProgress === LoadProgressConst.SAVING_SUCCESS)
		{
			// this.props.onCancel();
			this.props.clearIntelligentProgress()
		}
		
		if(nextProgress !== thisProgress)
		{
			if(nextProgress === LoadProgressConst.SAVING_FAILED)
			{
				this.getSavingErrorMsg();
			}
		}
	}
	
	getSavingErrorMsg()
	{
		Modal.error({
			title: getLangTxt("tip1"),
			iconType: 'exclamation-circle',
			className: 'errorTip',
			content: <div>{getLangTxt("20034")}</div>,
			okText: getLangTxt("sure"),
			width: '320px',
			onOk: () => {
				this.props.clearIntelligentProgress()
			}
		});
	}
	
	_onKeyDown({keyCode})
	{
		let keyName = Keyboard.getKeyName(keyCode);
		
		//
		//if(keyCode === 229 && nativeEvent && nativeEvent.code) //中文输入
		//{
		//	keyName = nativeEvent.code.replace("Key", "");
		//}
		
		if(noContainKeys.includes(keyName))
			return;
		
		if(this.intelligent)
		{
			this.state.key = keyName;
			
			let id = setTimeout(() => {
				clearTimeout(id);
				
				this.intelligent.innerText = keyName;
				
				let node = ReactDOM.findDOMNode(this.intelligent);
				
				var range = document.createRange(),
					selection = getSelection();
				
				range.selectNodeContents(node);
				range.setStart(node, keyName.length);
				range.collapse(true);
				selection.removeAllRanges();
				selection.addRange(range);
				
			}, 10);
		}
	}
	
	_onRestore()
	{
		this.setState({ctrl: "Ctrl", key: "Q"});
	}
	
	reFreshFn()
	{
		this.props.getIntelligent();
	}
	
	onSelect(value)
	{
		this.setState({ctrl: value});
	}
	
	render()
	{
		let {intelData: {intelligent = ""}, progress} = this.props,
			shortCut = intelligent.split("+"),
			{ctrl, key} = this.state;
		
		this.state.ctrl = ctrl || shortCut[0];
		this.state.key = key || shortCut[1];
		
		if(progress === LoadProgressConst.LOAD_FAILED)
			return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;
		
		return (
			<div className="intelligent personalise">
				<div className="intelligent-head">
					<Select style={{width: 100}} value={this.state.ctrl} onSelect={this.onSelect.bind(this)}>
						<Option value="Ctrl">Ctrl</Option>
						<Option value="Alt">Alt</Option>
					</Select>
					<div ref={(node) => this.intelligent = node} className="intelligent-head-div" contentEditable="true"
					     tabIndex={2} onKeyDown={this._onKeyDown.bind(this)}>
						{
							this.state.key
						}
					</div>
					
					<span style={{color: '#999'}}>{getLangTxt("personalset_int_switch_note")}</span>
				</div>
				
				<Button type="primary" style={{width: "100px", margin: '20px 0 0 35px'}}
				        onClick={this._onRestore.bind(this)}>{getLangTxt("restore_default")}</Button>
				
				<div className="footer">
					<Button type="ghost" onClick={this.onCancel.bind(this)}>{getLangTxt("cancel")}</Button>
					<Button type="primary" onClick={this.onOk.bind(this)}>{getLangTxt("sure")}</Button>
				</div>
				{
					_getProgressComp(progress, "submitStatus userSaveStatus")
				}
			</div>
		)
	}
}

function mapStateToProps(state)
{
	let {personalReducer} = state,
		intelligent = personalReducer.get("intelligent") || Map(),
		intelData = intelligent.get("data") || {intelligent: "Alt+Q"},
		progress = intelligent.get("progress");
	
	console.log("mapStateToProps progress", progress);
	return {
		intelData,
		progress
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getIntelligent, setIntelligent, clearIntelligentProgress}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Intelligent);
