import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { bglen } from "../../../../utils/StringUtils"
import { downloadByATag } from "../../../../utils/MyUtil";
import MessageType from "../../../../im/message/MessageType";
import Lang from "../../../../im/i18n/Lang";

class FileTransMessage extends React.PureComponent {

	constructor(props)
	{
		super(props);
		this.state = {
			url: "",
			load: true
		}
	}

	_getUrl()
	{
		let message = this.props.message;
		if(message && message.file)
		{
			let file = message.file,
				reader = new FileReader();

			reader.addEventListener("load", () => {
				this.setState({url: reader.result});
			}, false);

			reader.readAsDataURL(file);
		}
	}

	componentDidMount()
	{
		this._getUrl();
	}

	componentDidUpdate()
	{
		this._getUrl();
	}

	onDown(url, fileName)
	{
		if(url.indexOf("?") > -1 && fileName)
		{
			url += "&downLoadFileName=" + fileName;
		}

		downloadByATag(url, fileName);
	}

	fileTypeArr = [".DOCX", ".PDF", ".JPG", ".PNG", ".PPT", ".RAR", ".ZIP", ".XLSX", ".TXT"];

	/*判断文件类型*/
	getFileTypeImgSrc(suffixName)
	{
        let fileUrl;

        if (!suffixName)
            return require("../../../../public/images/chatPage/unknown.png");

		if(suffixName === ".DOCX" || suffixName === ".DOC")
		{
			suffixName = ".DOCX";
		}

		if(this.fileTypeArr.indexOf(suffixName) === -1)
			return null;

		fileUrl = require("../../../../public/images/chatPage/" + suffixName.substring(1) + ".png");

		return fileUrl;
	}

	_getDownComp(message)
	{
		if(message.url)
		{
			return (
				<div className="downloadBox">
					<span onClick={this.onDown.bind(this, message.url, message.fileName)}>下载</span>
				</div>
			);
		}

		return null;
	}

	_getDom(message)
	{
		let fileName = message.fileName,
			name = /\.[^\.]+$/.exec(fileName),
			suffix = (name && name.length > 0) ? name["0"].toUpperCase() : "";

		if(bglen(fileName) > 13 && fileName.length > 10)
		{
			let string1 = fileName.slice(0, 4),
				string2 = fileName.slice(-6);

			fileName = string1 + "..." + string2;
		}

		let imgSrc = this.getFileTypeImgSrc(suffix);

		return (
			<div className='fileMessage'>
				<div className="suffix" style={imgSrc ? {background: "url(" + imgSrc + ") no-repeat center"} : {background: '#999'}}>
					{
						imgSrc ? null : suffix
					}
				</div>
				<div className="fileMsgBox">
					<p className="fileName">{fileName}</p>
					<p className="size">{message.size}</p>
				</div>
				{
					this._getDownComp(message)
				}
			</div>
		)
	}
	
	getError()
	{
		let {error, status} = this.props.message;
		
		if(status === MessageType.STATUS_MESSAGE_SEND_FAILED && error)
		{
			let text = Lang.getLangTxt(error);
			
			return [<div className="errorTipsBg"></div>,
				<div className="errorTips">{text}</div>]
		}
		
		return null;
	}

	render()
	{
		if(!this.props.message)
			return null;

		let message = this.props.message;
		return (
			<div>
				{
					this._getDom(message)
				}
				{
					this.getError()
				}
			</div>
		);
	}
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({}, dispatch);
}

export default connect(null, mapDispatchToProps)(FileTransMessage);
