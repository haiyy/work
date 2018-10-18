const reg = new RegExp("\\\\u([0-9a-zA-Z]{4})", "g");

export function decode(str)
{
	if(!str || str.length <= 0)
		return str;
	
	let m = str.match(reg);
	
	if(m && m.length <= 0)
		return str;
	
	return str.replace(reg, replaceUnicode);
}

function replaceUnicode(value)
{
	if(!value)
		return value;
	
	let u = parseInt(value.substring(2), 16);
	
	return String.fromCodePoint(u);
}