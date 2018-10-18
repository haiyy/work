import React from 'react';
import ReactDOM from "react-dom";
import { Icon, Button, Tabs, Collapse } from 'antd';
import { connect } from 'react-redux';
import ScrollArea from 'react-scrollbar';
import { bindActionCreators } from 'redux';
import Logo from "../../../components/Logo";
import UserInfo from "../../../model/vo/UserInfo";
import { bglen } from "../../../utils/StringUtils";
import '../../../public/styles/chatpage/retweet.scss';
import '../../../public/styles/enterpriseSetting/consultDetail.scss';
import MessageType from "../../../im/message/MessageType";
import SystemSentence from "../../../model/vo/sentence/SystemSentence";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";
import { setPageRoute, getConsultDetail } from "../../../apps/record/redux/consultReducer";
import { formatTimestamp, createSentence, getProgressComp, formatTime, getSourceForDevice, getLangTxt, downloadByATag, configProxy, token, loginUserProxy } from "../../../utils/MyUtil";
import ImageMessage from "../../chat/view/message/ImageMessage";
import TextMessage from "../../chat/view/message/TextMessage";
import GlobalEvtEmitter from "../../../lib/utils/GlobalEvtEmitter";
import { getSummaryModal } from "../../../utils/ConverUtils";
import NTImageView from "../../../components/NTImageView";
import HyperMediaMessage from "../../chat/view/message/HyperMediaMessage";
import VideoMessage from "../../chat/view/message/VideoMessage";
import AudioMessage from "../../chat/view/message/AudioMessage";
import Trajectory from "../../chat/view/aside/trajectory/Trajectory";

const TabPane = Tabs.TabPane, Panel = Collapse.Panel;

class ConsultDetail extends React.PureComponent {
	constructor(props)
	{
		super(props);

		this.state = {
			isOpen: false,
			summaryProps: {visible: false}
		};

		this.onShowImageView = this.onShowImageView.bind(this);
		this.hideSummaryModal = this.hideSummaryModal.bind(this);
		this.terminalMap = {
			0: "Others", 1: "web", 2: "wechat", 3: "wap", 4: "IOS App", 5: "Android App", 6: "weibo", 7: "AliPay"
		};
		this.pleasedMap = {0: "未评价", 1: "非常不满意", 2: "不满意", 3: "一般", 4: "满意", 5: "非常满意"};
		this.solveMap = {0: "未解决", 1: "未解决", 2: "跟进中", 3: "已解决"};
		GlobalEvtEmitter.on("show_all_img", this.onShowImageView);
	}

	onShowImageView(currentSrc)
	{
		let imageBox = ReactDOM.findDOMNode(this.refs["scrollArea1"]),
			currentImage = 0;

		if(imageBox)
		{
			let images = imageBox.getElementsByTagName("img") || [];

			if(images.length > 0)
			{
				images = Array.from(images);

				currentImage = images.findIndex(value => value.currentSrc === currentSrc);

				currentImage = currentImage < 0 ? 0 : currentImage;

				images = images.map(value => {
					if(value.alt && value.alt.indexOf("http") > -1)
					{
						return value.alt;
					}
					else
					{
						return value.currentSrc;
					}
				});
			}
			else
			{
				images = [currentSrc];
			}

			this.setState({isOpen: true, currentImage, images});
		}
	}

	_onClose()
	{
		this.setState({isOpen: false});
	}

	componentWillUnmount()
	{
		GlobalEvtEmitter.removeListener("show_all_img", this.onShowImageView);
	}

	changeClick()
	{
		this.props.setPageRoute('main');
	}

	getNum(value)
	{
		if(value < 0)
			return 0;

		return value;
	}

	componentDidMount()
	{
		if(this.pageRoute != 'consult_detail')
			this.props.setPageRoute('main');
	}

	get messageList()
	{
		return this.getData("messageList");
	}

	get progress()
	{
		return this.getData("progress");
	}

	get conversation()
	{
		return this.getData("conversation");
	}

	get search()
	{
		return this.getData("search");
	}

	get pageRoute()
	{
		let {consultData} = this.props;

		return consultData.getIn(["pageRoute"]);
	}

	get extra()
	{
		return this.getData("extra") || {};
	}

	getData(key2)
	{
		let {consultData} = this.props;

		return consultData.getIn(["consultDetail", key2]);
	}

	getMsgContentList(messageList)
	{
		if(!Array.isArray(messageList))
			return null;

		return messageList.map((message, index) => {
			if(!message || !message.hasOwnProperty("msgtype"))
				return null;

			let sentence = createSentence(message, message.msgtype);

			return this.getMessageComp(sentence, index);
		});
	}

	reFreshFn()
	{
		let {conversationId, guestId} = this.extra;

		if(conversationId) // && guestId
		{
			this.props.getConsultDetail(conversationId); //, guestId
		}
	}

    exportConsultDetail()
    {
        let {conversationId} = this.extra;

        if(conversationId) // && guestId
        {
            let tokenValue = token(),
                {siteId} = loginUserProxy(),
                exportUrl = configProxy().nCrocodileServer + '/conversation/detail/export?converId=' + conversationId + '&token=' + tokenValue + '&siteId=' + siteId;

            downloadByATag(exportUrl);
        }
    }

	/*获取 访客信息*/
	getVisitorInformationComp()
	{
		let conversation = this.conversation || {},
			{ip, city, startPage = {}, landPage, sourcePage, customerName} = conversation;

		return (
			<div className="contentInfoContainer">
                <p>基本信息</p>
                <div className="itemContent">
                    <span> 访客名称: </span>
                    <span> {customerName || '暂无'} </span>
                </div>
				<div className="itemContent">
					<span> 访客IP: </span>
					<span> {ip || '空'} </span>
				</div>
				<div className="itemContent">
					<span> 访客地域: </span>
					<span> {city || '空'} </span>
				</div>
                <div className="itemContent">
                    <span> 咨询发起页: </span>
                    {
                        startPage.url ? <a target="_blank" href={startPage.url}>{startPage.title}</a> : <span> 空 </span>
                    }
                </div>
                <div className="itemContent">
                    <span> 着陆页: </span>
                    {
                        landPage ? <a target="_blank" href={landPage}>{landPage}</a> : <span>空</span>
                    }
                </div>
                <div className="itemContent">
                    <span> 来源页: </span>
                    {
                        sourcePage ? <a target="_blank" href={sourcePage}>{sourcePage}</a> : <span>空</span>
                    }
                </div>
			</div>
		)
	}

	/*获取 会话信息*/
	getSessionComp()
	{
		let conversation = this.conversation || {},
            {
                customerName, mainKfNames,
                templateName, starTtime, firstResponseTime,
                avgResponseTime, whenlong, totalTime, destroyTime,
                totalMsg, kfTotalMsg, customerTotalMsg, rounds, converTypeStr,
                actionStrList, evaluateHistory, summaryHistory, converId
            } = conversation;

		return (
            <ScrollArea speed={1} horizontal={false} smoothScrolling
                style={{height: '100%'}}>
                <div className="contentInfoContainer">
                    <p>基本信息</p>
                    <div className="itemContent">
                        <span> 会话ID: </span>
                        <span> {converId || '暂无'} </span>
                    </div>
                    <div className="itemContent">
                        <span> 访客名称: </span>
                        <span> {customerName || '暂无'} </span>
                    </div>
                    <div className="itemContent">
                        <span> 客服名称: </span>
                        <span> {mainKfNames || '暂无'} </span>
                    </div>
                    <div className="itemContent">
                        <span> 客服组: </span>
                        <span> {templateName || '暂无'} </span>
                    </div>
                    <p>会话生命周期</p>
                    <div className="itemContent">
                        <span> 会话开始时间: </span>
                        <span> {starTtime || '暂无'} </span>
                    </div>
                    <div className="itemContent">
                        <span> 首次响应时间: </span>
                        <span> {firstResponseTime || '暂无'} </span>
                    </div>
                    <div className="itemContent">
                        <span> 平均响应时间: </span>
                        <span> {avgResponseTime || '暂无'} </span>
                    </div>
                    <div className="itemContent">
                        <span> 会话有效时长: </span>
                        <span> {whenlong || '暂无'} </span>
                    </div>
                    <div className="itemContent">
                        <span> 会话总时长: </span>
                        <span> {totalTime || '暂无'} </span>
                    </div>
                    <div className="itemContent">
                        <span> 会话销毁时间: </span>
                        <span> {destroyTime || '暂无'} </span>
                    </div>
                    <div className="itemContent">
                        <span> 会话消息条数: </span>
                        <span> {totalMsg || '暂无'} </span>
                    </div>
                    <div className="itemContent">
                        <span> 客服消息条数: </span>
                        <span> {kfTotalMsg || '暂无'} </span>
                    </div>
                    <div className="itemContent">
                        <span> 访客消息条数: </span>
                        <span> {customerTotalMsg || '暂无'} </span>
                    </div>
                    <div className="itemContent">
                        <span> 会话回合数: </span>
                        <span> {rounds || '暂无'} </span>
                    </div>
                    <div className="itemContent">
                        <span> 会话类型: </span>
                        <span> {converTypeStr || '暂无'} </span>
                    </div>
                    <Collapse bordered={false}>
                        <Panel header="查看会话生命周期详细流程" key="1">
                            {this.getActionStrList(actionStrList)}
                        </Panel>
                    </Collapse>
                    <p>评价信息</p>
                    {
                        this.getassessmentInformaticaComp()
                    }
                    <Collapse bordered={false}>
                        <Panel header="查看评价信息详细流程" key="1">
                            {this.getEvaluateStrList(evaluateHistory)}
                        </Panel>
                    </Collapse>
                    <p>咨询总结</p>
                    {
                        this.getSummaryInfoComp()
                    }
                    <Collapse bordered={false}>
                        <Panel header="查看咨询总结详细流程" key="1">
                            {this.getSummaryStrList(summaryHistory)}
                        </Panel>
                    </Collapse>
                </div>

            </ScrollArea>
		)
	}

    /*会话生命周期*/
    getActionStrList(listData)
    {
        if (!listData || !listData.length)
            return <div className="itemContent">暂无</div>;
        return listData.map(item =>
        {
            return <div className="actionStrItem">
                <span className={"actionStrIcon actionStrIcon" + item.flag}></span>
                <span className="actionStrCon">{item.time}</span>
                <span className="actionStrCon">{item.str}</span>
            </div>
        })
    }

    /*评价信息流水*/
    getEvaluateStrList(evaluateHistory)
    {
        if (!evaluateHistory || !evaluateHistory.length)
            return <div className="itemContent">暂无</div>;
        return evaluateHistory.map(item =>
        {
            let {evaluateTimeStr, evaluate1, evaluate2, evaluate3, evaluateMethodStr} = item;

            return <div className="actionStrItem actionStrItemElse clearFix">
                <span className="actionStrIcon actionStrIcon2"></span>
                <span className="actionConComp">
                    <span className="actionStrCon">{evaluateTimeStr}</span>
                    <span className="actionStrCon">访客提交评价，评价结果：{evaluate1}；{evaluate2}；{evaluate3}，评价方式；{evaluateMethodStr}</span>
                </span>
            </div>
        })
    }

    /*咨询总结流水*/
    getSummaryStrList(summaryHistory)
    {
        if (!summaryHistory || !summaryHistory.length)
            return <div className="itemContent">暂无</div>;
        return summaryHistory.map(item =>
        {
            let {summaryTimeStr, summary, remark, kfName} = item;

            return <div className="actionStrItem actionStrItemElse clearFix">
                <span className="actionStrIcon actionStrIcon2"></span>
                <span className="actionConComp">
                    <span className="actionStrCon">{summaryTimeStr}</span>
                    <span className="actionStrCon">客服{kfName}对会话进行总结，总结结果：{summary || "无"}，备注：{remark || "无"}</span>
                </span>
            </div>
        })
    }

	/*获取 评价信息*/
	getassessmentInformaticaComp()
	{
		let conversation = this.conversation || {},
			{evaluate1, evaluate2, evaluate3, evaluateMethodStr, isInviteEvaluateStr} = conversation,
            eveluateArr = [];

        if (evaluate1)
            eveluateArr.push(evaluate1);
        if (evaluate2)
            eveluateArr.push(evaluate2);
        if (evaluate3)
            eveluateArr.push(evaluate3);

		return [
            <div className="itemContent">
                <span> 评价结果 : </span>
                <span> {eveluateArr.join(";") || "无"}</span>
            </div>,
            <div className="itemContent">
                <span> 评价方式 : </span>
                <span> {evaluateMethodStr || "无"} </span>
            </div>,
            <div className="itemContent">
                <span> 是否邀请评价 : </span>
                <span> {isInviteEvaluateStr || "无"} </span>
            </div>
        ]
	}

    getSummaryInfoComp()
    {
        let conversation = this.conversation || {},
            {summary, summaryRemark} = conversation;

        return [
            <div className="itemContent">
                <span> 咨询总结 : </span>
                <i className="iconfont icon-zixunzongjie"
                    onClick={this.onSummaryEdit.bind(this)}/>
                <span>  {summary || "空"}  </span>
            </div>,
            <div className="itemContent">
                <span> 备注 : </span>
                <span> {summaryRemark || "无"} </span>
            </div>
        ]
    }

	fileTypeArr = [".DOCX", ".PDF", ".JPG", ".PNG", ".PPT", ".RAR", ".ZIP", ".XLSX", ".TXT"];

	/*判断文件类型*/
	getFileTypeImgSrc(suffixName)
	{
		if(!suffixName)
			return require("../../../public/images/chatPage/unknown.png");

		if(suffixName === ".DOCX" || suffixName === ".DOC")
		{
			suffixName = ".DOCX";
		}

		if(this.fileTypeArr.indexOf(suffixName) === -1)
			return null;

		let fileUrl = require("../../../public/images/chatPage/" + suffixName.substring(1) + ".png");

		return fileUrl;
	}

	getMessageComp(sentence, index)
	{
		if(!sentence)
			return null;

		let bodyComp,
			{sentenceID, userName, createTime: curCreateTime, userInfo: {type}} = sentence,
			styleColor = UserInfo.isCustomer(type) ? "#11cd6e" : "#0177d7",
			backgroundStyle = {
				background: 'url(' + require('../../../public/images/receptionConsultation/blue.png') + ') center no-repeat',
				width: "12px"
			};

		switch(sentence.messageType)
		{
			case MessageType.MESSAGE_DOCUMENT_TXT:
			case MessageType.MESSAGE_DOCUMENT_RICH_MEDIA:
				bodyComp = <TextMessage sentence={sentence}/>;
				break;

			case MessageType.MESSAGE_DOCUMENT_IMAGE:
				bodyComp = <ImageMessage message={sentence}/>;
				break;

			case MessageType.MESSAGE_DOCUMENT_FILE:
				let {fileName, url} = sentence,
					name = /\.[^\.]+$/.exec(fileName),
					suffix = (name && name.length > 0) ? name["0"].toUpperCase() : "",
					imgSrc = this.getFileTypeImgSrc(suffix);

				if(bglen(fileName) > 13 && fileName.length > 10)
				{
					let string1 = fileName.slice(0, 4),
						string2 = fileName.slice(-6);
					fileName = string1 + "..." + string2;
				}

				bodyComp = (
					<div className='fileMessage'>
						<div className="suffix"
						     style={imgSrc ? {background: "url(" + imgSrc + ") no-repeat center"} : {background: '#999'}}>
							{imgSrc ? null : suffix}
						</div>
						<div className="fileMsgBox">
							<p>{fileName}</p>
							<p className="size">{sentence.size}</p>
						</div>
						<div className="downloadBox">
							<a href={url} style={{verticalAlign: 'middle', marginLeft: '10px'}}>{getLangTxt("down")}</a>
						</div>
					</div>
				);
				break;

			case MessageType.MESSAGE_DOCUMENT_AUDIO:
				bodyComp = (
					<AudioMessage message={sentence}/>
				);
				break;

			case MessageType.MESSAGE_DOCUMENT_COMMAND:
				userName = getLangTxt("sys_msg");
				styleColor = '#666';
				backgroundStyle = {
					background: 'url(' + require('../../../public/images/receptionConsultation/red.png') + ') center no-repeat',
					width: "14px"
				};

				if(sentence.systemType === SystemSentence.STARTPAGE_TYPE && sentence.message)
				{
					let startPage = sentence.message;

					bodyComp = (
						<div className="systemPrompt">
							<a href={startPage.url} target="_blank">{startPage.pagetitle}</a>
						</div>
					);
				}
				else
				{
					bodyComp = (
						<div className="systemPrompt">
							{
								sentence.messageBody
							}
						</div>
					);
				}
				break;
			case MessageType.MESSAGE_DOCUMENT_HYPERMEDIA:
				bodyComp = <HyperMediaMessage message={sentence}/>;
				break;

			case MessageType.MESSAGE_DOCUMENT_VIDEO:
				bodyComp = (
					<VideoMessage message={sentence}/>
				);
				break;
		}

		return (
			<div key={sentenceID}
			     className={this.state.currentIndex === index ? "retweetHistoryList selected" : "retweetHistoryList"}
			     style={this.state.currentIndex === index ? {} : {backgroundColor: '#fff'}}
			     onClick={this.changeBackgroundColor.bind(this, index)}>
				<span className="retweetImg" style={backgroundStyle}/>
				<span className="retweetUserName" style={{color: styleColor}}>
					{userName}
				</span>
				<span className="retweetCreateTime">
					{formatTimestamp(curCreateTime)}
				</span>
				<p>
					{bodyComp}
				</p>
			</div>
		);
	}

	changeBackgroundColor(index)
	{
		this.setState({currentIndex: index});
	}

	getSummaryText(converId)
	{
        if(converId)
        {
            this.props.getConsultDetail(converId)
                .then(result => {
                    if (result.code == 200)
                        this.forceUpdate();
                });//获取详情列表
        }
	}

	onSummaryEdit(e)
	{
		let conversation = this.conversation || {},
			{customerName, customerId, converId} = conversation;

		let summaryProps = {
			visible: true, summaryAll: this.props.chatSummaryAll,
			close: this.hideSummaryModal,
			converId: converId, rosterUser: {userId: customerId, userName: customerName},
			getSummaryText: this.getSummaryText.bind(this), isCurrent:false
		};

		this.setState({summaryProps});
	}

	hideSummaryModal()
	{
		let {summaryProps} = this.state;

		this.setState({summaryProps: {...summaryProps, visible: false}});
	}

    onConverInfoTabChange()
    {

    }

	render()
	{
		let conversation = this.conversation || {},
			messageList = this.messageList || [],
			progress = this.progress,
			{guestname, summary, source, terminal, customerId} = conversation,
			conversationList = this.getMsgContentList(messageList),
			url = getSourceForDevice(source, this.terminalMap[terminal]),
			{isOpen, images, currentImage, summaryProps} = this.state;

		if(progress === LoadProgressConst.LOAD_FAILED)
			return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;

		let toolFuncsData = this.props.toolFuncsData,
			evaluateEnable = true;

		if(toolFuncsData)
		{
			let index = toolFuncsData.findIndex(item => "summary" === item.get("name") && item.get("enable") === 1);
			if(index <= -1)
			{
				evaluateEnable = false;
			}
		}

		return (
			[<div className="contentMainLeftComp">
				<div className="consultDetail">
					<div onClick={this.changeClick.bind(this)} className="leftOfConsult">
						<Icon className="iconStyle backIcon" type="left"/>
						<span className="backText"> 返回 </span>
					</div>
					<Button className="reFreshBtn" type="primary" shape="circle" size="small" onClick={this.reFreshFn.bind(this)}>
						<i className="icon-shuaxin iconfont"/>
					</Button>
                    <Button type="primary" className="exportBtn" onClick={this.exportConsultDetail.bind(this)}> 导出 </Button>
				</div>

				<div className="consultDetailContent" style={{height: 'calc(100% - 51px)'}}>
					<div className="contentHead">
						<div className="contentHeadLeft">
							<Logo url={url} link={"visitor"}/>
							<span className="constuom"> {guestname || '访客'} </span>
						</div>
					</div>

					<div className="contentMain" style={{height: 'calc(100% - 55px)'}}>
						<div className="contentMainLeft">
							<ScrollArea ref="scrollArea1" speed={0.8} style={{height: '100%'}} smoothScrolling>
								{
									conversationList
								}
							</ScrollArea>
						</div>
					</div>
				</div>
				{
					getProgressComp(progress)
				}
				{
					isOpen ?
						<NTImageView
							images={images}
							currentImage={currentImage}
							_onClose={this._onClose.bind(this)}
						/> : null
				}
				{
					summaryProps.visible ? getSummaryModal(summaryProps) : null
				}
			</div>,
            <div className="contentMainRight">
                <Tabs defaultActiveKey="1" type="card" className="consultTabContent" onChange={this.onConverInfoTabChange.bind(this)}>
                    <TabPane tab="会话信息" key="1">
                        {
                            this.getSessionComp()
                        }
                    </TabPane>
                    <TabPane tab="用户信息" key="2">
                        {
                            this.getVisitorInformationComp()
                        }
                    </TabPane>
                    <TabPane tab="用户轨迹" key="3">
                        <Trajectory ntid={ customerId }/>;
                    </TabPane>
                </Tabs>
            </div>
            ]

		);
	}
}

function mapStateToProps(state)
{
	let {consultReducer1: consultData, summaryReducer, startUpData} = state,
		{chatSummaryAll} = summaryReducer,
		toolFuncsData = startUpData.get("toolFuncsData");

	return {consultData, chatSummaryAll, toolFuncsData};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({setPageRoute, getConsultDetail}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ConsultDetail);
