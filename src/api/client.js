var ApiClient = {
  BASE_URL: 'https://api-s.anixsekai.com/',

  request: function(method, endpoint, options) {
    options = options || {};
    var retries = options.retries != null ? options.retries : 2;
    var self = this;

    return this._doRequest(method, endpoint, options).catch(function(err) {
      if (retries > 0 && err.status === 0) {
        var delay = (3 - retries) * 1500;
        return new Promise(function(resolve) {
          setTimeout(resolve, delay);
        }).then(function() {
          options.retries = retries - 1;
          return self.request(method, endpoint, options);
        });
      }
      throw err;
    });
  },

  _doRequest: function(method, endpoint, options) {
    options = options || {};
    var url = this.BASE_URL + endpoint;

    if (options.token) {
      url += (url.indexOf('?') === -1 ? '?' : '&') + 'token=' + encodeURIComponent(options.token);
    }

    if (options.queryParams) {
      for (var key in options.queryParams) {
        if (options.queryParams.hasOwnProperty(key)) {
          url += (url.indexOf('?') === -1 ? '?' : '&') + encodeURIComponent(key) + '=' + encodeURIComponent(options.queryParams[key]);
        }
      }
    }

    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);

    if (options.formData) {
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    } else if (options.json) {
      xhr.setRequestHeader('Content-Type', 'application/json');
    }

    var startTime = Date.now();

    return new Promise(function(resolve, reject) {
      xhr.onload = function() {
        var duration = Date.now() - startTime;
        if (xhr.status >= 200 && xhr.status < 300) {
          if (typeof Debug !== 'undefined') Debug.logApi(method, url, xhr.status, duration);
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (e) {
            resolve(xhr.responseText);
          }
        } else {
          if (typeof Debug !== 'undefined') Debug.logApi(method, url, xhr.status, duration, xhr.responseText);
          reject({ status: xhr.status, text: xhr.responseText });
        }
      };

      xhr.onerror = function() {
        var duration = Date.now() - startTime;
        if (typeof Debug !== 'undefined') Debug.logApi(method, url, 0, duration, 'Network error');
        reject({ status: 0, text: 'Network error' });
      };

      xhr.ontimeout = function() {
        var duration = Date.now() - startTime;
        if (typeof Debug !== 'undefined') Debug.logApi(method, url, 0, duration, 'Timeout');
        reject({ status: 0, text: 'Request timeout' });
      };

      xhr.timeout = 15000;

      if (options.formData) {
        var parts = [];
        for (var key in options.formData) {
          if (options.formData.hasOwnProperty(key)) {
            parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(options.formData[key]));
          }
        }
        xhr.send(parts.join('&'));
      } else if (options.json) {
        xhr.send(JSON.stringify(options.json));
      } else {
        xhr.send();
      }
    });
  },

  post: function(endpoint, options) {
    return this.request('POST', endpoint, options);
  },

  get: function(endpoint, options) {
    return this.request('GET', endpoint, options);
  }
};
