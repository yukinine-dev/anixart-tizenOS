var KodikParser = {
  isKodikUrl: function(url) {
    return typeof url === 'string' && /kodikplayer|kodik\.(info|cc|biz)|aniqit\.com/i.test(url);
  },

  resolve: function(embedUrl) {
    var self = this;
    return this._fetchText(embedUrl).then(function(html) {
      var match = html.match(/var urlParams = '(.*?)';/);
      if (!match) throw { status: 0, text: 'Kodik: urlParams not found' };

      var params = JSON.parse(match[1]);
      var withoutProto = embedUrl.replace(/^https?:\/\//, '');
      var domain = withoutProto.split('/')[0];
      var pathParts = withoutProto.split('/').slice(1);
      params.type = pathParts[0];
      params.id = pathParts[1];
      params.hash = pathParts[2];

      var body = [];
      for (var key in params) {
        if (params.hasOwnProperty(key)) {
          body.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
        }
      }

      return self._postForm('https://' + domain + '/ftor', body.join('&'));
    }).then(function(data) {
      if (!data || !data.links) throw { status: 0, text: 'Kodik: no links in response' };

      var keys = Object.keys(data.links);
      if (keys.length === 0) throw { status: 0, text: 'Kodik: empty links' };

      keys.sort(function(a, b) { return parseInt(b, 10) - parseInt(a, 10); });
      var quality = keys[0];
      var src = data.links[quality][0].src;

      var decoded = src.indexOf('//') === -1 ? self._decrypt(src) : src;
      if (decoded.indexOf('http') !== 0) decoded = 'https:' + decoded;

      return decoded;
    });
  },

  _decrypt: function(enc) {
    var out = '';
    for (var i = 0; i < enc.length; i++) {
      var ch = enc.charAt(i);
      var code = enc.charCodeAt(i);
      var isUpper = code >= 65 && code <= 90;
      var isLower = code >= 97 && code <= 122;
      if (isUpper || isLower) {
        var base = isUpper ? 90 : 122;
        var shifted = code + 18;
        if (shifted > base) shifted -= 26;
        out += String.fromCharCode(shifted);
      } else {
        out += ch;
      }
    }
    return atob(out);
  },

  _fetchText: function(url) {
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.timeout = 15000;
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.responseText);
        else reject({ status: xhr.status, text: 'Kodik page fetch failed' });
      };
      xhr.onerror = function() { reject({ status: 0, text: 'Kodik page network error' }); };
      xhr.ontimeout = function() { reject({ status: 0, text: 'Kodik page timeout' }); };
      xhr.send();
    });
  },

  _postForm: function(url, body) {
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.timeout = 15000;
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (e) {
            reject({ status: xhr.status, text: 'Kodik /ftor bad JSON' });
          }
        } else {
          reject({ status: xhr.status, text: 'Kodik /ftor failed' });
        }
      };
      xhr.onerror = function() { reject({ status: 0, text: 'Kodik /ftor network error' }); };
      xhr.ontimeout = function() { reject({ status: 0, text: 'Kodik /ftor timeout' }); };
      xhr.send(body);
    });
  }
};
