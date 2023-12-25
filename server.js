// server file using expressjs
const express = require('express');
const session = require('express-session');
const bcrypt = require("bcrypt");
const data = require('./data');
const app = express();
const port = 8000;

app.set("views", "templates");
app.set("view engine", "pug");

app.use(session({secret:'sfsdfsdfkoisjldfa;;oijeofiaoijaopweijfodijasojeofwieje'}));
app.use(express.static('resources'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// middleware for login session
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.isLogin) {
        return next();
    } else {
        res.redirect("/login");
    }
};

// middleware function
app.use((req, res, next)=> {
    if (req.session.isLogin === false && req.path === '/') {
        return res.redirect('/login');
    }
    next();
    console.log(req.method, `localhost:${port}${req.path}`, res.statusCode);
})

// home page
app.get("/", isAuthenticated, async (req, res)=>{
    // get all posts with latest first by default
    let posts = await data.sortPostsByLatestPost();;
    const comments = await data.getComments();
    const allUsers = await data.getAllUsers();

    // when change to most liked first
    if (req.session.sortBY === 'like_count') {
        posts = await data.sortPostsByMostLike();
    }
    
    // pagination style from lecture
    let page = parseInt(req.query.page ?? 1);

    if (!page) {
        page = 1;
    }

    let offset = (page - 1) * 10;
    let newPosts = posts.slice(offset, offset + 10);

    res.render('media_page.pug', {comments:comments, posts:newPosts, page, currentUser:req.session.currentUser,
                                    allUsers:allUsers, currentUserId:req.session.currentUserId});
})

// login route
app.get("/login", (req, res)=>{
    res.render("login.pug");
})

// check password from database
app.post("/login", async (req, res) => {
    const users = await data.getUsersForLogin();
    for (const user of users) {
        // Compare hashed passwords
        const passwordMatch = await bcrypt.compare(req.body.password, user.password);

        if (req.body.username === user.username && passwordMatch) {
            req.session.currentUserId = user.user_id;
            req.session.currentUser = user.account_name;
            req.session.isLogin = true;
            // sort by lastest posts by default
            req.session.sortBY = 'post_time';
            // use return to break out of loop
            return res.redirect("/");
        }
    }

    // If no matching user is found
    res.status(401).send("Invalid username or password");
});


// create new user account
app.post("/create", async (req, res) => {
    const userData = req.body;

    // Input validation
    if (!userData.create_username || !userData.create_password || !userData.account_name) {
        res.render("create.unsuccess.pug");
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(userData.create_password, 10);

    // Create user
    await data.createUser(userData.create_username, hashedPassword, userData.account_name);
    
    res.render("create_success.pug");
});


app.get("/create", (req, res)=>{
    res.render("create_account.pug");
})

// lock out of app
app.get("/logout", (req, res) => {
    
    // Destroy the session with error handling
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
        }
        else {
            res.redirect("/login");
        }
    });
});


// form for new posts and comments
app.post("/posts/add", isAuthenticated, async (req, res)=>{
    // const comments = await data.getComments();
    const post = req.body.post;
    if (post) {
        await data.createPost(post, req.session.currentUserId);
    }
    res.redirect("/");
})

// form for new posts and comments
app.post("/posts/comment", isAuthenticated, async (req, res)=>{
    // const comments = await data.getComments();
    const result = req.body;
    if (result) {
        const getId = result.id.split('-');
        const comment = result.comment;
        await data.addComment(getId[1], getId[0], comment, getId[2]);
    }
    res.redirect("/");
})

// edit post 
app.post("/posts/edit", isAuthenticated, async (req, res)=>{
    const getId = req.body.id.split('-');
    const getPostText = req.body.new_post_text;
    if (getPostText && getId) {
        await data.editPost(getPostText, getId[1], getId[0]);
    }
    res.redirect("/");
})

// update news feed
app.put("/update", isAuthenticated, async (req, res)=>{
    const result = req.body;
    if ((result.message === 'post_time') || (result.message === 'like_count')) {
        req.session.sortBY = result.message;
    }
    res.status(200).send("update okay");
})

// get current user profile
app.get('/profile', isAuthenticated, (req, res) => {
    res.render("profile.pug", {currentUser:req.session.currentUser});
});

// delete post(s)
app.delete("/api/posts/delete", isAuthenticated, async (req, res)=>{
    const posts = await data.sortPostsByLatestPost();
    if (req.body){
        const postId = req.body.id;
        for (const post of posts){
            if (postId === `${post.poster_id}-${post.post_id}-${req.session.currentUserId}`) {
                await data.deletePost(post.post_id, post.poster_id);
            }
        }

        res.status(200).send("delete okay");
    }
})

// update like count
app.put("/api/posts/like", async (req, res)=>{
    const result = req.body.id.split('-');
    
    if (result && result.length === 3) {
        await data.updateLikeCount(result[1], result[0]);
    }
    res.status(200).send("like okay");
})

// get css file
app.get("/css/main.css", (req, res)=>{
    res.send("main.css");
})

// get image
app.get("/images/Pug_600.jpg", (req, res)=>{
    res.send("Pug_600.jpg");
})

// get all posts by latest time
app.get("/api/posts/bytime", async(req, res)=>{
    res.send({"message": "post_time"});
})

// get all posts by most liked
app.get("/api/posts/bylike", async(req, res)=>{
    res.send({"message": "like_count"});
})

// 404 not found page
app.use((req, res) => {
    res.status(404).render("404.pug");
})

app.listen(port , () => {
    console.log(`Listening on port ${port}`);
})