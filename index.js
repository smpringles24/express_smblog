const express = require('express');
const app = express();
const mysql = require('mysql2');
const mysql_info = require('./ignore_config/mysql_config');
const bodyParser = require('body-parser');
const fse = require('fs-extra');
const connection = mysql.createConnection(mysql_info);
const path = require('path');
const bcrypt = require('bcrypt');

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static('public'));

// 로깅 미들웨어
const logFilePath = path.join(__dirname, 'server.log');
const logger = (req, res, next) => {
  const log = `${Date()}: ${req.method} | ${req.url} \n`;
  fse.appendFile(logFilePath, log, (err) => {
    if (err) {
      console.error('log error', err);
    }
  });
  next();
};

app.use(logger);

let isLoggin = false;

// 메인 페이지
app.get('/main', (_, res) => {
  connection.query('SELECT * FROM sm_sample01', (err, rows, _) => {
    res.render('main', { data: rows, isLoggin: isLoggin });
  });
});

// 글 조회 페이지
app.get('/post/:id', (req, res) => {
  connection.query(
    'SELECT * FROM sm_sample01 WHERE id = ?',
    [req.params.id],
    (err, row, _) => {
      if (err) {
        return err;
      } else {
        res.render('post', { data: row[0] });
      }
    }
  );
});

// 글 삭제
app.post('/delete/:id', (req, res) => {
  let deleteId = req.params.id;
  const query = 'DELETE FROM sm_sample01 WHERE id = ?';

  connection.query(query, [deleteId], () => {
    res.redirect('/main');
  });
});

// 새 글 작성
app.get('/newpost', (req, res) => {
  res.render('newpost');
});

app.post('/newpost', (req, res) => {
  const { title, content, author } = req.body;
  connection.query(
    'INSERT INTO sm_sample01 (title, content, created, author) VALUES (?, ?, ?, ?)',
    [title, content, new Date(), author],
    () => {
      res.redirect('/main');
    }
  );
});

// 글 수정
app.get('/updatepost/:id', (req, res) => {
  let searchId = req.params.id;
  connection.query(
    'SELECT * FROM sm_sample01 WHERE id = ?',
    [searchId],
    (err, row) => {
      res.render('updatepost', { data: row[0] });
    }
  );
});

app.post('/updatepost/:id', (req, res) => {
  let updateId = req.params.id;
  const { title, content, author } = req.body;
  connection.query(
    'UPDATE sm_sample01 SET title = ?, content = ?, created = ?, author = ? WHERE id = ?',
    [title, content, new Date(), author, updateId],
    () => {
      res.redirect('/main');
    }
  );
});

// 로그인
app.get('/login/signup', (req, res) => {
  res.render('signup');
});

app.post('/login/signup', (req, res) => {
  const { id, password, name } = req.body;
  const encryptedPassword = bcrypt.hashSync(password, 10);
  connection.query(
    'INSERT INTO user_info (user_id, user_password, user_name) VALUES (?, ?, ?)',
    [id, encryptedPassword, name],
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send('database insertion err');
      }
      res.redirect('/main');
    }
  );
});

app.post('/login', (req, res) => {
  const { id, password } = req.body;
  // login테이블 쿼리(where id = id) 돌려서 해싱해서 저장해둔 값 가져오기
  connection.query(
    'SELECT user_password FROM user_info WHERE user_id = ?',
    [id],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        if (result.length === 0) {
          res.send('no id data');
        } else {
          const isPasswordVaild = bcrypt.compareSync(
            password,
            result[0].user_password
          );
          if (isPasswordVaild) {
            console.log('로그인 성공');
            isLoggin = true;
            res.redirect('/main');
          } else {
            console.log('로그인 실패');
            res.redirect('/main');
          }
        }
      }
    }
  );
});

// 로그아웃
app.post('/logout', (req, res) => {
  isLoggin = false;
  res.redirect('/main');
});

app.listen(3000, () => {
  console.log('Someone visit my backend!');
});
