import React from 'react'
import { Form, Input, Modal, Tooltip } from 'antd';
import { getLangTxt, loginUser } from "../../../utils/MyUtil";
import { bglen } from "../../../utils/StringUtils";

const FormItem = Form.Item;

class GroupItem extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		this.state = {
			edit: false
		}
	}
	
	//个人话术条目可修改状态
	editor()
	{
		this.setState({
			edit: true
		});
	}
	
	//判断个人话术条目是否仅输入空格 isTitle: true(标题) false(内容)
	judgeSpace(isTitle, rule, value, callback)
	{
		
		let maxLen = 24,
			errorMsg = getLangTxt("personalset_common_word_note1");
		if(!isTitle)
		{
			maxLen = 1000;
			errorMsg = getLangTxt("getLangTxt");
		}
		
		if(value && value.trim() !== "" && bglen(value) <= maxLen)
		{
			callback();
		}
		callback(errorMsg);
	}
	
	//保存个人话术条目修改信息
	saveEdit(obj)
	{
		let {form} = this.props;
		
		form.validateFields((errors) => {
			if(errors)
				return false;
			
			obj.type = 1;
			obj.title = this.props.form.getFieldValue("text");
			obj.response = this.props.form.getFieldValue("textarea");
			obj.editrank = 0;
			obj.userid = loginUser().userId;
			
			this.props.editorTips(obj);
			this.setState({edit: false});
		});
	}
	
	//删除个人话术条目
	delTips(obj)
	{
		Modal.confirm({
			title: getLangTxt("del_tip"),
			width: '320px',
			iconType: 'exclamation-circle',
			className: 'warnTip',
			content: getLangTxt("del_content"),
			onOk: () => {
				this.props.removeTips(obj)
			},
			onCancel: () => {
			
			}
		});
	}
	
	render()
	{
		const {getFieldDecorator} = this.props.form;
		let {item, gid} = this.props,
			obj = {
				groupId: gid,
				itemId: item.itemId
			},
			iconStyles = {display: 'inline-block', width: '26px', cursor: 'pointer'};
		
		return (
			<div className='group-items items'>
				<div className="item-title">
					{
						this.state.edit ?
							<FormItem>
								{
									getFieldDecorator('text', {
										initialValue: item.title,
										rules: [{validator: this.judgeSpace.bind(this, true)}]
									})(
										<Input type='text'/>
									)
								}
							</FormItem> :
							<span style={{
								paddingLeft: '16px', width: "calc(100% - 100px)", overflow: "hidden",
								textOverflow: "ellipsis", whiteSpace: "nowrap"
							}}>{item.title}</span>
					}
					<span className="itemRangeBtn">
                        <Tooltip placement="bottom" title={getLangTxt("move_up")}>
                            <i className="iconfont icon-shangyi"
                               onClick={this.props.handleRankItem.bind(this, item, -1)}/>
                        </Tooltip>
                        <Tooltip placement="bottom" title={getLangTxt("move_down")}>
                            <i className="iconfont icon-xiayi" onClick={this.props.handleRankItem.bind(this, item, 1)}/>
                        </Tooltip>
                        <Tooltip placement="bottom" title={getLangTxt("del")}>
                            <i className='icon-shanchu iconfont' onClick={this.delTips.bind(this, obj)}
                               style={iconStyles}/>
                        </Tooltip>
						{
							this.state.edit ?
								<Tooltip placement="bottom" title={getLangTxt("save")}>
									<i className='iconfont icon-baocun' onClick={this.saveEdit.bind(this, obj)}
									   style={iconStyles}/>
								</Tooltip>
								:
								<Tooltip placement="bottom" title={getLangTxt("edit")}>
									<i className='icon-bianji iconfont' onClick={this.editor.bind(this)}
									   style={iconStyles}/>
								</Tooltip>
						}
                    </span>
				
				
				</div>
				
				<div className='item-con'>
					{
						this.state.edit ?
							<FormItem>
								{
									getFieldDecorator('textarea', {
										initialValue: item.response,
										rules: [{validator: this.judgeSpace.bind(this, false)}]
									})(
										<Input type='text'/>
									)
								}
							</FormItem> :
							<span className="itemContent">{item.response}</span>
					}
				</div>
			</div>
		);
	}
}

GroupItem = Form.create()(GroupItem);
export default GroupItem;
