import ReactPlayer from 'react-player/lazy';

function VideoPlayer({ playerRef, ...props }) {
  return <ReactPlayer ref={playerRef} {...props} />;
}

export default VideoPlayer;
