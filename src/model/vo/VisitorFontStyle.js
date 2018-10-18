class VisitorFontStyle {
	_fontSize = "16px";
	_color = "#fff";
	_italic = false;
	_bold = false;
	_underline = false;
	_changed = true;
	_style = {};
	
	constructor()
	{
		window.stt = this;
	}
	
	set style(value)
	{
		this._style = value;
	}
	
	get style()
	{
		/*try
		{*/
		
		this._style = {};
		
		let font = "", text_decoration = "underline";
		
		if(this._italic)
		{
			font += "italic ";
		}
		
		if(this._bold)
		{
			font += "bold ";
		}
		
		if(this._fontSize)
		{
			font += this._fontSize + " Microsoft YaHei";
		}
		
		this._style.font = font;
		this._style.color = this._color;
		
		if(this._underline)
		{
			this._style.textDecoration = text_decoration;
		}
		else
		{
			delete this._style.textDecoration;
		}
		/*}
		catch(e)
		{
			console.log("VisitorFontStyle style e.stack = ", e.stack);
		}*/
		
		return this._style;
	}
	
	get fontSize()
	{
		return this._fontSize;
	}
	
	set fontSize(value)
	{
		if(this._fontSize === value)
			return;
		
		this._changed = true;
		this._fontSize = value;
	}
	
	get color()
	{
		return this._color;
	}
	
	set color(value)
	{
		if(this._color === value)
			return;
		
		this._changed = true;
		this._color = value;
	}
	
	get italic()
	{
		return this._italic;
	}
	
	set italic(value)
	{
		console.log("VisitorFontStyle italic = " + value);
		
		if(this._italic === value)
			return;
		
		this._changed = true;
		this._italic = value;
	}
	
	get bold()
	{
		return this._bold;
	}
	
	set bold(value)
	{
		console.log("VisitorFontStyle bold = " + value);
		
		if(this._bold === value)
			return;
		
		this._changed = true;
		this._bold = value;
	}
	
	get underline()
	{
		return this._underline;
	}
	
	set underline(value)
	{
		console.log("VisitorFontStyle underline = " + value);
		
		if(this._underline === value)
			return;
		
		this._changed = true;
		this._underline = value;
	}
	
}

export default VisitorFontStyle;
