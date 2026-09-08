var SearchApi = {
  search: function(query, page, token) {
    page = page || 0;
    return ApiClient.post('search/releases/' + page, {
      token: token,
      formData: { searchText: query }
    });
  }
};
