import React from 'react';
import ImageView from "../apps/chat/view/pictureviewer/ImageView";
import NTDragView from "./NTDragView";
import Portal from "./Portal";

class NTImageView extends React.Component {

	constructor(props)
	{
		super(props);
	}

	_getImageView()
	{
		let {images, currentImage} = this.props;

        return(
            <Portal>
                <NTDragView enabledDrag={true} enabledClose={true} _onClose={this.props._onClose}
                            wrapperProps={{width: 630, height: 600}}>
                    <ImageView images={images} currentImage={currentImage}/>
                </NTDragView>
            </Portal>
        );
	}

	render()
	{
		return (
			<div>
				{
					this._getImageView()
				}
			</div>
		);
	}
}

export default NTImageView;
