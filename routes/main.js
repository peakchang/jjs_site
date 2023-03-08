const express = require('express');

const sql_con = require('../db_lib');
const router = express.Router();
var requestIp = require('request-ip');
const fs = require('fs')

const aligoapi = require('aligoapi')
const { aligoKakaoNotification } = require('../db_lib/back_lib')
const app_root_path = require('app-root-path').path;

const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");


router.get('/', (req, res, next) => {
    // res.render('crm/work_site')
    res.render('main/index')
})

module.exports = router;