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
  //email check; xx @ xxx . xxx
  if (isEmailValid(user) === false) {
    req.session.err = "Enter valid email!";
    res.redirect('/createaccount');
  } else if (pwconfirm !== pw || pw.length === 0) {
    req.session.err = "Password entered does not match confirmation, please try again!";
    res.redirect('/createaccount');
  } else {
    db.findUser(user, (err, data) => {
      if (err) {
        res.status(500).send('db problem :(')
      } else if (data === null) {
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
  console.log('reset')
  res.render('resetPassword.pug');
});

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
