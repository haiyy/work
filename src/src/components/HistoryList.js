import React from 'react';
import ScrollArea from 'react-scrollbar';
import { getMessageComp } from "../utils/ConverUtils";
import '../public/styles/chatpage/retweet.scss';
import { getNoDataComp } from "../utils/ComponentUtils";
import { createSentence } from "../utils/MyUtil";

class HistoryList extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
	}
	
	render()
	{
		let {historyArr} = this.props;
		if(!historyArr || !historyArr.length)
			return getNoDataComp();
		
		return (
			<ScrollArea style={{height: 'calc(100% - 42px)'}} speed={1} className="area"
			            horizontal={false} smoothScrolling>
				<div className="historyListInteraction">
					{
						historyArr.map(message =>
						{
							if(!message || !message.hasOwnProperty("msgtype"))
								return null;
							
							let sentence = createSentence(message, message.msgtype);
							return getMessageComp(sentence);
						})
					}
				</div>
			</ScrollArea>
		)
	}
	
}

export default HistoryList;
