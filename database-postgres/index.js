const urlApi = require('../server/urlApi.js');
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  client = new Client({
    host: 'localhost',
    user: 'achou',
    database: 'stash',
  });
  client.connect();
} else {
  client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  });
  client.connect();
}

const findUser = (username, cb) => {
  client.query('SELECT * FROM users where username = $1', [username], (err, result) => {
    if (err) {
      cb(err);
    } else if (result.rows.length === 0) {
      cb(null, null);
    } else if (result.rows.length === 1) {
      // console.log(result.rows[0].id, 'db 26 rows[0].id');
      cb(err, result.rows[0]);
    }
  })
}

const createAccount = (username, hashedPassword, cb) => {
  client.query('INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id', [username, hashedPassword], (err, result) => {
    if (err) {
      cb(err, null);
    } else {
      console.log(result.rows[0].id, 'db 37')
      cb(null, result);
    }
  })
}

const getUserId = (username, cb) => {
  client.query('SELECT id from users WHERE username = $1', [username], (err, userId) => {
    if (err) {
      cb(err, null);
    } else {
      console.log(userId, 'db 48 result');
      cb(null, userId)
    }
  })
}


const resetPassword = (newPassword, user, cb) => {
  client.query('UPDATE users SET password_hash = $1 WHERE username = $2', [newPassword, user], (err, result) => {
    if (err) {
      cb(err, null);
    } else {
      cb(null, result);
    }
  })
}

const login = (username, cb) => {
  client.query('SELECT * FROM users WHERE username = $1', [username], (err, result) => {
    if (err) {
      cb(err, null);
    } else {
      if (result.rows.length === 0) {
        cb(null, null);
      } else {
        console.log(result, 'db 73 login result')
        cb(err, result.rows[0].password_hash, result.rows[0].id);
      }
    }
  });
}

const selectAll = (userId, callback) => {
  client.query('SELECT * FROM bookmarks WHERE user_id = $1', [userId], (err, results, fields) => {
    if (err) {
      callback(err, null);
    } else {
      const data = results['rows'].map(bookmark => {
        bookmark.img = urlApi.getScreenshotUrl(bookmark.url);
        return bookmark;
      });
      callback(null, data);
    }
  });
};

const add = (title, tags, category, url, notes, cb) => {
  const statement = 'INSERT INTO bookmarks (title, tags, category, url, notes) VALUES ($1, $2, $3, $4, $5)';
  const args = [title, tags, category, url, notes];
  client.query(statement, args,
    (err, result) => {
      if (err) {
        cb(err, null);
      } else {
        cb(null, result.insertId);
      }
    });
};

const setImage = (id, img, cb) => {
  client.query('UPDATE bookmarks SET img=? WHERE id=?', [img, id], cb);
};

const update = (id, data, cb) => {
  client.query(
    `UPDATE bookmarks SET title='${data.title}', tags='${
    data.tags
    }', category='${data.category}', url='${data.url}', notes='${
    data.notes
    }' WHERE id=${id}`,
    (err, result) => {
      if (err) {
        cb(err, null);
      } else {
        cb(null, result);
      }
    }
  );
};

const deleteBookmark = (id, cb) => {
  //  client.query(`DELETE FROM bookmarks WHERE id=` + id, (err, result) => {
  client.query(`DELETE FROM bookmarks WHERE id= ` + id, (err, result) => {
    if (err) {
      cb(err, null);
    } else {
      cb(null, result);
    }
  });
};

module.exports = {
  createAccount,
  findUser,
  getUserId,
  resetPassword,
  login,
  selectAll,
  add,
  setImage,
  deleteBookmark,
  update,
};
