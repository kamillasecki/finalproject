function isObject(value) {
	return (value != null && typeof value == 'object');
}

function isUndefined(value) {
	return typeof value == 'undefined';
}

function isNumber(value) {
	return typeof value == 'number';
}

function isBoolean (value) {
	return typeof value == 'boolean';
}

function isString(value) {
	return typeof value == 'string';
}

Location.SEP = '?';

function Location(browser) {
	this.browser = browser;
}

Location.prototype = {
	// Replace only the path
	path: function(path) {
		var url = this.url().split(Location.SEP);

		if(path) {
			url[0] = path;
			this.url(url.join(Location.SEP));
		} else {
			return url[0];
		}

		return this;
	},

	search: function(key, value) {
		var url = this.url().split(Location.SEP);

		if(isUndefined(key)) {
			url[1] = url[1] || '';
			return QueryString.parse(url[1]);
		} else if(isObject(key)) {
			url[1] = QueryString.stringify(key);

			this.url(url.join(Location.SEP));
		}

		return this;
	},

	// Replace the entire url
	url: function(url) {
		if(url) {
			this.browser.url(url);
		} else {
			return this.browser.url();
		}
	}
};