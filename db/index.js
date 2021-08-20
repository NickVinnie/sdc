const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/sdc');

mongoose.connection.on('open', () => {
  console.log('connected to sdc database');
})

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

// new indexModel({type: 'answer', index: 6879307}).save()
//       .then()
//       .catch(console.log);

// new indexModel({type:'question', index: 3518964}).save()
//       .then()
//       .catch(console.log);

//6879306 current answer index

module.exports.getQuestions = (productId) => {
  return new Promise((resolve, reject) => {
    qaModel.find({product_id: productId})
      .then(resolve)
      .catch(reject);
  })
};

module.exports.getAnswers = (questionId) => {
  return new Promise((resolve, reject) => {
    qaModel.findOne({id: questionId})
      .then((question) => resolve(question.answers))
      .catch(reject);
  })
}

module.exports.saveQuestion = (body, name, email, productId) => {
  return new Promise((resolve, reject) => {
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
            indexModel.updateOne({type: 'answer'}, {'$inc': {'index': 1}}, (err, data) => {
              if (err) {
                reject(err);
              } else {
                resolve()
              }
            })
          })
          .catch(reject);
      })
  });
}

module.exports.saveAnswer = (body, name, email, questionId) => {
  return new Promise((resolve, reject) => {
    let answerId;
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
            reject(err);
          } else {
            indexModel.updateOne({type: 'answer'}, {'$inc': {'index': 1}}, (err, data) => {
              if (err) {
                reject(err);
              } else {
                resolve()
              }
            })
          }
        })
      })
      .catch(reject);
  });
}

module.exports.helpfulQuestion = (questionId) => {
  return new Promise((resolve, reject) => {
    qaModel.findOne({id: questionId})
      .then((question) => {
        let newHelpful = Number(question.helpful) + 1;
        console.log(newHelpful);
        qaModel.updateOne({id: questionId}, {helpful: newHelpful.toString()}, (err, data) => {
          if (err) {
            reject(err)
          } else {
            resolve();
          }
        })
      })
      .catch(reject)
  })
}

module.exports.reportQuestion = (questionId) => {
  return new Promise((resolve, reject) => {
    qaModel.updateOne({id: questionId}, {reported: '1'}, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve();
      }
    })
  })
}

module.exports.helpfulAnswer = (answerId) => {
  return new Promise ((resolve, reject) => {
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
            resolve('success')
          })
          .catch(reject);
      })
      .catch(reject);
  })
}

module.exports.reportAnswer = (answerId) => {
  return new Promise((resolve, reject) => {
    qaModel.updateOne({'answers.id': answerId}, {'$set': {'answers.$.reported': '1'}})
      .then(resolve)
      .catch(reject);
  })
}