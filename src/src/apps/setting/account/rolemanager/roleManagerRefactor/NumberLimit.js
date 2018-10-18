import React, { PropTypes } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Radio, Form, TreeSelect, Popover } from 'antd';
import { getAccountList, getAccountGroup } from "../../../../record/redux/consultReducer";
import { getLangTxt } from "../../../../../utils/MyUtil";

const FormItem = Form.Item, TreeNode = TreeSelect.TreeNode;

class NumberItem extends React.PureComponent {
	constructor(props)
	{
		super(props);
		this.state = {isShowSelf: false};
		this.accountGroupIds = [];
	}

	componentDidMount()
	{
		this.props.getAccountGroup();
		let {range = []} = this.props;

		if(range.length > 0)
		{
			range.forEach(item => {

                if (item.sourcetype === "kfid" && item.enabled === 1 && item.entityid)
                {
                    let groupIds = item.entityid.split(",");
                    groupIds.map(item=>{

                        new Promise((resolve) => {

                            setTimeout(() =>
                            {
                                this.props.getAccountList({groupid: item});
                                resolve();
                            }, 200);
                        });
                    })
                }
            })
        }
    }

	componentWillReceiveProps(nextProps)
	{
		if(nextProps.fieldRangeValue !== this.props.fieldRangeValue)
		{
			let {range = []} = this.props;
			if(range.length > 0)
			{
				range.forEach(item => {

					this.props.form.setFieldsValue({[item.fieldid]: []});
				})
			}
		}
	}

	/*数组去重*/
	uniqueAccountGroup(accountGroupIds)
	{
		var finalIds = [];//临时数组
		for(var i = 0; i < accountGroupIds.length; i++)
		{
			if(finalIds.indexOf(accountGroupIds[i]) == -1) finalIds.push(accountGroupIds[i]);
		}
		return finalIds;
	}

	/*数字权限选择指定客服*/
	handleChange(itemInfo, value, label, extra)
	{

        let {checked, triggerNode = {props:{}}} = extra,
            {props:triggerProps = {root:{}}} = triggerNode,
            {root = {state:{}}} = triggerProps,
            {state = {expandedKeys: []}, props = []} = root,
            {expandedKeys = []} = props,
            fieldValue = this.props.form.getFieldValue(itemInfo.fieldid);

		expandedKeys.forEach(item => {
			this.accountGroupIds.push(item)
		});

		this.accountGroupIds = this.uniqueAccountGroup(this.accountGroupIds);

        itemInfo.ranges = value.filter(item => item !== "all").toString();
        itemInfo.expression = "in";
        itemInfo.entityid = this.accountGroupIds.toString();

        if (value.indexOf('all') >= 0 && fieldValue.indexOf('all') < 0)
        {
            itemInfo.expression = "all";
            itemInfo.ranges = "all";
        }
    }

	/*数字权限加载分组下内容*/
	getAccountListData(node)
	{
		let {eventKey = "", isGroup} = node.props;

		return new Promise((resolve) => {
			if(isGroup === 1)
			{
				this.props.getAccountList({groupid: eventKey});
				resolve();
			}
		});
	}

	/*客服树组件*/
	createUserAccountTreeNodes(mainkfsGroup)
	{
		if(!mainkfsGroup || !Array.isArray(mainkfsGroup))
			return null;

		return mainkfsGroup.map(item => {
			let isGroup = item.hasOwnProperty("children");
			const {groupid, groupname, children = []} = item;

			if(isGroup)
			{
				let disableCheckbox = children.length <= 0;

				return (
					disableCheckbox ?
						<TreeNode key={groupid} title={groupname} value={groupname} data={item} isGroup={1}
						          disableCheckbox={disableCheckbox}>
							<TreeNode key={groupid + "_"} title={getLangTxt("noData3")}
							          disableCheckbox={disableCheckbox}/>
						</TreeNode>
						:
						<TreeNode key={groupid} title={groupname} value={groupname} data={item} isGroup={1}
						          disableCheckbox={disableCheckbox}>
							{
								this.createUserAccountTreeNodes(children)
							}
						</TreeNode>
				);
			}

			return this.getAccountListComp(item);
		});
	}

	getAccountListComp(item)
	{
		let {externalname, nickname, userid} = item, username = "";

		if(externalname && nickname)
		{
			username = nickname + "[" + externalname + "]";
		}
		else if(externalname || nickname)
		{
			username = externalname || nickname;
		}
		else
		{
			username = userid;
		}

		return <TreeNode key={userid} title={username} value={userid} isLeaf={true}/>;
	}

	/*行政组树组件*/
	getAccountGroupTree(groupList)
	{

		return groupList.map(item => {
			let {groupid, groupname} = item;
			groupid = String(groupid);

			if(item.children && item.children.length > 0)
			{
				return (
					<TreeNode value={groupid} title={groupname} key={groupid}>
						{
							this.getAccountGroupTree(item.children)
						}
					</TreeNode>
				);
			}
			return <TreeNode value={groupid} title={groupname} key={groupid}/>;
		});
	}

	selectAll(value, prevValue = [])
	{
		if(value.indexOf('all') >= 0 && prevValue.indexOf('all') < 0)
		{
			return ['all'];
		}

		return value.filter(item => item !== "all");
	}

    /*数字权限选择行政组*/
    onSelectGroup(item, value)
    {
        item.ranges = value.filter(item => item !== "all").join(",");
        item.expression = "in";
        if (value.indexOf('all') >= 0 && value[value.length-1] === 'all')
        {
            item.expression = "all";
            item.ranges = "all";
        }
    }

	render()
	{
		let {groupList = [], consultData, form, range, shopGroup = []} = this.props,
			mainkfsGroup = consultData.getIn(["account", "data"]),
			{getFieldDecorator} = form;

		return range.map((item, index) => {
			let selectedGroup = [];

			if(item.ranges && item.expression === 'in' && item.ranges !== 'own' || item.expression === 'all')
				selectedGroup = item.ranges.split(",");

			if(item.sourcetype === "kfid")
			{
				return <span className="limitRadioBox">
                            <Radio defaultChecked value={item.fieldid}>{getLangTxt("setting_role_dos_label7")}</Radio>
                            <Radio value={item.fieldid + 'cust'}>{getLangTxt("setting_role_dos_label8")}</Radio>
                            <FormItem className="roleGroupTreeBox">
                                {getFieldDecorator(item.fieldid, {
	                                initialValue: selectedGroup,
	                                normalize: this.selectAll
                                })(
	                                <TreeSelect treeCheckable
	                                            className="groupSelectComp"
	                                            getPopupContainer={() => document.getElementsByClassName('createRoleScroll')[0]}
	                                            disabled={item.expression == null || item.expression == "="}
	                                            dropdownStyle={{maxHeight: 300, overflow: 'auto'}}
                                                dropdownClassName="limitGroupSelectDropDown"
	                                            onChange={this.handleChange.bind(this, item)}
	                                            loadData={this.getAccountListData.bind(this)}
	                                >
		                                {this.createUserAccountTreeNodes(mainkfsGroup)}
		                                <TreeNode title={<div>{getLangTxt("rightpage_all")}</div>} value="all"
		                                          isLeaf={true}/>
	                                </TreeSelect>
                                )}
                            </FormItem>
                        </span>;
			}
			else if(item.sourcetype === "group")
			{
				return <span className="limitRadioBox">
                            <Radio defaultChecked value={item.fieldid + 'self'}>{getLangTxt("setting_role_dos_label9")}</Radio>
                            <Radio value={item.fieldid + 'group'}>{getLangTxt("setting_role_dos_label10")}</Radio>
                            <FormItem className="roleGroupTreeBox">
                                {getFieldDecorator(item.fieldid, {
	                                initialValue: selectedGroup,
	                                normalize: this.selectAll
                                })(
	                                <TreeSelect className="groupSelectComp" multiple disabled={item.expression == "="}
	                                            getPopupContainer={() => document.getElementsByClassName('createRoleScroll')[0]}
	                                            disabled={item.expression == null || item.expression == "="}
	                                            treeDefaultExpandAll dropdownStyle={{maxHeight: 300, overflow: 'auto'}}
	                                            dropdownClassName="limitGroupSelectDropDown"
	                                            onChange={this.onSelectGroup.bind(this, item)}>
		                                {
			                                this.getAccountGroupTree(groupList)
		                                }
		                                <TreeNode title={<div>{getLangTxt("rightpage_all")}</div>} value="all"/>
	                                </TreeSelect>
                                )}
                            </FormItem>
                        </span>;
			}
            else if(item.sourcetype === "merchant")
			{
				return <span className="limitRadioBox">
                            <Radio value={item.fieldid}>{getLangTxt("setting_role_dos_label11")}</Radio>
                            <FormItem className="roleGroupTreeBox">
                                {getFieldDecorator(item.fieldid, {
	                                initialValue: selectedGroup,
	                                normalize: this.selectAll
                                })(
	                                <TreeSelect className="groupSelectComp" multiple disabled={item.expression == "="}
	                                            getPopupContainer={() => document.getElementsByClassName('createRoleScroll')[0]}
	                                            disabled={item.expression == null || item.expression == "="}
	                                            treeDefaultExpandAll dropdownStyle={{maxHeight: 300, overflow: 'auto'}}
	                                            dropdownClassName="limitGroupSelectDropDown"
	                                            onChange={this.onSelectGroup.bind(this, item)}>
		                                {
			                                this.getAccountGroupTree(shopGroup)
		                                }
		                                <TreeNode title={<div>{getLangTxt("rightpage_all")}</div>} value="all"/>
	                                </TreeSelect>
                                )}
                            </FormItem>
                        </span>;
			}
			else
			{
				return <Radio value={item.fieldid}>{item.fieldname}</Radio>

			}
		})
	}
}

NumberItem = Form.create()(NumberItem);

function mapStateToProps(state)
{

	let {consultReducer1: consultData, personalReducer, shopAccountReducer} = state,
		infomation = personalReducer.get("infomation") || Map(),
		userData = infomation.get("data") || {},
        shopGroup = shopAccountReducer.get("shopGroupList") || Map();

	return {
		groupList: state.accountReducer.data,
		groupProgress: state.accountReducer.progress,
		accountList: state.getAccountList.data,
		progress: state.getAccountList.progress,
		consultData,
		userData,
        shopGroup
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getAccountGroup/*, getlListData*/, getAccountList}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(NumberItem);
