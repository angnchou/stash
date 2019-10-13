const express = require('express');
const bodyParser = require('body-parser');
// UNCOMMENT THE DATABASE YOU'D LIKE TO USE
// const db = require('../database-mysql');
const db = require('../database-postgres');
const path = require('path');

const sha256 = require('js-sha256');
const loginSecret = require('./secret.js');

const diffApi = require('./diffApi.js');
const port = process.env.PORT || 8000;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/../react-client/dist/'));

app.get('/login', function (req, res) {
  res.sendFile(path.resolve('react-client/dist/login.html'));
});


app.post('/login', function (req, res) {
  let pw = JSON.stringify(req.body['password']);
  let checkHash = sha256.hmac(loginSecret, pw);
  let user = req.body['username'];
  db.login(user, (err, data) => {
    if (err) {
      res.status(500).send('db problem :(');
    } else {
      if (checkHash === data) {
        res.redirect('/');
      } else {
        res.redirect('/login?error=badpassword');
      }
    }
  });
});

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
