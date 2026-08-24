var AuthApi = {
  STATUS_OK: 0,
  STATUS_INVALID_LOGIN: 2,
  STATUS_INVALID_PASSWORD: 3,

  signIn: function(login, password) {
    return ApiClient.post('auth/signIn', {
      formData: {
        login: login,
        password: password
      }
    }).then(function(response) {
      if (response.profileToken && response.profileToken.token) {
        Storage.setToken(response.profileToken.token);
        Storage.setTokenId(response.profileToken.id);
      }
      if (response.profile) {
        Storage.setProfile(response.profile);
      }
      return response;
    });
  },

  getErrorMessage: function(status) {
    switch (status) {
      case this.STATUS_INVALID_LOGIN:
        return 'Неверная почта или никнейм';
      case this.STATUS_INVALID_PASSWORD:
        return 'Неверный пароль';
      default:
        return 'Ошибка входа';
    }
  }
};
