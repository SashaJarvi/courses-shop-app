const { Router } = require('express');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const router = Router();

const User = require('../models/user');
const keys = require('../keys');

const regEmail = require('../emails/registration');
const resetEmail = require('../emails/reset');

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(keys.SENDGRID_API_KEY);

const { registerValidators } = require('../utils/validators');

router.get('/login', async (req, res) => {
  res.render('auth/login', {
    title: 'Auth',
    isLogin: true,
    registerError: req.flash('registerError'),
    loginError: req.flash('loginError'),
  })
});

router.get('/logout', async (req, res) => {
  req.session.destroy(() => { /* очищаем сессию */
    res.redirect('/auth/login#login')
  });
});

router.post('/register', registerValidators, async (req, res) => {
  try {
    const {email, name, password} = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('registerError', errors.array()[0].msg);
      return res.status(422).redirect('/auth/login#register');
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email, name, password: hashPassword, cart: {items: []}
    });

    await user.save();
    res.redirect('/auth/login#login');
    sgMail
      .send(regEmail(email))
      .then(() => {
        console.log('Email sent')
      })
      .catch((error) => {
        console.error(error)
      })
  } catch (e) {
    console.log(e)
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const candidate = await User.findOne({ email });

    if (candidate) {
      const areSame = await bcrypt.compare(password, candidate.password);

      if (areSame) {
        req.session.user = candidate;
        req.session.isAuthenticated = true;

        req.session.save(err => {
          if (err) {
            throw err;
          }
        });

        res.redirect('/');
      } else {
        req.flash('loginError', 'Incorrect password');
        res.redirect('/auth/login#login');
      }
    } else {
      req.flash('loginError', 'This user does not exist');
      res.redirect('/auth/login#login');
    }
  } catch (e) {
    console.log(e)
  }
});

router.get('/reset', (req, res) => {
  res.render('auth/reset', {
    title: 'Forgot your password?',
    error: req.flash('error')
  })
});

router.post('/reset',  (req, res) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        req.flash('error', 'Something went wrong, try again later');
        return res.redirect('/auth/reset');
      }

      const token = buffer.toString('hex');
      const candidate = await User.findOne({ email: req.body.email });

      if (candidate) {
        candidate.resetToken = token;
        candidate.resetTokenExp = Date.now() + 60 * 60 * 1000; // token will exist for 1 hour
        await candidate.save();
        sgMail
          .send(resetEmail(candidate.email, candidate.resetToken))
          .then(() => {
            console.log('Email sent')
          })
          .catch((error) => {
            console.error(error)
          })
        res.redirect('/auth/login')
      } else {
        req.flash('error', 'User with this email does not exist');
        res.redirect('/auth/reset');
      }
    })
  } catch (e) {
    console.log(e)
  }
});

router.get('/password/:token', async (req, res) => {
  if (!req.params.token) {
    return res.redirect('/auth/login');
  }

  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExp: {
        $gt: Date.now()
      }
    });

    if (!user) {
      return res.redirect('/auth/login');
    } else {
      res.render('auth/password', {
        title: 'Password recovery',
        error: req.flash('error'),
        userId: user._id.toString(),
        token: req.params.token
      })
    }
  } catch (e) {
    console.log(e);
  }
});

router.post('/password', async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.body.userId,
      resetToken: req.body.token,
      resetTokenExp: {$gt: Date.now()}
    });

    if (user) {
      user.password = await bcrypt.hash(req.body.password, 10);
      user.resetToken = undefined;
      user.resetTokenExp = undefined;
      await user.save();
      res.redirect('/auth/login')
    } else {
      req.flash('loginError', 'The token has expired');
      res.redirect('/auth/login')
    }
  } catch (e) {
    console.log(e);
  }
})

module.exports = router;
