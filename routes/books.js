'use strict';

const express = require ('express'); 
const router = express.Router ();
const { Book } = require ('../models'); // require book model from models  

// A middleware to wrap each of the route in a try-catch block, so we don't have to explicitly write it over and over again 
function asyncHandler (cb) {
    // Return async func that will serve as our route handlers callback
    return async (req, res, next) => {
        try {
            // await whatever func we've passed to the asyncHandler with normal route handling params
            cb (req, res, next); 
        } catch (error) {
            res.status (500).send (error); // internal server error  
        }
    }; 
}; 

// GET the list of the books
router.get ('/', asyncHandler (async (req, res) => {
    const books = await Book.findAll ();
    res.render ('books/index', { books, title: 'Books' }); 
})); 

// GET create new book form 
router.get ('/new', (req, res) => {
    res.render ('books/new', { book: {}, title: 'New Book' });
}); 

// POST create new book form
router.post ('/new', asyncHandler ( async (req, res) => {
    let book; 
    try {
        // Req.body is an object with the same properties as Book { title: '', ... }
        book = await Book.create (req.body);
        // Sequelize generates an auto-incrementing id for each model instance
        res.redirect ('/books/' + book.id); // get the url of the newly created book   
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            // Build returns an unsaved model instance, which will get stored by the create method once the user submits the form with a valid values
            book = await Book.build (req.body);  
            res.render ('/books/new', { book, errors: error.errors, title: 'New Book' }); 
        } else {
            throw error; // error caught in the asyncHandler's catch block 
        }
    }
})); 

// GET individual book detail form
router.get ('/:id', asyncHandler (async (req, res) => {
    // Req.params returns parameters in the matched route
    const book = await Book.findByPk (req.params.id);
    if (book) { // if the book exists 
        res.render ('books/show', { book, title: book.title });
    } else {
        res.sendStatus (404); // send a 404 status to the client 
    }
}));

// GET update book form
router.get ('/:id/edit', asyncHandler (async (req, res) => {
    const book = await Book.findByPk (req.params.id); 
    if (book) {
        res.render ('books/edit', { book, title: 'Edit Book' }); 
    } else {
        res.sendStatus (404); 
    }
}));

// POST update book form 
router.post ('/:id/edit', asyncHandler (async (req, res) => {
    let book;
    try {
        book = await Book.findByPk (req.params.id); 
        if (book) {
            await book.update (req.body); 
            res.redirect ('/books/'); 
        } else {
            res.sendStatus (404); 
        }
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            book = await Book.build (req.body);
            // Add book ID, since the ID is in the URL as a parameter (:id) and not in req.body!
            book.id === req.params.id; 
            res.render ('books/edit', { book, errors: error.errors, title: 'Edit Book' }); 
        } else {
            throw error;
        }
    }
}));

// GET delete book form
router.get ('/:id/delete', asyncHandler (async (req, res) => {
    const book = await Book.findByPk (req.params.id); 
    if (book) {
        res.render ('books/delete', { book, title: 'Delete Book '});
    } else {
        res.sendStatus (404); 
    }
}));

// POST delete book form
router.post ('/:id/delete', asyncHandler (async (req, res) => {
    const book = await Book.findByPk (req.params.id); 
    if (book) {
        await book.destroy (); 
        res.redirect ('/'); 
    } else {
        res.sendStatus (404); 
    }
}));

module.exports = router; 