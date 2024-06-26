const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const requestLogger = (request, response, next) => {
    logger.info('Method:', request.method)
    logger.info('Path:  ', request.path)
    logger.info('Body:  ', request.body)
    logger.info('---')
    next()
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
    logger.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: 'Validation error' })
    } else if (error.name === 'JsonWebTokenError') {
        return response.status(400).json({ error: 'token missing or invalid' })
    } else if (error.name === 'TokenExpiredError') {
        return response.status(401).json({
            error: 'token expired'
        })
    }

    next(error)
}

const tokenExtractor = (request, response, next) => {
    if (request.method !== 'GET') {
        const authorization = request.headers.authorization

        if (authorization && authorization.startsWith('Bearer ')) {
            const token = authorization.replace('Bearer ', '')
            request.token = token
        }
    }
    next()
}

const userExtractor = async (req, res, next) => {
    if (req.method !== 'GET') {
        const token = req.token

        if (!token) {
            return res.status(401).json({ error: 'token missing' })
        }

        try {
            const decodedToken = jwt.verify(token, process.env.SECRET)
            if (!decodedToken.id) {
                return res.status(401).json({ error: 'token invalid' })
            }

            req.user = await User.findById(decodedToken.id)
            next()
        } catch (error) {
            return res.status(401).json({ error: 'token invalid' })
        }
    } else {
        next()
    }
}


module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
    tokenExtractor,
    userExtractor
}
