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
app.use (express.json ()); 
app.use (express.urlencoded ({ extended: false })); 
app.use (cookieParser ()); 
app.use (express.static (path.join (__dirname, 'public')));

app.use ('/', routes);
app.use ('/books', books);

// If a user navigates to a non-existent route, or if a request fails for whatever reason
app.use ((req, res, next) => {
    const err = new Error ('Not Found'); 
    err.status = 404;
    next (err); 
}); 

// Error handler that sets the error message and status code
app.use ((err, req, res, next) => {
    res.status (err.status || 500); 
    res.render ('error', { error: err });  
});

sequelize.sync ()
    .then ( async () => {
        // Returns a promise that resolves to a successful, authenticated connection to the database
        await sequelize.authenticate ();
        console.log ('Connection to the database is successful!');
    })
    .then (() => {
        // Start a server 
        app.listen (3000, () => {
            console.log ('The application is running on localhost:3000'); 
        });
});
