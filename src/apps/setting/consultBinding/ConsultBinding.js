import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {Table, Tooltip, Popover,  message} from 'antd';
import './style/consultBinding.less'
import {getConsultBindingList, getConsultBindingDetail, editConsultBinding, clearConsultBindingErr} from "./reducer/consultBindingReducer";
import {truncateToPop} from "../../../utils/StringUtils";
import ConsultBindingCon from "./ConsultBindingCon";
import {getProgressComp} from "../../../utils/MyUtil";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import ReFresh from "../../../components/ReFresh";
import Modal,{ confirm, info, error, success, warning } from "../../../components/xn/modal/Modal";

class ConsultBinding extends React.PureComponent {

	constructor(props)
	{
		super(props);

		this.state = {
		};
	}

    componentDidMount() {
        this.props.getConsultBindingList();
    }

	componentDidCatch(error, info) {
		// Display fallback UI
		this.setState({ hasError: true });
	}

    handleEditBinding(editGroupItem)
    {
        let {bindingModalShow} = this.state;

        this.setState({bindingModalShow: !bindingModalShow});

        if (editGroupItem.templateid)
        {
            this.props.getConsultBindingDetail(editGroupItem.templateid);
            this.setState({editGroupItem})
        }
    }

    getBindingModal()
    {
        let {bindingModalShow, editGroupItem = {}} = this.state;

        return bindingModalShow ?
            <Modal className='consultBindingModal modalCommonStyle' width={640}
                title={editGroupItem.templateName} visible={true} okText="保存"
                onOk={this.handleBindingOk.bind(this)}
                onCancel={this.handleEditBinding.bind(this)}
            >
                <ConsultBindingCon bindingDetail={this.bindingDetail}/>
            </Modal> : null
    }

    getUnselectedIds(merchantids)
    {
        return merchantids.filter(item => item.selecttate !== 1);
    }

    handleBindingOk()
    {
        let {fullproxy = {merchantids: []}, halfproxy = {merchantids: []}} = this.bindingDetail,
            {merchantids: fullMerchantids} = fullproxy,
            {merchantids: halfMerchantids} = halfproxy;
        
        if (!this.bindingDetail)
            return false;
        
        fullproxy.merchantids = this.getUnselectedIds(fullMerchantids);
        halfproxy.merchantids = this.getUnselectedIds(halfMerchantids);

        this.props.editConsultBinding(this.bindingDetail);
        this.setState({bindingModalShow: !this.state.bindingModalShow});
    }

    reFreshFn()
    {
        this.props.getConsultBindingList();
    }

    _getProgressComp()
    {
        let {progress} = this;

        if (progress)
        {
            if (progress === LoadProgressConst.LOAD_COMPLETE || progress === LoadProgressConst.SAVING_SUCCESS)
                return;

            if(progress === LoadProgressConst.LOADING || progress === LoadProgressConst.SAVING)//正在加载或正在保存
            {
                return getProgressComp(progress);
            }
            else if(progress === LoadProgressConst.LOAD_FAILED)  //加载失败
            {
                return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;
            }else
            {
                let errorMsg = '', classname = '';
                if (progress === LoadProgressConst.SAVING_FAILED)
                {
                    errorMsg = '数据保存失败！';
                    classname = 'errorTip';

                }

                this.props.clearConsultBindingErr();

                this.errorModal = error({
                    title: '错误提示',
                    iconType: 'exclamation-circle',
                    className: classname,
                    content: errorMsg,
                    okText: '确定',
                    width: '320px',
                    onOk:() => {
                        this.errorModal = null;
                    }
                });
            }
        }

        return null;
    }

    get bindingDetail()
    {
        let {consultBinding} = this.props;

        return consultBinding.get("consultBindingDetail") || {};
    }

    get consultBindingList ()
    {
        let {consultBinding = {}} = this.props;

        return consultBinding.get("consultBindingList");
    }

    get progress()
    {
        let {consultBinding = {}} = this.props;

        return consultBinding.get("progress");
    }

	render()
	{
        const columns = getColumn.call(this),
            pagination = {
                total: this.shopListCount || 0,
                showQuickJumper: true,
                showTotal: (total) => {
                    return `总计 ${total} 条`;
                },
                onChange: (pageData) => {
                }
            };

		return (
			<div className="consultBindingComp">
                <Table columns={columns}
                    dataSource={this.consultBindingList}
                    pagination={pagination}
                />
                {

                    this.getBindingModal()

                }

                {
                    this._getProgressComp()

                }
			</div>
		);
	}
}

function getColumn()
{
    return [{
        key: 'templateName',
        title: '平台客服组',
        dataIndex: 'templateName',
        width: '20%'
    }, {
        key: 'userNumber',
        title: '客服人数',
        dataIndex: 'userNumber',
        width: '20%'
    }, {
        key: 'fullproxy',
        title: '全代理商户',
        dataIndex: 'fullproxy',
        className: 'fullProxyContainer',
        width: '20%',
        render: data => {
            let typeEle = document.querySelector(".fullProxyContainer"),
                dataString = data.join(",") || "未绑定",
                titleWidth = typeEle && typeEle.clientWidth,
                titleInfo = truncateToPop(dataString, titleWidth) || {};

            return titleInfo.show ?
                        <Popover content={<div style={{width: titleWidth + "px", height: "auto", wordBreak: "break-word"}}>{dataString}</div>}
                            placement="topLeft">
                            <div>{titleInfo.content}</div>
                        </Popover>
                        :
                        <div>{dataString}</div>
        }
    }, {
        key: 'halfproxy',
        title: '半代理商户',
        dataIndex: 'halfproxy',
        className: 'halfproxyContainer',
        width: '20%',
        render: data => {
            let typeEle = document.querySelector(".halfproxyContainer"),
                dataString = data.join(",") || "未绑定",
                titleWidth = typeEle && typeEle.clientWidth,
                titleInfo = truncateToPop(dataString, titleWidth) || {};

            return titleInfo.show ?
                <Popover content={<div style={{width: titleWidth + "px", height: "auto", wordBreak: "break-word"}}>{dataString}</div>}
                    placement="topLeft">
                    <div>{titleInfo.content}</div>
                </Popover>
                :
                <div>{dataString}</div>
        }
    }, {
        title: '操作',
        key: 'action',
        width: '20%',
        render: (data, record) =>
            <div className="shopOperate">
                <Tooltip placement="bottom" title="编辑">
                    <i className="iconfont icon-bianji" onClick={this.handleEditBinding.bind(this, record)}/>
                </Tooltip>
            </div>
    }];
}

function mapStateToProps(state)
{
	return {
        consultBinding: state.consultBindingReducer
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getConsultBindingList, getConsultBindingDetail, editConsultBinding, clearConsultBindingErr}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ConsultBinding);
