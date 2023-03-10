const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const passport = require('passport');
const dateFilter = require('nunjucks-date-filter');

const helmet = require('helmet');
const hpp = require('hpp');

dotenv.config();


const crmRouter = require('./routes/admin');
const mainRouter = require('./routes/main');
const authRouter = require('./routes/auth');
const passportConfig = require('./passport');



const app = express();
var xhub = require('express-x-hub');



passportConfig(); // 패스포트 설정

app.set('port', process.env.PORT || 3060);
app.set('view engine', 'html');

function setUpNunjucks(expressApp) {
  let nunjucks_env = nunjucks.configure('views', {
    autoescape: true,
    express: app,
    watch: true,
  });
  nunjucks_env.addFilter('date', dateFilter);
}

setUpNunjucks();

if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined'));
    app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
    app.use(hpp());
} else {
    app.use(morgan('dev'));
}



app.use(xhub({ algorithm: 'sha1', secret: process.env.APP_SECRET }));

app.use('/img', express.static(path.join(__dirname, 'uploads')));
app.use('/lib', express.static(path.join(__dirname, 'db_lib')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));

if (process.env.NODE_ENV === 'production') {
  var https_status = true
} else {
  var https_status = false
}
const sessionOption = {
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: https_status,
        maxAge: 60 * 1000 * 120,
    },
};

if (process.env.NODE_ENV === 'production') {
    sessionOption.proxy = true;
    sessionOption.cookie.secure = true;
}

app.use(session(sessionOption));
app.use(passport.initialize());
app.use(passport.session());


app.use('/', mainRouter);
app.use('/crm', crmRouter);
app.use('/auth', authRouter);

app.use((req, res, next) => {
    const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
  });
  
  app.use((err, req, res, next) => {
    console.log('------------------------------');
    console.error(err);
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);

    console.log(err.status);
    if(err.code == 'ER_NO_SUCH_TABLE'){
      var errData = '테이블이 존재하지 않습니다. 테이블을 추가해주세요'
    }else if(err.status == 404){
      var errData = '페이지가 존재하지 않습니다. 주소를 확인해주세요'
    }
    res.render('error', { errData });
  });

  module.exports = app;