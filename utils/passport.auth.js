const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user.model')

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async(email, password, done) => {
      try{
        const user = await User.findOne({email})
        // user not exit
        if(!user){
          return done(null, false, {message: "Emailnot registered."})
        }
        // user exit. Verify password
        const isMatch = await user.isValidPassword(password)
        if(isMatch){
          return done(null,user)
        }else{
          return done(null, false, {message: "incorrect password"})
        }
      }catch(error){
        done(error)
      }
    }
  )
)

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});