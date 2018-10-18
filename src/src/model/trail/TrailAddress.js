export default class TrailAddress {

	emptyName = "未知";

	constructor(data) {
		this.country = data.country || this.emptyName;
		this.province = data.province || this.emptyName;
		this.city = data.city || this.emptyName;
	}

	get address() {
		let {country, province, city} = this;
		return "(" + [country, province, city].join("-") + ")";
	}

}
