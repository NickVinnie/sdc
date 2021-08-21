const mongoose = require('mongoose');
const express = require('express');

let app = express();
mongoose.connect('mongodb://localhost/sdc');

mongoose.connection.on('open', () => {
  console.log('connected to sdc database');
})

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const qaSchema = new mongoose.Schema({
  id: String,
  product_id: String,
  body: String,
  date_written: String,
  asker_name: String,
  asker_email: String,
  reported: String,
  helpful: String,
  answers: [new mongoose.Schema({
    id: String,
    question_id: String,
    body: String,
    date_written: String,
    answerer_name: String,
    answerer_email: String,
    reported: String,
    helpful: String,
    photos: [{
      id: String,
      answer_id: String,
      url: String
    }]
  })]
});

const qaModel = mongoose.model('QA', qaSchema, 'qa');

const indexSchema = new mongoose.Schema({
  type: String,
  index: Number
});

const indexModel = mongoose.model('index', indexSchema, 'indexes');

app.get('/qa/questions', (req, res) => {
  qaModel.find({product_id: req.query.product_id.toString()})
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500, err);
    });

});

app.get('/qa/questions/:questionId/answers', (req, res) => {
  qaModel.findOne({id: req.params.questionId.toString()})
    .then((question) => res.send(question.answers))
    .catch((err) => {
      console.log(err);
      res.sendStatus(500, err);
    });
});

app.post('/qa/questions', (req, res) => {
  let body = req.body.body;
  let name = req.body.name;
  let email = req.body.email;
  let productId = req.body['product_id'].toString();
  indexModel.findOne({type: 'question'})
    .then((data) => {
      let questionId = data.index;
      new qaModel({
        id: questionId.toString(),
        'product_id': productId,
        body,
        'date_written': new Date().getTime(),
        'asker_name': name,
        'asker_email': email,
        reported: '0',
        helpful: '0',
        answers: []
      }).save()
        .then(() => {
          indexModel.updateOne({type: 'question'}, {'$inc': {'index': 1}}, (err, data) => {
            if (err) {
              res.sendStatus(500, err);
            } else {

              res.send()
            }
          })
        })
        .catch((err) => {
          res.sendStatus(500, err);
        });
    })
});

app.post('/qa/questions/:questionId/answers', (req, res) => {
  let answerId;
  let body = req.body.body;
  let name = req.body.name;
  let email = req.body.email;
  let questionId = req.params.questionId.toString();
  indexModel.findOne({'type': 'answer'})
    .then((data) => {
      answerId = data.index;
      qaModel.updateOne({'id': questionId}, {'$push': {answers: {
        id: answerId.toString(),
        'question_id': questionId,
        body,
        'date_written': new Date().getTime(),
        'answerer_name': name,
        'answerer_email': email,
        reported: '0',
        helpful: '0',
        photos: []
      }}}, (err, data) => {
        if (err) {
          res.sendStatus(500, err);
        } else {
          indexModel.updateOne({type: 'answer'}, {'$inc': {'index': 1}}, (err, data) => {
            if (err) {
              res.sendStatus(500, err);
            } else {
              res.send();
            }
          })
        }
      })
    })
    .catch((err) => {
      res.sendStatus(500, err);
    });
  });

app.put('/qa/questions/:questionId/helpful', (req, res) => {
  let questionId = req.params.questionId.toString();
  qaModel.findOne({id: questionId})
    .then((question) => {
      let newHelpful = Number(question.helpful) + 1;
      qaModel.updateOne({id: questionId}, {helpful: newHelpful.toString()}, (err, data) => {
        if (err) {
          res.sendStatus(500, err);
        } else {
          res.send()
        }
      })
    })
    .catch((err) => {
      res.sendStatus(500, err);
    })
});

app.put('/qa/questions/:questionId/report', (req, res) => {
  let questionId = req.params.questionId.toString();
  qaModel.updateOne({id: questionId}, {reported: '1'}, (err) => {
    if (err) {
      res.sendStatus(500, err);
    } else {
      res.send();
    }
  })
});

app.put('/qa/answers/:answerId/helpful', (req, res) => {
  let answerId = req.params.answerId.toString();
  qaModel.findOne({'answers.id': answerId})
    .then((question) => {
      let newHelpful = 0;
      question.answers.forEach((answer) => {
        if (answer.id === answerId) {
          newHelpful = Number(answer.helpful) + 1
        }
      })
      qaModel.updateOne({'answers.id': answerId}, {'$set': {'answers.$.helpful': newHelpful}})
        .then(() => {
          res.send('success')
        })
        .catch((err) => {
          res.sendStatus(500, err);
        });
    })
    .catch((err) => {
      res.sendStatus(500, err);
    });
});

app.put('/qa/answers/:answerId/report', (req, res) => {
  let answerId = req.params.answerId.toString();
  qaModel.updateOne({'answers.id': answerId}, {'$set': {'answers.$.reported': '1'}})
    .then(() => {
      res.send('success');
    })
    .catch((err) => {
      res.sendStatus(500, err);
    });
});

app.listen(3000, (err) => {
  if (err) {
    console.log(err)
  } else {
    console.log('db server connected to port 3000');
  }
})