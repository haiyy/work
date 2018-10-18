import React, { PropTypes } from 'react'
import { Radio, Select, Form, Input, Tree, TreeSelect } from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchRules } from '../keyPage/action/essentialPages';
import { getVisitorData } from '../visitorsource/action/visitorSourceSetting';
import { getCity, getProvince, getRegion, getData, getUserRegionData } from "../company/redux/companyInfoReducer";
import { is, List, Map } from "immutable";
import TreeNode from "../../../components/antd2/tree/TreeNode";
import { getLangTxt } from "../../../utils/MyUtil";

const RadioButton = Radio.Button, Option = Select.Option,
	SHOW_PARENT = TreeSelect.SHOW_PARENT, FormItem = Form.Item;

let userDimensionsData = [
	{title: getLangTxt("select_dimension"), value: "", disabled: false},
	{title: getLangTxt("startpage"), value: "startpage", disabled: false},
	{title: getLangTxt("user_region"), value: "userregionid", disabled: false},
	{title: getLangTxt("user_tml"), value: "userterminal", disabled: false},
	{title: getLangTxt("user_source"), value: "usersource", disabled: false},
	{title: getLangTxt("user_keyword"), value: "keyword", disabled: false},
	{title: getLangTxt("user_identity"), value: "useridentity", disabled: false},
	{title: getLangTxt("source_page"), value: "referer", disabled: false},
	{title: getLangTxt("landing_page"), value: "landingpage", disabled: false}/*,
     {title: "自定义", value: "custom", disabled: false}*/];

let uuid = 0;

class UserFilterList extends React.Component {

	constructor(props)
	{
		super(props);

		this.state = {
			treeData: [],
			value: [],
			users: {},
			countryIds: []
		};
	}

	componentDidMount()
	{
		let {companyInfo, link, users = {matchRules: []}} = this.props,
			{setFieldsValue} = this.props.form,
			region = companyInfo.get("region") || List(),
			regionDataSuccess = region.get("success");

		this.props.getRegion(0);
		this.props.getVisitorData(-1);
		this.props.fetchRules();

		if(link == "new")
		{
			setFieldsValue({
				allFilterData: [{data: 0, type: "", include: "include", value: []}]
			})
		}
		else
		{
			if(this.props.editData)
			{

				let {rules = []} = this.props.editData,
					{setFieldsValue} = this.props.form,
					fieldValue,
					editorIds = [];
				if(rules.length > 0)
				{
					let editFilterData = [];

					uuid = rules.length - 1;

					rules.map((item, index) => {
						if(item.ruleKey === "userregionid")
						{
							let countryIds = [];
							item.ruleValue.map(singleIdString => {
								if(singleIdString.indexOf("/") !== -1)
								{
									let singleIdArray = singleIdString.split("/");
									singleIdArray.map((getId, index) => {
										if(index == singleIdArray.length - 1)
										{
											editorIds.push(getId);
										}
										if(index != 2)
										{
											countryIds.push(getId)
										}
									})
								}
								else
								{
									countryIds = item.ruleValue;

								}
							});

							countryIds = this.uniqueArray(countryIds);
							fieldValue = editorIds;
							if(fieldValue.length < 1)
							{
								fieldValue = item.ruleValue
							}

							this.setState({countryIds});

							countryIds.map(item => {

								new Promise((resolve) => {
									setTimeout(() => {
										getUserRegionData(countryIds.shift(), countryIds)
										.then(regions => {
											this.setState({treeData: regions});
											resolve();
										});
									}, 200);
								});
							});
						}
						else
						{
							fieldValue = item.ruleValue
						}
						editFilterData.push({
							data: index, type: item.ruleKey, include: item.ruleChar, value: fieldValue
						});
					});
					setFieldsValue({allFilterData: editFilterData});

				}
				else
				{
					setFieldsValue({
						allFilterData: [{data: 0, type: "", include: "include", value: []}]
					})
				}
			}
		}

		if(regionDataSuccess == undefined)
		{
			region.map((item) => {
				const name = item.get("name"),
					id = item.get("id");
				setTimeout(() => {
					this.setState({
						treeData: [
							{name: name, id: id}
						]
					});
				}, 100);
			})
		}

		userDimensionsData.forEach(item => {
			item.disabled = false
		})
	}

	uniqueArray(array)
	{
		var n = [];
		for(var i = 0; i < array.length; i++)
		{
			if(n.indexOf(array[i]) == -1) n.push(array[i]);
		}
		return n;
	}

	componentWillReceiveProps(props)
	{
		if(this.props.link == "editor" && !this.props.editData && props.users.name && !this.props.users.name)
		{
			let {users = {matchRules: []}} = props,
				{matchRules = []} = users,
				{setFieldsValue} = this.props.form,
				fieldValue,
				editorIds = [];
			if(matchRules.length > 0)
			{
				let editFilterData = [];

				uuid = matchRules.length - 1;

				matchRules.map((item, index) => {
					if(item.ruleKey === "userregionid")
					{
						let countryIds = [];
						item.ruleValue.map(singleIdString => {
							if(singleIdString.indexOf("/") !== -1)
							{
								let singleIdArray = singleIdString.split("/");
								singleIdArray.map((getId, index) => {
									if(index == singleIdArray.length - 1)
									{
										editorIds.push(getId);
									}
									if(index != 2)
									{
										countryIds.push(getId)
									}
								})
							}
							else
							{
								countryIds = item.ruleValue;

							}
						});

						countryIds = this.uniqueArray(countryIds);
						fieldValue = editorIds;
						if(fieldValue.length < 1)
						{
							fieldValue = item.ruleValue
						}

						this.setState({countryIds});

						countryIds.map(item => {

							new Promise((resolve) => {
								setTimeout(() => {
									getUserRegionData(countryIds.shift(), countryIds)
									.then(regions => {
										this.setState({treeData: regions});
										resolve();
									});
								}, 200);
							});
						});
					}
					else
					{
						fieldValue = item.ruleValue
					}
					editFilterData.push({data: index, type: item.ruleKey, include: item.ruleChar, value: fieldValue});
				});
				setFieldsValue({allFilterData: editFilterData});
				this.props.getUserFilterList(editFilterData);
			}
			else
			{
				setFieldsValue({
					allFilterData: [{data: 0, type: "", include: "include", value: []}]
				})
			}
		}
	}

	/*
	 * 设置每条规则type include value 值
	 * */

	setFilterValueCommon(currentFilterData, value, type)
	{
		let {form} = this.props,
			allFilterData = form.getFieldValue("allFilterData");

		allFilterData.forEach(item => {
			if(item.data == currentFilterData.data)
			{
				item[type] = value;
			}
		});
		form.setFieldsValue({allFilterData});

		this.props.getUserFilterList(allFilterData);

	}

	getTreeNode(allFilterData)
	{
		userDimensionsData.forEach(dimension => {
			allFilterData.forEach(item => {
				if(item.type === dimension.value)
				{
					dimension.disabled = true
				}
			})
		});

		return userDimensionsData.map((item) => {
			return (
				<Option key={item.title} value={item.value} disabled={item.disabled}>
					{item.title}
				</Option>
			)
		})
	}

	/*
	 * 用户维度选择
	 * */

	handleChange(currentFilterData, value)
	{
		let {form} = this.props,
			allFilterData = form.getFieldValue("allFilterData");

		userDimensionsData.find(item => {
			if(item.value == currentFilterData.type)
			{
				item.disabled = false
			}
		});
		allFilterData.forEach(item => {
			if(item.data == currentFilterData.data)
			{
				item.value = [];
			}
		});

		/*userDimensionsData = userDimensionsData.filter(item => item.value !== value);*/

		form.setFieldsValue({allFilterData});

		this.setState({changeFilterData: true});
		this.setFilterValueCommon(currentFilterData, value, "type");
	}

	/*
	 * 是否包含
	 * */

	changeInclude(currentFilterData, value)
	{
		this.setFilterValueCommon(currentFilterData, value, "include");
	}

	/*
	 * 关键页面选择值
	 * */

	changeKeyPage(currentFilterData, value)
	{
		if(typeof value === "string")
		{
			value = value && value.split();
		}

		this.setFilterValueCommon(currentFilterData, value, "value");
	}

	/*
	 * 地域选择
	 * */
	unique(arr)
	{
		const seen = new Map();
		return arr.filter((a) => !seen.has(a) && seen.set(a, 1));
	}

	onValueChange(currentFilterData, checkedKeys, value)
	{
		this.keys = [];
		let key = checkedKeys.filter(value => {
			return !currentFilterData.value.includes(value);
		});

		if(Array.isArray(key) && key.length === 1)
		{
			this.loadUserRegionData(key[0])
			.then(() => {
				this.getCheckedLoadData(this.state.treeData, key[0]);

				checkedKeys = this.unique(checkedKeys.concat(this.keys));
				this.setFilterValueCommon(currentFilterData, checkedKeys, "value");
			});
		}

		this.unique(checkedKeys);
		this.setFilterValueCommon(currentFilterData, checkedKeys, "value");
	}

	keys = [];

	getCheckedLoadData(data, checkeKey)
	{
		data.forEach(value => {
			if(!value || !value.children || !value.children.length)
				return;

			if(value.id === checkeKey)
			{
				this.keys = value.children.map(v => v.id);
			}
			else
			{
				this.getCheckedLoadData(value.children, checkeKey);
			}
		});
	}

	/*
	 * 异步加载数据
	 * */
	onLoadData(treeNode)
	{
		const {props = {eventKey: ""}} = treeNode,
			{eventKey = 0} = props;

		return new Promise(() => {
			setTimeout(() => {
				this.loadUserRegionData(eventKey);
			}, 200);
			resolve();
		});
	}

	loadUserRegionData(eventKey)
	{
		//const treeData = this.state.treeData;
		let ids = [eventKey];
		return getUserRegionData(ids.shift(), ids)
		.then(regions => {
			/*this.getNewTreeData(treeData, eventKey, this.generateTreeNodes(regions, eventKey), 3);*/
			this.setState({treeData: regions});
			return Promise.resolve();
		});
	}

	/*
	 * 移除筛选条件
	 * */
	remove(currentFilterData)
	{
		const {form} = this.props,
			allFilterData = form.getFieldValue('allFilterData'),
			afterRemoveData = allFilterData.filter(key => key.data !== currentFilterData.data);

		form.setFieldsValue({
			allFilterData: afterRemoveData
		});

		if(afterRemoveData.length < 1)
		{
			form.setFieldsValue({
				allFilterData: [{data: 0, type: "", include: "include", value: []}]
			});
		}

        this.props.getUserFilterList(afterRemoveData);

		userDimensionsData.forEach(item => {
			if(item.value === currentFilterData.type)
			{
				item.disabled = false
			}
		})
	}

	/*
	 * 添加筛选条件
	 * */
	add()
	{
		uuid++;
		const {form} = this.props,
			allFilterData = form.getFieldValue('allFilterData') || [],
			newAllFilterData = allFilterData.concat({data: uuid, type: "", include: "include", value: ""});

		if(allFilterData.length > 7)
			return;
		form.setFieldsValue({
			allFilterData: newAllFilterData
		});
	}

	/*
	 * 用户地域  对应值渲染  TreeSelect
	 * @param currentFilterData = {} 当前操作筛选条件条目值
	 * */

	getUserRegionComponent(currentFilterData)
	{
		let {treeData = []} = this.state;
		const loop = data => data && data.length > 0 ? data.map((item) => {
			if(item.id.length > 3)
			{
				item.isLeaf = true
			}
			if(item.children)
			{
				return <TreeNode title={item.name} key={item.id} value={item.id}
				                 isLeaf={item.isLeaf}>{loop(item.children)}</TreeNode>;
			}
			return <TreeNode title={item.name} key={item.id} value={item.id} isLeaf={item.isLeaf}/>;
		}) : null;

		const treeNodes = loop(treeData),
			_regionStyle = {width: "40%", minHeight: "32px", marginRight: "29px", display: "inline-block"};

		let regionArray = [],
			currentIds = [],
			{value = []} = currentFilterData;

		/*value.length>0 && currentFilterData.value.map(item => {
		 if (item.indexOf("/") !== -1)
		 {
		 let initialArray = item.split("/");
		 initialArray.map((lastItem,index) => {
		 if (index === initialArray.length - 1)
		 {
		 regionArray.push(lastItem);
		 }
		 })
		 }else
		 {
		 regionArray.push(item);
		 }
		 });*/
		return (
			<TreeSelect
				className="areaSelectStyle"
                maxTagCount={2}
				multiple={true}
				getPopupContainer={() => document.getElementsByClassName('iptScrollContainer')[0]}
				value={value}
				treeCheckable={true}
				dropdownStyle={{maxHeight: 340, overflowX: 'hidden', overflowY: 'auto'}}
				placeholder={getLangTxt("kpi_placeholder")}
				onChange={this.onValueChange.bind(this, currentFilterData)}
				loadData={this.onLoadData.bind(this)}
				style={_regionStyle}>
				{
					treeNodes
				}
			</TreeSelect>
		)
	}

	/*
	 * 输入框值发生变化
	 * */

	onIptValueChange(currentFilterData, e)
	{
		let value = e.target.value;

		value = value && value.split();
		this.setFilterValueCommon(currentFilterData, value, "value");
	}

	judgeIptValue(rule, value, callback)
	{

		let keyWordReg = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");

		if(value && !keyWordReg.test(value))
			return callback();

		callback(getLangTxt("note4"));

	}

	/*
	 * 关键词 自定义 对应值渲染  Input
	 * @param currentFilterData = {} 当前操作筛选条件条目值
	 * */

	getIptComponent(currentFilterData, _style)
	{

		const {getFieldDecorator} = this.props.form;
		return (
			<FormItem
				className="urlIptBox"
				style={_style}
				hasFeedback>
				{getFieldDecorator('title', {
					initialValue: currentFilterData.value[0],
					rules: [{validator: this.judgeIptValue.bind(this)}]
				})(
					<Input onKeyUp={this.onIptValueChange.bind(this, currentFilterData)}/>
				)}
			</FormItem>
		)
	}

	judgeValue(rule, value, callback)
	{
		// let reUrl01 = /(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/;
		let reUrl01 = /[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/;

		if(value && reUrl01.test(value))
			return callback();

		callback(getLangTxt("setting_custom_tab_note1"));
	}

	/*
	 * 来源页 着陆页对应值渲染  Input
	 * @param currentFilterData = {} 当前操作筛选条件条目值
	 * */
	getFormIptComponent(currentFilterData, _style)
	{
		const {getFieldDecorator} = this.props.form;
		return (
			<FormItem
				className="urlIptBox"
				style={_style}
				hasFeedback>
				{getFieldDecorator(currentFilterData.type, {
					initialValue: currentFilterData.value[0],
					rules: [{validator: this.judgeValue.bind(this)}]
				})(
					<Input autoFocus="autofocus" onKeyUp={this.onIptValueChange.bind(this, currentFilterData)}/>
				)}
			</FormItem>
		)
	}

	/*
	 * 用户终端 用户来源 用户身份 咨询发起页  对应值渲染  Select
	 * @param currentFilterData = {} 当前操作筛选条件条目值
	 * */

	getSelectComponent(currentFilterData, _style)
	{
		let data = [];
		switch(currentFilterData.type)
		{
			case "userterminal":
				data = [
					{itemKey: "Web", itemValue: "Web", itemContent: "Web"},
					{itemKey: "Wap", itemValue: "Wap", itemContent: "Wap"},
					{itemKey: "Android App", itemValue: "Android App", itemContent: "Android App"},
					{itemKey: "IOS App", itemValue: "IOS App", itemContent: "IOS App"},
					{itemKey: "Wechat", itemValue: "Wechat", itemContent: "Wechat"},
					/*{itemKey: "Weibo", itemValue: "Weibo", itemContent: "Weibo"},
					{itemKey: "AliPay", itemValue: "AliPay", itemContent: "AliPay"},
					{itemKey: "Others", itemValue: "Others", itemContent: "Others"}*/
				];
				break;

			case "usersource":
				let {userSource = []} = this.props;
				userSource ? userSource.map((item) =>
                {
					let obj = {itemKey: item.pk_config_source.toString(), itemValue: item.ename.toString(), itemContent: item.cname};

					data.push(obj);
				}) : null;

				break;

			case "useridentity":
				data = [
					{itemKey: "1", itemValue: "1", itemContent: "vip"},
					{itemKey: "2", itemValue: "0", itemContent: "非vip"}
				];
				break;
			case "startpage":
				let {essentialPage = []} = this.props;
				const children = [];

				if(essentialPage.length > 0)
				{
					essentialPage.map((items) => {
						items.subset ? items.subset.map((item) => {
							let obj = {itemKey: item.keyid, itemValue: item.urlreg, itemContent: item.keyname};
							data.push(obj);
						}) : null;
					});
				}
				break;
		}

		if(currentFilterData.type === "userterminal" || currentFilterData.type === "usersource")
		{
			return (
				<Select className="selectIptStyle" mode="multiple"
				        showSearch optionFilterProp="children"
				        getPopupContainer={() => document.getElementsByClassName('iptScrollContainer')[0]}
				        value={currentFilterData.value || []} style={_style}
				        onChange={this.changeKeyPage.bind(this, currentFilterData)}>
					    {
						data.map(item => {
							return (
								<Option key={item.itemKey} value={item.itemValue}>{item.itemContent}</Option>
							)
						})}
				</Select>
			)
		}

		return (
			<Select className="selectIptStyle"
			        getPopupContainer={() => document.getElementsByClassName('iptScrollContainer')[0]}
			        value={currentFilterData.value[0] || ""} style={_style}
			        onChange={this.changeKeyPage.bind(this, currentFilterData)}>
				{
					data.map(item => {
						return (
							<Option key={item.itemKey} value={item.itemValue}>{item.itemContent}</Option>
						)
					})
				}
			</Select>
		)
	}

	/*
	 * 用户维度对应值渲染
	 * */
	_getDimensionsValue(currentFilterData)
	{
		let _style = {width: "40%", minHeight: "32px", marginRight: "29px", display: "inline-block"};

		if(currentFilterData.type == "userregionid")
		{
			return this.getUserRegionComponent(currentFilterData, _style);
		}
		else if(currentFilterData.type == "keyword" || currentFilterData.type == "custom")
		{
			return this.getIptComponent(currentFilterData, _style);
		}
		else if(currentFilterData.type == "landingpage" || currentFilterData.type == "referer")
		{
			return this.getFormIptComponent(currentFilterData, _style);
		}
		else if(currentFilterData.type == "startpage" || currentFilterData.type == "userterminal" || currentFilterData.type == "usersource" || currentFilterData.type == "useridentity")
		{
			return this.getSelectComponent(currentFilterData, _style);
		}
		else
		{
			return (
				<Input style={_style}/>
			)
		}
	}

	render()
	{
		let {getFieldValue, getFieldDecorator} = this.props.form,
			allFilterData = getFieldValue('allFilterData'),
			form = allFilterData && allFilterData.map((currentFilterData, index) => {
				if(currentFilterData.type != "userregion")
					return (
						<div key={currentFilterData.data} style={{position: "inherit"}}>
							<svg style={{
								width: "8px", height: "8px", position: "absolute", left: "-4px", top: "14px",
								zIndex: "10"
							}}>
								<circle cx="4" cy="4" r="4"/>
							</svg>
							{
								index != 0 ?
									<div className="dimensionsOptions">
										<span className='queueList-border'/>
										<RadioButton
											style={{marginTop: "3px", borderRadius: "6px"}}>And</RadioButton>
									</div>
									: null
							}
							<div className="dimensionsOptions">
								<span className='queueList-border'/>
								<Select size="large" style={{width: 150}} value={currentFilterData.type}
								        getPopupContainer={() => document.getElementsByClassName('iptScrollContainer')[0]}
								        onChange={this.handleChange.bind(this, currentFilterData)}>
									{
										this.getTreeNode(allFilterData)
									}
								</Select>
								<Select size="large" getPopupContainer={() => document.getElementsByClassName('iptScrollContainer')[0]}
								        value={currentFilterData.include} style={{width: 88, margin: "0 20px"}}
								        onChange={this.changeInclude.bind(this, currentFilterData)}>
									<Option key="include" value="include">{getLangTxt("contain")}</Option>
									<Option key="exclude" value="exclude">{getLangTxt("no_contain")}</Option>
								</Select>
								{
									this._getDimensionsValue(currentFilterData)
								}
								<i className="iconfont icon-006jianxiao" style={{color: "#f04134"}}
								   onClick={this.remove.bind(this, currentFilterData)}/>
							</div>
						</div>
					);
			});

		return (
			<div className="screen">
				<div className="content">
					<div className="mask"></div>
					<div className="main iptScrollContainer">
						<Form>
							{
								form
							}
						</Form>

						<div className="add" onClick={this.add.bind(this)}>
							<i className="iconfont icon icon-tianjia1"/>
							<span>{getLangTxt("add_dimension")}</span>
						</div>
						<Form>
							<FormItem>
								{getFieldDecorator('allFilterData')(
									<div></div>
								)}
							</FormItem>
						</Form>
					</div>
				</div>
			</div>
		)
	}
}

UserFilterList = Form.create()(UserFilterList);

function mapStateToProps(state)
{
	return {
		essentialPage: state.rules.data,
		userSource: state.getVisitor.data,
		companyInfo: state.companyInfo
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({fetchRules, getVisitorData, getCity, getProvince, getRegion}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(UserFilterList);
