### IM导出类
##### 1.必须导出 
```javascript
NIMClient.js            
NIMClientConfig.js            
MessageACK.js      
INIMCallBack.js        
ConnectStatus.js    //连接状态码        
Lang.js     //根据状态码获取文本        
```
##### 2.可选  
```javascript
ILang.js //自定义多语言        
LogUtil.js//日志打印                   
NIMCode.js  //状态码  
```

##### IM初始化DEMO
```javascript
import NIMClientConfig from './im/core/NIMClientConfig';  
import NIMClient from "./im/core/NIMClient";  
import SessionManager from "./logic/session/SessionManager";  
   
var nimClient = new NIMClient();  
var callBack = new SessionManager();  
var config = new NIMClientConfig();  
```   
### 配置
```javascript
config.appId = 'appkey001';  
config.userId = userId  
config.userName = 'caixiaobing';
config.device = "{\"id\":\"" + 11 + "\",\"deviceType\":\"" + 'pc' + "\",\"os\":\"" + 'ios' + "\",\"deviceModel\":\"" + null + "\",\"browse\":\"" + null + "\"}";  
config.sessionId = userId + '_nim';  
config.hosts = ['192.168.30.229'];  
config.ports = [8083];  
//连接服务器     
nimClient.init(config, callBack);  
nimClient.connect();//连接服务器  
       
//接收服务器状态        
callBack.onConnectStatusHandler(connectStatus, errorCode)                
       
//发布消息        
nimClient.publish('发布消息', 11, MessageACK.SUCCESS_ACK);//发布了一条可确认发送是否成功消息      
callBack.onMessageDeliveredHandler('发布消息', 41);//表示发送至服务器     
       
//接收消息        
callBack.onMessageArrivedHandler({'发布消息'});//表示接收服务器消息     
       
//说明：
SessionManager extends ICallBack (./im/api/ICallBack)  
ICallBack::onMessageArrivedHandler(message);//收到上行消息  
ICallBack::onConnectStatusHandler(connectStatus, errorCode);//IMSDK向UI层报网络状态  
ICallBack::onMessageDeliveredHandler(message, isArrived );//IMSDK向UI层反馈消息发送状态  
 
NIMClient::init(nimConfig, icallBack);//初始化NIMClient配置  
NIMClient::connect();//建立与服务器之间的连接  
NIMClient::publish(payload, messageType, qos = 0);//发布消息  
NIMClient::doDisconnect();//断开与服务器之间的连接  
``` 
### IM 自定义多语言
IM默认语言：zh_CN

设置英语：config.i18n = 'en_US';

自定义多语言如下：   

```javascript
//ILang接口   
setget langs       
getError(errorCode, ...args)        
getLangTxt(errorCode, ...args)     

import ILang from "../api/ILang";       
  
class CustomLang extends ILang      
{       
 	constructor()       
   	{       
   		super();      
  		this._langs = {     
  		    30001:'未知错误',       
   	    }       
   	}       
 }  
       
//使用：    
window.i18n = {30002:"扩展语言"}        
Lang.langs = new CustomLang();     
Lang.getLangTxt(30001);//==> '未知错误'     
Lang.getLangTxt(30002);//==> '扩展语言'  
```
 **注：**
 自定义多语言需要在初始化IMClient之前完成



