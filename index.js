const express = require('express');

const app = express();

app.set('port', process.env.PORT || 8080);
app.get('/api', require('./controllers/api').get);
app.listen(app.get('port'));

module.exports = app;