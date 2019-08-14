const $ = require('jquery');
const { ipcRenderer } = require('electron');

$(document).ready(() => {
  const loginButton = $('.login-button');
  const signUpButton = $('.sign-up');
  const userIdInput = $('#id');
  const userPasswordInput = $('#password');
  const errorElement = $('#login-error');
  loginButton.on('click', () => {
    $.ajax({
      type: 'POST',
      url: 'http://localhost:3005/api/identities/authorization',
      data: JSON.stringify({
        id: userIdInput.val(),
        password: userPasswordInput.val(),
      }),
      success(res) {
        if (res.token) {
          ipcRenderer.send('setUserData', {
            username: res.username,
            email: res.email,
            token: res.token,
          })
          window.location = 'map.html';
        }
      },
      error(jqHXR, textStatus, errorThrown) {
        errorElement.html(jqHXR.responseJSON.message);
      },
      contentType: 'application/json',
      accepts: 'application/hal+json',
      dataType: 'json',
    });
  });
  signUpButton.on('click', () => {
    window.location = 'signup.html';
  });
});
