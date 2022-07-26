var express = require("express");

var path = require('path');
const passport = require('passport');

// DB config
const JSONdb = require('simple-json-db');

const authRouter = express.Router();

authRouter.get('/login', async (req,res) => {
    res.sendFile(path.resolve('./pages/login.html'));
})
  
authRouter.post('/login',
    passport.authenticate('local', { failureRedirect: '/login', failureMessage: true }),
    async (req, res) => {
        res.redirect('/profile/' + req.user.id);
});

module.exports = authRouter;