import { TreeNode } from 'rc-tree';

class TreeNode2 extends TreeNode{
	
	constructor(props)
	{
		super(props);
	}
	
	onSelect()
	{
		this.props.root.onSelect(this);
		this.onExpand();
	}
}


export default TreeNode2;