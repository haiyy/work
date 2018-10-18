import React from "react";
import { Table, Button, Input, Checkbox,Modal,Tooltip} from 'antd';
import './style/searchListComp.less'
import './style/Receptiongroup.less'
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import { ReFresh } from "../../../components/ReFresh";
import { getRecePtiongGroupList, queryRecePtiongGroupList, deleteRecePtiongGroup, putRecePtiongGroup, addRecePtiongGroup, getCtiGroups } from "../redux/reducers/receptiongroupReducer";
import NTTableWithPage from "../../../components/NTTableWithPage"
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { getProgressComp } from "../../../utils/MyUtil";
import ReceptiongroupComponent from "../util/ReceptiongroupComponent"
import { getTableTdContent } from "../../../utils/ComponentUtils";
import moment from "moment";

const Search = Input.Search;
const confirm = Modal.confirm;
class Receptiongroup extends React.Component {
	constructor(props)
	{
		super(props);
		this.state = {
			currentPage: 1,
			groudName: '',
			modalShow: false,
			visible: false,
			requestType: '',
			tempeltesId: '',

		}

	}

	componentDidMount()
	{
		let {groudName, currentPage} = this.state;
		this.getRecePtiongGroupList(groudName, currentPage);


	}

	getRecePtiongGroupList(templateName, currentPage)
	{
		let {actions} = this.props
		actions.getRecePtiongGroupList(templateName, currentPage);
	}

	reFreshFn()
	{
		let {groudName, currentPage} = this.state;

		this.getRecePtiongGroupList(groudName,currentPage)
	}

	//初始化表格Data
	getData()
	{
		return [
			{
				key: 'templateName',
				dataIndex: 'templateName',
				title: '接待组名称',
                width: '',
                className:'grouptemplateName',
                render:((text,record)=>{

                    return getTableTdContent(record.templateName, 192)
                })
			}, {
				key: 'xntemplateId',
				dataIndex: 'xntemplateId',
				title: '接待组ID',
				width: ''
			}, {
				key: 'createTime',
				dataIndex: 'createTime',
				title: '创建时间',
                render:((text)=>{
                    text = moment(text)
                        .format("YYYY-MM-DD HH:mm:ss");
                    return <span style={{width:"125px",display:"inline-block"}}>{text}</span>;
                })
			}, {
				key: 'updateTime',
				dataIndex: 'updateTime',
				title: '最新修改时间',
                render:((text)=>{
                        text = moment(text)
                            .format("YYYY-MM-DD HH:mm:ss");
                        return <span style={{width:"125px",display:"inline-block"}}>{text}</span>;
                })
			}, {
				key: 'operation',
				dataIndex: 'operation',
				title: '操作',
                width: '120px',
                render: (text, data, index) => (
                        <div style={{textAlign:"center",position:"relative"}}>
                        <i className="Receptiongroup_btn icon-bianji iconfont" icon="edit"
                            onClick={this.onAccountPut.bind(this, data, 'edit')} />
						<i className="Receptiongroup_btn icon-shanchu iconfont" icon="delete"
						        onClick={this.onAccountDelete.bind(this, data, index)} />
                        </div>
				),
			}
		]
	}

	/*change currentpage*/
	onCurrentPage(value)
	{
		let {actions} = this.props,
			{groudName} = this.state;

		this.setState({
			currentPage: value
		})
		actions.getRecePtiongGroupList(groudName, value);
	}

	/*change 接待组搜索*/
	onGroupsName()
	{
		let {actions} = this.props,
            {groudName} = this.state;

			
		actions.getRecePtiongGroupList(groudName);
	
	
	}

	onAccountDelete(item, index)
	{
        let _this=this;
        confirm({
            title: '提示',
            content: '是否确认删除?',
            onOk()
            {
                let {actions, dataList} = _this.props,
                    {groudName} = _this.state,
                    {list} = dataList;
				list = list.splice(index, 1);
				
				actions.deleteRecePtiongGroup(item.xntemplateId);
				
            },
            onCancel()
            {},
        });
	}

	_getProgressComp()
	{
		let {progress} = this.props;

		if(progress === LoadProgressConst.LOADING || progress === LoadProgressConst.SAVING)  //正在加载或正在保存
		{
			return getProgressComp(progress);
		}

		return null;
	}

	onCreateGroup(type)
	{
        if (this.onisGroupLength()){
            this.onModalShow();
            this.setState({
                requestType: type,
            });
        };
	}

    //判断接待组是否 超过30
    onisGroupLength()
    {
        let {dataList} = this.props,
            { totalPage, maxCtiGroupNumber} = dataList,
            flag=false;

        if(totalPage==maxCtiGroupNumber){
            confirm({
                title: '提示',
                content: `最多同时存在${maxCtiGroupNumber}个接待组`,
                onOk(){  return flag;},
                onCancel(){},
            });
        }else{
            flag=true;
            return flag;
        }
    }

	/*Put fn */
	onAccountPut(item, type)
	{
        this.onModalShow();

        this.setState({
			requestType: type,
			tempeltesId: item.xntemplateId,
        })

        let {actions} = this.props;

        actions.getCtiGroups(item.xntemplateId)

	}

	onFormDatachange(form)
	{
		let {requestType} = this.state;

		if(requestType == "edit")
		{
			this.editFormDataFn(form)
		}
		else
		{
			this.createFormDataFn(form);
		}

		this.onEnClosureClose();
	}

	createFormDataFn(form)
	{
		let {actions} = this.props;

		form.userIds = form.userIds.join(",");
		actions.addRecePtiongGroup(form);

	}

	editFormDataFn(form)
	{
		let {actions} = this.props,
			{tempeltesId} = this.state;
		form.userIds = form.userIds.join(",");
		actions.putRecePtiongGroup(form, tempeltesId);
	}

	onModalShow()
	{
		this.setState({
			modalShow: true,
			visible: true
		});
	}

	/*关闭Modal*/
	onEnClosureClose()
	{
		this.setState({
			modalShow: false,
			visible: false
		});
	}

	componentWillReceiveProps(nextProps)
	{
		let {currentPage} = this.state;
		if(nextProps.reloadFlag && !this.props.reloadFlag)
		{
			this.getRecePtiongGroupList('', currentPage)
		}
	}

    onGroudNameChange(e){
        this.setState({
            groudName:e.target.value
        })
    }

	render()
	{
		let {dataList, progress} = this.props,
			{list, totalPage} = dataList,
			{currentPage, modalShow, visible, requestType,groudName} = this.state;

		if(progress === LoadProgressConst.LOAD_FAILED)  //加载失败
		{
			return <ReFresh reFreshStyle={{width: "100%"}} reFreshFn={this.reFreshFn.bind(this)}/>;
		}
		return <div className="Receptiongroup">
			<div className="Receptiongroup-search">
                <div className="bindonSearch searchBox search">
                    <Button type="primary"
                        className="Receptiongroup-create"
                        onClick={this.onCreateGroup.bind(this, 'create')}>新增</Button>
                    <Input
                        placeholder="请输入接待组名称"
                        maxlength={50}
						value={groudName}
						onPressEnter={this.onGroupsName.bind(this)}
                        onChange={this.onGroudNameChange.bind(this)}
                    />
                    <Button className="searchBtn" type="primary" onClick={this.onGroupsName.bind(this)}
                        icon="search"></Button>
                </div>
			</div>
			<div>
				<NTTableWithPage currentPage={currentPage} columns={this.getData()} dataSource={list} total={totalPage}
				                 selectOnChange={this.onCurrentPage.bind(this)}/>
			</div>
			{
				modalShow ?
					<ReceptiongroupComponent actionsType={requestType} onformData={this.onFormDatachange.bind(this)}
					                         modalShow={modalShow} visible={visible}
					                         handleCancel={this.onEnClosureClose.bind(this)}/>
					: null
			}

			{
				this._getProgressComp()
			}
		</div>
	}
}

const mapStateToProps = (state) => {
	let {receptiongroupReducer} = state;
	return {
		dataList: receptiongroupReducer.get("groupList") || {},
		queryList: receptiongroupReducer.get("queryList") || {},
		progress: receptiongroupReducer.get("progress"),
		reloadFlag: receptiongroupReducer.get("recePtionGrouproloadFlag") || false,

	};
}

const mapDispatchToProps = (dispatch) => ({
	actions: bindActionCreators({
		getRecePtiongGroupList, queryRecePtiongGroupList, deleteRecePtiongGroup, putRecePtiongGroup, addRecePtiongGroup,
		getCtiGroups
	}, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(Receptiongroup);

