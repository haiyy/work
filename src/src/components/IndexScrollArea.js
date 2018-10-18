import ScrollArea from 'react-scrollbar';

class IndexScrollArea extends ScrollArea {
	constructor(props)
	{
		super(props);
		
		//totalNum
		//index = -1; //不做滚动
	}
	
	componentWillReceiveProps(nextProps)
	{
		let {currentIndex, totalNum} = nextProps;
		
		if(totalNum > 0)
		{
			let id = setTimeout(() => {
				this.index = currentIndex;
				clearTimeout(id);
			}, 100)
		}
	}
	
	handleWheel(e)
	{
		super.handleWheel(e);
		
		if(typeof this.props.onWheel === "function")
		{
			this.props.onWheel(e);
		}
		
	}
	
	isBottom()
	{
		let {containerHeight, realHeight, topPosition} = this.state;
		
		return realHeight - containerHeight - 5 < topPosition;
	}
	
	isTop()
	{
		return this.state.topPosition < 5;
	}
	
	getTopIndex()
	{
		let {topPosition} = this.state;
		
		if(this.itemHeight <= 0)
			return -1;
		
		return Math.floor(topPosition / this.itemHeight);
	}
	
	getBottomIndex()
	{
		let {topPosition, containerHeight} = this.state;
		
		if(this.itemHeight <= 0)
			return -1;
		
		return Math.floor((topPosition + containerHeight) / this.itemHeight);
	}
	
	set index(value)
	{
		if(this.itemHeight <= 0)
			return;
		
		let {containerHeight} = this.state;
		if(containerHeight <= 0)
			return;
		
		if(value + 1 >= this.getBottomIndex())
		{
			this.scrollYTo((value + 1) * this.itemHeight - containerHeight);
		}
		else if(value <= this.getTopIndex())
		{
			this.scrollYTo(value * this.itemHeight);
		}
	}
	
	get itemHeight()
	{
		let {realHeight} = this.state,
			{totalNum} = this.props;
		
		if(totalNum > 0)
		{
			return parseInt(realHeight / totalNum);
		}
		
		return 0;
	}
	
}

export default IndexScrollArea;
