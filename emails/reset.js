const keys = require('../keys');

module.exports = function (email, token) {
  return {
    to: email,
    from: keys.EMAIL_FROM,
    subject: 'Password recovery',
    html: `
      <h1>Forgot your password?</h1>
      <p>If yes, ignore this letter</p>
      <p>Otherwise click this link below:</p>
      <p><a href="${keys.BASE_URL}/auth/password/${token}">Restore access</a></p>
      <hr />
      <a href="${keys.BASE_URL}">Courses shop</a>
    `
  }
}