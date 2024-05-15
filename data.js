// data file
// this package behaves just like the mysql one, but uses async await instead of callbacks.
const mysql = require(`mysql-await`); // npm install mysql-await
const env = require("dotenv");
// first -- I want a connection pool: https://www.npmjs.com/package/mysql#pooling-connections
// this is used a bit differently, but I think it's just better -- especially if server is doing heavy work.

env.config();
var connPool = mysql.createPool({
    connectionLimit: 5, // it's a shared resource, let's not go nuts.
    host: "127.0.0.1",// this will work
    user: process.env.DATABASE,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
});

// get all users in the users table
// the extracted data will include user_id, username, and account_name
// and password will not be extracted
async function getAllUsers() {
    return await connPool.awaitQuery('SELECT user_id, username, account_name FROM users');
}

// This is only for login purpose
async function getUsersForLogin() {
    return await connPool.awaitQuery('SELECT * FROM users');
}

// create new user with new user_id, username, and password
async function createUser(username, password, account_name) {
    await connPool.awaitQuery('INSERT INTO users (username, password, account_name) VALUES (?, ?, ?)',
                                [username, password, account_name]);

}

// create post 
async function createPost(posted_content, poster_id) {
    await connPool.awaitQuery('INSERT INTO posts (posted_content, poster_id) VALUES (?, ?)', [posted_content, poster_id])
}

// edit post for current user
async function editPost(postText, post_id, poster_id) {
    await connPool.awaitQuery('UPDATE posts SET posted_content = ? WHERE poster_id = ? AND post_id = ?', 
                                [postText, poster_id, post_id]);
}

// update like count for specific post
async function updateLikeCount(post_id, poster_id) {
    await connPool.awaitQuery('UPDATE posts SET like_count = (like_count + ?) WHERE post_id = ? AND poster_id = ?',
                                    [1, post_id, poster_id]);
}

// sort 20 posts by lastest posts
async function sortPostsByLatestPost() {
    return await connPool.awaitQuery('SELECT * FROM posts ORDER BY post_time DESC');
}

// sort 20 posts by most like count
async function sortPostsByMostLike() {
    return await connPool.awaitQuery('SELECT * FROM posts ORDER BY like_count DESC');
}

// delete post for a specific user
// delete post should delete likes and comments associated to it
async function deletePost(post_id, poster_id) {
    await connPool.awaitQuery('DELETE FROM posts WHERE post_id = ? AND poster_id = ?',
                                [post_id, poster_id]);
    await connPool.awaitQuery('DELETE FROM comments WHERE post_id = ? AND poster_id = ?',
                                [post_id, poster_id]);
}

// get all comments for specific post
async function getComments() {
    return await connPool.awaitQuery('SELECT * FROM comments');
}

// add comment to a specific post
async function addComment(post_id, poster_id, comment_content, commenter_id) {
    await connPool.awaitQuery(`INSERT INTO comments (post_id, poster_id, comment_content,
                                commenter_id) VALUES (?, ?, ?, ?)`,
                                [post_id, poster_id, comment_content, commenter_id]);
}


module.exports = {  
                    getAllUsers, createUser, editPost, updateLikeCount, getComments, 
                    sortPostsByLatestPost, deletePost, sortPostsByMostLike, 
                    addComment, createPost, getUsersForLogin
                }