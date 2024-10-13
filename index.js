const express = require('express');
const app = express();
const mysql = require('mysql2');
const mysql_info = require('./ignore_config/mysql_config');
const bodyParser = require('body-parser');

const connection = mysql.createConnection(mysql_info);

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static('public'));

// 메인 페이지
app.get('/main', (_, res) => {
  connection.query('SELECT * FROM sm_sample01', (err, rows, _) => {
    res.render('main', { data: rows });
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

app.listen(3000, () => {
  console.log('Someone visit my backend!');
});

// CRUD 구현 완료.
// 이번엔 CRLF LF 문제 해결해서 GIT에 업로드
// 그후 약간의 프로젝트 업그레이드. EX) MD형식으로 글 작성가능/이미지 저장/로그인/인증 ...
