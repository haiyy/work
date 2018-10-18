import React from 'react';
import {Form, Input, Button, Upload, message, Popover} from 'antd';
import './style/newTips.scss';
import {upload, UPLOAD_IMAGE_ACTION, UPLOAD_FILE_ACTION, getLangTxt} from "../../../utils/MyUtil";
import ToolUpload from "../../../apps/chat/view/send/ToolUpload";
import Modal from "../../../components/xn/modal/Modal";
import {bglen} from "../../../utils/StringUtils";
import Select from "../../public/Select";
import {truncateToPop} from "../../../utils/StringUtils";

const FormItem = Form.Item,
    Option = Select.Option;

class NewTips extends React.PureComponent {

    static NEW_TIP = 1;
    static EDIT_TIP = 2;

    constructor(props) {
        super(props);

        this.state = {
            disabled: this.props.isEdit,
            flag: false,
            display: false,
            type: 1,
            fileList: [],
            fileUrl: null,
            fileName: null,
            imgUrl: null,
            imgName: null,
            ifImg: false,
            editImg: false,
            editFile: false,
            editText: false,
            changeGroup: false,
            cleared: false,
            gid: null,
            isedit: this.props.isEdit,
            size: ''
        }
    }

    //设置分组
    onChange(value, label, extra) {
        let {selectGroupInfo = {groupId: ''}} = this.props,
            {groupId = ''} = selectGroupInfo;

        this.props.onNewTipsSelectGroup(value);

        if (this.props.editorData && value === this.props.editorData.groupId || groupId && value == groupId) {
            this.setState({changeGroup: false})
        }
        else {
            this.setState({changeGroup: true, gid: value})
        }
    }

    //获取内容并判断是否为空
    getKeyWord(e) {

        this.setState({isedit: false});
        let {getFieldValue} = this.props.form,
            keyWord = getFieldValue("response") && getFieldValue("response")
                .trim();
        this.setState({type: 1});

        if (keyWord && keyWord.length > 0) {
            this.setState({disabled: true, type: 1});
        }
        else {
            this.setState({disabled: false});
        }
    }

    setIsEdit() {
        this.setState({isedit: false});
    }

    //点击上传文件
    getTypeFile() {
        this.setState({type: 2, ifImg: false});
    }

    //点击上传图片
    getTypeImage() {
        this.setState({type: 3, ifImg: true});
    }

    //上传文件或图片
    onChangeFun(info) {
        let type, {file, fileList} = info,
            {originFileObj, size} = file;

        fileList = fileList.slice(-2);

        if (!info.event) {
            switch (this.state.type) {
                case 2:
                    type = UPLOAD_FILE_ACTION;
                    break;
                case 3:
                    type = UPLOAD_IMAGE_ACTION;
                    break;
            }

            upload(originFileObj, type)
                .then((res) => {

                    let {jsonResult} = res,
                        {code, data = {}, success} = jsonResult;

                    if (!success) return;

                    if (success) {
                        let fileUrl = "", fileName = "", size = 0, thumbImageUrl = "", thumbImageName = "";
                        if (this.state.type == 2) {
                            fileUrl = data.url;
                            fileName = data.srcFileName;
                            size = data.fileSize;
                        }
                        else {
                            let {
                                thumbnailImage = {
                                    srcFileName: "",
                                    url: "",
                                    fileSize: 0,
                                    path: "",
                                    key: "",
                                    playTime: ""
                                },
                                srcFile = {srcFileName: "", url: "", fileSize: 0, path: "", key: "", playTime: ""}
                            } = data;
                            fileUrl = srcFile.url;
                            fileName = srcFile.srcFileName;
                            size = srcFile.fileSize;
                            thumbImageUrl = thumbnailImage.url;
                            thumbImageName = thumbnailImage.srcFileName;
                        }

                        this.setState({isedit: false});
                        this.setState({
                            flag: true, disabled: true, size: size, fileUrl: fileUrl, thumbImgUrl: thumbImageUrl,
                            fileName: fileName, thumbImgName: thumbImageName, fileList: fileList
                        });
                        this.props.form.setFieldsValue({"response": " "});
                    }
                });
        }
    }

    //点击清空移除已上传文件
    onRemoveFile() {
        this.props.form.setFieldsValue({"response": ""});
        if (this.props.newTipName == NewTips.NEW_TIP) {
            if (this.state.type != 1) {
                this.setState({
                    ifImg: false,
                    flag: false,
                    disabled: false,
                    fileUrl: null,
                    fileName: null,
                    size: '',
                    imgUrl: null,
                    imgName: null,
                    fileList: [],
                    type: 1,
                    isedit: false
                });
            }
            else {
                if (document.getElementById("clearInput")) {
                    document.getElementById("clearInput").value = "";
                }
                this.setState({
                    ifImg: false,
                    fileUrl: null,
                    type: 1,
                    isedit: false,
                    fileName: null,
                    size: '',
                    imgUrl: null,
                    imgName: null,
                    fileList: [], flag: false, disabled: false
                });

            }
        }
        else if (this.props.newTipName == NewTips.EDIT_TIP) {

            let {editorData = {}} = this.props;
            if (editorData.type !== 1 || this.state.type != 1) {
                this.setState({
                    isedit: false,
                    ifImg: false,
                    disabled: false,
                    flag: false,
                    fileUrl: null,
                    fileName: null,
                    size: '',
                    imgUrl: null,
                    imgName: null,
                    cleared: true,
                    fileList: [],
                    type: 1
                });
                if (document.getElementById("clearInput")) {
                    document.getElementById("clearInput").value = "";
                }
                this.setState({flag: false, disabled: false});

            }
            else {

                this.setState({
                    cleared: true,
                    isedit: false
                });
                if (document.getElementById("clearInput")) {
                    document.getElementById("clearInput").value = "";
                }
                this.setState({flag: false, disabled: false});
            }
        }
    }

    //下拉框展示分组信息
    _createTreeNodes(states)
    {
        if (states) return states.map(item =>
        {
            const {groupId, groupName} = item;

            // contentInfo = truncateToPop(groupName, 230) || {}
            // {
            //     contentInfo.show ?
            //         <Popover content={<div style={{
				// 					maxWidth: "1.4rem", height: "auto", wordBreak: "break-word", zIndex: "9999"
				// 				}}>{groupName}</div>} placement="topLeft">
            //             {contentInfo.content}
            //         </Popover>
            //         :
            //         groupName
            // }
            
            return (
                <Option key={groupId} value={groupId}> { groupName } </Option>
            );
        });
    }

    judgeTitleSpace(rule, value, callback) {
        if (value && typeof value !== "string")
            return callback();

        if (value && value.trim() !== "" && bglen(value) <= 200) {
            callback();
        }
        callback(" ");
    }

    judgeSpace(rule, value, callback) {
        if (value && typeof value !== "string")
            return callback();

        if (value && value.trim() !== "" && bglen(value) <= 1000) {
            callback();
        }
        callback(" ");
    }

    newTipOk() {
        let {form} = this.props;

        form.validateFields((errors) => {
            if (errors)
                return false;

            if (this.props.newTipName === NewTips.NEW_TIP) {
                let responseForI,
                    {selectGroupInfo = {groupId: ''}} = this.props,
                    {groupId = ''} = selectGroupInfo;

                if (this.state.type === 2) {
                    responseForI = {
                        fileUrl: this.state.fileUrl, fileName: this.state.fileName, notText: 1, size: this.state.size
                    };
                }
                else if (this.state.type === 3) {
                    responseForI = {
                        imgUrl: this.state.fileUrl, imgName: this.state.fileName, notText: 1, size: this.state.size
                    };
                }
                let obj = {
                    response: responseForI ? JSON.stringify(responseForI) : this.props.form.getFieldValue("response"),
                    title: this.props.form.getFieldValue("title") || "",
                    type: this.state.type/*,
					remark: this.props.form.getFieldValue("response") || ""*/
                };
                if (this.state.changeGroup) {
                    obj.groupId = this.state.gid;
                }
                else {
                    obj.groupId = groupId;
                }

                this.props.newTips(obj);
                this.props.changeNewTip();
            }

            if (this.props.newTipName === NewTips.EDIT_TIP) {
                let responseForI,
                    responseText,
                    responseType,
                    {editorData = {}} = this.props,
                    {type, cleared, changeGroup, gid} = this.state;
                if (cleared) {

                    if (type === 2) {
                        responseType = 2;
                        responseForI = {
                            fileUrl: this.state.fileUrl, fileName: this.state.fileName, notText: 1,
                            size: this.state.size
                        };
                    }
                    else if (type === 3) {
                        responseType = 3;
                        responseForI = {
                            imgUrl: this.state.fileUrl, imgName: this.state.fileName, notText: 1, size: this.state.size
                        };
                    }
                    else if (type === 1) {
                        responseType = 1;
                        responseText = this.props.form.getFieldValue("response")
                    }

                }
                else if (!cleared) {

                    if (editorData.type === 2) {
                        responseType = 2;
                        responseForI = {
                            fileUrl: editorData.response.fileUrl, fileName: editorData.response.fileName,
                            size: editorData.response.size, notText: 1
                        }
                    }
                    else if (editorData.type === 3) {
                        responseType = 3;
                        responseForI = {
                            imgUrl: editorData.response.imgUrl, imgName: editorData.response.imgName, notText: 1,
                            size: editorData.response.size
                        };
                    }
                    else if (editorData.type === 1) {
                        responseType = 1;
                        responseText = this.props.form.getFieldValue("response")
                    }

                }

                let obj = {
                    response: JSON.stringify(responseForI) || responseText,
                    title: this.props.form.getFieldValue("title") || "",
                    type: responseType,
                    itemId: editorData.itemId,
                    rank: editorData.rank,
                    editrank: 0,
                    groupId: gid || this.props.editorData.groupId
                };

                this.props.editorTips(obj);
                this.props.changeNewTip()
            }
        })
    };

    beforeUpload(file) {
        if (this.state.type == 3 && (!file.type || !(file.type.indexOf("image/") > -1))) {
            //log("beforeUpload file.type = " + file.type + ", 请上传图片！！！");
            //请上传图片
            message.error(getLangTxt("please_upload_image"));
            return false;
        }

        if (file.size > ToolUpload.MAX_FILE_SIZE) {
            //超出上传大小
            //log("beforeUpload file.size = " + file.size + ", 文件超出上传大小限制(20M)");
            message.error(getLangTxt("please_upload_limit"));
            return false;
        }

        return true;
    }

    render() {

        let {editorData} = this.props,
            {selectedKeys = []} = this.props,
            selectedKey = selectedKeys[0],
            newTipName = this.props.newTipName !== NewTips.NEW_TIP,
            modalTitle = this.props.newTipName === NewTips.NEW_TIP ? getLangTxt("setting_add_common_word") : getLangTxt("setting_add_common_edit");

        const {getFieldDecorator} = this.props.form,
            formItemLayout = {
                labelCol: {span: 6},
                wrapperCol: {span: 14}
            },
            props = {
                name: 'file',
                //accept: '.txt,.zip,.rar',
                listType: 'file'
            },

            props2 = {
                name: 'picture',
                accept: '.JPG,.JPEG,.GIF,.PNG',
                listType: 'picture'
            };

        return (
            <Modal className='newTipsStyle' title={modalTitle} visible={true}/* okText = "保存"*/
                     onOk={this.newTipOk.bind(this)} onCancel={this.props.changeNewTip.bind(this)}>
                <div className="choiceFatherGroup">
                    <Form hideRequiredMark={true}>
                        <FormItem
                            {...formItemLayout}
                            label={getLangTxt("setting_common_word_title")}
                            >{/*去掉了hasFeedback(绿色对号)*/}
                            {getFieldDecorator('title', {
                                initialValue: editorData && newTipName ? editorData.title : null,
                                rules: [{validator: this.judgeTitleSpace.bind(this)}]
                            })(
                                <Input/>
                            )}
                            <span className="inputTips">{getLangTxt("setting_common_word_title_note")}</span>
                        </FormItem>

                        <div className="fileBoxFormStyle">
                            <FormItem
                                {...formItemLayout}
                                label={getLangTxt("setting_common_word_content")}
                                >
                                {getFieldDecorator('response', {
                                    initialValue: editorData && newTipName ? editorData.response : null,
                                    rules: this.state.type === 1 ? [{required: true, message: ' '},
                                        {validator: this.judgeSpace.bind(this)}] : [{required: true, message: ' '}]
                                })(this.state.isedit ?
                                    <div>
                                        {
                                            editorData.type !== 1 ?
                                                <div className='uploadBox'>
                                                    {
                                                        editorData.type === 3 ?
                                                            <div className='fileBox'>
                                                                <img className='previewImg'
                                                                     src={editorData.response.imgUrl}
                                                                     alt={editorData.response.imgName}/>
                                                                <span className='previewImgName'>
                                                                    {editorData.response.imgName}
                                                                </span>
                                                            </div>
                                                            :
                                                            <div className='fileBox'>
                                                                <span
                                                                    className='fileName'>{getLangTxt("setting_common_word_filename")}</span>
                                                                <span className='previewImgName'>
                                                                    {editorData.response.fileName}
                                                                </span>
                                                            </div>
                                                    }
                                                </div>
                                                : <Input type="textarea" id="clearInput" value={editorData.response}
                                                         onFocus={this.setIsEdit.bind(this)}
                                                         className="NewTipsInput"/>
                                        }
                                    </div>
                                    :
                                    <div>
                                        {
                                            this.state.flag ?
                                                <div className='uploadBox'>
                                                    {
                                                        this.state.ifImg ?
                                                            <div className='fileBox'>
                                                                <img className='previewImg'
                                                                     src={this.state.thumbImgUrl}
                                                                     alt={this.state.thumbImgName}/>
                                                                <span className='previewImgName'>
                                                                    {this.state.thumbImgName}
                                                                </span>
                                                            </div>
                                                            :
                                                            <div className='fileBox'>
                                                                <span
                                                                    className='fileName'>{getLangTxt("setting_common_word_filename")}</span>
                                                                <span className='previewImgName'>
                                                                    {this.state.fileName}
                                                                </span>
                                                            </div>
                                                    }
                                                </div>
                                                :
                                                <Input
                                                    type="textarea"
                                                    id="clearInput"
                                                    className="isThisShow NewTipsInput"
                                                    onKeyUp={this.getKeyWord.bind(this)}
                                                />
                                        }
                                    </div>
                                )}
                                <div className="clearfix">
                                    <div className="btnBox clearfix">
                                        <Upload {...props} className="uploadBtn"
                                                showUploadList={false}
                                                beforeUpload={this.beforeUpload.bind(this)}
                                                onChange={this.onChangeFun.bind(this)}>
                                            <Button disabled={this.state.disabled}
                                                    onClick={this.getTypeFile.bind(this)}>
                                                <i className="icon-wenjianjia iconfont newTipsIcon"/>
                                            </Button>
                                        </Upload>

                                        <Upload {...props2} className="uploadBtn"
                                                showUploadList={false}
                                                beforeUpload={this.beforeUpload.bind(this)}
                                                onChange={this.onChangeFun.bind(this)}>
                                            <Button disabled={this.state.disabled}
                                                    onClick={this.getTypeImage.bind(this)}>
                                                <i className="icon-tupian iconfont newTipsIcon"/>
                                            </Button>
                                        </Upload>

                                        <Button type="default" className="clearFile"
                                                onClick={this.onRemoveFile.bind(this)}>{getLangTxt("clear")}</Button>
                                    </div>

                                    <div className="img-size">
                                        <div className="newTipsInfo">
                                            <span>{getLangTxt("setting_common_word_note1")}</span></div>
                                        <div className="newTipsInfo">
                                            <p>{getLangTxt("setting_common_word_note2")}</p>
                                            <p>{getLangTxt("setting_common_word_note3")}</p>
                                        </div>
                                    </div>
                                </div>
                            </FormItem>
                        </div>

                        <FormItem
                            {...formItemLayout}
                            label={getLangTxt("select_group")}>
                            {getFieldDecorator('groupName', {
                                initialValue: editorData && newTipName ? editorData.groupId : selectedKey,
                                rules: [{
                                    required: true,
                                    message: ' '
                                }]
                            })(
                                this.props.state ?
                                    <Select
                                        placeholder={getLangTxt("select_group")}
                                        onSelect={this.onChange.bind(this)}
                                        option={this._createTreeNodes(this.props.state)}
                                    /> : null
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        )
    }
}

NewTips = Form.create()(NewTips);

export default NewTips;
