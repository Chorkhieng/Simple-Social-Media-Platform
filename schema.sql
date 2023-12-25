-- users table
CREATE TABLE users (
    user_id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (user_id)
);

-- posts table
CREATE TABLE posts (
    post_id INT NOT NULL AUTO_INCREMENT,
    poster_id INT,
    posted_content TEXT NOT NULL,
    like_count INT DEFAULT 0,
    post_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id)
);

-- comments table
CREATE TABLE comments (
    poster_id INT,
    commenter_id INT,
    post_id INT,
    comment_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comment_content TEXT NOT NULL
    -- allow user to delete comment(s)?
    -- commnet_id INT
);
