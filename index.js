const express =  require("express");
const path = require('path')
const cookieParser = require('cookie-parser')
const URL = require("./models/url")
const { connectToMongoDB } = require("./connect")
const {restrictToLoggedinUserOnly, checkAuth} = require('./middleware/auth')

const app = express();
const PORT = 8001;

const urlRoute = require('./routes/url')
const staticRoute = require('./routes/staticRouter')
const userRoute = require('./routes/user')

connectToMongoDB('mongodb://127.0.0.1:27017/short-url')
.then(() => console.log("MongoDB connected"))

app.set('view engine', 'ejs')
app.set('views', path.resolve("./views"))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.get('/test', async (req,res) => {
    const allUrls = await URL.find({})
    return res.render('home')
})

app.use(checkAuth)
app.use("/url", restrictToLoggedinUserOnly, urlRoute)
app.use('/', staticRoute, checkAuth)
app.use('/user', userRoute)

app.get("/url/:shortId", async (req,res) => {
    const shortId = req.params.shortId
    const entry = await URL.findOneAndUpdate({
        shortId
    }, { $push: {
        visitHistory: {
            timestamp: Date.now()
        }
    }
}
)
res.redirect(entry.redirectURL)
})

app.listen(PORT, () => console.log(`Server started at PORT ${PORT}`))

