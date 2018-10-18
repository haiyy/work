import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Upload } from "antd";
import { upload, UPLOAD_IMAGE_ACTION, UPLOAD_FILE_ACTION, getLangTxt } from "../../../../utils/MyUtil";
import { sendMessage } from "../../redux/reducers/eventsReducer";
import MessageType from "../../../../im/message/MessageType";
import LogUtil from "../../../../lib/utils/LogUtil";
import { Tooltip, message } from "antd";
import { Map } from "immutable";
import { sendMessageWithChatData } from "../../../../utils/ConverUtils";

class ToolUpload extends React.PureComponent {
	
	static ImageType = "sendimg";
	static FileType = "sendfile";
	static MAX_FILE_SIZE = 1024 * 1024 * 20;  //20M
	_lastFileUid = null;
	_messageError = null;
	
	constructor(props)
	{
		super(props);
	}
	
	handleChange(info)
	{
		let file = info.file;
		
		if(file && file.originFileObj instanceof File)
		{
			
			if(this._lastFileUid && file.uid === this._lastFileUid)
				return;
			
			let name = this.props.item.get("name"),
				type = name == ToolUpload.FileType ? UPLOAD_FILE_ACTION : UPLOAD_IMAGE_ACTION,
				originFileObj = file.originFileObj,
				msgType = name == ToolUpload.FileType ? MessageType.MESSAGE_DOCUMENT_FILE : MessageType.MESSAGE_DOCUMENT_IMAGE,
				fileType = name == ToolUpload.FileType ? 4 : 2;
			
			this._lastFileUid = file.uid;
			
			this.sendMessage(sendFile(originFileObj, 0, msgType));
			
			upload(originFileObj, type)
			.then((res) => {
				log(["handleChange upload res = ", res]);
				
				var {jsonResult = {data: {}}} = res,
					{data = {srcFile: {}, thumbnailImage: {}}, code} = jsonResult,
					success = code === 200;
				
				if(type === UPLOAD_FILE_ACTION)
				{
					var {fileSize, url, sourceurl, fileName, srcFileName} = data;
				}
				else
				{
					var {srcFile: {fileSize, url: sourceurl, srcFileName}, thumbnailImage: {url}} = data;
				}
				
				if(success)
				{
					this.sendMessage(sendFile(originFileObj, 1, msgType, "", {
						sourceurl, url, size: fileSize, oldfile: srcFileName, type: fileType
					}));
				}
				else
				{
					let err = type === UPLOAD_IMAGE_ACTION ? 20031 : 20032;
					
					this.sendMessage(sendFile(originFileObj, 1, msgType, err));
					
					if(this._messageError)
					{
						this._messageError();
						this._messageError = null;
					}
					
					this._messageError = message.error(getLangTxt(err));
				}
			});
		}
		
	}
	
	sendMessage(value)
	{
		sendMessageWithChatData(this.props.chatData, value[0], value[1]);
	}
	
	render()
	{
		let props, item = this.props.item, name = item.get("name");
		
		if(!name)
			return null;
		
		props = {
			beforeUpload(file)
			{
				if(name == ToolUpload.ImageType && (!file.type || !(file.type.indexOf("image/") > -1)))
				{
					log("beforeUpload file.type = " + file.type + ", 请上传图片！！！");
					
					//请上传图片
					message.error(getLangTxt("please_upload_image"));
					return false;
				}
				
				if(file.name.endsWith(".exe"))
				{
					getLangTxt("upload_note1");
					return false;
				}
				
				if(file.size > ToolUpload.MAX_FILE_SIZE)
				{
					//超出上传大小
					log("beforeUpload file.size = " + file.size + ", 文件超出上传大小限制");
					
					message.error(getLangTxt("please_upload_limit"));
					return false;
				}
				
				return true;
			}
		};
		
		if(name == ToolUpload.ImageType)
		{
			props.accept = ".JPG,.JPEG,.GIF,.PNG,.BMP";
		}
		
		return (
			<Upload {...props} onChange={this.handleChange.bind(this)}>
				<Tooltip placement="bottom" title={item.get("title")} arrowPointAtCenter
				         overlayStyle={{lineHeight: '0.16rem'}}>
					<i className={this.props.propsClassName}/>
				</Tooltip>
			</Upload>
		
		)
	}
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace('ToolUpload', info, log);
}

/**
 * 发送文件或者图片数据
 * @param {File} file
 * @param {Number} progress 1 or 0
 * @param {String} type 图片或者文件
 * @param {int} error 错误code
 * @param {Object} loadData 上传图片返回数据
 * @return {Object}
 * */
export function sendFile(file, progress, type, error = -1, loadData = null)
{
	return [{file, progress, error, loadData}, type];
}

function mapStateToProps(state)
{
	let {chatPageReducer} = state,
		chatData = chatPageReducer.get("chatData") || {};
	
	return {chatData};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({sendMessage}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ToolUpload);
