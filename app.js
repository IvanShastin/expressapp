'use strict';

const express = require('express');

const app = express();

app.set('port', process.env.PORT || 3000);

app.get('/', (request, response) => {
    response.type('text/plain');
    response.send('Meadowlark Travel');
});

app.get('/about', (request, response) => {
    response.type('text/plain');
    response.send('About Meadowlark Travel');
});

app.use((request, response) => {
    response.status(404);
    response.type('text/pain');
    response.send('404 - Not found');
});

app.use((error, request, response, next) => {
    if(error)console.error(error); 
    response.status(500);
    response.type('text/pain');
    response.send('500 - Server error');
});

app.listen(app.get('port'), () => {
    console.log('Express started on http://localhost:' + app.get('port'));
});