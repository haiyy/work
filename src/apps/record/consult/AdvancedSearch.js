import React from 'react' ;
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Input, Form, message } from 'antd';
import moment from 'moment';
import Tags from "../public/Tags";
import TagData from "../data/TagData";
import ScrollArea from 'react-scrollbar';
import '../../../public/styles/record/AdvancedSearch.scss';
import DatePickerComponent from "../public/DatePickerComponent";
import NTButtonGroup from "../../../components/NTButtonGroup";
import { getData } from "../../../apps/setting/company/redux/companyInfoReducer";
import NtTreeForSelect from "../../../components/NtTreeForSelect";
import ConsultSelectedComponent from "./ConsultSelectedComponent";
import { createMessageId } from "../../../lib/utils/Utils";
import { bglen } from "../../../utils/StringUtils";
import Modal from "../../../components/xn/modal/Modal";
import { getConsultList, getAccountGroup, getAccountList, getVisitorSourceGroup, getVisitorSourceList, updateCommonUsedConditions, updateSelectedConditions, saveCommonUsedConditions, deleteCommonUsedConditions } from "../../../apps/record/redux/consultReducer";

let FormItem = Form.Item;

class AdvancedSearch extends React.PureComponent {

	constructor(props)
	{
		super(props);

		this.search = {};

		this.state = {
			regionVisible: false,
			sourceVisible: false,
			treeData: [],
			selectedConditions: [...props.selectedConditions],
            startTamp: 0,
            endTamp: 0,
            selectValue: '',
            tagsWidth: 0,
            commonUsedTagsWidth: 0,
            isShowAllFilterData: false,
            isShowCommonUsedFilterData: false,
            commonUsedVisible: false,
            commonSearchName: [...props.commonSearchName],
            clickedSearchTag:[...props.clickedTag]
		};
		this.onLoadData = this.onLoadData.bind(this);
		this.sourceLoadDataFn = this.sourceLoadDataFn.bind(this);
	}

	componentDidMount()
	{
		this.props.getAccountGroup();
	}

	getData(key2)
	{
		let {consultData} = this.props;

		return consultData.getIn(["checkedData", key2]);
	}

	/*责任客服 loadDataFn*/
	kfLoadDataFn(groupid)
	{
		if(groupid)
		{
			this.props.getAccountList({groupid});
		}
		else
		{
			this.props.getAccountGroup();
		}
	}

	/* 添加下级数组至treeData */
	getNewTreeData(treeData, curKey, child, level)
	{
		if(!treeData || treeData.length <= 0)
		{
			return treeData = child || [];
		}

		const loop = (data) => {
			if(curKey.length > level) return;

			data.forEach(item => {
				if(item.key === curKey)
				{
					item.children = child;
				}
				else
				{
					if(item.children)
					{
						loop(item.children);
					}
				}
			});
		};

		loop(treeData);

		return treeData;
	}

	/*
	 *责任客服 itemTitleFn
	* */
	kfItemTitleFn()
	{
		return item => {
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
			return username;
		}
	}

	/* 生成下级地域数组*/
	generateTreeNodes(areaData, eventKey)
	{
		const arr = [];

		areaData.map(item => {
			const obj = {
				value: item.name,
				key: item.id
			};

			obj.isLeaf = eventKey.length >= 3;

			if(eventKey.length < 3)
				obj.children = [];

			arr.push(obj);
		});

		return arr;
	}

	//--------------------------------访客来源-------------------
	get sourceTags()
	{
		let {selectedConditions} = this.state;

		return selectedConditions.filter(tag => tag.searchKey === "source");
	}

	get sourceModalProps()
	{
		if(!this._sourceModalProps)
		{
			this._sourceModalProps = {
				title: "访客来源", width: 542, height: 506,
				wrapClassName: "regionModal", onCancel: this.onSourceCancel.bind(this),
				onOk: this.onSourceOk.bind(this)
			};
		}

		return this._sourceModalProps;
	}

	/*访客来源 Modal取消函数*/
	onSourceCancel()
	{
		this.setState({
			sourceVisible: !this.state.sourceVisible
		})
	}

	/*访客来源 Modal确定函数*/
	onSourceOk(tags)
	{
		this.setState({sourceVisible: !this.state.sourceVisible});

		let {selectedConditions} = this.state,
			arr = selectedConditions.filter(tag => tag.searchKey !== "source")
			.concat(tags);

		this.setState({selectedConditions: arr});
	}

	/*访客来源 loadDataFn*/
	sourceLoadDataFn(source_type_id)
	{
		if(source_type_id)
		{
			this.props.getVisitorSourceList(source_type_id);
		}
		else
		{
			this.props.getVisitorSourceGroup();
		}
	}

	//--------------------------------访客地域-------------------
	get regionTags()
	{
		let {selectedConditions} = this.state;

		return selectedConditions.filter(tag => tag.searchKey === "region");
	}

	get regionModalProps()
	{
		if(!this._regionModalProps)
		{
			this._regionModalProps = {
				title: "访客地域", width: 542, height: 506,
				wrapClassName: "regionModal", onCancel: this.onRegionCancel.bind(this),
				onOk: this.onRegionOk.bind(this)
			};
		}

		return this._regionModalProps;
	}

	onRegionOk(tags)
	{
		this.setState({regionVisible: !this.state.regionVisible});

		let {selectedConditions} = this.state,
			arr = selectedConditions.filter(tag => tag.searchKey !== "region")
			.concat(tags);

		this.setState({selectedConditions: arr});
	}

	onRegionCancel()
	{
		this.setState({regionVisible: !this.state.regionVisible});
	}

	/*访客地域 异步加载数据 */
	onLoadData(eventKey = "0")
	{
		return new Promise((resolve) => {
			setTimeout(() => {
				let treeData = [...this.state.treeData];

				getData(eventKey)
				.then((result) => {
					let {jsonResult = []} = result;

					treeData = this.getNewTreeData(treeData, eventKey, this.generateTreeNodes(jsonResult, eventKey), 3);

					this.setState({treeData});

					resolve();
				});
			}, 100);
		});
	}

    /*点击已保存常用搜索*/
    handleCommonSearch(tagInfo)
    {
        if (tagInfo)
            this.setState({
                selectedConditions: tagInfo.selectedConditions,
                clickedSearchTag: tagInfo
            })
    }

    onOk()
    {
        let {onOk, selectedValue} = this.props,
            {startTamp, endTamp, selectValue, selectedConditions} = this.state;

        if(typeof onOk === "function")
            onOk(selectedConditions, startTamp, endTamp, selectValue || selectedValue);
    }

    getTags(key)
	{
		let {selectedConditions} = this.state;

		return selectedConditions.filter(tag => tag.searchKey === key);
	}

	getTagsWithout(key)
	{
		let {selectedConditions} = this.state;

		return selectedConditions.filter(tag => tag.searchKey !== key);
	}

	/*get pleaseValue()
	{
		return this.getTags("pleased")
		.map(tag => tag.key2);
	}*/

	/*onPleasedChange(value)
	{
		this.groupChange("pleased", pleasedOptions, value);
	}*/

	/*get solveValue()
	{
		return this.getTags("solve")
		.map(tag => tag.key2);
	}

	onSolveChange(value)
	{
		this.groupChange("solve", solveOptions, value);
	}*/

	get actiontypeValue()
	{
		return this.getTags("memberacts.actiontype")
		.map(tag => tag.key2);
	}

	onActiontypeChange(value)
	{
		if(value)
		{
			let key = "memberacts.actiontype",
				gTags = actiontypeOptions.filter(option => value.includes(option.value))
				.map(option => {
					let tagData = new TagData();
					tagData.key = option.key;
					tagData.key2 = option.value;
					tagData.value = option.label;
					tagData.searchKey = key;
					tagData.isKey = false;
					return tagData;
				}),
				tags = gTags.concat(this.getTagsWithout(key));

			this.setState({
				selectedConditions: tags,
				clickedSearchTag:''
			});
		}
		//groupChange(key, goptions, value)
		//this.groupChange("memberacts.actiontype", actiontypeOptions, value);
	}

	/*get customeridentityValue()
	{
		return this.getTags("customeridentity")
		.map(tag => tag.key2);
	}

	onCustomeridentityChange(value)
	{
		this.groupChange("customeridentity", customeridentityOptions, value);
	}
*/
	get terminalValue()
	{
		return this.getTags("terminal")
		.map(tag => tag.key2);
	}

	onTerminalChange(value)
	{
		this.groupChange("terminal", terminalOptions, value);
	}

	groupChange(key, goptions, value)
	{
		if(value)
		{
			let gTags = goptions.filter(options => value.includes(options.value))
				.map(options => {
					let tagData = new TagData();
					tagData.key = options.key;
					tagData.key2 = options.value;
					tagData.value = options.label;
					tagData.searchKey = key;
					tagData.isKey = false;
					return tagData;
				}),
				tags = gTags.concat(this.getTagsWithout(key));

			this.setState({
                selectedConditions: tags,
                clickedSearchTag:''
            });
		}
	}

	get kfValue()
	{
		return this.getTags("kfs.kfid")
		.map(tag => tag.key);
	}

	onSearchKf(searchKeys, treeSelectedData)
	{
		let usernameFn = this.kfItemTitleFn(),
			kfTags = treeSelectedData.filter(data => data)
			.map(data => {
				let tagData = new TagData();
				tagData.key = data.userid;
                tagData.key2 = data.userid;
				tagData.value = usernameFn(data);
				tagData.searchKey = "kfs.kfid";

				return tagData;
			}),
			tags = kfTags.concat(this.getTagsWithout("kfs.kfid"));

		this.setState({selectedConditions: tags});
	}

    /*获取search时间*/
    getSearchTime(startTamp, endTamp, selectValue)
    {
        this.setState({
            startTamp,
            endTamp,
            selectValue,
            searchTime: [moment(startTamp), moment(endTamp)]
        })
    }

    //点击展开筛选条件列表
    isShowAllFilterData(isShowAllFilterData)
    {
        this.setState({isShowAllFilterData: !isShowAllFilterData})
    }

    //点击展开常用搜索筛选条件列表
    isShowCommonUsedFilterData(isShowCommonUsedFilterData)
    {
        this.setState({isShowCommonUsedFilterData: !isShowCommonUsedFilterData})
    }

    getWidth(width)
    {
        if (width !== 0)
            this.setState({tagsWidth: width});
    }

    getCommonUsedWidth(width)
    {
        if (width !== 0)
            this.setState({commonUsedTagsWidth: width});
    }

    /*删除常用搜索tag*/
    delCommonUsedTag(key)
    {
        let { commonSearchName } = this.state,
            tags = [...commonSearchName],
            index = tags.findIndex(tag => tag.key === key);

        if (index > -1)
        {
            tags.splice(index, 1);
            this.setState({
                commonSearchName: tags
            });
            // this.props.updateCommonUsedConditions(tags);

            this.props.deleteCommonUsedConditions(key);
        }
    }

    /*删除已选条件tag*/
    delTag(key)
    {
        let { selectedConditions } = this.state,
            tags = [...selectedConditions],
            index = tags.findIndex(tag => tag.key === key);

        if(index > -1)
        {
            tags.splice(index, 1);
            this.setState({selectedConditions: tags});
        }

    }

    /*添加至常用搜索*/
    addToCommonUsed()
    {
        this.setState({
            commonUsedVisible : true
        });

        this.props.form.setFieldsValue({"name": ''});
    }

    /*常用搜索 关闭*/
    handleCancel()
    {
        this.setState({
            commonUsedVisible: false,
            isUsedWarned: false,
            isOverCount: false
        })
    }

    /*常用搜索 保存*/
    handleOk()
    {
        let {form} = this.props,
            name = form.getFieldValue("name"),
            {commonSearchName, selectedConditions} = this.state,
            commonUsedObj={};

        form.validateFields((errors) => {
            if (errors)
                return false;

            if(commonSearchName.length>=50)
            {
                this.setState({isOverCount: true});
                return false;
            }

            if (commonSearchName.length === 0) {
                let tagData = new TagData();
                tagData.key = createMessageId();
                tagData.key2 = name;
                tagData.value = name;
                tagData.searchKey = 'commonUsed';
                tagData.isKey = false;
                tagData.selectedConditions = [...selectedConditions];

                commonSearchName.push(tagData);

                this.setState({
                    commonSearchName,
                    clickedSearchTag: tagData
                });
            }
            else {
                for (let i = 0; i < commonSearchName.length; i++) {
                    if (commonSearchName[i].value === name)
                        break;

                    if (i === commonSearchName.length - 1) {
                        let tagData = new TagData();
                        tagData.key = createMessageId();
                        tagData.key2 = name;
                        tagData.value = name;
                        tagData.searchKey = 'commonUsed';
                        tagData.isKey = false;
                        tagData.selectedConditions = [...selectedConditions];

                        commonSearchName.push(tagData);

                        this.setState({
                            commonSearchName,
                            clickedSearchTag: tagData
                        });
                    }
                }
            }

            commonUsedObj = {
                searchName: name,
                searchContent: selectedConditions,
                flag: "0"
            };

            this.props.saveCommonUsedConditions(commonUsedObj).then(result => {
                let saveStats = result.code !== 200,
                    newCommonSearch = [...commonSearchName],
                    addUsedItem = newCommonSearch.find(item => item.key2 === name);

                addUsedItem.key = result.data;

                this.setState({commonUsedVisible: saveStats, isUsedWarned: saveStats, commonSearchName: newCommonSearch});
            });

            this.props.updateCommonUsedConditions(commonSearchName);

        })
    }

    /*常用搜索 保存并搜索*/
    handleOkAndSearch()
    {
        let {form} = this.props,
            {selectedConditions, commonSearchName} = this.state;

        form.validateFields((errors) => {
            if (errors)
                return false;

            if(commonSearchName.length >= 50)
            {
                this.setState({isOverCount: true});
                return false;
            }

            this.handleOk();
            this.props.onCancel();

            this.props.updateSelectedConditions(selectedConditions);

            this.onOk();
        })
    }

    /*自定义校验常用搜索名称*/
    judgeCommonUsedName(rule, value, callback)
    {
        let char = /^[A-Za-z0-9\u4e00-\u9fa5]+$/;

        if(bglen(value) <= 20 && char.test(value))
            callback();

        callback(" ");
    }

	render()
	{
		let {consultData, onCancel, selectedValue, merchantIds} = this.props,
			visitorSource = consultData.getIn(["visitorSource", "data"]) || [],
			mainkfsGroup = consultData.getIn(["account", "data"]) || [],
            widthMore = false,
            commonUsedWidthMore = false,
            className = "",
            commonUsedClassName = '',
            filterDataBox = document.getElementById("advancedSearchTags"),
            filterCommonUsedBox = document.getElementById("commonSearchTags"),
            {regionVisible, sourceVisible, treeData, isShowAllFilterData, isShowCommonUsedFilterData, tagsWidth, commonUsedVisible, commonSearchName, commonUsedTagsWidth, selectedConditions, isUsedWarned, isOverCount} = this.state,
            commonBtnIsClick = selectedConditions.length > 0 ? false : true;

        const {getFieldDecorator} = this.props.form;

        widthMore = tagsWidth > 512;
        commonUsedWidthMore = commonUsedTagsWidth > 512;

        if (!isShowAllFilterData)
        {
            filterDataBox && filterDataBox.setAttribute("class", "selectedBox hideExtra");
        }
        else
        {
            filterDataBox && filterDataBox.setAttribute("class", "selectedBox showExtra");
        }

        if (!isShowCommonUsedFilterData)
        {
            filterCommonUsedBox && filterCommonUsedBox.setAttribute("class", "selectedBox hideExtra");
        }
        else
        {
            filterCommonUsedBox && filterCommonUsedBox.setAttribute("class", "selectedBox showExtra");
        }

        className = !widthMore || isShowAllFilterData ? "showExtra" : "hideExtra";
        commonUsedClassName = !commonUsedWidthMore || isShowCommonUsedFilterData ? "showExtra" : "hideExtra";

		return (
			<div className="advancedSearchContent">
				<ScrollArea speed={1} style={{height: 'calc(100% - 0.24rem - 28px)'}} horizontal={false} smoothScrolling>
					<div className="dataWrap">
						<DatePickerComponent selectedValue={this.state.selectValue || selectedValue} time={this.state.searchTime || this.props.time} _onOk={this.getSearchTime.bind(this)}/>
					</div>

					<div className="selectedCondition">
                        <div className="commonSearchTagDiv">
                            <label>常用搜索</label>
                            <Tags idnames="commonSearchTags"
                                tags={commonSearchName}
                                classname={commonUsedClassName}
                                onClick={this.handleCommonSearch.bind(this)}
                                delDataFn={this.delCommonUsedTag.bind(this)}
                                getWidth={this.getCommonUsedWidth.bind(this)}
                            />
                            {
                                commonUsedWidthMore ?
                                    <a onClick={this.isShowCommonUsedFilterData.bind(this, isShowCommonUsedFilterData)}>
                                        {isShowCommonUsedFilterData ? '收起' : '展开'}
                                    </a> : null
                            }
                        </div>
                        <div>
                            <label>已选条件</label>
                            <Tags idnames="advancedSearchTags"
                                tags={selectedConditions}
                                classname={className}
                                delDataFn={this.delTag.bind(this)}
                                getWidth={this.getWidth.bind(this)}
                            />
                            {
                                widthMore ?
                                    <a onClick={this.isShowAllFilterData.bind(this, isShowAllFilterData)}>
                                        {isShowAllFilterData ? '收起' : '展开'}
                                    </a> : null
                            }
                        </div>
					</div>

					<div className="conditionContainer">
                        {
                            !merchantIds ? [<p>客服信息</p>,
                                <div className="perSelect responsibilityKFSelect">
                                    <label className="customerLabel">责任客服</label>
                                    <NtTreeForSelect treeData={mainkfsGroup}
                                        checkedKeys={this.kfValue}
                                        itemInfo={{itemid: "userid"}}
                                        searchFn={this.onSearchKf.bind(this)}
                                        loadDataFn={this.kfLoadDataFn.bind(this)}
                                        itemTitleFn={this.kfItemTitleFn()}
                                        popupContainer="advancedSearchContent"
                                        />
                                </div>
                            ] : null
                        }


						<p>会话情况</p>
						{/*<div className="perSelect">
							<label>满意度</label>
							<NTButtonGroup options={pleasedOptions} itemClassName="perSelectItem"
							               className="perSelectNTButtonGroup"
							               value={this.pleaseValue}
                                           onChange={this.onPleasedChange.bind(this)}/>
						</div>*/}

					{/*	<div className="perSelect">
							<label>是否解决问题</label>
							<NTButtonGroup options={solveOptions} itemClassName="perSelectItem"
							               className="perSelectNTButtonGroup"
							               value={this.solveValue}
                                           onChange={this.onSolveChange.bind(this)}/>
						</div>*/}

						<div className="perSelect">
							<label>会话类型</label>
							<NTButtonGroup options={actiontypeOptions} itemClassName="perSelectItem"
							               className="perSelectNTButtonGroup"
							               value={this.actiontypeValue}
                                           onChange={this.onActiontypeChange.bind(this)}/>
						</div>

						<p>访客信息</p>
						{/*<div className="perSelect">
							<label>访客身份</label>
							<NTButtonGroup options={customeridentityOptions} itemClassName="perSelectItem"
							               className="perSelectNTButtonGroup"
							               value={this.customeridentityValue}
							               onChange={this.onCustomeridentityChange.bind(this)}/>
						</div>*/}

						<div className="perSelect">
							<label>访客地域</label>
							<a onClick={this.onRegionCancel.bind(this)}>更多</a>
							<Tags tags={this.regionTags}
                                delDataFn={this.delTag.bind(this)}
                                getWidth={this.getWidth.bind(this)}
                                classnames="regionTags"
                            />
						</div>

						<div className="perSelect">
							<label>访客来源</label>
							<a onClick={this.onSourceCancel.bind(this)}>更多</a>
							<Tags tags={this.sourceTags}
                                delDataFn={this.delTag.bind(this)}
                                getWidth={this.getWidth.bind(this)}
                                classnames="sourceTags"
                            />
						</div>

						<div className="perSelect">
							<label>访客终端</label>
							<NTButtonGroup options={terminalOptions} itemClassName="perSelectItem"
							               className="perSelectNTButtonGroup"
							               value={this.terminalValue} onChange={this.onTerminalChange.bind(this)}/>
						</div>
					</div>
				</ScrollArea>
				<div className="btnContainer">
					<Button className="btn" type="primary" onClick={this.onOk.bind(this)}>确定</Button>
					<Button className="btn" onClick={onCancel}>取消</Button>
                    <Button className="addToCommonBtn" disabled={commonBtnIsClick} onClick={this.addToCommonUsed.bind(this)}>
                        添加至常用检索
                    </Button>
				</div>
				{
					//访客地域
					regionVisible ?
						<ConsultSelectedComponent modalProps={this.regionModalProps}
						                          tags={this.regionTags}
						                          treeData={treeData}
						                          searchKey="region"
						                          groupInfo={{groupid: "key", groupname: "value"}}
						                          itemInfo={{itemid: "key", itemname: 'value'}}
                                                  getWidth={this.getWidth.bind(this)}
						                          loadDataFn={this.onLoadData}/> : null
				}
				{
					//访客来源
					sourceVisible ?
						<ConsultSelectedComponent modalProps={this.sourceModalProps}
						                          tags={this.sourceTags}
						                          searchKey="source"
						                          treeData={visitorSource} groupInfo={groupInfo}
						                          itemInfo={{itemid: "ename", itemname: 'cname'}}
                                                  getWidth={this.getWidth.bind(this)}
						                          loadDataFn={this.sourceLoadDataFn}/> : null
				}

                <Modal title="设置常用搜索"
                    visible={commonUsedVisible}
                    width={540}
                    wrapClassName='addCommonUsed'
                    footer={[
                        <Button onClick={this.handleCancel.bind(this)}>取消</Button>,
                        <Button type="primary" onClick={this.handleOk.bind(this)}>保存</Button>,
                        <Button type="primary" onClick={this.handleOkAndSearch.bind(this)}>保存并搜索</Button>
                        ]}
                    onCancel={this.handleCancel.bind(this)}
                >
                    <Form>
                        <FormItem>
                            <p>设置并显示常用搜索名称</p>
                            {
                                getFieldDecorator('name', {
                                    initialValue: '',
                                    rules: [{required: true, whitespace:true}, { validator: this.judgeCommonUsedName.bind(this)}]
                                })(<Input />)
                            }
                            {isUsedWarned ? <p className="commonUsedWarned">该常用搜索名称已存在！</p> : null}
                            {isOverCount ?  <p className="commonUsedWarned">常用搜索最多创建50条！</p> : null}
                        </FormItem>
                    </Form>
                </Modal>
			</div>
		);
	}
}

AdvancedSearch = Form.create()(AdvancedSearch);

const
	/*pleasedOptions = [
		{label: '非常满意', value: 5, key: createMessageId()},
		{label: '满意', value: 4, key: createMessageId()},
		{label: '一般', value: 3, key: createMessageId()},
		{label: '不满意', value: 2, key: createMessageId()},
		{label: '非常不满意', value: 1, key: createMessageId()},
		{label: '未评价', value: 0, key: createMessageId()}
	],
	solveOptions = [
		{label: '已解决', value: 3, key: createMessageId()},
		{label: '跟进中', value: 2, key: createMessageId()},
		{label: '未解决', value: 1, key: createMessageId()},
		{label: '未评价', value: 0, key: createMessageId()}
	],*/
	actiontypeOptions = [
		{label: '独立咨询', value: 0, key: createMessageId()},
		{label: '邀请咨询', value: 2, key: createMessageId()},
		{label: '转接咨询', value: 3, key: createMessageId()},
		{label: '协助咨询', value: 6, key: createMessageId()},
		{label: '接管咨询', value: 7, key: createMessageId()},
	],
	customeridentityOptions = [
		{label: '普通', value: 0, key: createMessageId()},
		{label: 'VIP', value: 1, key: createMessageId()}
	],
	terminalOptions = [
		{label: 'web', value: 1, key: createMessageId()},
		{label: 'wechat', value: 2, key: createMessageId()},
		{label: 'wap', value: 3, key: createMessageId()},
		{label: 'IOS App', value: 4, key: createMessageId()},
		{label: 'Android App', value: 5, key: createMessageId()},
		{label: 'weibo', value: 6, key: createMessageId()},
		{label: 'AliPay', value: 7, key: createMessageId()},
		{label: 'Others', value: 0, key: createMessageId()}
	],
	groupInfo = {groupid: "source_type_id", groupname: "typename"};

function mapStateToProps(state)
{

	let {consultReducer1: consultData} = state;
	
	console.log("AdvancedSearch mapStateToProps consultData = ", consultData.toJS());
	
	return {
		summaryTypeTree: state.summaryReducer.summaryTypeTree || [],
		summaryProgress: state.summaryReducer.groupProgress,
		consultData
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		getConsultList, getAccountGroup, getVisitorSourceGroup, getVisitorSourceList,
		getAccountList, updateCommonUsedConditions, updateSelectedConditions, saveCommonUsedConditions, deleteCommonUsedConditions
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AdvancedSearch);
