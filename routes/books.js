'use strict';

const express = require ('express'); 
const router = express.Router ();
const { Book } = require ('../models'); // require book model from models 
const { Op } = require ('sequelize'); // extract the property Op (Operators)   

// A middleware to wrap each of the route in a try-catch block, so we don't have to explicitly write it over and over again 
function asyncHandler (cb) {
    // Return async func that will serve as our route handlers callback
    return async (req, res, next) => {
        try {
            // await whatever func we've passed to the asyncHandler with normal route handling params
            cb (req, res, next); 
        } catch (error) {
            console.log ('Something is wrong with the routes', error); 
            next (error);  
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
router.post ('/', asyncHandler ( async (req, res) => {
    let book; 
    try {
        // Req.body is an object with the same properties as Book { title: '', ... }
        book = await Book.create (req.body);
        // Sequelize generates an auto-incrementing id for each model instance
        res.redirect ('/books');    
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            // Build returns an unsaved model instance, which will get stored by the create method once the user submits the form with a valid values
            book = await Book.build (req.body);  
            res.render ('books/new', { book, errors: error.errors, title: 'New Book' }); 
        } else {
            throw error; // error caught in the asyncHandler's catch block 
        }
    }
})); 

// GET individual book detail form
router.get ('/:id', asyncHandler (async (req, res, next) => {
    // Req.params returns parameters in the matched route
    const book = await Book.findByPk (req.params.id);
    if (book) { // if the book exists 
        res.render ('books/show', { book, title: book.title });
    } else { // if book doesn't exist, use error handler
        const err = new Error ();
        err.status = 400;
        next (err); 
    }
}));

// GET update book form
router.get ('/:id/edit', asyncHandler (async (req, res) => {
    const book = await Book.findByPk (req.params.id); 
    if (book) {
        res.render ('books/edit', { book, title: 'Edit Book' }); 
    } else {
        const err = new Error ();
        err.status = 400;
        next (err);  
    }
}));

// POST update book form 
router.post ('/:id/edit', asyncHandler (async (req, res) => {
    let book;
    try {
        book = await Book.findByPk (req.params.id); 
        if (book) {
            await book.update (req.body); 
            res.redirect ('/books'); 
        } else {
            const err = new Error ();
            err.status = 400;
            next (err);  
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
        const err = new Error ();
        err.status = 400;
        next (err); 
    }
}));

// POST delete book form
router.post ('/:id/delete', asyncHandler (async (req, res) => {
    const book = await Book.findByPk (req.params.id); 
    if (book) {
        await book.destroy (); 
        res.redirect ('/'); 
    } else {
        const err = new Error ();
        err.status = 400;
        next (err);  
    }
}));

// GET search for a book
router.get ('/search/', asyncHandler (async (req, res, next) => {
    const value = req.query.query; // the name of the search input is query 
    console.log (value); 
    const books = await Book.findAll ({ 
        where: { 
            title: { 
                [Op.like]: '%' + value + '%' 
            },
        //     author: {
        //         [Op.like]: '%' + value + '%' 
        //     },
        //     genre: {
        //         [Op.like]: '%' + value + '%'
        //     },
        //     year: {
        //         [Op.like]: '%' + value + '%'
        //     }
        // },
        // // order books in the array
        // order: [['title', 'DESC']] // titles in descending order 
    }});
    res.render ('books/index', { books, title: 'Results' });
})); 

module.exports = router; 