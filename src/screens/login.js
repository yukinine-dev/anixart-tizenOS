var LoginScreen = {
  HELPER_URL: 'https://yukinine-dev.github.io/anixart-tizenOS/auth-helper.html',
  activeTab: 'password',

  render: function() {
    var container = document.getElementById('app');
    container.innerHTML = '';
    container.className = 'screen-login';

    var wrapper = document.createElement('div');
    wrapper.className = 'login-wrapper login-wrapper-wide';

    var logo = document.createElement('div');
    logo.className = 'login-logo';
    logo.innerHTML = '<img src="assets/icons/logo_splash_dark.png" alt="Anixart">';
    wrapper.appendChild(logo);

    var title = document.createElement('h1');
    title.className = 'login-title';
    title.textContent = 'С возвращением';
    wrapper.appendChild(title);

    var subtitle = document.createElement('p');
    subtitle.className = 'login-subtitle';
    subtitle.textContent = 'Войдите, чтобы продолжить';
    wrapper.appendChild(subtitle);

    var tabs = document.createElement('div');
    tabs.className = 'login-tabs';

    var tabPass = document.createElement('button');
    tabPass.className = 'login-tab active';
    tabPass.id = 'tab-password';
    tabPass.textContent = 'Пароль';
    tabPass.setAttribute('data-focusable', 'true');
    tabPass.addEventListener('click', function() { LoginScreen.switchTab('password'); });
    tabs.appendChild(tabPass);

    var tabQR = document.createElement('button');
    tabQR.className = 'login-tab';
    tabQR.id = 'tab-qr';
    tabQR.textContent = 'QR Code';
    tabQR.setAttribute('data-focusable', 'true');
    tabQR.addEventListener('click', function() { LoginScreen.switchTab('qr'); });
    tabs.appendChild(tabQR);

    wrapper.appendChild(tabs);

    var passwordPanel = this.createPasswordPanel();
    passwordPanel.id = 'panel-password';
    wrapper.appendChild(passwordPanel);

    var qrPanel = this.createQRPanel();
    qrPanel.id = 'panel-qr';
    qrPanel.style.display = 'none';
    wrapper.appendChild(qrPanel);

    container.appendChild(wrapper);

    this.activeTab = 'password';
    setTimeout(function() {
      var firstInput = document.getElementById('login-input');
      if (firstInput) FocusManager.setFocus(firstInput);
    }, 100);
  },

  switchTab: function(tab) {
    this.activeTab = tab;
    var passPanel = document.getElementById('panel-password');
    var qrPanel = document.getElementById('panel-qr');
    var tabPass = document.getElementById('tab-password');
    var tabQR = document.getElementById('tab-qr');

    if (tab === 'password') {
      passPanel.style.display = '';
      qrPanel.style.display = 'none';
      tabPass.classList.add('active');
      tabQR.classList.remove('active');
      setTimeout(function() {
        var input = document.getElementById('login-input');
        if (input) FocusManager.setFocus(input);
      }, 50);
    } else {
      passPanel.style.display = 'none';
      qrPanel.style.display = '';
      tabQR.classList.add('active');
      tabPass.classList.remove('active');
      this.renderQRCode();
      setTimeout(function() {
        var pinInput = document.getElementById('pin-input');
        if (pinInput) FocusManager.setFocus(pinInput);
      }, 50);
    }
  },

  createPasswordPanel: function() {
    var form = document.createElement('div');
    form.className = 'login-form';

    var loginGroup = document.createElement('div');
    loginGroup.className = 'input-group';
    var loginInput = document.createElement('input');
    loginInput.type = 'text';
    loginInput.id = 'login-input';
    loginInput.className = 'login-field';
    loginInput.placeholder = 'Почта или никнейм';
    loginInput.setAttribute('data-focusable', 'true');
    loginInput.addEventListener('focus', function() { FocusManager.setFocus(loginInput); });
    loginGroup.appendChild(loginInput);
    form.appendChild(loginGroup);

    var passGroup = document.createElement('div');
    passGroup.className = 'input-group';
    var passInput = document.createElement('input');
    passInput.type = 'password';
    passInput.id = 'password-input';
    passInput.className = 'login-field';
    passInput.placeholder = 'Пароль';
    passInput.setAttribute('data-focusable', 'true');
    passInput.addEventListener('focus', function() { FocusManager.setFocus(passInput); });
    passGroup.appendChild(passInput);

    var togglePass = document.createElement('button');
    togglePass.className = 'password-toggle';
    togglePass.setAttribute('data-focusable', 'true');
    togglePass.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/></svg>';
    togglePass.addEventListener('click', function() {
      passInput.type = passInput.type === 'password' ? 'text' : 'password';
    });
    passGroup.appendChild(togglePass);
    form.appendChild(passGroup);

    var errorMsg = document.createElement('div');
    errorMsg.className = 'login-error';
    errorMsg.id = 'login-error';
    form.appendChild(errorMsg);

    var loginBtn = document.createElement('button');
    loginBtn.className = 'login-button';
    loginBtn.id = 'login-button';
    loginBtn.textContent = 'Войти';
    loginBtn.setAttribute('data-focusable', 'true');
    loginBtn.addEventListener('click', function() { LoginScreen.doLogin(); });
    form.appendChild(loginBtn);

    return form;
  },

  createQRPanel: function() {
    var panel = document.createElement('div');
    panel.className = 'login-qr-panel';

    var columns = document.createElement('div');
    columns.className = 'qr-columns';

    // Left: QR code
    var left = document.createElement('div');
    left.className = 'qr-left';

    var qrContainer = document.createElement('div');
    qrContainer.className = 'qr-code-container';
    qrContainer.id = 'qr-container';
    left.appendChild(qrContainer);

    var qrHint = document.createElement('div');
    qrHint.className = 'qr-hint';
    qrHint.textContent = 'Scan with your phone camera';
    left.appendChild(qrHint);

    columns.appendChild(left);

    // Right: PIN input
    var right = document.createElement('div');
    right.className = 'qr-right';

    var stepList = document.createElement('div');
    stepList.className = 'qr-steps';
    var steps = [
      'Scan the QR code with your phone',
      'Log in on the opened page',
      'Enter the 6-digit code shown on the phone below'
    ];
    for (var i = 0; i < steps.length; i++) {
      var step = document.createElement('div');
      step.className = 'qr-step';
      var num = document.createElement('span');
      num.className = 'qr-step-num';
      num.textContent = (i + 1);
      step.appendChild(num);
      var text = document.createElement('span');
      text.className = 'qr-step-text';
      text.textContent = steps[i];
      step.appendChild(text);
      stepList.appendChild(step);
    }
    right.appendChild(stepList);

    var pinGroup = document.createElement('div');
    pinGroup.className = 'pin-input-group';

    var pinInput = document.createElement('input');
    pinInput.type = 'tel';
    pinInput.id = 'pin-input';
    pinInput.className = 'login-field pin-field';
    pinInput.placeholder = '000000';
    pinInput.maxLength = 6;
    pinInput.setAttribute('data-focusable', 'true');
    pinInput.addEventListener('focus', function() { FocusManager.setFocus(pinInput); });
    pinInput.addEventListener('input', function() {
      pinInput.value = pinInput.value.replace(/[^0-9]/g, '');
      if (pinInput.value.length === 6) {
        LoginScreen.verifyPin(pinInput.value);
      }
    });
    pinGroup.appendChild(pinInput);
    right.appendChild(pinGroup);

    var pinError = document.createElement('div');
    pinError.className = 'login-error';
    pinError.id = 'pin-error';
    right.appendChild(pinError);

    var divider = document.createElement('div');
    divider.className = 'qr-divider';

    var divLine1 = document.createElement('div');
    divLine1.className = 'qr-divider-line';
    divider.appendChild(divLine1);
    var divText = document.createElement('span');
    divText.className = 'qr-divider-text';
    divText.textContent = 'or';
    divider.appendChild(divText);
    var divLine2 = document.createElement('div');
    divLine2.className = 'qr-divider-line';
    divider.appendChild(divLine2);
    right.appendChild(divider);

    var tokenGroup = document.createElement('div');
    tokenGroup.className = 'token-input-group';
    var tokenLabel = document.createElement('div');
    tokenLabel.className = 'token-label';
    tokenLabel.textContent = 'Paste full token:';
    tokenGroup.appendChild(tokenLabel);
    var tokenInput = document.createElement('input');
    tokenInput.type = 'text';
    tokenInput.id = 'token-input';
    tokenInput.className = 'login-field';
    tokenInput.placeholder = 'Token from the phone page';
    tokenInput.setAttribute('data-focusable', 'true');
    tokenInput.addEventListener('focus', function() { FocusManager.setFocus(tokenInput); });
    tokenGroup.appendChild(tokenInput);

    var tokenBtn = document.createElement('button');
    tokenBtn.className = 'login-button';
    tokenBtn.textContent = 'Login by token';
    tokenBtn.setAttribute('data-focusable', 'true');
    tokenBtn.addEventListener('click', function() { LoginScreen.doTokenLogin(); });
    tokenGroup.appendChild(tokenBtn);
    right.appendChild(tokenGroup);

    columns.appendChild(right);
    panel.appendChild(columns);

    return panel;
  },

  renderQRCode: function() {
    var container = document.getElementById('qr-container');
    if (!container || container.querySelector('canvas')) return;

    if (typeof QRCode !== 'undefined') {
      try {
        var matrix = QRCode.generate(this.HELPER_URL);
        var canvas = QRCode.toCanvas(matrix, 6, 2);
        canvas.className = 'qr-canvas';
        container.appendChild(canvas);
      } catch (e) {
        if (typeof Debug !== 'undefined') Debug.log('error', 'QR generation failed', e.message);
        container.innerHTML = '<div class="qr-fallback">' + this.HELPER_URL + '</div>';
      }
    } else {
      container.innerHTML = '<div class="qr-fallback">' + this.HELPER_URL + '</div>';
    }
  },

  verifyPin: function(pin) {
    var errorEl = document.getElementById('pin-error');
    if (typeof Debug !== 'undefined') Debug.log('info', 'PIN verify attempt: ' + pin);

    errorEl.style.display = 'none';
    errorEl.textContent = '';

    var token = Storage.getToken();
    if (token && this.generatePin(token) === pin) {
      App.showScreen('home');
      return;
    }

    errorEl.textContent = 'Wrong code. Make sure you entered the code from the phone.';
    errorEl.style.display = 'block';

    this.tryPinAuth(pin);
  },

  tryPinAuth: function(pin) {
    var errorEl = document.getElementById('pin-error');

    ApiClient.post('auth/signIn', {}).then(function() {}).catch(function() {});

    errorEl.textContent = 'Enter the code from the phone page after logging in.';
    errorEl.style.display = 'block';
  },

  generatePin: function(token) {
    var hash = 0;
    for (var i = 0; i < token.length; i++) {
      hash = ((hash << 5) - hash + token.charCodeAt(i)) | 0;
    }
    var num = Math.abs(hash) % 1000000;
    var s = String(num);
    while (s.length < 6) s = '0' + s;
    return s;
  },

  doTokenLogin: function() {
    var tokenInput = document.getElementById('token-input');
    var token = tokenInput.value.trim();
    var errorEl = document.getElementById('pin-error');

    if (!token) {
      errorEl.textContent = 'Paste the token from the phone page';
      errorEl.style.display = 'block';
      return;
    }

    if (typeof Debug !== 'undefined') Debug.log('info', 'Token login attempt');

    errorEl.style.display = 'none';
    Storage.setToken(token);

    ApiClient.post('profile/preference/get', { token: token }).then(function(response) {
      if (response && !response.error) {
        if (typeof Debug !== 'undefined') Debug.log('info', 'Token login success');
        App.showScreen('home');
      } else {
        if (typeof Debug !== 'undefined') Debug.log('error', 'Token login: invalid token');
        Storage.clearAuth();
        errorEl.textContent = 'Invalid token. Try again.';
        errorEl.style.display = 'block';
      }
    }).catch(function() {
      if (typeof Debug !== 'undefined') Debug.log('info', 'Token login: proceeding (API check skipped)');
      App.showScreen('home');
    });
  },

  doLogin: function() {
    var login = document.getElementById('login-input').value.trim();
    var password = document.getElementById('password-input').value;
    var errorEl = document.getElementById('login-error');
    var button = document.getElementById('login-button');

    if (!login || !password) {
      errorEl.textContent = 'Введите логин и пароль';
      errorEl.style.display = 'block';
      return;
    }

    errorEl.style.display = 'none';
    button.textContent = 'Вход...';
    button.disabled = true;

    if (typeof Debug !== 'undefined') Debug.log('info', 'Login attempt: ' + login);

    AuthApi.signIn(login, password).then(function(response) {
      button.textContent = 'Войти';
      button.disabled = false;

      if (response.status && response.status !== 0) {
        if (typeof Debug !== 'undefined') Debug.log('error', 'Login failed: status=' + response.status);
        errorEl.textContent = AuthApi.getErrorMessage(response.status);
        errorEl.style.display = 'block';
        return;
      }

      if (response.profileToken && response.profileToken.token) {
        if (typeof Debug !== 'undefined') Debug.log('info', 'Login success, tokenId=' + response.profileToken.id);
        App.showScreen('home');
      } else {
        if (typeof Debug !== 'undefined') Debug.log('error', 'Login: no token in response');
        errorEl.textContent = 'Ошибка авторизации';
        errorEl.style.display = 'block';
      }
    }).catch(function(err) {
      button.textContent = 'Войти';
      button.disabled = false;
      if (typeof Debug !== 'undefined') Debug.log('error', 'Login network error', err);
      errorEl.textContent = 'Ошибка сети. Проверьте подключение.';
      errorEl.style.display = 'block';
    });
  }
};
