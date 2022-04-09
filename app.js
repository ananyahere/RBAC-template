const express= require("express")
const createHttpError= require('http-errors')
const morgan = require('morgan')
const mongoose = require('mongoose')
const indexRoutes = require('./routes/index.route')
const authRoutes = require('./routes/auth.route')
const userRoutes = require('./routes/user.route')
const adminRoutes = require('./routes/admin.route')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const roles = require('./utils/constants')
require('dotenv').config()

const app = express()
app.use(morgan('dev'))
app.set('view engine', 'ejs')
app.use(express.static('public'))
// to parse incoming JSON body
app.use(express.json())
app.use(express.urlencoded({extended: false}))


// Init Session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true
    },
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    })
  })
);

// For Passport JS Authentication
app.use(passport.initialize());
app.use(passport.session());
require('./utils/passport.auth');

app.use((req, res, next) => {
  // can be used inside ejs templates
  res.locals.user = req.user;
  next();
});

app.use('/', indexRoutes)
app.use('/auth', authRoutes)
app.use('/user', ensureAuthentication, userRoutes)
app.use('/admin', ensureAdmin, adminRoutes)

// for the routes which are not handled by this application - 404 Handler
app.use((req, res, next) => {
  next(createHttpError.NotFound())
})

// error handler middleware
app.use((error,req, res,next) => {
  error.status = error.status|| 500
  res.status(error.status)
  console.log(error)
  res.send(error)
})

const PORT= process.env.PORT || 8080

// database connection
mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    console.log('mongoose connected')
    app.listen(PORT, () => {
      console.log(`Listening at port ${PORT}`);
    })
  }
  )
  .catch((err) => console.log(err));

// middleware to ensure if user is logged in
function ensureAuthentication(req, res, next) {
  if(req.isAuthenticated()){
    next()
  }else{
    res.redirect('/auth/login')
  }
}

function ensureAdmin(req, res, next){
  if(req.user.role === 'ADMIN'){
    next()
  }else{
    res.redirect("/")
  }
}