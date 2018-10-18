import React, { Component } from 'react';
import { Button } from 'antd';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { getLangTxt } from "../../../utils/MyUtil";

class Uploads extends Component {

	constructor(props)
	{
		super(props);

		this.state = {
			src: ""/*require("../../../public/images/kfPortrait.png")*/,
			cropResult: null,
			name: "",
			display: true,
			scale: 1
		};

		this.cropImage = this.cropImage.bind(this);
	}

	componentWillMount()
	{
		let imagesInfo = this.props.imagesInfo;

		if(imagesInfo.cropResult)
		{
			this.setState({cropResult: imagesInfo.cropResult})
		}
	}

	cropImage()
	{
		if(typeof this.cropper.getCroppedCanvas() === 'undefined')
		{
			return;
		}
		this.setState({
			cropResult: this.cropper.getCroppedCanvas()
			.toDataURL()
		});
	}

	onChange(e)
	{
		e.preventDefault();
		let files;
		if(e.dataTransfer)
		{
			files = e.dataTransfer.files;
		}
		else if(e.target)
		{
			files = e.target.files;
		}

		const reader = new FileReader();

		reader.onload = () =>
		{
			this.setState({src: reader.result, name: files[0].name, display: false});
		};

		reader.readAsDataURL(files[0]);
	}

	setRotateLeft()
	{
		if(!this.state.display)
		{
			this.cropper.rotate(-90);
		}
	}

	setRotateRight()
	{
		if(!this.state.display)
		{
			this.cropper.rotate(90);
		}
	}

	setScale()
	{
		if(!this.state.display)
		{
			let scale = this.state.scale, scaleSize = scale - 0.1;
			this.setState({scale: scaleSize});
			this.cropper.scale(scaleSize, scaleSize);
		}
	}

	setScaleBig()
	{
		if(!this.state.display)
		{
			let scale = this.state.scale, scaleSize = scale + 0.1;
			this.setState({scale: scaleSize});
			this.cropper.scale(scaleSize, scaleSize);
		}
	}

	uploadOk()
	{
		this.props.onOk();
		let cropResult = this.cropper.getCroppedCanvas().toDataURL();

        this.props.getCroperImage({
			cropResult: cropResult,
			src: this.state.src
		});
	}

	render()
	{
		const {minCropBoxSize} = this.props,
            styles = {
                preview: {
                    width: minCropBoxSize.width + "px", height: minCropBoxSize.height + "px", overflow: "hidden", border: "1px solid #e3e3e3", background: "#e1e1e1",
                    WebkitFilter: `brightness(${1}) contrast(${1}) saturate(${1})`
                },
                name: {float: "left", display: "inline-block", width: "50px"},
                col: {position: "relative", bottom: "5px"}
            },
            aspectRatio = minCropBoxSize.width / minCropBoxSize.height;

		return (
			<div className="cropper">
				<div className="cropper-title">
					<span className="file">
                        <input type="file" accept=".JPG,.JPEG,.PNG,.BMP"
                                onChange={this.onChange.bind(this)}/>
						{getLangTxt("setting_select_photos")}
                    </span>
					<span className="name">{this.state.name}</span>
				</div>

				<div style={{height: "364px"}}>
					<div style={{width: '400px', float: "left", overflow: "hidden"}}>
						<div className="cropper-body">
							<Cropper
								style={{height: 295, width: '100%', border: "1px solid #e3e3e3"}}
								aspectRatio={aspectRatio}
								preview=".img-preview"
								guides={false}
								cropBoxResizable={false}
								autoCropArea={0.376}
								minCropBoxWidth={minCropBoxSize.width}
								minCropBoxHeight={minCropBoxSize.height}
								src={this.state.src}
								crossOrigin={null}
								ref={cropper =>
								{
									this.cropper = cropper;
								}}
							/>
							{this.state.display ? <span className="crop-area"></span> : null}
						</div>
						<div className="cropper-btn">
							<i className="iconfont icon-zuoxuanzhuan" onClick={ this.setRotateLeft.bind(this)}/>
							<i className="iconfont icon-suoxiao" onClick={ this.setScale.bind(this)}/>
							<i className="iconfont icon-fangda" onClick={ this.setScaleBig.bind(this)}/>
							<i className="iconfont icon-youxuanzhuan" onClick={ this.setRotateRight.bind(this)}/>
						</div>
					</div>

					<div style={{width: '360px', float: "left", marginLeft: "22px"}}>
						<p style={{color: "#c97a80", lineHeight: "30px"}}>{getLangTxt("setting_select_photos_note")}</p>
						<div style={{marginBottom: "42px"}}>
							<div className="img-preview" style={styles.preview}></div>
							<span style={{marginLeft: "15px"}}>{minCropBoxSize.width}*{minCropBoxSize.height}</span>
						</div>
					</div>
				</div>

				<span style={{float: "right", margin: "15px 15px 0 0"}}>
					<Button style={{marginRight: "10px"}} onClick={() => this.props.onCancel()}>{getLangTxt("cancel")}</Button>
					<Button type="primary" onClick={this.uploadOk.bind(this)}>{getLangTxt("save")}</Button>
				</span>
			</div>
		);
	}
}

export default Uploads;
