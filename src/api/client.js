var ApiClient = {
  BASE_URL: 'https://api-s.anixsekai.com/',

  request: function(method, endpoint, options) {
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

    return new Promise(function(resolve, reject) {
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (e) {
            resolve(xhr.responseText);
          }
        } else {
          reject({ status: xhr.status, text: xhr.responseText });
        }
      };

      xhr.onerror = function() {
        reject({ status: 0, text: 'Network error' });
      };

      xhr.ontimeout = function() {
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
