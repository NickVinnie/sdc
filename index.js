const express = require('express');
const axios = require('axios');
const db = require('./db/index.js');

var app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}))

app.get('/qa/questions', (req, res) => {
  let productId = req.query.product_id;
  let page = req.query.page || 1;
  let count = req.query.count || 5;
  db.getQuestions(productId.toString())
    .then((questions) => {
      let formatted = {product_id: productId, results: []};
      let start = (page - 1) * count;
      for (let i = start; i < start + count; i++) {
        if (questions[i] && questions[i].reported === '0') {
          let formattedQuestion = {}
          formattedQuestion['question_id'] = Number(questions[i]['id']);
          formattedQuestion['question_body'] = questions[i]['body'];
          formattedQuestion['question_date'] = questions[i]['date_written'];
          formattedQuestion['reported'] = false;
          formattedQuestion['question_helpfulness'] = Number(questions[i]['helpful']);
          formattedQuestion['asker_name'] = questions[i]['asker_name'];
          let formattedAnswers = {};
          questions[i]['answers'].forEach((answer) => {
            let formattedPhotos = [];
            answer.photos.forEach((photo) => {
              formattedPhotos.push(photo.url);
            });
            formattedAnswers[answer.id] = {
              id: Number(answer.id),
              body: answer.body,
              date: answer['date_written'],
              'answerer_name': answer['answerer_name'],
              helpfulness: Number(answer.helpful),
              photos: formattedPhotos
            }
          });
          formattedQuestion['answers'] = formattedAnswers;
          formatted.results.push(formattedQuestion);
      }
    }
      res.send(formatted);
    })
    .catch(console.log);
});

app.get('/qa/questions/:questionId/answers', (req, res) => {
  let questionId = req.params.questionId;
  let page = Number(req.query.page) || 1;
  let count = Number(req.query.count) || 5;
  let formatted = {
    question: questionId.toString(),
    page,
    count,
    results: []
  };
  db.getAnswers(questionId.toString())
    .then((answers) => {
      answers = answers.slice((page - 1) * count, (page - 1) * count + count);
      answers.forEach((answer) => {
        if (answer.reported === '0') {
          let formattedPhotos = [];
          answer.photos.forEach((photo) => {
            formattedPhotos.push({
              id: photo.id,
              url: photo.url
            });
          });
          let formattedAnswer = {
            'answer_id': Number(answer.id),
            body: answer.body,
            date: answer['date_written'],
            'answerer_name': answer['answerer_name'],
            helpfulness: Number(answer.helpful),
            photos: formattedPhotos
          }
          formatted.results.push(formattedAnswer);
        }
      })
      res.send(formatted);
    })
    .catch(console.log);
});

app.post('/qa/questions', (req, res) => {
  db.saveQuestion(req.body.body, req.body.name, req.body.email, req.body['product_id'].toString())
    .then(() => res.send('success'))
    .catch((err) => {
      console.log(err);
      res.send('fail');
    });
});

app.post('/qa/questions/:questionid/answers', (req, res) => {
  db.saveAnswer(req.body.body, req.body.name, req.body.email, req.params.questionid.toString())
    .then(() => res.send('success'))
    .catch(() => res.send('error'));
});

app.put('/qa/questions/:questionId/helpful', (req, res) => {
  db.helpfulQuestion(req.params.questionId)
    .then(() => {
      res.send('success');
    })
    .catch((err) => {
      res.sendStatus(500, err)
    });
});

app.put('/qa/questions/:questionId/report', (req, res) => {
  db.reportQuestion(req.params.questionId)
    .then(() => {
      res.send('success');
    })
    .catch((err) => {
      res.sendStatus(500, err);
    })
});

app.put('/qa/answers/:answerId/helpful', (req, res) => {
  db.helpfulAnswer(req.params.answerId.toString())
    .then(() => {
      res.send('success');
    })
    .catch((err) => {
      res.sendStatus(500, err);
    })
});

app.put('/qa/answers/:answerId/reported', (req, res) => {
  db.reportAnswer(req.params.answerId.toString())
    .then(() => {
      res.send('success');
    })
    .catch((err) => {
      res.sendStatus(500, err);
    })
});


app.listen(3000, () => {
  console.log('listening on port 3000');
})