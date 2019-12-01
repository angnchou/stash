const express = require('express');
const app = express();
const { google } = require('googleapis');
const clientID = require('./clientID');
const clientSecret = require('./clientSecret');
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
  console.log(url, 'url')
  res.redirect(url);
})

//authenticating user
app.get('/stashgoogleauth', function (req, res) {
  const code = req.query.code;
  console.log(code, 'codeeeee')
  oauth2Client.getToken(code)
    .then(tokens => {
      oauth2Client.setCredentials(tokens);
      client.verifyIdToken({
        idToken: tokens.tokens.id_token,
        audience: clientID
      })
        .then(({ payload }) => {
          if (payload.email_verified && payload.email) {
            const oauthCookie = jwt.sign({ username: req.body.username, email: payload.email }, loginSecret);
            res.cookie('auth', oauthCookie);
          }
          res.redirect('/');
        })
    })
    .catch(err => {
      console.log(err, 'CAUGHTERRRR');
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
  const username = req.cookies.username;
  if (req.session.err) {
    const msg = req.session.err;
    req.session.err = '';
    res.render('login', { error: msg, username: username });
  } else {
    res.render('login', { username: username });
  }
})

app.post('/login', function (req, res) {
  const pw = req.body.password;
  const user = req.body.username;

  if (!pw || !user) {
    req.session.err = 'Username and password are required!';
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
        res.cookie('username', req.body.username);
      }
      // const checkAuth = sha256.hmac(loginSecret, req.body.username);
      const jwtAuth = jwt.sign({ username: req.body.username }, loginSecret);
      res.cookie('auth', jwtAuth);

      res.redirect('/');
    } else {
      req.session.err = 'Incorrect password, try again!';
      res.redirect('/login');
    }
  });
});


app.use(function (req, res, next) {
  if (req.cookies.auth) {
    try {
      const checkAuth = jwt.verify(req.cookies.auth, loginSecret);
      console.log(checkAuth, 'jwt.verify checkAuth');
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
      console.log(err, 'ERR SERVER');
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
            console.log(err, 'ERR server');
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
      console.log(err, 'ERR server');
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
