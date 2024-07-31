require('dotenv').config()
const http = require('http')
const express = require('express')
const app = express()
app.use(express.json())

const Person = require('./models/person')
const PORT = process.env.PORT
app.listen(PORT, () => {
     console.log(`Server running on port ${PORT}`)
})

const morgan = require('morgan')
morgan.token('body', req => { return JSON.stringify(req.body)})
app.use(morgan(':method :url :status :response-time :body'))

let persons = [
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
// const app = http.createServer((request, response) => {
//  response.writeHead(200, { 'Content-Type': 'application/json' })
//  response.end(JSON.stringify(notes))
// })

//  const requestLogger = (request, response, next) => {
//    console.log(request.method, ' ', request.path, ' ', response.status, ' ', request.body)
//    next()
//  }

//  app.use(requestLogger)

//  const unknownEndpoint = (request, response) => {
//    response.status(404).send({ error: 'unknown endpoint' })
//  }


  // retrive all contacts from phonebook
  app.get('/api/persons', (request, response) => {
    response.json(persons)
  })

  // retrive a specific contact from phonebook
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

  // delete a specific contact from phonebook
  app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
  })

  // post a new contact entry into phonebook
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
 
    const person = request.body
    const randomID = Math.floor(Math.random() * 99999999)
    person.id = String(randomID)
    persons = persons.concat(person)
    response.json(person)

  })


  // show total no. of contact and current timestamp
  const timeStamp = Date.now()
  const d = Date(parseInt(timeStamp, 10))
  const ds = d.toString('MM/dd/yy HH:mm:ss')
 
  app.get('/info', (request, response) => {
    response.send(`<p> Phonebook has info for ${persons.length} people </p> 
                   <p> ${ds} </p>`)
  })

 // app.use(unknownEndpoint)

const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)