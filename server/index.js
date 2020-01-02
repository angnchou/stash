const express = require('express');
const app = express();
const { google } = require('googleapis');
const clientID = process.env.CLIENT_ID || require('./clientID');
const clientSecret = process.env.CLIENT_SECRET || require('./clientSecret');

const path = require('path');

const bodyParser = require('body-parser');

const db = require('../database-postgres');

const sha256 = require('js-sha256');
const loginSecret = process.env.SECRET || require('./secret.js');

const diffApi = require('./diffApi.js');
const port = process.env.PORT || 8000;

const session = require('express-session');

const cookieParser = require('cookie-parser');

const jwt = require('jsonwebtoken');

const sendGridApi = process.env.SENDGRIDAPI || require('./sendGridApi.js');
const sendGrid = require('@sendgrid/mail');
sendGrid.setApiKey(sendGridApi);

const resetPasswordSecret = process.env.RESETPASSWORDSECRET || require('./resetPasswordSecret.js')

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(clientID);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(__dirname + '/../react-client/dist/'));

//template engine
app.set('views', './server/views');
app.set('view engine', 'pug');
app.locals.basedir = path.join(__dirname, 'views');

//session
app.use(session({ secret: 'hoi', resave: false, saveUninitialized: false }));

//OAuth client with redirect URI
const oauth2Client = new google.auth.OAuth2(
  clientID,
  clientSecret,
  'http://localhost:8000/stashgoogleauth'
);

//kicks off oauth flow
app.get('/googleauthtest', function (req, res) {
  const url = oauth2Client.generateAuthUrl({
    scope: 'email'
  });
  res.redirect(url);
})

//authenticating user
app.get('/stashgoogleauth', function (req, res) {
  const code = req.query.code;
  oauth2Client.getToken(code)
    .then(tokens => {
      oauth2Client.setCredentials(tokens);
      client.verifyIdToken({
        idToken: tokens.tokens.id_token,
        audience: clientID
      })
        .then(({ payload }) => {
          if (payload.email_verified && payload.email) {
            const oauthCookie = jwt.sign({ username: req.body.email, email: payload.email }, loginSecret);
            console.log(oauthCookie, 'OATH 68')
            res.cookie('auth', oauthCookie);
          }
          res.redirect('/');
        })
    })
    .catch(err => {
      console.log(err, 'google auth error!');
    })
})


//parse auth
const parseUser = (str) => {
  const index = str.indexOf('_');
  return str.slice(0, index);
}

const parseAuth = (str) => {
  const index = str.indexOf('_') + 1;
  return str.slice(index);
}

app.get('/logout', function (req, res) {
  res.clearCookie('auth');
  res.redirect('/login');
})

app.get('/login', function (req, res) {
  const user = req.cookies.email;
  if (req.session.err) {
    const msg = req.session.err;
    req.session.err = '';
    res.render('login', { error: msg, email: user });
  } else {
    res.render('login', { email: user });
  }
})

app.post('/createaccount', function (req, res) {
  const pw = req.body.password;
  const user = req.body.email;
  const pwconfirm = req.body.passwordconfirm;
  if (!pw || !user || !pwconfirm) {
    req.session.err = "All fields are required!";
    res.redirect('/createaccount');
    return;
  }
  //email check
  //TODO password check
  if (!isEmailValid(user)) {
    req.session.err = "Enter valid email!";
    res.redirect('/createaccount');
  } else if (pwconfirm !== pw || pw.length === 0) {
    req.session.err = "Password entered does not match confirmation, please try again!";
    res.redirect('/createaccount');
  } else {
    db.findUser(user, (err, data) => {
      if (err) {
        res.status(500).send('db problem :(')
      } else if (data === null && !isPAsswordValid(pw)) {
        //db createAccount
        const hashedPassword = sha256.hmac(loginSecret, pw);
        db.createAccount(user, hashedPassword, (err, data) => {
          if (err) {
            res.status(500).send('db problem - cannot create user :(');
          } else {
            //if successfully create account, create auth cookie and log user in
            const jwtAuth = jwt.sign({ email: user }, loginSecret);
            res.cookie('auth', jwtAuth);
            res.redirect('/');
          }
        })
      } else if (isPAsswordValid(pw)) {
        res.render('createAccount.pug', { error: isPAsswordValid(pw) });
      } else if (data) {
        req.session.err = "You already have an account"
        res.redirect('/login');
      }
    })
  }
})

//email validation
function isEmailValid(email) {
  const reg = /[\w\._\-]+@\w+(\.\w)+/;
  return reg.test(email);
}

/*password validation:
pw must be at least 8 chars, has 1 uppercase letter, 1 lowercase letter, 1 special char, and 1 number
ascii code 65 - 90 A - Z, 97 - 122 a - z, 48 - 57 is zero - nine
*/

function isPAsswordValid(pw) {
  const check = {};
  if (pw.length < 8) {
    return "Password needs to be at least 8 characters long";
  }
  for (var i = 0; i < pw.length; i++) {
    if (pw.charCodeAt(i) >= 65 && pw.charCodeAt(i) <= 90) {
      check.upper = true;
    } else if (pw.charCodeAt(i) >= 97 && pw.charCodeAt(i) <= 122) {
      check.lower = true
    } else if (pw.charCodeAt(i) >= 48 && pw.charCodeAt(i) <= 57) {
      check.num = true;
    } else {
      check.special = true;
    }
  }
  if (Object.keys(check).length !== 4) {
    return "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 special character, and 1 number"
  }
  return "";
}


app.post('/login', function (req, res) {
  const pw = req.body.password;
  const user = req.body.email;

  if (!pw || !user) {
    req.session.err = 'Email and password are required!';
    res.redirect('/login');
    return;
  }
  const checkHash = sha256.hmac(loginSecret, pw);
  db.login(user, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send('db problem :(');
    } else if (data === null) {
      req.session.err = 'User not found!';
      res.redirect('/login');
    } else if (checkHash === data) {
      if (req.body.rememberMe === 'on') {
        res.cookie('email', req.body.email);
      }
      // const checkAuth = sha256.hmac(loginSecret, req.body.username);
      const jwtAuth = jwt.sign({ email: user }, loginSecret);
      res.cookie('auth', jwtAuth);
      res.redirect('/');
    } else {
      req.session.err = 'Incorrect password, try again!';
      res.redirect('/login');
    }
  });
});

app.get('/resetpassword', function (req, res) {
  const msg = req.session.message;
  if (req.session.message) {
    res.render('resetpassword.pug', { message: msg });
    req.session.message = "";
  } else {
    res.render('resetpassword.pug');
  }
});

//send email with link that contains reset password secret and user email 
app.post('/resetpassword', function (req, res) {
  const email = req.body.email;
  if (!isEmailValid(email)) {
    res.render('resetPassword.pug', { message: 'Please enter your email' })
  } else {
    const hashedResetpassword = sha256.hmac(resetPasswordSecret, email);
    const resetEmail = {
      to: email,
      from: 'admin@stash.com',
      subject: 'Reset Your Password',
      text: 'Click the link below to reset your password',
      html: '<h2>Click the link below to reset your password: </h2><br/>'
        + `<a href="http://localhost:8000/newpassword?action=${hashedResetpassword}&user=${email}" target="_blank">`
        + `http://localhost:8000/newpassword?action=${hashedResetpassword}&user=${email}"`
        + '</a>'
    }
    sendGrid.send(resetEmail);
    req.session.message = "Check your inbox";
    res.redirect('/resetpassword');
  }
})

//verify 
app.get('/newpassword', function (req, res) {
  const user = req.query.user;
  const action = req.query.action;
  if (!user || !action) {
    res.render('resetPassword.pug')
  }
  const verifyAccount = sha256.hmac(resetPasswordSecret, user);
  if (action !== verifyAccount) {
    res.redirect('/resetpassword');
  } else {
    res.render('newPassword.pug', { user: req.query.user, action: req.query.action });
  }
})

//verify link and check for user in db then update user pw based on user in link
app.post('/newpassword', function (req, res) {
  const user = req.body.user;
  const newPassword = req.body.newPassword;
  const confirmPassword = req.body.confirmPassword;
  if (newPassword !== confirmPassword || newPassword.length === 0) {
    res.render('newPassword.pug', { error: 'New password does not match confirmation. Try again.' });
  } else if (!isPAsswordValid(newPassword)) {
    db.findUser(user, (err, data) => {
      if (err) {
        res.status(500).send('Error: newpassword user not found in db')
      } else if (data === null) {
        res.status(500);
        res.render('login.pug', { error: 'Error: no user found' });
      } else if (data) {
        const hashedNewPw = sha256.hmac(loginSecret, newPassword);
        db.resetPassword(hashedNewPw, user, (err, data) => {
          if (err) {
            res.status(500).send('cannot reset password. Db error :(');
          } else {
            res.status(200);
            req.session.err = 'log in using your new password'
            res.redirect('/login');
          }
        })
      }
    })
  } else {
    res.render('newPassword.pug', { error: isPAsswordValid(newPassword) });
  }
})

app.get('/createaccount', function (req, res) {
  const error = req.session.err;
  req.session.err = "";
  res.render('createaccount.pug', { error: error });
})


app.use(function (req, res, next) {
  if (req.cookies.auth) {
    try {
      const checkAuth = jwt.verify(req.cookies.auth, loginSecret);
      next();
    } catch (e) {
      res.clearCookie('auth');
      res.redirect('/login');
    }
  } else {
    res.redirect('/login');
  }
})

app.get('/', function (req, res) {
  res.render('index');
})


app.get('/items', function (req, res) {
  db.selectAll((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(data);
    }
  });
});
app.post('/items/api', function (req, res) {
  diffApi
    .getInfo(req.body.url)
    .then(info => {
      db.add(
        info.title,
        req.body.tags,
        req.body.category,
        req.body.url,
        req.body.notes,
        (err, newId) => {
          if (err) {
            res.status(500).send(err);
          } else {
            res.status(200).send({ success: true });
          }
        }
      );
    })
    .catch(err => {
      console.log(err, 'ERR');

      res.status(500).send(err);
    });
});

app.post('/items', function (req, res) {
  db.add(
    req.body.title,
    req.body.tags,
    req.body.category,
    req.body.url,
    req.body.notes,
    (err, data) => {
      if (err) {
        res.status(500).send(err);
      } else {
        db.selectAll((err, data) => {
          if (err) {
            res.status(500).send(err);
          } else {
            res.json(data);
          }
        });
      }
    }
  );
});

app.patch('/items/:id', (req, res) => {
  db.update(req.params.id, req.body, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(data);
    }
  });
});

app.delete('/items/delete/:id', (req, res) => {
  db.deleteBookmark(req.params.id, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      db.selectAll((err, data) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.json(data);
        }
      });
    }
  });
});

app.listen(port, function () {
  console.log(`listening on port ${port}!`);
});
