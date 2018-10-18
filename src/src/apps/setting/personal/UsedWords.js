import React from 'react'
import { Form, Button, Modal, Upload } from 'antd';
import ScrollArea from 'react-scrollbar';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
	getPersonTipsAll, newPersonTipsGroup, editPersonTipsGroup, delPersonTipsGroup,
	getPersonTipsItem, newPersonTips, editPersonTips, delPersonTips, importPersonCommonWord, editPersonTipsTypeRank, editPersonTipsRank
} from './action/personTips';
import Settings from '../../../utils/Settings';
import { downloadByATag, getLangTxt } from "../../../utils/MyUtil";
import { UPLOAD_FILE_ACTION } from "../../../utils/MyUtil";
import GroupCard from './GroupCard';
import { loginUserProxy } from '../../../utils/MyUtil';
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";
import { getProgressComp } from "../../../utils/MyUtil";
import { upOrDown } from "../../../utils/MyUtil";
import NTModal from "../../../components/NTModal";
import Nodata from "../../../public/images/dataNo.png";
import "./style/UsedWord.scss";

class UsedWords extends React.PureComponent {
	constructor(props)
	{
		super(props);
		this.state = {
			newGroup: false,
			cancel: false,
			isImportShow: false
		};
		let {userId: operatingUserId} = loginUserProxy();
		this.operatingUserId = operatingUserId;
	}

	//页面渲染完成填充分组数据
	componentDidMount()
	{
		this.props.getPersonTipsAll(this.operatingUserId);
	}

	//点击关闭个人常用话术页
	onCancel()
	{
		this.props.onCancel(false);
	}

	onOk()
	{
		this.props.onCancel(false);
	}

	//新建分组
	newGroups()
	{
		this.setState({
			newGroup: true,
			newGroupName: getLangTxt("add_group1"),
			cancel: false
		})
	}

	//判断子组件是否取消或完成新建分组
	isCancel(msg)
	{
		this.setState({
			cancel: msg
		})
	}

	//子组件点击恢复newgroup状态
	afterCreate(msg)
	{
		this.setState({
			newGroup: msg
		})
	}

	//滚动条复位
	scrollIng(value)
	{
		if(!value.topPosition)
		{
			value.topPosition = 0;
		}
	}

	reFreshFn()
	{
		this.props.getPersonTipsAll(this.operatingUserId);
	}

	getErrorMsgComp(errorMsg)
	{
		Modal.error({
			title: getLangTxt("err_tip"),
			iconType: 'exclamation-circle',
			className: 'errorTip',
			okText: getLangTxt("sure"),
			content: <div>{errorMsg}</div>,
			width: '320px',
			onOk: () => {
				this.props.getPersonTipsAll(this.operatingUserId)
			}
		});
	}

	//下载模板
	downLoadModal()
	{
		let {siteId, userId} = loginUserProxy(),
			downLoadUrl = Settings.querySettingUrl("/exportExcel/fastResponse?siteid=", siteId, "&userid=" + userId + "&sample=sample");

		downloadByATag(downLoadUrl);
	}

	exportPersonTips()
	{
		let {siteId, userId} = loginUserProxy(),
			exportUrl = Settings.querySettingUrl("/exportExcel/fastResponse?siteid=", siteId, "&userid=" + userId);

		downloadByATag(exportUrl);
	}

	showImportModal()
	{
		this.setState({
			isImportShow: true
		})
	}

	cancelImport()
	{
		this.setState({
			isImportShow: false
		})
	}

	onSelectFile(info)
	{
		let type = UPLOAD_FILE_ACTION, {file, fileList} = info, {originFileObj, size} = file;
		fileList = fileList.slice(-1);

		if(info.event)
		{
			this.props.importPersonCommonWord(originFileObj)
			.then(res => {
				if(!res.success && res.result.code != 400)
				{
					let {result: {msg = ""}} = res;

					let msgObject = JSON.parse(msg),
						{groupExist = [], groupFailed = [], itemExist = [], itemFailed = []} = msgObject,
						groupExistString = groupExist.join(","),
						groupFailedString = groupFailed.join(","),
						itemExistString = itemExist.join(","),
						itemFailedString = itemFailed.join(",");

					Modal.info({
						title: getLangTxt("import_tip"),
						width: '320px',
						iconType: 'exclamation-circle',
						className: 'errorTip usedWordErrorModal',
						okText: getLangTxt("sure"),
						content: <div>
							{groupExist.length > 0 ? <p className="importErrorMsg"
							                            style={{wordBreak: "break-all"}}>{getLangTxt("setting_import_content1")}{groupExistString}</p> : null}
							{groupFailed.length > 0 ? <p className="importErrorMsg"
							                             style={{wordBreak: "break-all"}}>{getLangTxt("setting_import_content2")}{groupFailedString}</p> : null}
							{itemExist.length > 0 ? <p className="importErrorMsg"
							                           style={{wordBreak: "break-all"}}>{getLangTxt("setting_import_content3")}{itemExistString}</p> : null}
							{itemFailed.length > 0 ? <p className="importErrorMsg"
							                            style={{wordBreak: "break-all"}}>{getLangTxt("setting_import_content4")}{itemFailedString}</p> : null}
						</div>,
						onOk: () => {
							this.props.getPersonTipsAll(this.operatingUserId);
						}
					});
				}
				else if(!res.success && res.result.code == 400)
				{
					Modal.error({
						title: getLangTxt("import_tip"),
						iconType: 'exclamation-circle',
						className: 'errorTip',
						okText: getLangTxt("sure"),
						content: getLangTxt("setting_import_content5"),
						width: '320px'
					});
				}
				else if(res.success && res.result.code == 200)
				{
					Modal.success({
						title: getLangTxt("import_tip"),
						content: getLangTxt("setting_import_content6"),
						iconType: 'exclamation-circle',
						className: 'commonTip',
						width: '320px',
						onOk: () => {
							this.props.getPersonTipsAll(this.operatingUserId);
						}
					});
				}
				else
				{
					Modal.error({
						title: getLangTxt("import_tip"),
						iconType: 'exclamation-circle',
						className: 'errorTip',
						content: getLangTxt("20034"),
						okText: getLangTxt("sure"),
						width: '320px'
					});
				}
			})
		}
	}

	importVisibleConfirm()
	{
		this.setState({
			isImportShow: false
		})
	}

	//个人常用话术分组排序
	handleRank(rankItem, up)
	{
		let {userId} = loginUserProxy(),
			{dataList = []} = this.props,
			rangeGroupIds = [rankItem && rankItem.groupId],
			rangeArray = upOrDown(dataList, rangeGroupIds, "groupId", up);

		if(rangeGroupIds.length < 1)
			return;

		if(rangeArray && rangeArray.length > 0)
			this.props.editPersonTipsTypeRank(rangeArray, userId);

		this.setState({
			rangeDone: !this.state.rangeDone
		});
	}

	render()
	{
		let {getFieldDecorator} = this.props.form,
			{dataList = [], progress, errorMsg} = this.props,
			newData = {name: getLangTxt("add_group1")},
			props = {
				name: 'file',
				accept: '.xls,.xlsx',
				listType: 'file',
				action: "http://xiaonenggood.cn"
			};

		dataList.sort((a, b) => a.rank - b.rank);

		if(progress === LoadProgressConst.LOAD_FAILED)
			return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;

		if((progress === LoadProgressConst.DUPLICATE || progress === LoadProgressConst.SAVING_FAILED) && errorMsg)
		{
			this.getErrorMsgComp(errorMsg)
		}

		return (
			<div className="usedWordsStyle" style={{position: 'relative'}}>
				<div className="UsedWords personalise" style={{position: 'relative'}}>
					<ScrollArea
						speed={1} smoothScrolling
						className="area"
						onScroll={this.scrollIng.bind(this)}
						contentClassName="UserMenu"
						horizontal={false}
						style={{height: "3.58rem"}}>
						<div className="usedwords-container" style={{margin: '0.11rem 0.14rem', height:"100%"}}>
							<div className="usedwords-head clearFix">
								<Button className="newTipsBtn" onClick={this.newGroups.bind(this)}
								        type="primary">{getLangTxt("add_group1")}</Button>
								<Button className="newTipsBtn" type="primary"
								        onClick={this.showImportModal.bind(this)}>{getLangTxt("import")}</Button>
								<Button className="newTipsBtn" onClick={this.exportPersonTips.bind(this)}
								        type="primary">{getLangTxt("export")}</Button>
								<Button className="newTipsBtn" onClick={this.downLoadModal.bind(this)}
								        type="primary">{getLangTxt("setting_faq_templete")}</Button>
							</div>
							{
								this.state.newGroup ? <GroupCard
									data={newData}
									new={true}
									cancel={this.state.cancel}
									operatingUserId={this.operatingUserId}
									isCancel={this.isCancel.bind(this)}
									afterCreate={this.afterCreate.bind(this)}
									newGroup={this.state.newGroup}
									newTipsGroup={this.props.newPersonTipsGroup}
									editTipsGroup={this.props.editPersonTipsGroup}
									removeTipsGroup={this.props.delPersonTipsGroup}
									getTipsData={this.props.getPersonTipsItem}
									newTips={this.props.newPersonTips}
									editorTips={this.props.editPersonTips}
									removeTips={this.props.delPersonTips}
								/> : null
							}
							{
								dataList && dataList.length != 0 ? dataList.map((item, index) => {
										item.fastResponses ? item.fastResponses.sort((a, b) => a.rank - b.rank) : null;
										console.log("index: "+index);
										return (
											<GroupCard
												newGroup={this.state.newGroup}
												operatingUserId={this.operatingUserId}
												getPersonTipsAll={this.props.getPersonTipsAll}
												newTipsGroup={this.props.newPersonTipsGroup}
												editTipsGroup={this.props.editPersonTipsGroup}
												removeTipsGroup={this.props.delPersonTipsGroup}
												getTipsData={this.props.getPersonTipsItem}
												newTips={this.props.newPersonTips}
												editorTips={this.props.editPersonTips}
												removeTips={this.props.delPersonTips}
												key={index} groupItemData={item}
												ind={index}
												leng={dataList.length}
												handleRank={this.handleRank.bind(this)}
												editPersonTipsRank={this.props.editPersonTipsRank}
											/>
										);
									}) :
									<div className="NoData">
                                        <p><img src={Nodata}/></p>
										<p style={{paddingTop: "20px", textAlign: "center", color: "#999"}}> 暂无数据</p>
									</div>
							}
						</div>
						<NTModal visible={this.state.isImportShow} title={getLangTxt("import")}
						         style={{position: "relative", top: "50%", marginTop: "-112px"}}
						         onCancel={this.cancelImport.bind(this)}
						         footer={
							         [
								         <Button key="back" type="ghost" size="large" style={{marginRight: "8px"}}
								                 onClick={this.cancelImport.bind(this)}>{getLangTxt("cancel")}</Button>,
								         <Upload showUploadList={false} key="submit" {...props}
								                 onChange={this.onSelectFile.bind(this)}>
									         <Button type="primary" size="large"
									                 onClick={this.importVisibleConfirm.bind(this)}>{getLangTxt("import")}</Button>
								         </Upload>
							         ]
						         }>
							<p>{getLangTxt("setting_import_note1")}</p>
							<p>{getLangTxt("setting_import_note2")}</p>
							<p>{getLangTxt("setting_import_note3")}</p>
							<p>{getLangTxt("setting_import_note4")}</p>
							<p>{getLangTxt("setting_import_note5")}</p>
						</NTModal>
					</ScrollArea>
				</div>
				{
					getProgressComp(progress)
				}
			</div>
		)
	}
}

UsedWords = Form.create()(UsedWords);

function mapStateToProps(state)
{
	return {
		dataList: state.getPersonWords.data,
		progress: state.getPersonWords.progress,
		errorMsg: state.getPersonWords.errorMsg
	}
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		getPersonTipsAll, newPersonTipsGroup, editPersonTipsGroup, delPersonTipsGroup,
		getPersonTipsItem, newPersonTips, editPersonTips, delPersonTips, importPersonCommonWord, editPersonTipsTypeRank,
		editPersonTipsRank
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(UsedWords);
