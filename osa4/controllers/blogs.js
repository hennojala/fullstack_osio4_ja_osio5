const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
// const User = require('../models/user')
const { userExtractor } = require('../utils/middleware')

// Get all blogs
blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user')
    response.json(blogs)
})

// Get one blog by ID
blogsRouter.get('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    if (blog) {
        response.json(blog)
    } else {
        response.status(404).end()
    }
})

//Create new blog, use userExtractor
blogsRouter.post('/', userExtractor, async (request, response) => {
    const body = request.body
    const user = request.user

    if (!user) {
        return response.status(401).json({ error: 'User unauthorized to create a blog' })
    }

    if (!body.author || !body.url)
    {
        return response.status(400).json({ error: 'No url or author added' })
    }

    if(!body.likes)
    {
        body.likes = 0
    }

    const blog = new Blog({
        ...body,
        user: body.userId || user.userId
    })

    if (blog && blog.user.toString() === user.id.toString()) {
        const savedBlog = await blog.save()
        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()
        return response.status(201).json(savedBlog)
    }

    return response.status(401).json({ error: 'User unauthorized to create blog' })
})


//Delete blog by ID
blogsRouter.delete('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    const user = request.user

    if (!user || blog.user.toString() !== user.id.toString()) {
        return response.status(401).json({ error: 'token invalid' })
    }

    user.blogs = user.blogs.filter(b => b.toString() !== blog.id.toString())
 
    await user.save()
    blog.deleteOne()
    response.status(204).end()
})

//update blog by id
blogsRouter.put('/:id', async (request, response) => {
    try {
        const token = request.token
        const body = request.body

        if (!token) {
            return response.status(401).json({ error: 'Token missing or invalid' })
        }

        const decodedToken = jwt.verify(token, process.env.SECRET)
        if (!decodedToken.id) {
            return response.status(401).json({ error: 'Token invalid' })
        }

        if (!body) {
            return response.status(400).json({ error: 'Request body is missing or empty' })
        }

        const updatedBlog = await Blog.findByIdAndUpdate(
            request.params.id,
            {
                title: body.title,
                author: body.author,
                url: body.url,
                likes: body.likes,
                userId: body.user.id
            },
            { new: true }
        )

        if (!updatedBlog) {
            return response.status(404).json({ error: 'Blog not found' })
        }

        response.status(200).json(updatedBlog)
    } catch (error) {
        console.error('Error during blog update:', error)
        return response.status(500).json({ error: 'Internal server error' })
    }
})


module.exports = blogsRouter