/* script.js file for direction on index.ejs page */

document.getElementById('join-room-button').addEventListener('click', function(event) {
    const userName = document.getElementById('user-name').value.trim().toLowerCase();
    const password = document.getElementById('password').value.trim();
    const roomId = document.getElementById('room-id').value.trim();

    const authorizedUsers = {
        'nikhil': 'Nikhil',
    };
    
    if (authorizedUsers.hasOwnProperty(userName) && authorizedUsers[userName] === password) {
        if (roomId === "") {
            // navigate to the "/start" page
            window.location.href = "/start?userName=" + encodeURIComponent(userName);
        } else {
            // redirect to specific room
            window.location.href = "/" + roomId + "?username=" + encodeURIComponent(userName);
        }
    } else {
        // If the user is not authorized, display a message
        const notAuthorizedMessage = document.getElementById('not-authorized-message');
        notAuthorizedMessage.textContent = "Login combination not accepted";
        notAuthorizedMessage.style.color = "red";
    }
});