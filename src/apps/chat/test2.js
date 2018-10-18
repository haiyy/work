let chatinfo = {
	"m": 5001,
	"body":{
		"success": true,
		"converid": "kf_1000_00014564641",
		"conversationInfo": {
			"evalutionResult": "评价结果",
			"conclusion": "总结",
			"starttime": 1489718412404,
			"customerid":"kf_1000_customer_caixiaobing1",
			"members": [
				{
					"userid": "kf_1000_customer_caixiaobing1",
					"account": "caixiaobing1",
					"nickname": "caixiaobing1",
					"showname": "caixiaobing1",
					"message": "请问iPhone 7s plus还有货吗？",
					"content":"当当的访客",
					"title":"访客1",
					"num": "6条",
					"current_date":"2016-10-08 16:44:10",
					"access_date":"2016-10-08 16:44:10",
					"sessionState": "endline",
					"source":"&#xe609;",
					"usericon": "https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/img/logo_top_ca79a146.png",
					"type": 2,
					"crm":1,
					"country": "中国",
					"province": "北京",
					"city": "北京",
					"entrance":"售后",
					"chatstatus":2,
					"startpage":{
						"url": "http://confluence.xiaoneng.cn/pages/viewpage.action?pageId=9113345#IM下行接口-3.接收会话信息",
						"level": "咨询发起页深度",
						"levelname": "咨询发起页深度名称",
						"starttime": "咨询发起时间",
						"parentpagetitle": ""
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
	for (var i = 0; i < num; i++)
	{
		converid = "kf_1000_00014564641_" + i;
		userid = "kf_1000_customer_" + i;
		chats.push(createChatInfo(converid, userid));
	}

	return chats;
}

let chathistory = {
	"m": 3021,
	"body":{
		"converid": "kf_1000_00014564641",
		"messages": [
			{
				"converid": "kf_1000_00014564641",
				"messageid": "f1477383362000",
				"createtime": 1483525622622,
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
				"message": "44444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444"
			},
			{
				"converid": "kf_1000_00014564641",
				"messageid": "f1477383362001",
				"createtime": 1483525622622,
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
				"msgtype": 11,
				"expiredTime": 0,
				"message": "有货44444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444"
			},
			{
				"converid": "kf_1000_00014564641",
				"messageid": "f1477383362001",
				"createtime": 1483525622622,
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
				"errorType": 1,
				"expiredTime": 0,
				"message": "邀请评价已成功！"
			},
			{
				"sourceurl": "https://fileupload-dev.ntalker.com/func/imagetrans/download2.php?f=/rc3J9s13PpDAvJfH2Cab7Mhs8wiRG/jKg&q=rLVhcYFvha1dBPpXHWSRbr486Z5FWzWjfZzwo2KFTQCQJmsBopCYGht0wVv3yvijaHaxqqsMiAcAIQkfnq1aSmpmLHyKSDVB",
				"extension": "",
				"size": "123kb",
				"converid": "kf_1000_00014564641",
				"messageid": "15718836032",
				"fromuser": {
					"chatStatus": 3,
					"type": 2,
					"userid": "wangpeng315"
				},
				"message": "传输完成",
				"sys": 0,
				"msgtype": 12,
				"url": "https://fileupload-dev.ntalker.com/func/imagetrans/image2.php?f=/rc3J9s13PpDAvJfH2Cab7Mhs8wiRG/jKg&q=rLVhcYFvha1dBPpXHWSRbr486Z5FWzWjfZzwo2KFTQCQJmsBopCYGht0wVv3yvijaHaxqqsMiAcAIQkfnq1aSmpmLHyKSDVB",
				"status": 1
			}
		]
	}
};

let pridictMessage = {
	"m": 5004,
	"body": {
		"converid": "kf_1000_00014564641",
		"fromuser": "正在输入的成员id",
		"message": "正在输入的消息"
	}
};

let invitMessage = {
	"m": 6201, //Method Code
	"body": {
		"sm":"invit", //业务说明
		"msglevel":2,
		"message":"客服W1邀请您加入会话",
		"converid": "kf_1000_00014564641",
		"callbackoperation": [
			{
				"operationName": "accept",
				"operationSubmit": "{\"accept\":\"taskid_1\"}"
			},
			{
				"operationName": "refuse",
				"operationSubmit": "{\"refuse\":\"taskid_1\"}"
			}
		]
	}
};

let invit1Message = {
	"m": 6201, //Method Code
	"body": {
		"sm":"invit", //业务说明
		"msglevel":2,
		"message":"邀请已发送，请等待客服W2确认",
		"converid": "kf_1000_00014564641",
		"callbackoperation": [
			{
				"operationName": "cancel",
				"operationSubmit": "{\"cancel\":\"task_1\"}"
			}
		]
	}
};

let invit2Message = {
	"m": 6201, //Method Code
	"body": {
		"sm":"invitAccepted", //业务说明
		"msglevel":2,
		"message":"客服W2已进入会话",
		"converid": "kf_1000_00014564641"
	}
};

function test2(window)
{
	window.callBack.onMessageArrivedHandler(JSON.stringify(chatinfo));
	window.callBack.onMessageArrivedHandler(JSON.stringify(pridictMessage));
	window.callBack.onMessageArrivedHandler(JSON.stringify(chathistory));
	window.pridictMessage = function(message)
	{
		pridictMessage.content = message;
		window.callBack.onMessageArrivedHandler(JSON.stringify(pridictMessage));
	};

	window.onChat = onChat;
	window.invite1 = invite1;
	window.invite2 = invite2;
	window.invite3 = invite3;
}

function onChat(num = 25)
{
	let chats = createChats(num);

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

function invite3()
{
	window.callBack.onMessageArrivedHandler(JSON.stringify(invit2Message));
}


export default test2;
