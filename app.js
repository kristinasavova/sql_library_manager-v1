const express = require ('express'); 
const path = require ('path'); // provides a way of working with directories and file paths 

const routes = require ('./routes/index'); 
const books = require ('./routes/books');  

const app = express (); 

// View engine setup
app.set ('views', path.join (__dirname, 'views')); // join the specified path segments into one path 
app.set ('view engine', 'pug'); 

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
    // Set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get ('env') === 'development' ? err : {};

    // Render the error page
    res.status (err.status || 500);
    res.render ('error');  
});

module.exports = app; 
