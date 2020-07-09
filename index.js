require('dotenv').config()
const mongoose = require('mongoose')

const User = mongoose.model('User',
    new mongoose.Schema({
        name: String,
        username: String,
        email: String,
        photo: String,
        password: String,
        facebookId: String,
        googleId: String,
        twitterId: String,
        githubId: String,
        provider: String,
    })
)

mongoose.connect(
    process.env.MONGO_URI,
    {
        useUnifiedTopology: true,
        useNewUrlParser: true
    }
).then(
    db =>
        console.log(`Connected to database: ${db.connections[0].name}`)
).catch(
    e => console.log(e)
)

const express = require('express')
const app = express()
const path = require('path')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const GoogleStrategy = require('passport-google-oauth2').Strategy
const FaceookStrategy = require('passport-facebook').Strategy
const TwitterStrategy = require('passport-twitter').Strategy
const GithubStrategy = require('passport-github2').Strategy
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
}, async (username, password, done) => {
    console.log(username, password)
    try {
        const user = await User.findOne({ username, password })
        if (user) {
            return done(null, user)
        }
        else
            return done(new Error('Not Found'), false)
    }
    catch (e) {
        console.log('Error finding user')
        console.log(e)
        return done(new Error('Not Connected'), false)
    }
}))

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://127.0.0.1:5000/auth/google/redirect',
    passReqToCallback: true
}, async (request, accessToken, refreshToken, profile, done) => {
    // console.log('request', request, '\n\n')
    // console.log('accessToken', accessToken, '\n\n')
    // console.log('refreshToken', refreshToken, '\n\n')
    // console.log('profile', profile, '\n\n')

    try {
        let user = await User.findOne({ googleId: profile.id })
        if (user) {
            done(null, user)
        }
        else {
            try {
                nUser = new User({
                    name: profile.name.givenName + ' ' + profile.name.familyName,
                    username: profile.email.replace('@gmail.com', ''),
                    email: profile.email,
                    photo: profile.photos[0].value,
                    googleId: profile.id,
                    provider: profile.provider
                })
                user = await nUser.save()
                done(null, user)
            } catch (err) {
                done(err, false)
            }
        }
    } catch (err) {
        done(err, false)
    }
}))

passport.use(new FaceookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/auth/facebook/redirect',
    profileFields: ['id', 'displayName', 'photos', 'email', 'gender']
}, async (accessToken, refreshToken, profile, done) => {
    // console.log('accessToken', accessToken, '\n\n')
    // console.log('refreshToken', refreshToken, '\n\n')
    // console.log('profile', profile, '\n\n')

    try {
        let user = await User.findOne({ facebookId: profile.id })
        if (user) {
            done(null, user)
        }
        else {
            try {
                nUser = new User({
                    name: profile.displayName,
                    username: profile.emails[0].value.replace(/@.*$/, ''),
                    email: profile.emails[0].value,
                    photo: profile.photos[0].value,
                    facebookId: profile.id,
                    provider: profile.provider
                })
                user = await nUser.save()
                done(null, user)
            } catch (err) {
                done(err, false)
            }
        }
    } catch (err) {
        done(err, false)
    }
}))

passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CLIENT_ID,
    consumerSecret: process.env.TWITTER_CLIENT_SECRET,
    callbackURL: 'http://127.0.0.1:5000/auth/twitter/redirect',
    includeEmail: true,
    includeEntities: true,
    includeStatus: true
}, async (token, tokenSecret, profile, done) => {
    // console.log('token', token, '\n\n')
    // console.log('tokenSecret', tokenSecret, '\n\n')
    // console.log('profile', profile, '\n\n')

    try {
        let user = await User.findOne({ twitterId: profile.id })
        if (user) {
            done(null, user)
        }
        else {
            try {
                nUser = new User({
                    name: profile.displayName,
                    username: profile.username,
                    email: profile.emails[0].value,
                    photo: profile.photos[0].value,
                    twitterId: profile.id,
                    provider: profile.provider
                })
                user = await nUser.save()
                done(null, user)
            } catch (err) {
                done(err, false)
            }
        }
    } catch (err) {
        done(err, false)
    }
}))

passport.use(new GithubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: 'http://127.0.0.1:5000/auth/github/redirect'
}, async (accessToken, refreshToken, profile, done) => {
    // console.log('accessToken', accessToken, '\n\n')
    // console.log('refreshToken', refreshToken, '\n\n')
    // console.log('profile', profile, '\n\n')

    try {
        let user = await User.findOne({ githubId: profile.id })
        if (user) {
            done(null, user)
        }
        else {
            try {
                nUser = new User({
                    name: profile.displayName,
                    username: profile.username,
                    email: (!!profile.emails) ? profile.emails[0].value : '',
                    photo: profile.photos[0].value,
                    githubId: profile.id,
                    provider: profile.provider
                })
                user = await nUser.save()
                done(null, user)
            } catch (err) {
                done(err, false)
            }
        }
    } catch (err) {
        done(err, false)
    }
}))

const PORT = process.env.PORT || 5000

app.set('view engine', 'ejs')
app.use('/public', express.static(path.join(__dirname, 'public')))

app.use(bodyParser.json())
app.use(cookieParser())
app.use(session({
    secret: 'TEST',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60
    }
}))
app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id)
        if (user) {
            done(null, user)
        }
    }
    catch (e) {
        console.log(e)
        done(e, false)
    }
})

let redirectUrl = ''

app.get('/', (req, res) => res.render('home', { user: req.user }))


app.post('/logup', async (req, res) => {
    try {
        const user = new User(req.body)
        await user.save()
        return res.status(201).header("Content-Type", "application/json").json({ "created": true })
    } catch (e) {
        console.log('Error creating user')
        return res.status(500).header("Content-Type", "application/json").json(e)
    }
})

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            if (err.message === 'Not Found') {
                console.log('Invalid username or password')
                return res.status(401).header("Content-Type", "application/json").json({ "error": "Unauthorized" })
            }
            return res.status(500).header("Content-Type", "application/json").json(err)
        }
        if (user) {
            req.logIn(user, e => {
                if (e) {
                    return res.status(500).header("Content-Type", "application/json").json(e)
                }
                next()
            })
        }
    })(req, res, next)
}, (req, res) => {
    console.log(req.user)
    return res.status(201).header("Content-Type", "application/json").json(req.user)
})


app.get('/auth/google', (req, res, next) => { console.log('setting req', req.query); redirectUrl = req.query.next; next() }, passport.authenticate('google', {
    scope: [
        'profile',
        'email',
        'openid'
    ]
}))

app.get('/auth/google/redirect', (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
        // console.log('err\n', err, '\n\n')
        // console.log('user\n', user, '\n\n')
        // console.log('info\n', info, '\n\n')
        if (err) {
            // Handle errors

            console.log(err)
            return res.status(500).header("Content-Type", "application/json").json(err)
        }
        if (user) {
            req.logIn(user, e => {
                if (e) {
                    return res.status(500).header("Content-Type", "application/json").json(e)
                }
                next()
            })
        }
    })(req, res, next)
}, (req, res) => {
    console.log(redirectUrl)
    // return res.status(200).header('Content-Type', 'application/json').json(req.user)
    return res.redirect(redirectUrl)
})


app.get('/auth/facebook', (req, res, next) => { console.log('setting req', req.query); redirectUrl = req.query.next; next() }, passport.authenticate('facebook', { scope: ['email'] }))

app.get('/auth/facebook/redirect', (req, res, next) => {
    passport.authenticate('facebook', (err, user, info) => {
        // console.log('err\n', err, '\n\n')
        // console.log('user\n', user, '\n\n')
        // console.log('info\n', info, '\n\n')
        if (err) {
            // Handle errors

            console.log(err)
            return res.status(500).header("Content-Type", "application/json").json(err)
        }
        if (user) {
            req.logIn(user, e => {
                if (e) {
                    return res.status(500).header("Content-Type", "application/json").json(e)
                }
                next()
            })
        }
    })(req, res, next)
}, (req, res) => {
    console.log(redirectUrl)
    // return res.status(200).header('Content-Type', 'application/json').json(req.user)
    return res.redirect(redirectUrl)
})


app.get('/auth/twitter', (req, res, next) => { console.log('setting req', req.query); redirectUrl = req.query.next; next() }, passport.authenticate('twitter', { scope: ['email'] }))

app.get('/auth/twitter/redirect', (req, res, next) => {
    passport.authenticate('twitter', (err, user, info) => {
        // console.log('err\n', err, '\n\n')
        // console.log('user\n', user, '\n\n')
        // console.log('info\n', info, '\n\n')
        if (err) {
            // Handle errors

            console.log(err)
            return res.status(500).header("Content-Type", "application/json").json(err)
        }
        if (user) {
            req.logIn(user, e => {
                if (e) {
                    return res.status(500).header("Content-Type", "application/json").json(e)
                }
                next()
            })
        }
    })(req, res, next)
}, (req, res) => {
    console.log(redirectUrl)
    // return res.status(200).header('Content-Type', 'application/json').json(req.user)
    return res.redirect(redirectUrl)
})


app.get('/auth/github', (req, res, next) => { console.log('setting req', req.query); redirectUrl = req.query.next; next() }, passport.authenticate('github', { scope: ['user:email'] }))

app.get('/auth/github/redirect', (req, res, next) => {
    passport.authenticate('github', (err, user, info) => {
        // console.log('err\n', err, '\n\n')
        // console.log('user\n', user, '\n\n')
        // console.log('info\n', info, '\n\n')
        if (err) {
            // Handle errors

            console.log(err)
            return res.status(500).header("Content-Type", "application/json").json(err)
        }
        if (user) {
            req.logIn(user, e => {
                if (e) {
                    return res.status(500).header("Content-Type", "application/json").json(e)
                }
                next()
            })
        }
    })(req, res, next)
}, (req, res) => {
    console.log(redirectUrl)
    // return res.status(200).header('Content-Type', 'application/json').json(req.user)
    return res.redirect(redirectUrl)
})

app.listen(PORT, e => {
    console.log(`App started on port ${PORT}`)
})