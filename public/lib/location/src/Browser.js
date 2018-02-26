function Browser($window) {
	this.$window = $window;
	this.urlChangeInit = false;
	this.urlChangeListeners = [];
}

Browser.prototype = {
	onUrlChange: function(callback) {
		var listeners = this.urlChangeListeners;

		if(!this.urlChangeInit) {
			var self = this;

			this.$window.addEventListener('hashchange', function(e) {
				self.fireUrlChange();
			});

			this.urlChangeInit = true;
		}

		listeners.push(callback);
	},

	fireUrlChange: function() {
		var listeners = this.urlChangeListeners;

		for(var length = listeners.length - 1; length >= 0; length--) {
			listeners[length](this.url());
		}
	},

	url: function(url) {
		var $window = this.$window;

		// setter
		if(url) {
			if(url.charAt(0) != '/') {
				url = '/' + url;
			}

			$window.location.hash = url;
		} else {
			// getter
			var hash = $window.location.hash;

			if(hash.charAt(0) == '#') {
				return hash.substring(1);
			} else if (hash.length == 0) {
				return hash;
			}

			throw new Error('Invalid hash');
		}
	}
};