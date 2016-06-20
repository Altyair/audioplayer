function Iterator (data) {
	this._data = data;
	this._index = 0;
	this._length = data.length;
}

Iterator.prototype = {
	constructor: Iterator,
	current: function () {
		return this._data[this._index];  
	},
	rewind: function () {
		this._index = 0; 
	},
	prev: function () {
		if (!this.hasPrev()) {
			return null;
		}
		this._index -= 1;
		return this._data[this._index];
	},
	next: function () {
		if (!this.hasNext()) {
			return null;
		}
		this._index += 1;
		return this._data[this._index];
	},
	hasNext: function () {
		return this._index < this._length - 1;
	},
	hasPrev: function () {
		return this._index > 0;
	}
}


export default Iterator;