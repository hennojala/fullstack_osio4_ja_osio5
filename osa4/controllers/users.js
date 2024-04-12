const bcrypt = require('bcryptjs')
const usersRouter = require('express').Router()
const User = require('../models/user')
// const Blog = require('../models/blog')

//Get all users
usersRouter.get('/', async (request, response) => {
    const users = await User
        .find({}).populate('blogs')
    response.json(users)
})

//Create user
usersRouter.post('/', async (request, response) => {
    const { username, name, password } = request.body

    //Check password and username length
    if (!username || !password || username.length < 3 || password.length < 3) {
        return response.status(400).json({ error: 'Invalid username or password. Both must be at least 3 characters long.' })
    }

    // Check unique username
    const existingUser = await User.findOne({ username })
    if (existingUser) {
        return response.status(400).json({ error: 'Username must be unique.' })
    }
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        name,
        passwordHash,
    })

    try {
        const savedUser = await user.save()
        response.status(201).json(savedUser)
    } catch (error) {
        response.status(500).json({ error: 'Something went wrong.' })
    }
})

//Get user by id
usersRouter.get('/:id', async (request, response) => {
    const user = await User.findById(request.params.id)
    if (user) {
        response.json(user)
    } else {
        response.status(404).end()
    }
})


//Get user by username
usersRouter.get('/:username', async (request, response) => {
    const user = await User.findById(request.params.username)
    if (user) {
        response.json(user)
    } else {
        response.status(404).end()
    }
})

//delete user
usersRouter.delete('/:id', async (request, response) => {
    try {
        const user = await User.findById(request.params.id)
        if (!user) {
            return response.status(404).end()
        }

        console.log('Deleting user:', user)
        await User.findByIdAndRemove(request.params.id)
        console.log('User deleted successfully')
        return response.status(204).end()
    } catch (error) {
        console.error('Error during user deletion:', error)
        return response.status(500).json({ error: 'internal server error' })
    }
})

module.exports = usersRouter