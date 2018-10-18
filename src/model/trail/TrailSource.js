export default class TrailSource {
	specialMap = {
		"input": "直接访问",
		"link": "友情链接"
	};

	constructor(data) {
		let source = data.source;

		if (this.specialMap[source]) {
			this.value = this.specialMap[source];
		} else {
			this.value = source;
		}
	}
}