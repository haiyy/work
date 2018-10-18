import React from 'react'
import { Form, Input, Button, Card, Modal, Tooltip } from 'antd';
import GroupItem from './GroupItem';
import { connect } from 'react-redux';
import { getLangTxt, upOrDown } from "../../../utils/MyUtil";
import { bglen } from "../../../utils/StringUtils";
import "./style/GroupCard.scss";

const FormItem = Form.Item;

class GroupCard extends React.PureComponent {
	constructor(props)
	{
		super(props);
		this.state = {
			visible: false,
			show: false,
			newTips: false,
			hide: this.props.new,
			cancel: this.props.cancel,
			isEditGroupName: false
		}
	}
	
	//isTitle: true(标题) false(内容)
	judgeSpace(isTitle, rule, value, callback)
	{
		let maxLen = 24,
			errorMsg = getLangTxt("personalset_common_word_note1");
		if(!isTitle)
		{
			maxLen = 1000;
			errorMsg = getLangTxt("personalset_common_word_note2");
		}
		
		if(value && value.trim() !== "" && bglen(value) <= maxLen)
		{
			callback();
		}
		callback(errorMsg);
	}
	
	addTipsGroup()
	{
		let {form} = this.props;
		
		form.validateFields((errors) => {
			if(errors)
				return false;
			if(this.props.newGroup && !this.state.visible)
			{
				let obj = {
					groupName: this.props.form.getFieldValue("text"),
					userid: this.props.operatingUserId
				};
				this.props.newTipsGroup(obj);
				this.props.isCancel(true);
				this.props.afterCreate(false);
				this.setState({visible: false, show: false, cancel: !this.props.cancel});
			}
		});
		
	}
	
	//双击组名进入编辑状态
	isEditGroupName()
	{
		this.setState({
			isEditGroupName: true
		})
	}
	
	//input失去焦点保存组名修改
	editGroupName(groupItemData)
	{
		let {form} = this.props;
		form.validateFields((errors) => {
			if(errors)
				return false;
			let obj = {
				groupName: this.props.form.getFieldValue("text"),
				groupId: groupItemData.groupId,
				userid: this.props.operatingUserId
			};
			this.props.editTipsGroup(obj);
			this.setState({
				isEditGroupName: false
			});
		});
	}
	
	addGroupCard()
	{
		this.setState({
			newTips: true
		})
	}
	
	editTipsGroup(gid)
	{
		let {form} = this.props;
		
		form.validateFields((errors) => {
			if(errors)
				return false;
			let data = {
				groupId: gid,
				userid: this.props.operatingUserId,
				title: this.props.form.getFieldValue("textTitle"),
				response: this.props.form.getFieldValue("textContainer"),
				type: 1
			};
			
			if(gid && this.state.newTips)
			{
				this.props.newTips(data);
				this.setState({newTips: false});
			}
		});
		
	}
	
	changeShow(gid)
	{
		
		this.setState({
			show: !this.state.show,
			visible: !this.state.visible,
			newTips: false
		});
	}
	
	cancelCreate()
	{
		this.props.isCancel(true);
		this.props.afterCreate(false);
		this.setState({hide: !this.state.hide, cancel: !this.props.cancel});
	}
	
	delGroup(gid)
	{
		Modal.confirm({
			title: getLangTxt("del_tip"),
			width: '320px',
			iconType: 'exclamation-circle',
			className: 'warnTip',
			content: getLangTxt("del_content"),
			onOk: () => {
				if(gid)
				{
					let obj = {
						groupId: gid,
						userid: this.props.operatingUserId
					};
					this.props.removeTipsGroup(obj)
				}
			},
			onCancel: () => {
			
			}
		});
	}
	
	//个人常用话术条目排序
	handleRankItem(rankItem, up)
	{
		let {groupItemData = {fastResponses: []}} = this.props,
			{fastResponses = []} = groupItemData,
			rankItemIds = [rankItem && rankItem.itemId];
		let rangeArray = upOrDown(fastResponses, rankItemIds, "itemId", up);
		
		if(rankItemIds.length < 1)
			return;
		
		if(rangeArray && rangeArray.length > 0)
			this.props.editPersonTipsRank(rangeArray);
		
		this.setState({
			rangeDone: !this.state.rangeDone
		});
	}
	
	newPersonTips()
	{
		const {getFieldDecorator} = this.props.form;
		return (<div className='group-card-con'>
			<FormItem>
				{getFieldDecorator('textTitle', {
					rules: [{validator: this.judgeSpace.bind(this, true)}]
				})(
					<Input placeholder={getLangTxt("setting_common_word_title")} type='text'/>
				)}
			</FormItem>
			<FormItem style={{width: '100%', height: '80px'}}>
				{getFieldDecorator('textContainer', {
					rules: [{validator: this.judgeSpace.bind(this, false)}]
				})(
					<Input placeholder={getLangTxt("setting_common_word_content")} type="textarea" id="textarea"
					       style={{width: '100%', height: '80px', resize: "none"}}
					       name="textarea"/>
				)}
			</FormItem>
		</div>)
	}
	
	render()
	{
		const {getFieldDecorator} = this.props.form;
		let _style;
		if(!this.state.cancel)
		{
			_style = {width: '100%', margin: '10px 0 20px 0', padding: '10px 15px', position: 'relative'};
		}
		else
		{
			_style = {display: 'none'};
		}
		
		let { groupItemData = {}, leng=0, ind=0 } = this.props;

		return (
			<Card style={_style}>
				{
					this.state.show || this.props.new ? (
							<div className="personTipsStyle">
								<div className='group-card-head'>
									{
										this.state.isEditGroupName || this.props.new ?
											<FormItem>
												{getFieldDecorator('text', {
													initialValue: groupItemData.groupName || "",
													rules: [{
														validator: this.judgeSpace.bind(this, true)
													}]
												})(
													this.state.visible ?
														<Input autoFocus type='text'
														       onBlur={this.editGroupName.bind(this, groupItemData)}/>
														:
														<Input autoFocus="autofocus" type='text'/>
												)}
											</FormItem>
											:
											<span className="unEditGroupName"
											      onDoubleClick={this.isEditGroupName.bind(this)}>
                                                {groupItemData.groupName}
                                            </span>
										
									}
									
									{
										this.state.hide ? null :
											<span>
                                            {
	                                            this.state.visible ?
		                                            <Tooltip placement="bottom" title={getLangTxt("setting_webview_takeup")}>
			                                            <i className="icon-xiala-xiangshang iconfont"
			                                               onClick={this.changeShow.bind(this)}
			                                               style={{
				                                               float: 'right', marginTop: '5px', cursor: 'pointer'
			                                               }}/>
		                                            </Tooltip>
		                                            :
		                                            <Tooltip placement="bottom" title={getLangTxt("setting_webview_open")}>
			                                            <i className="icon-xiala iconfont"
			                                               onClick={this.changeShow.bind(this)}
			                                               style={{
				                                               float: 'right', marginTop: '5px', cursor: 'pointer'
			                                               }}/>
		                                            </Tooltip>
	
                                            }
                                        </span>
									}
									{
										this.state.hide ?
											<i className="icon-guanbi1 iconfont"
											   onClick={this.cancelCreate.bind(this)}
											   style={{
												   float: 'right', marginTop: '5px', marginRight: '5px', cursor: 'pointer'
											   }}/>
											:
											<span className="rangeBtnXiaLa">
                                            <Tooltip placement="bottom" title={getLangTxt("move_up")}>
                                                <i className="iconfont icon-shangyi"
                                                   onClick={this.props.handleRank.bind(this, groupItemData, -1)}/>
                                            </Tooltip>
                                            <Tooltip placement="bottom" title={getLangTxt("move_down")}>
                                                <i className="iconfont icon-xiayi"
                                                   onClick={this.props.handleRank.bind(this, groupItemData, 1)}/>
                                            </Tooltip>
                                            <Tooltip placement="bottom" title={getLangTxt("del")}>
                                                <i className="icon-shanchu iconfont"
                                                   onClick={this.delGroup.bind(this, groupItemData.groupId)}/>
                                            </Tooltip>
                                        </span>
									}
								
								</div>
								{
									groupItemData.fastResponses ? groupItemData.fastResponses.map((item, index) => {
										return (
											<GroupItem
												getTipsData={this.props.getTipsData}
												getPersonTipsAll={this.props.getPersonTipsAll}
												newTips={this.props.newTips}
												editorTips={this.props.editorTips}
												handleRankItem={this.handleRankItem.bind(this)}
												removeTips={this.props.removeTips}
												gid={groupItemData.groupId} item={item} key={index}
											/>
										);
									}) : null
								}
								{
									this.state.newTips ? this.newPersonTips() : null
								}
								
								<div className='group-card-foot'>
									{
										this.state.hide ? null :
											<Button onClick={this.addGroupCard.bind(this)}
											        disabled={this.state.newTips}>{getLangTxt("personalset_common_word_add")}</Button>
									}
									{
										this.state.visible ?
											this.state.newTips ?
												<Button onClick={this.editTipsGroup.bind(this, groupItemData.groupId)}
												        type="primary" style={{marginLeft: '15px'}}> {getLangTxt("save")} </Button>
												:
												null
											:
											<Button onClick={this.addTipsGroup.bind(this)} type="primary"
											        style={{marginLeft: '15px'}}> {getLangTxt("save")} </Button>
									}
								</div>
							</div>
						)
						:
						(
							this.state.cancel ? null :
								<div className='group-card-small'>
									<FormItem>
										{
											getFieldDecorator('hobby')(
												<div className="groupNameShow">{groupItemData.groupName}</div>
											)
										}
									</FormItem>
									{
										this.state.visible ?
											<Tooltip placement="bottom" title={getLangTxt("setting_webview_takeup")}>
												<i className="icon-xiala-xiangshang iconfont"
												   onClick={this.changeShow.bind(this)}
												   style={{
													   float: 'right', position: 'absolute', right: '0', top: '5px',
													   cursor: 'pointer'
												   }}/>
											</Tooltip>
											
											:
											<Tooltip placement="bottom" title={getLangTxt("setting_webview_open")}>
												<i className="icon-xiala iconfont"
												   onClick={this.changeShow.bind(this, groupItemData.groupId)}
												   style={{
													   float: 'right', position: 'absolute', right: '0', top: '5px',
													   cursor: 'pointer'
												   }}/>
											</Tooltip>
										
									}
									<span className="rangeBtn">
                                        <Tooltip placement="bottom" title={getLangTxt("move_up")}>
											<i className={ind == 0 ? "iconfont icon-shangyi styleColor" : "iconfont icon-shangyi"}	
                                               onClick={this.props.handleRank.bind(this, groupItemData, -1)}/>
                                        </Tooltip>
                                        <Tooltip placement="bottom" title={getLangTxt("move_down")}>
                                            <i className={ind+1 == leng ? "iconfont icon-xiayi styleColor" : "iconfont icon-xiayi"}
                                               onClick={this.props.handleRank.bind(this, groupItemData, 1)}/>
                                        </Tooltip>
                                        <Tooltip placement="bottom" title={getLangTxt("del")}>
                                            <i className="icon-shanchu iconfont"
                                               onClick={this.delGroup.bind(this, groupItemData.groupId)}
                                            />
                                        </Tooltip>
                                    </span>
								</div>
						)
				}
			</Card>
		)
	}
}

GroupCard = Form.create()(GroupCard);

function mapStateToProps(state)
{
	return {
		tableData: state.getPersonWords.data
	}
}

export default connect(mapStateToProps)(GroupCard);
