/* Client.js file for client side of Magus application */

// Create a new socket.
const socket = io('/');

const videoGrid = document.getElementById('video-grid')



const myVideo = document.createElement('video')
myVideo.muted = true
const muteButton = document.createElement('button');
muteButton.id = "muteButton";
muteButton.textContent = "Unmute";
muteButton.style.marginLeft = "10px";

const urlParams = new URLSearchParams(window.location.search);
const userName = urlParams.get('username');

const myName = userName.charAt(0).toUpperCase() + userName.slice(1);

let myPeer
let peerid

const peers = {}

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        const serverHostname = window.location.hostname;
        console.log("serverHostname: ", serverHostname);
        console.log(stream.getAudioTracks);

        if (serverHostname === "localhost") {
            myPeer = new Peer(undefined, {
                host: 'localhost',
                port: '3001',
                path: '/peerserver'
            });
        }
        else if (serverHostname === "nikhils-macbook-pro.local") {
            myPeer = new Peer(undefined, {
                host: 'nikhils-macbook-pro.local',
                port: '3001',
                path: '/peerserver'
            });
        }

        myPeer.on('open', id => {
            console.log("I have entered room " + ROOM_ID + ". My peer id is " + id + ". My name is " + myName);
            addVideoStream(myVideo, stream, id, myName);
            socket.emit('join-room', ROOM_ID, id, myName);
        });

        socket.on('user-connected', (userId, username) => {
            console.log(username + " (" + userId + ") has connected");
            connectToNewUser(userId, stream, username);
        });

        myPeer.on('call', call => {
            console.log("getting a call from " + call.metadata.username); // Log when a call is received
            const video = document.createElement('video');
            call.on('stream', userVideoStream => {
                if (!peers[call.peer]) {
                    addVideoStream(video, userVideoStream, call.peer, call.metadata.username);
                    peers[call.peer] = {'name': call.metadata.username, 'call': call};
                }
            });
        
            // Answer the call and send the receiver's username as metadata
            call.answer(stream);
            console.log("Call answered");
        });

        socket.on('user-disconnected', peerId => {
            console.log(peers[peerId]['name'] + " (" + peerId, ") has disconnected");
            if (peers[peerId]) {
                peers[peerId]['call'].close();
                const videoElement = document.querySelector(`#user-${peerId}`);
                if (videoElement) {
                    console.log("removing element with id ", `#user-${peerId}`);
                    videoElement.remove();
                }

                delete peers[peerId];
            }

        });
    })
    .catch(error => {
        console.error('Error accessing media devices:', error);
        alert('Failed to access media devices. Please make sure your camera and microphone are properly connected and accessible.');
    });


function connectToNewUser(userId, stream, username) {
    console.log("Connecting to " + username + " (" + userId + ")");
    const call = myPeer.call(userId, stream, { metadata: { username: myName } });
    const video = document.createElement('video');

    // Receive the receiver's username and update the metadata
    call.on('stream', userVideoStream => {
        if (!peers[call.peer]) {
            addVideoStream(video, userVideoStream, call.peer, username);
            peers[call.peer] = {'name': username, 'call': call};
        }
    });

    call.on('close', () => {
        video.remove();
    });

    console.log("Call: ", call);
}

function addVideoStream(video, stream, peerId, username) {
    console.log(username + "'s video stream added")
    const videoContainer = document.createElement('div');
    const userIdElement = document.createElement('div');
    const controlsContainer = document.createElement('div'); // Container for user ID and mute button

    videoContainer.id = `user-${peerId}`; // Set the ID of the video element to the user ID
    userIdElement.innerText = username;
    userIdElement.style.fontWeight = "bold";
    userIdElement.style.fontSize = "1.5em";
    videoContainer.appendChild(video);
    controlsContainer.appendChild(userIdElement);

    // CSS to center the username
    videoContainer.style.display = 'flex';
    videoContainer.style.flexDirection = 'column';
    videoContainer.style.alignItems = 'center';
    

    userIdElement.style.display = 'inline-block'; // Set display to inline-block
    muteButton.style.display = 'inline-block'; // Set display to inline-block

    if (videoGrid.childElementCount === 0) {
        controlsContainer.appendChild(muteButton); // Append the mute button to the controls container
    }

    videoContainer.appendChild(controlsContainer); // Append the controls container to the video container

    video.srcObject = stream;
    video.addEventListener('loadedmetadata', function() {
        video.play();
    });
    videoGrid.append(videoContainer);
}


muteButton.addEventListener('click', () => {
    console.log('Mute/Unmute button clicked');
    // const isEnabled = myVideo.srcObject.getAudioTracks()[0].enabled;
    let isEnabled = myVideo.muted;

    if (isEnabled) {
        // Mute the audio
        // myVideo.srcObject.getAudioTracks()[0].enabled = false;
        myVideo.muted = false
        muteButton.textContent = 'Mute';
    } else {
        // Unmute the audio
        // myVideo.srcObject.getAudioTracks()[0].enabled = true;
        myVideo.muted = true
        muteButton.textContent = 'Unmute';
    }

    console.log("Muted:", myVideo.muted)

});