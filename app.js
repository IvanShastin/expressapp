'use strict';

const express = require('express');

const handlebars = require('express-handlebars').create({ defaultLayout: 'main'});

const app = express();

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

app.get('/', (request, response) => {
    response.render('home');
});

app.get('/about', (request, response) => {
    response.render('about');
});

app.use((request, response) => {
    response.status(404);
    response.render('404');
});

app.use((error, request, response, next) => {
    if(error)console.error(error); 
    response.status(500);
    response.render('500');
});

app.listen(app.get('port'), () => {
    console.log('Express started on http://localhost:' + app.get('port'));
});