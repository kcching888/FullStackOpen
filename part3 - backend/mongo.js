const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
//  `mongodb+srv://fullstack:${password}@cluster0.o1opl.mongodb.net/?retryWrites=true&w=majority`
  `mongodb+srv://kcching888:${password}@cluster0.tsvs8y5.mongodb.net/mongo?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length == 5) {
  console.log('5 argv input')

  const newName = process.argv[3]
  const newNumber = process.argv[4]
  console.log( 'name: ', newName, ' number: ', newNumber)

  const person = new Person({
    name: newName,
    number: newNumber,
  })

  person.save().then(result => {
    console.log('person saved!')
    mongoose.connection.close()
  })
}

if (process.argv.length == 3) {
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person.name, " ", person.number)
    })
    mongoose.connection.close()
   })
}