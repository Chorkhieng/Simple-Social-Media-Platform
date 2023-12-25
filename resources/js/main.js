// change posts options
document.addEventListener('DOMContentLoaded', () => {
    const option = document.getElementById("choice");

    option.addEventListener("change", async () => {
        const selectedOption = option.value;

        let endpoint;
        if (selectedOption === "post_time") {
            endpoint = "http://localhost:4131/api/posts/bytime";
        } else if (selectedOption === "like_count") {
            endpoint = "http://localhost:4131/api/posts/bylike";
        }

        const response = await fetch(endpoint);
        const message = await response.json();

        // Send the sorted posts back to the server
        const updateResponse = await fetch("http://localhost:4131/update", {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(message),
        });

        await updateResponse.json();

    });
});


// toggle switch for dark or norman mode
function toggleMode() {
    const mode = document.getElementById("dark-light");
    const changeMode = document.getElementById("css-mode");
    let isDarkMode = localStorage.getItem("isDarkMode") === "true";
  
    // switch between css files to change background colors
    // and change the text to indicate option (Dark Mode/ Light Mode)
    if (isDarkMode) {
      changeMode.setAttribute("href", "/css/main.css");
      mode.innerText = "Dark Mode";
      isDarkMode = false;
    } else {
      changeMode.setAttribute("href", "/css/main.dark.css");
      mode.innerText = "Light Mode";
      isDarkMode = true;
    }
  
    // Store the current theme mode in localStorage
    localStorage.setItem("isDarkMode", isDarkMode.toString());
  }
  
  document.addEventListener("DOMContentLoaded", function () {
    const darkTheme = document.getElementById("dark-light");
    darkTheme.addEventListener("click", function (event) {
      event.preventDefault();
      toggleMode();
    });
  
    // Check for the initial theme mode and set it
    let isDarkMode = localStorage.getItem("isDarkMode") === "true";
    if (isDarkMode) {
      document.getElementById("css-mode").setAttribute("href", "/css/main.dark.css");
      document.getElementById("dark-light").innerText = "Light Mode";
    } else {
      document.getElementById("css-mode").setAttribute("href", "/css/main.css");
      document.getElementById("dark-light").innerText = "Dark Mode";
    }
  });


// that remove posts permanently 
function removePost() {
  let table = document.getElementById("news_feed");
  let tbody = table.tBodies[0];

  tbody.addEventListener("click", async (event) => {
      if (event.target.tagName === "BUTTON" && event.target.classList.contains("delete-button")) {
          // Get the parent row of the clicked button
          const row = event.target.parentElement.parentElement;
          const id = row.id;

          const result = await fetch("http://localhost:4131/api/posts/delete", {
              method: "DELETE",
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({"id": id})
          });

          // remove row from front-end
          if (result.status == 200 || result.status == 404) {
              tbody.removeChild(row);
          }
      }
  });
}

// update like count for each post
function likePost() {
  let table = document.getElementById("news_feed");
  let tbody = table.tBodies[0];

  tbody.addEventListener("click", async (event) => {
      if (event.target.tagName === "BUTTON" && event.target.classList.contains("like-button")) {
          // Get the parent row of the clicked a tag
          const row = event.target.parentElement.parentElement;
          const id = row.id;

          const result = await fetch("http://localhost:4131/api/posts/like", {
              method: "PUT",
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({"id": id})
          });

          // update like count for frond-end
          if (result.status === 200) {
            let likeCount = document.getElementById(`like_count-${id}`);
            let currentLikes = parseInt(likeCount.innerText);
            let newLikes = currentLikes + 1;

            if (newLikes <= 1) {
                likeCount.innerText = newLikes + " like";
            }
            else {
                likeCount.innerText = newLikes + " likes"
            }
          }
      }
  });
}

// form for edit post
function editPost() {
  let table = document.getElementById("news_feed");
  let tbody = table.tBodies[0];

  tbody.addEventListener("click", async (event) => {
      if (event.target.tagName === "BUTTON" && event.target.classList.contains("edit-button")) {
          // Get the parent row of the clicked a tag
          const row = event.target.parentElement.parentElement;
          const id = row.id;
          // Get the form element
          let EditForm = document.getElementById(`edit-form-${id}`);
          let postedText = document.getElementById(`posted-text-${id}`);

          // change the visibility of the form
          if (EditForm.classList.contains(`edit-post-text-${id}`)) {

            if (EditForm.style.display == 'none') {
              postedText.style.display = 'none';
              EditForm.style.display = 'block';
            }
            else if (EditForm.style.display !== 'none') {
              postedText.style.display = 'block';
              EditForm.style.display = 'none';
            }
        }
      }
  });
}

// form for comment
function commentPost() {
  let table = document.getElementById("news_feed");
  let tbody = table.tBodies[0];

  tbody.addEventListener("click", async (event) => {
      if (event.target.tagName === "BUTTON" && event.target.classList.contains("comment-button")) {
          // Get the parent row of the clicked a tag
          const row = event.target.parentElement.parentElement;
          const id = row.id;
          // Get the form element
          let commentForm = document.getElementById(`comment-form-${id}`);

          // change the visibility of the form
          if (commentForm.classList.contains(`comment-text-form-${id}`)) {

            if (commentForm.style.display == 'none') {
              commentForm.style.display = 'block';
            }
            else if (commentForm.style.display !== 'none') {
              commentForm.style.display = 'none';
            }
        }
      }
  });
}


// Wait until the full document is loaded
document.addEventListener("DOMContentLoaded", removePost);
document.addEventListener("DOMContentLoaded", likePost);
document.addEventListener("DOMContentLoaded", editPost);
document.addEventListener("DOMContentLoaded", commentPost);
