let jwt = require('jsonwebtoken');
const config = require('./config.js');

/*
TODO: 
need form for user sign up or log in:
 -> sign up - 
  client POST to create user table in db to store username, password
 -> log in - 
  client GET to check token
  - get token from request header in middleware.js


- create token
- authenticate by checking if user exists & if token expired?
  - get token from request header in middleware.js
  - return 403 if authentication fails
  - 400 if user can't be found


*/

//create token
