const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = false;

var peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '3030',
});

let myVideoStream;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', (call) => {
      call.answer(stream);
      const video = document.createElement('video');
      call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on('user-connected', (userId) => {
      connectToNewUser(userId, stream);
    });
  });

peer.on('open', (id) => {
  socket.emit('join-room', ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  console.log('connect new user', userId);
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });

  videoGrid.append(video);
};

let text = $('input');

$('html').keydown((e) => {
  if (e.which == 13 && text.val().length !== 0) {
    socket.emit('message', text.val());
    text.val('');
  }
});

socket.on('createMessage', (message) => {
  $('ul').append(`<li><strong>user</strong><br />${message}</li>`);
  scrollToBottom();
});

const scrollToBottom = () => {
  const d = $('.main__chat__window');
  d.scrollTop(d.prop('scrollHeight'));
};

const toggleAudio = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  myVideoStream.getAudioTracks()[0].enabled = !enabled;
  const html = !enabled
    ? `<i class="fas fa-microphone"></i>
              <span>Mute</span>`
    : `<i class="unmute fas fa-microphone-slash"></i>
              <span>Un-Mute</span>`;
  document.querySelector('.main__mute_button').innerHTML = html;
};

const toggleVideo = () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  myVideoStream.getVideoTracks()[0].enabled = !enabled;
  const html = !enabled
    ? `<i class="fas fa-video"></i>
              <span>Stop Video</span>`
    : `<i class="unmute fas fa-video-slash"></i>
              <span>Start Video</span>`;
  document.querySelector('.main__video_button').innerHTML = html;
};
