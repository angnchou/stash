const express = require('express');
const bodyParser = require('body-parser');
// UNCOMMENT THE DATABASE YOU'D LIKE TO USE
const db = require('../database-mysql');
// const items = require('../database-mongo');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// UNCOMMENT FOR REACT
app.use(express.static(__dirname + '/../react-client/dist'));

// UNCOMMENT FOR ANGULAR
// app.use(express.static(__dirname + '/../angular-client'));
// app.use(express.static(__dirname + '/../node_modules'));

app.get('/items', function(req, res) {
  db.selectAll((err, data) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json(data);
    }
  });
});

app.post('/items', function(req, res) {
  console.log(req.body, 'req.body');
  db.add(
    req.body.title,
    req.body.tags,
    req.body.category,
    req.body.url,
    req.body.notes,
    (err, data) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        db.selectAll((err, data) => {
          if (err) {
            res.status(500).send(err);
          } else {
            res.json(data);
          }
        });
      }
    },
  );
});

app.listen(3000, function() {
  console.log('listening on port 3000!');
});
