const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  // password: 'FILL_ME_IN',
  database: 'stash',
});

const selectAll = callback => {
  connection.query('SELECT * FROM bookmarks', (err, results, fields) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

const add = (title, tags, category, url, notes, cb) => {
  connection.query(
    `INSERT INTO bookmarks (title, tags, category, url, notes) VALUES ("${title}", "${tags}", "${category}", "${url}", "${notes}")`,
    (err, result) => {
      if (err) {
        cb(err, null);
      } else {
        cb(null, result);
      }
    },
  );
};

const deleteBookmark = (id, cb) => {
  connection.query(
    `DELETE bookmarks WHERE id=${req.params.id})`,
    (err, result) => {
      if (err) {
        cb(err, null);
      } else {
        cb(null, result);
      }
    },
  );
};

module.exports = {
  selectAll,
  add,
  deleteBookmark,
};
