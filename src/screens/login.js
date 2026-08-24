var LoginScreen = {
  render: function() {
    var container = document.getElementById('app');
    container.innerHTML = '';
    container.className = 'screen-login';

    var wrapper = document.createElement('div');
    wrapper.className = 'login-wrapper';

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
    loginInput.addEventListener('focus', function() {
      FocusManager.setFocus(loginInput);
    });
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
    passInput.addEventListener('focus', function() {
      FocusManager.setFocus(passInput);
    });
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
    loginBtn.addEventListener('click', function() {
      LoginScreen.doLogin();
    });
    form.appendChild(loginBtn);

    wrapper.appendChild(form);
    container.appendChild(wrapper);

    setTimeout(function() {
      FocusManager.setFocus(loginInput);
    }, 100);
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

    AuthApi.signIn(login, password).then(function(response) {
      button.textContent = 'Войти';
      button.disabled = false;

      if (response.status && response.status !== 0) {
        errorEl.textContent = AuthApi.getErrorMessage(response.status);
        errorEl.style.display = 'block';
        return;
      }

      if (response.profileToken && response.profileToken.token) {
        App.showScreen('home');
      } else {
        errorEl.textContent = 'Ошибка авторизации';
        errorEl.style.display = 'block';
      }
    }).catch(function(err) {
      button.textContent = 'Войти';
      button.disabled = false;
      errorEl.textContent = 'Ошибка сети. Проверьте подключение.';
      errorEl.style.display = 'block';
    });
  }
};
