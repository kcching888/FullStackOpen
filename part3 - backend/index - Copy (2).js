
require('dotenv').config()
const http = require('http')
const express = require('express')
const app = express()
app.use(express.json())

const morgan = require('morgan')
morgan.token('body', req => { return JSON.stringify(req.body)})
app.use(morgan(':method :url :status :response-time :body'))

const Person = require('./models/person')
const PORT = process.env.PORT
app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`)
})

//const backend = 'JSON'
const backend = 'Mongo'

let persons = []
// initialization of values in JSON backend
if (backend === 'JSON') {
  console.log('init persons')
  persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
  ]
}


// retrive all contacts from phonebook - JSON backend
if (backend === 'JSON') {
  app.get('/api/persons', (request, response) => {
    response.json(persons)
  }) 
}
 // retrive all contacts from phonebook - Mongo DB
 if (backend === 'Mongo') {
   app.get('/api/persons', (request, response) => {
    // response.json(persons)
      Person.find({}).then(result => {
         console.log(result)
         response.json(result)
    })
  }) 
 }
  
  // retrive a specific contact from phonebook - JSON backend
  if (backend === 'JSON') {
    app.get('/api/persons/:id', (request, response) => {
      const id = request.params.id
      const person = persons.find(person => person.id === id)
      if (person) {
        response.json(person)
      }
      else {
        response.status(404).end()
      }
    })
  }
  

   // retrive a specific contact from phonebook - Mongo DB
  if (backend === 'Mongo') {
     app.get('/api/persons/:id', (request, response) => {
     const id = request.params.id
     Person.findById(id).then(person => {
       console.log(person)
       if (person) {
         response.json(person)
       }
       else {
        response.status(404).end()
       }
     })
     .catch(error => {
       console.log(error)
       response.status(400).send({error: 'malformatted id'})
     })
    })
  }

  // delete a specific contact from phonebook - JSON backend
  if (backend === 'JSON') {
    app.delete('/api/persons/:id', (request, response) => {
      const id = request.params.id
      persons = persons.filter(person => person.id !== id)
      response.status(204).end()
    })
  }

   // delete a specific contact from phonebook - Mongo DB
  if (backend === 'Mongo') {
    app.delete('/api/persons/:id', (request, response, next) => {
      Person.findByIdAndDelete(request.params.id)
        .then(result => {
          response.status(204).end()
        })
        .catch(error => next(error))
    })
  }
  // post a new contact entry into phonebook - JSON backend
  if (backend === 'JSON') {
    app.post('/api/persons', (request, response) => {
   
      const body = request.body

      if (!body.name) {
        return response.status(400).json({
          error: 'name missing'
        })
      }
 
      if (!body.number) {
        return response.status(400).json({
          error: 'number missing'
        })
      }

      const existPerson = persons.find(person => person.name === body.name)
      if (existPerson) {
        return response.status(400).json({
          error: 'name must be unique'
        })
      }
 
      // obj 'person' is created and saved to non-db backend (json)
      const person = request.body
      const randomID = Math.floor(Math.random() * 99999999)
      person.id = String(randomID)
      persons = persons.concat(person)
      response.json(person)
    })
  }

 // post a new contact entry into phonebook - Mongo DB
 if (backend === 'Mongo') {
   app.post('/api/persons', (request, response) => {
    const body = request.body

    if (body.name === undefined) {
      return response.status(400).json({ error: 'name missing' })
    }

    if (body.number === undefined) {
      return response.status(400).json({ error: 'number missing' })
    }
    const person = new Person({
      name: body.name,
      number: body.number,
    })

    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
  })
 }

 // post a updated contact entry into phonebook - Mongo DB
 if (backend === 'Mongo') {
    app.put('/api/persons/:id', (request, response, next) => {
      const body = request.body
  
      const person = {
        name: body.name,
        number: body.number,
      }
  
      Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => {
          response.json(updatedPerson)
        })
        .catch(error => next(error))
    })
  }

  
  // get current timestamp 
  const timeStamp = Date.now()
  const d = Date(parseInt(timeStamp, 10))
  const ds = d.toString('MM/dd/yy HH:mm:ss')
 
  // show total no. of contact - JSON backend
  if (backend === 'JSON') {
    app.get('/info', (request, response) => {
      response.send(`<p> Phonebook has info for ${persons.length} people </p> 
                   <p> ${ds} </p>`)
    })
  }

// show total no. of contact - Mongo DB
if (backend === 'Mongo') {
  app.get('/info', (request, response) => {
    Person.estimatedDocumentCount().then((count) => {
      console.log('count: ', count)
      response.send(`<p> Phonebook has info for ${count} people </p> 
                   <p> ${ds} </p>`)
    })
  })
}


 // app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)