import TrailInfo from "./TrailInfo";
import LogUtil from "../../lib/utils/LogUtil";

export default class TrailInfoList {
	constructor(data) {
		if (!data || !data instanceof Array || data.length === 0) {
			LogUtil.trace("trail", LogUtil.ERROR, "error code 330000：infoList init data is invaild");
			throw new Error("330000");
		}

		if (data.length > 1) {
			LogUtil.trace("trail", LogUtil.ERROR, "this is a multi-terminal trail info");
		}

		this.infos = new Set();

		data.map((v) => {
			this.infos.add(new TrailInfo(v));
		});
	}

	isSame(infoList) {
		if (this.infos.size != infoList.size) {
			return false;
		} else {
			for (let info of this.infos) {
				if (!infoList.has(info)) {
					return false;
				}
			}
		}
		return true;
	}

	getAll() {
		return Array.from(this.infos);
	}
}