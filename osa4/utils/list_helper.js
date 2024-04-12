const User = require('../models/user')

const dummy = () => {
    return 1
}

//Laskee kaikkien tykkäysten määrän yhteen
const totalLikes = (likes) => {
    const sum = likes.reduce((ac, cu) => ac + cu.likes, 0)
    return sum
}

const favoriteBlogs = (blogs) => {
    // Alusta likesBlogi-objekti tyhjällä arvolla
    let likesBlogi = { title: '', author: '', likes: 0 }

    // Käytä reducea etsimään eniten tykkäyksiä
    blogs.reduce((ac, va) => {
        if (va.likes > likesBlogi.likes) {
            likesBlogi = va
        }
        return likesBlogi
    }, likesBlogi)

    // Palauta blogin jossa eniten tykkäyksiä
    return {
        title: likesBlogi.title,
        author: likesBlogi.author,
        likes: likesBlogi.likes
    }
}

const _ = require('lodash')

const mostBlogs = (blogs) => {
    // Ryhmittele blogit kirjoittajan perusteella
    const groupedBlogs = _.groupBy(blogs, 'author')

    // Etsi kirjoittaja, jolla eniten blogeja
    const mostBlogsAuthor = _.maxBy(Object.keys(groupedBlogs), (author) => groupedBlogs[author].length)

    // Palauta tulos objektina
    return {
        author: mostBlogsAuthor,
        blogs: groupedBlogs[mostBlogsAuthor].length,
    }
}

//Eniten tykkäyksiä authorin blogeilla
const mostLikes = (blogs) => {
    // Ryhmittele blogit kirjoittajan perusteella
    const groupedBlogs = _.groupBy(blogs, 'author')

    // Etsi kirjoittaja, jonka blogeilla on eniten tykkäyksiä
    const mostLikesAuthor = _.maxBy(Object.keys(groupedBlogs), (author) => {
        return _.sumBy(groupedBlogs[author], 'likes')
    })

    // Laske suosikkibloggaajan likejen yhteenlaskettu määrä
    const totalLikes = _.sumBy(groupedBlogs[mostLikesAuthor], 'likes')

    // Palauta tulos objektina
    return {
        author: mostLikesAuthor,
        likes: totalLikes,
    }
}

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlogs,
    mostBlogs,
    mostLikes,
    usersInDb
}