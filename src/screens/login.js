var LoginScreen = {
  render: function() {
    var container = document.getElementById('app');
    container.innerHTML = '';
    container.className = 'screen-login';

    var wrapper = document.createElement('div');
    wrapper.className = 'login-wrapper';

    var header = document.createElement('div');
    header.className = 'login-header';
    header.innerHTML = '<img src="assets/icons/logo_splash_dark.png" alt="" class="login-header-logo"><span class="login-header-name">Anixart</span>';
    wrapper.appendChild(header);

    var title = document.createElement('h1');
    title.className = 'login-title';
    title.textContent = 'С возвращением';
    wrapper.appendChild(title);

    var subtitle = document.createElement('p');
    subtitle.className = 'login-subtitle';
    subtitle.textContent = 'Войдите, чтобы продолжить';
    wrapper.appendChild(subtitle);

    var form = document.createElement('div');
    form.className = 'login-form';

    var loginGroup = document.createElement('div');
    loginGroup.className = 'login-field-wrap';
    var loginInput = document.createElement('input');
    loginInput.type = 'text';
    loginInput.id = 'login-input';
    loginInput.className = 'login-field';
    loginInput.setAttribute('placeholder', ' ');
    loginInput.setAttribute('data-focusable', 'true');
    loginInput.addEventListener('focus', function() { FocusManager.setFocus(loginInput); });
    loginGroup.appendChild(loginInput);
    var loginLabel = document.createElement('label');
    loginLabel.className = 'login-field-label';
    loginLabel.setAttribute('for', 'login-input');
    loginLabel.textContent = 'Почта или никнейм';
    loginGroup.appendChild(loginLabel);
    form.appendChild(loginGroup);

    var passGroup = document.createElement('div');
    passGroup.className = 'login-field-wrap';
    var passInput = document.createElement('input');
    passInput.type = 'password';
    passInput.id = 'password-input';
    passInput.className = 'login-field';
    passInput.setAttribute('placeholder', ' ');
    passInput.setAttribute('data-focusable', 'true');
    passInput.addEventListener('focus', function() { FocusManager.setFocus(passInput); });
    passGroup.appendChild(passInput);
    var passLabel = document.createElement('label');
    passLabel.className = 'login-field-label';
    passLabel.setAttribute('for', 'password-input');
    passLabel.textContent = 'Пароль';
    passGroup.appendChild(passLabel);
    var togglePass = document.createElement('button');
    togglePass.className = 'password-toggle';
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

    wrapper.appendChild(form);
    container.appendChild(wrapper);

    setTimeout(function() {
      var firstInput = document.getElementById('login-input');
      if (firstInput) FocusManager.setFocus(firstInput);
    }, 100);
  },

  doLogin: function() {
    var loginEl = document.getElementById('login-input');
    var passEl = document.getElementById('password-input');
    var errorEl = document.getElementById('login-error');
    var button = document.getElementById('login-button');
    var login = loginEl ? loginEl.value.trim() : '';
    var password = passEl ? passEl.value : '';

    if (typeof Debug !== 'undefined') Debug.log('info', 'doLogin called, login="' + login + '", passLen=' + password.length);

    if (!login || !password) {
      errorEl.textContent = !login && !password ? 'Введите логин и пароль' : !login ? 'Введите логин' : 'Введите пароль';
      errorEl.style.visibility = 'visible';
      return;
    }

    errorEl.style.visibility = 'hidden';
    button.textContent = 'Вход...';
    button.disabled = true;

    AuthApi.signIn(login, password).then(function(response) {
      button.textContent = 'Войти';
      button.disabled = false;

      if (typeof Debug !== 'undefined') Debug.log('info', 'API response: ' + JSON.stringify(response));

      if (response.code && response.code !== 0) {
        errorEl.textContent = AuthApi.getErrorMessage(response.code);
        errorEl.style.visibility = 'visible';
        return;
      }

      if (response.profileToken && response.profileToken.token) {
        App.showScreen('home');
      } else {
        errorEl.textContent = 'Ошибка авторизации';
        errorEl.style.visibility = 'visible';
      }
    }).catch(function(err) {
      button.textContent = 'Войти';
      button.disabled = false;
      var msg = err && err.text ? err.text : 'Ошибка сети';
      if (typeof Debug !== 'undefined') Debug.log('error', 'Login error: ' + msg);
      errorEl.textContent = 'Ошибка сети: ' + msg;
      errorEl.style.visibility = 'visible';
    });
  }
};
