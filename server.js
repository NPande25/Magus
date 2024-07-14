/* server.js file for server side of Magus application */

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid')

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.render(`index`)
  })

app.get('/start', (req, res) => {
  const username = req.query.userName; // Retrieve the username from the query parameters
  if (!username) {
      // If username is not provided, redirect to homepage or handle the error accordingly
      res.redirect('/');
      return;
  }
  const roomId = uuidV4(); // Generate a unique room ID
  res.redirect(`/${roomId}?username=${encodeURIComponent(username)}`);
});

// Route for '/disconnected.ejs'
app.get('/disconnected.ejs', (req, res) => {
  // Render the 'disconnected.ejs' template
  res.render('disconnected');
});

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
  }
)

// we need to host our own peer server here
const { PeerServer } = require("peer");
const peerServer = PeerServer({ port: 3001, path: "/peerserver" });

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId, username) => {
    socket.join(roomId); // Join the room corresponding to the roomId
    console.log(username + " (" + userId + ") has connected server side")
    socket.broadcast.to(roomId).emit('user-connected', userId, username); // Broadcast to users in the same room

    socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit('user-disconnected', userId, username); // Broadcast disconnection message to users in the same room
      console.log(username + " (" + userId + ") has disconnected")
    });
  });
});
server.listen(3000)