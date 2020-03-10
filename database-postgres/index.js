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
  const statement = 'SELECT * FROM users where username = $1';
  const args = [username];
  client.query(statement, args, (err, result) => {
    if (err) {
      cb(err);
    } else if (result.rows.length === 0) {
      cb(null, null);
    } else if (result.rows.length === 1) {
      cb(err, result.rows[0]);
    }
  })
}

const createAccount = (username, hashedPassword, cb) => {
  const statement = 'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id';
  const args = [username, hashedPassword];
  client.query(statement, args, (err, result) => {
    if (err) {
      cb(err, null);
    } else {
      cb(null, result);
    }
  })
}

const getUserId = (username, cb) => {
  const statement = 'SELECT id from users WHERE username = $1';
  const args = [username]
  client.query(statement, args, (err, userId) => {
    if (err) {
      cb(err, null);
    } else {
      cb(null, userId)
    }
  })
}


const resetPassword = (newPassword, user, cb) => {
  const statement = 'UPDATE users SET password_hash = $1 WHERE username = $2';
  const args = [newPassword, user];
  client.query(statement, args, (err, result) => {
    if (err) {
      cb(err, null);
    } else {
      cb(null, result);
    }
  })
}

const login = (username, cb) => {
  const statement = 'SELECT * FROM users WHERE username = $1';
  const args = [username];
  client.query(statement, args, (err, result) => {
    if (err) {
      cb(err, null);
    } else {
      if (result.rows.length === 0) {
        cb(null, null);
      } else {
        cb(err, result.rows[0].password_hash, result.rows[0].id);
      }
    }
  });
}

const selectAll = (userId, callback) => {
  const statement = 'SELECT * FROM bookmarks WHERE user_id = $1';
  const args = [userId];
  client.query(statement, args, (err, results, fields) => {
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

const add = (title, tags, category, url, notes, userId, cb) => {
  const statement = 'INSERT INTO bookmarks (title, tags, category, url, notes, user_id) VALUES ($1, $2, $3, $4, $5, $6)';
  const args = [title, tags, category, url, notes, userId];
  client.query(statement, args,
    (err, result) => {
      if (err) {
        cb(err, null);
      } else {
        cb(null, result.insertId);
      }
    });
};

const update = (id, data, userId, cb) => {
  const statement = 'UPDATE bookmarks SET title=$1, tags=$2, category=$3, url=$4, notes=$5 WHERE id=$6 AND user_id=$7';
  const args = [data.title, data.tags, data.category, data.url, data.notes, id, userId];
  client.query(statement, args,
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
  const statement = 'DELETE FROM bookmarks WHERE id=$1';
  const args = [id];
  client.query(statement, args, (err, result) => {
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
  deleteBookmark,
  update,
};
