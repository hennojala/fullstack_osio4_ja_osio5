const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
require('../models/blog')
const api = supertest(app)

describe('Blogs API', () => {
    let initialBlogs
    let token

    beforeAll(async () => {
        // Get initial blogs
        initialBlogs = await api.get('/api/blogs')

        // Log in to get the token
        const userCredentials = {
            username: 'Aku',
            password: 'ankka',
        }

        const loginResponse = await api
            .post('/api/login')
            .send(userCredentials)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        token = loginResponse.body.token
    })

    describe('GET /api/blogs', () => {
        test('returns blogs as json', async () => {
            await api.get('/api/blogs').expect(200).expect('Content-Type', /application\/json/)
        })

        test('blogs _id to be id', async () => {
            const response = await api.get('/api/blogs')
            const blogs = response.body

            expect(response.status).toBe(200)
            expect(response.headers['content-type']).toMatch(/application\/json/)

            blogs.forEach(blog => {
                expect(blog.id).toBeDefined()
            })
        })
    })

    describe('POST /api/blogs', () => {
        test('adding a new blog and then check count of the blogs', async () => {
            
            const res = await api.get('/api/users')
            const users = res.body

            const user = users.find((us) => us.username === 'Aku')

            const newBlog = {
                title: 'UusiTestiBlogi3',
                author: 'Aku',
                url: 'www.rplaaplaaaa.com/',
                likes: 15,
                userId: user.id
            }
            
            await api
                .post('/api/blogs')
                .set({ 'Authorization': `Bearer ${token}` })
                .send(newBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const response = await api.get('/api/blogs')
            const blogs = response.body

            expect(blogs).toHaveLength(initialBlogs.body.length + 1)
            const titles = blogs.map(blog => blog.title)
            expect(titles).toContain('UusiTestiBlogi3')

        })

        test('try adding a new blog with token fails', async () => {

            const res = await api.get('/api/users')
            const users = res.body

            const user = users.find((us) => us.username === 'Aku')

            const newBlog = {
                title: 'UusiTestiBlogi',
                author: 'Eva MacDonal',
                url: 'www.rplaaplaaaa.com/',
                likes: 15,
                userId: user.id
            }

            // Try to add blog without token
            await api
                .post('/api/blogs')
                .set('Authorization', 'Bearer notright')
                .send(newBlog)
                .expect(401)
                .expect('Content-Type', /application\/json/)
        })

        test('added the blog without likes', async () => {

            const res = await api.get('/api/users')
            const users = res.body

            const user = users.find((us) => us.username === 'Aku')

            const newBlog = {
                title: 'Testitykkayksista',
                author: 'Tykkaystesti',
                url: 'www.tykkaykset....',
                userId: user.id
            }

            
            const result = await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/)
            console.log(result.body)
            expect(result.body.likes).toBe(0)

            //delete created blog
            const re = await api.get('/api/blogs')
            const tblogs = re.body
            
            const blog = tblogs.find((b) => b.title === 'Testitykkayksista')

            await api.delete(`/api/blogs/${blog.id}`).set('Authorization', `Bearer ${token}`)

        })

        test('adding a new blog without title and url', async () => {
            const newBlog = {
                author: 'Evan MacDonals',
                likes: 18,
            }

            // Lisää blogi oikealla tokenilla
            await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newBlog)
                .expect(400)
        })
    })

    describe('DELETE /api/blogs/:id', () => {

        
        test('delete blog', async () => {

            const re = await api.get('/api/blogs')
            const tblogs = re.body
            
            const blog = tblogs.find((b) => b.title === 'UusiTestiBlogi3')

            await api.delete(`/api/blogs/${blog.id}`).set('Authorization', `Bearer ${token}`)

            const response = await api.get('/api/blogs')
            const blogs = response.body

            expect(blogs).toHaveLength(tblogs.length - 1)
            const blogIds = blogs.map(blog => blog.id)
            expect(blogIds).not.toContain(blog.id)
        })
    })

    describe('PUT /api/blogs/:id', () => {
        test('update blog', async () => {
            const initialBlogs = await api.get('/api/blogs')
            const blogToUpdate = initialBlogs.body[0]

            const updatedLikes = {
                likes: blogToUpdate.likes + 1,
            }

            await api
                .put(`/api/blogs/${blogToUpdate.id}`)
                .set({ 'Authorization': `Bearer ${token}` })
                .send(updatedLikes)
                .expect(200)
                .expect('Content-Type', /application\/json/)

            const updatedBlog = await api.get(`/api/blogs/${blogToUpdate.id}`)
            expect(updatedBlog.body.likes).toEqual(updatedLikes.likes)
        })
    })
})

describe('User tests', () => {

    test('invalid user is not created', async () => {
        const invalidUser = {
            username: 'ab',
            password: '12',
        }

        await api
            .post('/api/users')
            .send(invalidUser)
            .expect(400)
    })

    test('non-unique username is not allowed', async () => {
        const existingUser = {
            username: 'Aku',
            user: 'Aku Ankka',
            password: 'testpassword',
        }
        await api
            .post('/api/users')
            .send(existingUser)
            .expect(400)
    })

    test('valid user is created', async () => {
        let validUser = {
            username: 'newuser4',
            name: 'newuser44',
            password: 'newpassword4',
        }

        await api
            .post('/api/users')
            .send(validUser)
            .expect(201)
    })

    test('delete valid user', async () => {
        const initialUsers = await api.get('/api/users')
        const userToDelete = initialUsers.body[initialUsers.body.length - 1]
    
        await api.delete(`/api/users/${userToDelete.id}`).expect(204)
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})