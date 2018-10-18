import { fromJS, Record, is } from "immutable";

const Sonalcall = Record({
        Servicemode: '',
        Outcrynumber: '',
        Finishingtime: '',
        AutoAnswer: '',
        LoginStatus: '',
        ScreenPopUp: '',
        Outbound: '',
})
class PersonalCall extends Sonalcall{
    get Servicemode()
	{
		return this.get("Servicemode");
	}
	
	set Servicemode(value)
	{
		this.set("Servicemode", value);
    }
    get Outcrynumber()
	{
		return this.get("Outcrynumber");
	}
	
	set Outcrynumber(value)
	{
		this.set("Outcrynumber", value);
    }
    get AutoAnswer()
	{
		return this.get("AutoAnswer");
	}
	
	set AutoAnswer(value)
	{
		this.set("AutoAnswer", value);
    }
    get LoginStatus()
	{
		return this.get("LoginStatus");
	}
	
	set LoginStatus(value)
	{
		this.set("LoginStatus", value);
    }
    get ScreenPopUp()
	{
		return this.get("ScreenPopUp");
	}
	
	set ScreenPopUp(value)
	{
		this.set("ScreenPopUp", value);
    }
    get Outbound()
	{
		return this.get("Outbound");
	}
	
	set Outbound(value)
	{
		this.set("Outbound", value);
	}
}

export default PersonalCall;