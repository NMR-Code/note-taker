// Dependencies
const express = require("express");
const fs = require("fs");
const path = require("path");

// Package to create unique ids for the note objects.
// =============================================================
const { v4: uuidv4 } = require('uuid');

// Sets up the Express App
// =============================================================
const app = express();
const PORT = process.env.PORT || 3000;

// Sets up the Express app to handle data parsing
//==============================================================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

//Class for notes
//==============================================================
class Note {
    constructor(title, text) {
        this.title = title;
        this.text = text;
        //Adds an unique id for the note object--Example: "3f9e5bcs-bv4e-4a8d-8k5c-bb86fdbd4brz".
        this.id = uuidv4();
    }
}

// Routes
// =============================================================

// Basic route that sends the user to the index page
app.get("/", function(req, res) {
    fs.readFile(path.join(__dirname, "public/index.html"));
});

//Sends the notes.html file when the user hits the "/notes" path.
app.get("/notes", function(req, res) {
    res.sendFile(`${__dirname}/public/notes.html`);
});

//Sends the information in the db.json file.
app.get("/api/notes", function(req, res) {
    fs.readFile(`${__dirname}/db/db.json`, function(err, data) {
        if (err) {
            throw err;
        } else {
            res.send(data);
        }
    });
});

// Takes a JSON input with keys "title" and "text" and adds a new note object with that message to the db.json file
app.post("/notes", function(req, res) {
    fs.readFile(path.join(__dirname, "/db/db.json"), "utf8", function(error, response) {
        if (error) {
            console.log(error);
        }
        const notes = JSON.parse(response);
        const noteRequest = req.body;
        const newNoteId = notes.length + 1;
        const newNote = {
            id: newNoteId,
            title: noteRequest.title,
            text: noteRequest.text
        };
        notes.push(newNote);
        res.json(newNote);
        fs.writeFile(path.join(__dirname, "/db/db.json"), JSON.stringify(notes, null, 2), function(err) {
            if (err) throw err;
        });
    });
});

// Deletes the note object with requested id from the db.json file, returns the deleted note; if no such id exists returns false
app.delete("/api/notes/:id", function(req, res) {
    const id = req.params.id;
    fs.readFile(`${__dirname}/db/db.json`, 'utf8', function(err, data) {
        if (err) {
            throw err;
        } else {
            console.log(data);
            const db = [];
            JSON.parse(data).forEach((item, i) => {
                db.push(item);
            });
            db.forEach((item, i) => {
                if (item.id === id) {
                    db.splice(i, 1);
                }
            });
            fs.writeFile(`${__dirname}/db/db.json`, JSON.stringify(db), function(err) {
                if (err) {
                    throw err;
                } else {
                    console.log("Note added to data base");
                }
            });
            res.redirect("/api/notes");
        }
    });
});

// Starts the server to begin listening
// =============================================================
app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
});