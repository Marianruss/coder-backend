const handlebars = require("express-handlebars")
const express = require("express")
const app = express()
const initSocket = require("./utils/socket")
const { static } = require("express")
const loginRouterFn = require("./routers/loginRouter")
const prodRouterFn = require("./routers/prodRouter")
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser")
const session = require("express-session")
const fileStore = require("session-file-store")
const mongoStore = require("connect-mongo")



//Run app
const PORT = 8080
const httpServer = app.listen(PORT, () => {
    console.log(`Server running in port ${PORT}...`)
})

const mongoConnect = "mongodb+srv://marianruss:Darksouls3@cluster0.n9qkduy.mongodb.net/geekers-store?retryWrites=true&w=majority"

mongoose.connect(mongoConnect)
    .catch(err => {
        if (err) {
            console.log("Can't connect to DB", err)
        }
    }
    )



const socket = initSocket(httpServer)
const fileStorage = fileStore(session)

app.use(cookieParser("secret"));


//session 
app.use(session({
    store:mongoStore.create({
        mongoUrl:"mongodb+srv://marianruss:Darksouls3@cluster0.n9qkduy.mongodb.net/sessions?retryWrites=true&w=majority",
        mongoOptions:{useUnifiedTopology:true},
        ttl:500
    }),
    secret: "secret",
    resave: true,
    saveUninitialized: true
}))

//Routers
const prodRouter = prodRouterFn(socket)
const cartRouter = require("./routers/cartRouter")
const chatRouter = require("./routers/chatRouter")
const loginRouter = loginRouterFn(socket)
const userRouter = require("./routers/userRouter")


//Handlebars Views
app.engine('handlebars', handlebars.engine())
app.set('view engine', 'handlebars')
app.set('views', './views')

//cookies


//Express encode and public
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(static('public/'))

//Use routers
app.use("/products", prodRouter)
app.use("/carts", cartRouter)
app.use("/chat", chatRouter)
app.use("/login", loginRouter)
app.use("/users", userRouter)


app.get("/",(req,res) =>{
    res.redirect("/login")
})


module.exports = httpServer