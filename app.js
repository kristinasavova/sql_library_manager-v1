const express = require ('express'); 
const cookieParser = require ('cookie-parser'); // parse cookie header  
const logger = require ('morgan'); // easily log requests, errors, and more to the console 
const path = require ('path'); // provides a way of working with directories and file paths 
const sequelize = require ('./models').sequelize; // import Sequelize

const routes = require ('./routes/index'); 
const books = require ('./routes/books');  

const app = express (); 

// View engine setup
app.set ('views', path.join (__dirname, 'views')); // join the specified path segments into one path 
app.set ('view engine', 'pug'); 

app.use (logger ('dev')); 
// Returns middleware that only parses JSON and only looks at requests where the Content-Type header matches the type option
app.use (express.json ()); 
app.use (express.urlencoded ({ extended: false })); 
app.use (cookieParser ()); 
app.use (express.static (path.join (__dirname, 'public')));

app.use ('/', routes);
app.use ('/books', books);

// If a user navigates to a non-existent route
app.use ((req, res, next) => { 
    const err = new Error ();
    err.status = 404;
    console.log ('Page not found!', err);
    next (err);
}); 

// Error handler that sets the error message and status code
app.use ((err, req, res, next) => {
    res.status (err.status || 500); 
    console.log ('Global error handler has been called!', err);
    res.render ('error', { error: err, title: 'Not Found' });  
});

sequelize.sync ()
    .then ( async () => {
        // Returns a promise that resolves to a successful, authenticated connection to the database
        await sequelize.authenticate ();
        console.log ('Connection to the database is successful!');
    })
    .then (() => {
        // Start a server 
        let port = process.env.PORT;
        if (port == null || port == '') {
            port = 3000; 
        }
        app.listen (port, () => {
            console.log (`The application is running on localhost:${port}`); 
        });
});
