let jwt = require('jsonwebtoken');
const config = require('./config.js');

//get token from header, if authorization Bearer type used, remove it from actual token; send token to server
//if no token at all send err to server
let getToken = (req, callback) => {
  let token = req.headers['x-access-token'] || req.headers['authorization'];
  let tokenA = token.split(' ');
  if (typeof token === 'undefined') {
    callback(err);
  } else {
    if (tokenA[0] === 'Bearer') {
      token = tokenA[1];
      callback(token);
    }
  }
};

let verifyToken = (token, callback) => {
  jwt.verify(token, config.secret, (err, data) => {
    if (token) {
      callback(data);
    } else {
      callback(err);
    }
  });
};
