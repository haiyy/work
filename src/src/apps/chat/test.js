import MessageType from "../../im/message/MessageType";
import MessageACK from "../../im/message/MessageACK";
import { createMessageId } from "../../lib/utils/Utils";
import Model from "../../utils/Model";
import NtalkerListRedux from "../../model/chat/NtalkerListRedux";
import { createSentence } from "../../utils/MyUtil";

let chatinfo = {
		"m": 5001,
		"body": {
			"success": true,
			"converid": "kf_3004_template_9_1507544385349",
			"conversationInfo": {
				"evalresult": "小能非常棒，Yeah！",
				"conclusion": "总结",
				"starttime": new Date().getTime(),
				"customerid": "018c5d3a-ac76-4aa6-9df9-c98df55331a1",
				summarized: 1,
				templatename: "我是咨询入口，。。。。。",
				"members": [
					{
						"userid": "018c5d3a-ac76-4aa6-9df9-c98df55331a1",
						"username": "caixiaobing当当的访客当当的访客",
						"content": "当当的访客",
						"title": "访客1",
						"num": "6条",
						"current_date": "2016-10-08 16:44:10",
						"access_date": "2016-10-08 16:44:10",
						"sessionState": "endline",
						"source": "ss",
						"usericon": "https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/img/logo_top_ca79a146.png",
						"type": 2,
						"crm": 1,
						"country": "中国",
						"province": "北京",
						"city": "北京",
						"entrance": "售后",
						"chatstatus": 5,
						"status": 1,
						"startpage": {
							"url": "http://confluence.xiaoneng.cn/pages/viewpage.action?pageId=9113345#IM下行接口-3.接收会话信息",
							"level": "咨询发起页深度",
							"levelname": "咨询发起页深度名称",
							"starttime": "咨询发起时间",
							"parentpagetitle": "",
							prid: "ntalker_test"
						},
						"usertrail": {
							"country": "中国",
							"province": "江苏",
							"tml": "android",
							"source": "input",
							"dv": "3",
							keyword: "售前"
						}
					},
					{
						"userid": "kf_1000_supplier_lisi",
						"account": "lisi",
						"nickname": "lisi",
						"showname": "lisi",
						"type": 1
					},
					{
						"userid": "kf_1000_supplier_lisi22",
						"account": "lisi1",
						"nickname": "lisi1",
						"showname": "lisi1",
						"type": 1
					},
					{
						"userid": "kf_1000_supplier_lisi23",
						"account": "lisi2",
						"nickname": "lisi2",
						"showname": "lisi2",
						"type": 1
					}
				]
			}
		}
	},
	chatinfo1 = {
		"m": 5001,
		"body": {
			"success": true,
			"converid": "kf_3004_template_9_1507544385349",
			"conversationInfo": {
				"evalutionResult": "评价结果",
				"conclusion": "总结",
				"starttime": new Date().getTime(),
				"customerid": "018c5d3a-ac76-4aa6-9df9-c98df55331a1",
				summarized: 1,
				"members": [
					{
						"userid": "018c5d3a-ac76-4aa6-9df9-c98df55331a1",
						"username": "方可名横",
						"content": "当当的访客",
						"title": "访客1",
						"num": "6条",
						"current_date": "2016-10-08 16:44:10",
						"access_date": "2016-10-08 16:44:10",
						"sessionState": "endline",
						"source": "ss",
						"usericon": "https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/img/logo_top_ca79a146.png",
						"type": 2,
						"crm": 1,
						"country": "中国",
						"province": "北京",
						"city": "北京",
						"entrance": "售后",
						"chatstatus": 1,
						"status": 1,
						"startpage": {
							"url": "http://confluence.xiaoneng.cn/pages/viewpage.action?pageId=9113345#IM下行接口-3.接收会话信息",
							"level": "咨询发起页深度",
							"levelname": "咨询发起页深度名称",
							"starttime": "咨询发起时间",
							"parentpagetitle": "",
							prid: "ntalker_test"
						},
						"usertrail": {
							"country": "中国",
							"province": "江苏",
							"tml": "android",
							"source": "input",
							"dv": "3",
							keyword: "售前"
						}
					},
					{
						"userid": "kf_1000_supplier_lisi",
						"account": "lisi",
						"nickname": "lisi",
						"showname": "lisi",
						"type": 1
					}
				]
			}
		}
	};

let _5006_message = {
	"body": {
		"converid": "kf_3004_template_9_1507544385349",
		"member": {
			"chatstatus": 2,
			"type": 2,
			"userid": "018c5d3a-ac76-4aa6-9df9-c98df55331a1"
		}
	},
	"m": 5006
}

let chatInfoStr = JSON.stringify(chatinfo);

function createChatInfo(converId, userid)
{
	let chatInfo = JSON.parse(chatInfoStr);
	chatInfo.body.converid = converId;
	chatInfo.body.conversationInfo.customerid = userid;
	chatInfo.body.conversationInfo.members.userid = userid;
	return chatInfo;
}

function createChats(num)
{
	let chats = [], converid = "0", userid = "0";
	for(var i = 0; i < num; i++)
	{
		converid = "kf_3004_template_9_1507544385349_" + i;
		userid = "kf_1000_customer_" + i;
		chats.push(createChatInfo(converid, userid));
	}
	
	return chats;
}

let chathistory = {
	"m": 3021,
	"body": {
		"converid": "kf_3004_template_9_1507544385349",
		"messages": [
			{
				"converid": "kf_3004_template_9_1507544385349",
				"messageid": "f1477383362000",
				"createat": 1504668498716,
				"status": 41,
				"fromuser": {
					"userid": "kf_1000_customer_zhangsan",
					"account": "zhangsan",
					"nickname": "zhangsan",
					"showname": "zhangsan",
					"usericon": "https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/img/logo_top_ca79a146.png",
					"type": 1
				},
				"toUsers": [],
				"msgtype": 11,
				"expiredTime": 0,
				"message": '<!DOCTYPE HTML> <html><Script>alert("XSS attack available!");</Script><body> 您便可进行789845612312私密浏览了。共用此设备的其他用户将不会看到您 </body> </html>'
			},
			{
				"converid": "kf_3004_template_9_1507544385349",
				"messageid": "f1477383362001",
				"createat": 1498125160058,
				"status": 43,
				"fromuser": {
					"userid": "kf_1000_customer_zhangsan",
					"account": "zhangsan",
					"nickname": "zhangsan",
					"showname": "zhangsan",
					"usericon": "https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/img/logo_top_ca79a146.png",
					"type": 2,
					"usertrail": {
						"country": "中国",
						"province": "江苏",
						"tml": "android",
						"source": "input",
						"dv": "3",
					}
				},
				"tousers": [],
				"type": "2",
				"msgtype": 11,
				"expiredTime": 0,
				"message": "您便可进行私密浏览了。共用此设备的其他用户将不会看到您"
			},
			{
				"converid": "kf_3004_template_9_1507544385349",
				"messageid": "f14773833ssss62001",
				"createat": 1498125160058,
				"status": 43,
				"fromuser": {
					"userid": "kf_1000_customer_zhangsan",
					"account": "zhangsan",
					"nickname": "zhangsan",
					"showname": "zhangsan",
					"usericon": "https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/img/logo_top_ca79a146.png",
					"type": 1
				},
				"tousers": [],
				"type": "2",
				"msgtype": 11,
				"expiredTime": 0,
				"message": "121315464"
			},
			{
				"converid": "kf_3004_template_9_1507544385349",
				"messageid": "f1477383ssss362001",
				"createat": 1498125160058,
				"status": 42,
				"fromuser": {
					"userid": "kf_1000_dae8c1f4-ca1d-4cb6-98f",
					"account": "lisisss",
					"nickname": "lisiss",
					"showname": "lisiss",
					"type": 1
				},
				"tousers": [],
				"type": "2",
				"msgtype": 11,
				"expiredTime": 0,
				"message": "我是另一个客服"
			},
			{
				"converid": "kf_3004_template_9_1507544385349",
				"messageid": "f1477383362001",
				"createat": 1498125160058,
				"status": 43,
				"fromuser": {
					"userid": "kf_1000_dae8c1f4-ca1d-4cb6-98f1-f79b8447e4b5",
					"account": "lisi",
					"nickname": "lisi",
					"showname": "lisi",
					"type": 2
				},
				"tousers": [],
				"type": "2",
				"msgtype": 19,
				"errortype": 1,
				"expiredTime": 0,
				"message": "邀请评价已成功！"
			},
			{
				"sourceurl": "https://fileupload-dev.ntalker.com/func/imagetrans/download2.php?f=/rc3J9s13PpDAvJfH2Cab7Mhs8wiRG/jKg&q=rLVhcYFvha1dBPpXHWSRbr486Z5FWzWjfZzwo2KFTQCQJmsBopCYGht0wVv3yvijaHaxqqsMiAcAIQkfnq1aSmpmLHyKSDVB",
				"extension": "",
				"size": "123kb",
				"converid": "kf_3004_template_9_1507544385349",
				"messageid": "15718836032",
				"fromuser": {
					"chatStatus": 1,
					"type": 2,
					"userid": "wangpeng315"
				},
				"message": "传输完成",
				"sys": 0,
				"msgtype": 12,
				"url": "https://fileupload-dev.ntalker.com/func/imagetrans/image2.php?f=/rc3J9s13PpDAvJfH2Cab7Mhs8wiRG/jKg&q=rLVhcYFvha1dBPpXHWSRbr486Z5FWzWjfZzwo2KFTQCQJmsBopCYGht0wVv3yvijaHaxqqsMiAcAIQkfnq1aSmpmLHyKSDVB",
				"status": 1
			},
			{
				"converid": "kf_3004_template_9_1507544385349",
				"messageid": "1571883603sas2",
				"message": {
					"startpage": {
						"url": "http://localhost:8080/chats",
						"pagetitle": "发起页标题",
						prid: "ntalker_test"
					}
				},
				"sys": 3,
				"msgtype": 19,
				"status": 1
			},
			{
				"converid": "kf_3004_template_9_1507544385349",
				"messageid": "1571883603sas21213",
				"createat": 1523433136461,
				"fromuser": {
					"userid": "kf_1000_dae8c1f4-ca1d-4cb6-98f1-f79b8447e4b5",
					"account": "langgeligelang",
					"nickname": "langgeligelang",
					"showname": "langgeligelang",
					"type": 2
				},
				"message": "视频",// 文件名称
				"msgtype": 14,//14
				"status": 14,
				"url": "https://www.baidu.com/img/superlogo_c4d7df0a003d3db9b65e9ef0fe6da1ec.png",
				"sourceurl": "https://zootest.oss-cn-beijing.aliyuncs.com/1523415815642.mp4",
			},
			{
				"converid": "kf_3004_template_9_1507544385349",
				"messageid": "1571883603sas21213w",
				"createat": 1523433136462,
				"fromuser": {
					"userid": "kf_1000_dae8c1f4-ca1d-4cb6-98f1-f79b8447e4b5",
					"account": "langgeligelang",
					"nickname": "langgeligelang",
					"showname": "langgeligelang",
					"type": 2
				},
				"message": "视频",// 文件名称
				"msgtype": 14,//14
				"status": 14,
				"url": "https://www.baidu.com/img/superlogo_c4d7df0a003d3db9b65e9ef0fe6da1ec.png",
				"sourceurl": "https://zootest.oss-cn-beijing.aliyuncs.com/1523415815642.mp4",
			},
			{
				"converid": "kf_3004_template_9_1507544385349",
				"messageid": "1571883603sas2121",
				"createat": 1498125160058,
				"fromuser": {
					"userid": "kf_1000_dae8c1f4-ca1d-4cb6-98f1-f79b8447e4b5",
					"account": "反反复复",
					"nickname": "xicuicui",
					"showname": "xi水电费xihaha",
					"type": 2
				},
				"message": "语音",
				"url": "http://www.170mv.com/kw/other.web.ra01.sycdn.kuwo.cn/resource/n1/128/20/8/6110147.mp3",
				"msgtype": 13,//13
				"status": 13,
				"duration": 1000  //s
			}, {
				"converid": "kf_3004_template_9_1507544385349",
				"messageid": "1571883603sas2122",
				"createat": 1498125160068,
				"fromuser": {
					"userid": "kf_1000_dae8c1f4-ca1d-4cb6-98f1-f79b8447e4b5",
					"account": "反反复复",
					"nickname": "xicuicui",
					"showname": "xi水电费xihaha",
					"type": 2
				},
				"message": "语音",
				//"url": "http://www.w3school.com.cn/i/horse.ogg",
				"url": "http://www.170mv.com/kw/other.web.ra01.sycdn.kuwo.cn/resource/n1/128/20/8/6110147.mp3",
				"msgtype": 13,//13
				"status": 13,
				"duration": 1000  //s
			},
			{
				"converid": "kf_3004_template_9_1507544385349",
				"messageid": "1571883603sas212222",
				"createat": 1498125160058,
				"fromuser": {
					"userid": "kf_1000_dae8c1f4-ca1d-4cb6-98f1-f79b8447e4b5",
					"account": "反反复复",
					"nickname": "enaena",
					"showname": "xi水电费xihaha",
					"type": 2
				},
				"message": "语音",
				//"url": "http://dl.stream.qqmusic.qq.com/C40000139TbH38Uurs.m4a?vkey=E7DAFCDE8883064590F8400BB1600551B652C9C3442394B42141F91C58D99922ACBA2A7DD717C801868D92E0BD9454739A0A08FA561050D9&guid=2083752776&uin=0&fromtag=66",
				"url": "http://www.170mv.com/kw/other.web.ra01.sycdn.kuwo.cn/resource/n1/128/20/8/6110147.mp3",
				"msgtype": 13,//13
				"status": 13,
				"duration": 1000  //s
			},
			{
				"converid": "kf_3004_template_9_1507544385349",
				"messageid": "Prc-upload-1506507727860-3",
				"createat": 1498125160058,
				"fromuser": {
					"userid": "kf_1000_dae8c1f4-ca1d-4cb6-98f1-f79b8447e4b5",
					"account": "xicuicui",
					"nickname": "xicuicui",
					"showname": "xicuicui",
					"username": "xicuicui"
				},
				"message": "1506509650278-169263901.png",
				"msgtype": 17,
				"status": 17,
				"size": "45645",
				"url": "http: //filestorage-base.ntalker.com/file/?key=L2NsaWVudC8xNTA2NTA5NjUwMjc4LTE2OTI2MzkwMS5wbmc="
			},
			{
				"converid": "kf_3004_template_9_1507544385349",
				"messageid": "Prc-upload-15sss06507727880-4",
				"createat": 1498125160058,
				"fromuser": {
					"userid": "kf_1000_dae8c1f4-ca1ssd-4cb6-98f1-f88b",
					"account": "chaomeiti",
					"showname": "chaomeiti",
					"username": "chaomeiti",
					"type": 2
				},
				"message": "https://www.baidu.com",
				"msgtype": 15,
				"status": 15,
				"expiredtime": 0
			}
		]
	}
};

let pridictMessage = {
	"m": 5004,
	"body": {
		"converid": "kf_3004_template_9_1507544385349",
		"fromuser": "正在输入的成员id",
		"message": "正在输入的消息"
	}
};

let invitMessage = {
	"m": 5020,
	"body": {
		"cooptype": 2,                                  // 协同类型，邀请:2  转接:3
		"taskid": "task_1",                             // 协同任务id
		"converid": "kf_3004_template_9_1507544385349",   // 会话id
		"source": {
			"id": "s_0002",                               // 源客服id
			"nickname": "刘光伦",                          // 源客服内部名称
			"showname": "伦伦",                            // 源客服外部名称
			"usericon": ""                                // 源客服头像
		},
		"vistorname": "访客003",                          // 访客名称
		"description": "咨询售后问题",                    // 对本次协同请求的描述
	}
};

let invit1Message = {
	"m": 5021,
	"body": {
		"cooptype": 2,
		"converid": "kf_3004_template_9_1507544385349",
		"targets": {
			"targetid": "s_0003",            // 目标id
			"targetname": "客服0003"          // 客服名称
		},
		"operation": 1,                      // 操作类型，cancel:1, accept:2, refuse:3
		"description": ""                    // 操作的理由或描述
	}
};

let testMessage = '{ "converid": "kf_3004_template_9_1507544385349", "messageid": "f1477383362000", "createat": 1504668498716, "status": 41, "msgtype": 11, "expiredTime": 0, "message": "IM消息测试！！！" }',
	sendMsgIntervalId = -1,
	goingTimes = 0;

function getNtalkerList()
{
	return Model.retrieveProxy(NtalkerListRedux.NAME);
}

function startSendMessage()
{
	if(sendMsgIntervalId !== -1)
		return;
	
	sendMsgIntervalId = setInterval(() => {
		goingTimes++;
		
		getNtalkerList()
		.tabList
		.forEach(chatData => {
			let message = JSON.parse(testMessage);
			
			message.converid = chatData.sessionId;
			message.messageid = createMessageId();
			message.createat = new Date().getTime();
			
			let outputMessages = chatData.chatDataVo.outputMessages[chatData.sessionId] || [];
			if(outputMessages.length > 20)
			{
				outputMessages.splice(0, 5);
				console.log("startSendMessage outputMessages.length = " + outputMessages.length)
			}
			
			chatData && chatData.sendMessage(createSentence(message, message.msgtype));
		})
		
		if(goingTimes > 60 * 30)
		{
			downloadLog();
			
			goingTimes = 0;
		}
	}, 1000);
}

function stopSendMessage()
{
	clearInterval(sendMsgIntervalId);
	sendMsgIntervalId = -1;
}

function test(window)
{
	window.callBack.onMessageArrivedHandler(JSON.stringify(chatinfo));
	window.callBack.onMessageArrivedHandler(JSON.stringify(pridictMessage));
	window.callBack.onMessageArrivedHandler(JSON.stringify(chathistory));
	window.pridictMessage = function(message) {
		pridictMessage.content = message;
		window.callBack.onMessageArrivedHandler(JSON.stringify(pridictMessage));
	};
	
	window.onChat = onChat;
	window.invite1 = invite1;
	window.invite2 = invite2;
	window.send = send;
	window.startSendMessage = startSendMessage;
	window.stopSendMessage = stopSendMessage;
	window._5001 = () => {
		window.callBack.onMessageArrivedHandler(JSON.stringify(chatinfo1));
	}
	
	window._5006 = (value) => {
		_5006_message.body.member.chatstatus = value;
		window.callBack.onMessageArrivedHandler(JSON.stringify(_5006_message));
	}
}

function send(text, sendTimes = 1)
{
	let count = 0, intenvalId;
	
	intenvalId = setInterval(function() {
		let sendtxt = text ? text : "测试测试测试测试！！！";
		window.callBack.publish(3006, sendtxt, 11, MessageACK.SUCCESS_ACK, "kf_3004_template_9_1507544385349", "", MessageType.MESSAGE_DOCUMENT, createMessageId())
		count++;
		
		if(count > sendTimes)
		{
			clearInterval(intenvalId);
		}
	}, 1000);
}

function onChat(num = 25)
{
	let chats = createChats(num);
	
	console.log("test chats：", chats);
	chats.forEach(item => {
		window.callBack.onMessageArrivedHandler(JSON.stringify(item));
	});
}

function invite1()
{
	window.callBack.onMessageArrivedHandler(JSON.stringify(invitMessage));
}

function invite2()
{
	window.callBack.onMessageArrivedHandler(JSON.stringify(invit1Message));
}

export default test;
