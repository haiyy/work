import { urlLoader } from "../../lib/utils/cFetch";

require("../../lib/utils/xhr");

export function getXmlBody(p_loginname, p_userid, p_status)
{
	return `<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
	<SOAP-ENV:Body>
		<m:callProcedure xmlns:m="http://webservice.elitecrm.com" SOAP-ENV:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
			<spxml xsi:type="xsd:string">
				<![CDATA[
					<root>
						<sp name="p_xn_custsync" timeout="10">
							<spparam name="p_loginname">
								${p_loginname}
							</spparam>
							<spparam name="p_userid">
								${p_userid}
							</spparam>
							<spparam name="p_date">
								${new Date().getTime()}
							</spparam>
							<spparam name="p_status">
								${p_status}
							</spparam>
						</sp>
					</root>
				]]>
			</spxml>
		</m:callProcedure>
	</SOAP-ENV:Body>
</SOAP-ENV:Envelope>
`
}

function Doxhr(data)
{
	let xmlRequest = new XMLHttpRequest();
	let url = "http://kefu.zhaopin.com/EliteGeneralWS/EliteDBWSImpl.jws?wsdl";
	xmlRequest.onreadystatechange = onreadystatechange;
	xmlRequest.open("POST", url);
	xmlRequest.setRequestHeader("Content-Type", "text/xml; charset=UTF-8");
	xmlRequest.setRequestHeader("SOAPAction", "");
	xmlRequest.send(data);
}

function onreadystatechange()
{
}

export function sendZhilianSeleced(p_loginname, p_userid, p_status)
{
	try
	{
		//let url = "http://wkefu.zhaopin.com:8090/EliteGeneralWS/EliteDBWSImpl.jws?wsdl";
		//let url = "http://kefu.zhaopin.com/EliteGeneralWS/EliteDBWSImpl.jws?wsdl";
		let url = "http://dolphin-pro.ntalker.com/zlzp";
		
		//Doxhr(getXmlBody(p_loginname, p_userid, p_status));
		
		return urlLoader(url, {
			method: "POST",
			body: getXmlBody(p_loginname, p_userid, p_status),
			headers: {SOAPAction: ""}
		}, "text/plain; charset=UTF-8", "no-cors")
		.then(({jsonResult}) => {
			console.log("jsonResult = ", jsonResult);
		})
	}
	catch(e)
	{
	
	}
}

const siteIds = ["kf_9015", "kf_9051", "kf_9221"];

export function enabledForSelected(value)
{
	return siteIds.includes(value);
}
