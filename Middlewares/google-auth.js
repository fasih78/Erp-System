const express = require ('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;


require('dotenv').config()



passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:2000/google/callback",
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));

passport.serializeUser(function(user, cb) {
    cb(null, user);
  });
  
  passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
  });