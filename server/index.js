const express = require('express');
const bodyParser = require('body-parser');
// UNCOMMENT THE DATABASE YOU'D LIKE TO USE
const db = require('../database-mysql');
const diffApi = require('./diffApi.js');
const port = 4000;

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
      res.status(500).send(err);
    } else {
      res.send(data);
    }
  });
});
//use API to get page title and image/fav icon
app.post('/items/api', function(req, res) {
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
        },
      );
      // res.status(200).send(info);
    })
    .catch(err => {
      res.status(500).send(err);
    });
});
// var img = document.createElement('img');
// img.src = 'my_image.jpg';
// document.getElementById('container').appendChild(img);
//getScreenshot to add to server
app.post('/items', function(req, res) {
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
    },
  );
});

// app.post('/items', function(req, res) {
//   console.log(req.body, 'req.body');
//   db.add(
//     req.body.title,
//     req.body.tags,
//     req.body.category,
//     req.body.url,
//     req.body.notes,
//     (err, data) => {
//       if (err) {
//         console.log(err);
//         res.status(500).send(err);
//       } else {
//         db.selectAll((err, data) => {
//           if (err) {
//             res.status(500).send(err);
//           } else {
//             res.json(data);
//           }
//         });
//       }
//     },
//   );
// });

//TODO PATCH
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

app.listen(port, function() {
  console.log(`listening on port ${port}!`);
});
