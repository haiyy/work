import React from 'react'
import { Form } from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'
import { getSummaryAll, getSummaryAllItems, addSummaryType, editSummaryType, editSummaryTypeRank, removeSummaryType, getSummaryLeaf, isSetCommonOk, clearSetCommonMsg, addSummaryLeaf, editSummaryLeaf, removeSummaryLeaf, getSummaryLeafSearchData } from './action/summarySetting';
import SummaryTypeTree from './SummaryTypeTree';
import SummaryTypeTreeReadOnly from './SummaryTypeTreeReadOnly';
import SummaryList from './SummaryList';
import SummaryListReadOnly from './SummaryListReadOnly';
import SummaryModel from './SummaryModel';
import './style/summary.scss';
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";
import { getLangTxt } from "../../../utils/MyUtil";
import Loading from "../../../components/xn/loading/Loading";
import Modal,{ confirm, info, error, success, warning } from "../../../components/xn/modal/Modal";

class Summary extends React.PureComponent {

	constructor(props)
	{
		super(props);
		this.state = {
			showModelType: '',
			selectedLeafListData: [],
			display: true,
			selectingKey: [],
			getAllItems: true,
			currentListPage: 1,
			isSingleGroup: false,
			isRangeItem: false
		};

		this.showSummaryModel = this.showSummaryModel.bind(this);
		this.hideSummaryModel = this.hideSummaryModel.bind(this);
		this.addSummaryType = this.addSummaryType.bind(this);
		this.addSummaryLeaf = this.addSummaryLeaf.bind(this);
		this.editSummaryType = this.editSummaryType.bind(this);
		this.editSummaryLeaf = this.editSummaryLeaf.bind(this);
		this.removeSummaryType = this.removeSummaryType.bind(this);
		this.removeSummaryLeaf = this.removeSummaryLeaf.bind(this);
		this.notifySelectedSummaryType = this.notifySelectedSummaryType.bind(this);
		this.notifyEditSummary = this.notifyEditSummary.bind(this);
	}

	componentDidMount()
	{
		this.props.getSummaryAll();
		let obj = {
			page: 1,
			rp: 10
		};
		this.props.getSummaryAllItems(obj);
		this.setState({getAllItems: true})
	}

	//添加咨询总结分组
	addSummaryType(data)
	{
		this.props.addSummaryType(data);
		this.hideSummaryModel();
	}

	//添加咨询总结条目
	addSummaryLeaf(data)
	{
		this.props.addSummaryLeaf(data);
		this.hideSummaryModel();
	}

	//获取分组下咨询总结条目
	getSummaryLeafData(groupId)
	{
		if(groupId)
		{
			this.setState({selectingKey: [groupId], selectedSummaryType: groupId, getAllItems: false});
			this.props.getSummaryLeaf(groupId)
		}
		else
		{
			this.setState({selectingKey: [], selectedSummaryType: ""});
		}
	}

	//编辑咨询总结分组
	editSummaryType(data)
	{
		this.props.editSummaryType(data);
		this.hideSummaryModel();
	}

	//编辑咨询总结条目
	editSummaryLeaf(data)
	{
		this.props.editSummaryLeaf(data);
		this.hideSummaryModel();
	}

	//删除咨询总结分组
	removeSummaryType(data)
	{
		let {currentListPage = 1} = this.state;
		this.props.removeSummaryType(data, currentListPage);
		this.setState({selectedSummaryType: "", getAllItems: true})
	}

	//删除咨询总结条目
	removeSummaryLeaf(data, isUpdate, currentPage)
	{
		this.props.removeSummaryLeaf(data, isUpdate, currentPage);
	}

	//弹出对话框
	showSummaryModel(type)
	{
		this.setState({
			showModelType: type
		});
	}

	//取消对话框
	hideSummaryModel()
	{
		this.setState({
			showModelType: ''
		});
	}

	//获取点击分组id
	notifySelectedSummaryType(summaryType, children)
	{
		let isRangeItem = children ? false : true;
		this.setState({
			selectedSummaryType: summaryType,
			isRangeItem
		});
	}

	//获取编辑信息
	notifyEditSummary(editSummaryInfo)
	{
		this.setState({
			editSummaryInfo: editSummaryInfo
		});
	}

	//点击收起分组
	changeClick()
	{
		this.setState({
			display: !this.state.display
		})
	}

	_getProgressComp(progress, className = "")
	{
		let progressNum = progress && progress.left ? progress && progress.left : progress && progress.right,
			left = this.state.display && progress && progress.right ? '62%' : '50%';
		if(progressNum === LoadProgressConst.SAVING || progressNum === LoadProgressConst.LOADING)//正在保存 || 正在加载
		{
			return (
				<div style={{height: '100%', width: '100%', position: 'absolute', top: "0", left: "0"}}>
                    <Loading style={{
					width: "100%",
					height: "100%",
					display: "flex",
					justifyContent: "center",
					alignItems: "center"
				}}/>
				</div>
			);
		}
		else if(progressNum === LoadProgressConst.LOAD_FAILED)//加载失败
		{
			if(progress.left)
			{
				return <ReFresh reFreshFn={this.reFreshLeftFn.bind(this)}/>;
			}
			else
			{
				return <ReFresh
					reFreshStyle={this.state.display ? {width: "calc(100% - 1.97rem)"} : {width: "calc(100% - 0.07rem)"}}
					reFreshFn={this.reFreshRightFn.bind(this)}/>;
			}
		}

		return null;
	}

	reFreshLeftFn()
	{
		this.props.getSummaryAll();
	}

	reFreshRightFn()
	{
		let {selectingKey} = this.state;
		this.props.getSummaryLeaf(selectingKey[0]);
	}

	savingErrorTips(msg, isGroup)
	{
		warning({
			title: getLangTxt("err_tip"),
			width: '320px',
			iconType: 'exclamation-circle',
			className: 'errorTip',
			content: msg,
			okText: getLangTxt("sure"),
			onOk: () => {
				this.props.getSummaryAll();
			}
		});
	}

	savingItemErrorTips = (msg) => {
		let {selectedSummaryType, currentListPage = 1} = this.state;
		warning({
			title: getLangTxt("err_tip"),
			width: '320px',
			iconType: 'exclamation-circle',
			className: 'errorTip',
			okText: getLangTxt("sure"),
			content: msg,
			onOk: () => {
				let obj = {
					page: currentListPage,
					rp: 10
				};
				selectedSummaryType ?
					this.props.getSummaryLeaf(selectedSummaryType)
					:
					this.props.getSummaryAllItems(obj);
			}
		});

	};

	getCurrentListPage(currentListPage)
	{
		this.setState({currentListPage})
	}

	getAllSummary()
	{
		this.props.getSummaryAll();
		let obj = {
			page: 1,
			rp: 10
		};
		this.props.getSummaryAllItems(obj);
		this.setState({getAllItems: true})
	}

	render()
	{
		let {
			progress, groupProgress, rootid, summaryTypeTree, summaryGroupErrorMsg = getLangTxt("20034"),
			summaryItemErrorMsg = getLangTxt("20034"), isCommonOk = true
		} = this.props;

		if(groupProgress && groupProgress.left === LoadProgressConst.SAVING_FAILED)
			this.savingErrorTips(summaryGroupErrorMsg);

		if(progress && progress.right === LoadProgressConst.SAVING_FAILED || progress && progress.right === LoadProgressConst.DUPLICATE)
			this.savingItemErrorTips(summaryItemErrorMsg);

		return (
			<div className='summary'>
				<div className='summary-container'>
					<div className='summary-tree' style={this.state.display ? {width: '1.95rem'} : {width: '0.05rem'}}>
						{
							this.state.display ?
								<div className="summary-type-box">
									<SummaryTypeTree rootid={rootid} summaryTypeTree={summaryTypeTree}
									                 selectingKey={this.state.selectingKey}
									                 getSummaryAll={this.props.getSummaryAll.bind(this)}
									                 getSummaryLeafData={this.getSummaryLeafData.bind(this)}
									                 notifySelectedSummaryType={this.notifySelectedSummaryType}
									                 showSummaryModel={this.showSummaryModel}
									                 notifyEditSummary={this.notifyEditSummary}
									                 hideSummaryModel={this.hideSummaryModel}
									                 removeSummaryType={this.removeSummaryType}
									                 editSummaryTypeRank={this.props.editSummaryTypeRank.bind(this)}
									/>
									<img className="summary-button" src={require("./image/SummaryGroupClose.png")}
									     onClick={this.changeClick.bind(this)}/>
								</div>
								:
								<img className="summary-button summary-button-open"
								     src={require("./image/summaryGroupOpen.png")}
								     onClick={this.changeClick.bind(this)}/>
						}
						{
							this.state.display ? this._getProgressComp(groupProgress, " la-square-jelly-box_accountGroup") : null
						}
					</div>
					<div className='summary-list'
					     style={this.state.display ? {padding: '0.05rem 0 0 1.97rem'} : {padding: '0.05rem 0 0 0.08rem'}}
					>
						<SummaryList selectedSummaryType={this.state.selectedSummaryType}
						             getSummaryAllData={this.getAllSummary.bind(this)}
						             getSummaryLeaf={this.props.getSummaryLeaf}
						             selectingKey={this.state.selectingKey}
						             getAllItems={this.state.getAllItems}
						             isRangeItem={this.state.isRangeItem}
						             getSummaryAllItems={this.props.getSummaryAllItems.bind(this)}
						             getCurrentListPage={this.getCurrentListPage.bind(this)}
						             showSummaryModel={this.showSummaryModel} notifyEditSummary={this.notifyEditSummary}
						             editSummaryLeaf={this.editSummaryLeaf} removeSummaryLeaf={this.removeSummaryLeaf}
						/>
						{
							this._getProgressComp(progress)
						}
					</div>
				</div>

				<SummaryModel
					getAllSummary={this.props.getSummaryAll.bind(this)}
					rootid={this.props.rootid} type={this.state.showModelType}
					getSummaryLeafData={this.getSummaryLeafData.bind(this)}
					hideSummaryModel={this.hideSummaryModel} summaryTypeTree={this.props.summaryTypeTree}
					isSingleGroup={this.state.isSingleGroup}
					selectedSummaryType={this.state.selectedSummaryType} addSummaryType={this.addSummaryType}
					addSummaryLeaf={this.addSummaryLeaf} editSummaryType={this.editSummaryType}
					isSetCommonOk={this.props.isSetCommonOk}
					clearSetCommonMsg={this.props.clearSetCommonMsg}
					isCommonOk={isCommonOk}
					editSummaryLeaf={this.editSummaryLeaf} editSummaryInfo={this.state.editSummaryInfo}/>
			</div>
		)
	}
}

function mapStateToProps(state)
{
	return {
		summaryTypeTree: state.summaryReducer.summaryTypeTree,
		groupProgress: state.summaryReducer.groupProgress,
		summaryGroupErrorMsg: state.summaryReducer.summaryGroupErrorMsg,
		progress: state.summaryReducer.progress,
		summaryItemErrorMsg: state.summaryReducer.summaryItemErrorMsg,
		isCommonOk: state.summaryReducer.isCommonOk
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		getSummaryAll, getSummaryAllItems, addSummaryType, editSummaryType, editSummaryTypeRank, getSummaryLeaf,
		isSetCommonOk, clearSetCommonMsg, addSummaryLeaf, editSummaryLeaf, removeSummaryType,
		removeSummaryLeaf, getSummaryLeafSearchData
	}, dispatch);
}

Summary = Form.create()(Summary);

export default connect(mapStateToProps, mapDispatchToProps)(Summary);
