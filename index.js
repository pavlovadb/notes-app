require("dotenv").config();
const express = require("express");
const app = express();
const Note = require("./models/note");
const { Client } = require('pg');

const client = new Client({
            user: 'postgres',
            host: 'localhost',
            database: 'sm_app',
            password: `{$POSTGRES_PWD}`,
            port: 5432,
        });

let notes = [
  {
    id: "1",
    content: "HTML is POOP",
    important: true,
  },
  {
    id: "2",
    content: "Browser can execute only JavaScript",
    important: false,
  },
  {
    id: "3",
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true,
  },
];

const generateId = () => {
  return notes.length + 1;
};

app.use(express.static("dist"));

app.use(express.json());

app.get("/api/users", async (request, response) => {
  await client.connect()
  let users; 

  try {
    const result = await client.query("SELECT users from users");
    users = result.rows;
  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    client.end()
  }
  response.json(users);
})

app.get("/api/notes", async (request, response) => {
  const notes = await Note.find({});
  response.json(notes);
});

app.get("/api/notes/:id", async (request, response) => {
  const note = await Note.findById(request.params.id);
  response.json(note);

  // const id = request.params.id;
  // const note = notes.find((note) => note.id == id);

  // if (note) {
  //   response.json(note);
  // } else {
  //   response.status(404).end();
  // }
});

app.delete("/api/notes/:id", async (request, response) => {
  const id = request.params.id;
  await Note.deleteOne({ _id: id });
  // notes = notes.filter((note) => note.id !== id);

  response.status(204).end();
});

app.put("/api/notes/:id", async (request, response) => {
  const { content, important } = request.body;
  const note = await Note.findById(request.params.id);

  if (!note) {
    return response.status(404).end();
  }

  note.content = content;
  note.important = important;

  const updatedNote = await note.save();
  response.json(updatedNote);
});

app.post("/api/notes", async (request, response) => {
  const body = request.body;

  if (!body.content) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
  });

  const savedNote = await note.save();
  response.json(savedNote);
  // note.save().then(savedNote => {
  //   response.json(savedNote)
  // })
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});