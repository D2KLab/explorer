import ReactPlayer from 'react-player/lazy';

/**
 * A custom video player component that uses the ReactPlayer component.
 * @param {React.Ref<ReactPlayer>} playerRef - the ref of the ReactPlayer.
 * @param {object} props - the props to pass to the ReactPlayer component.
 * @returns A React component.
 */
function VideoPlayer({ playerRef, ...props }) {
  return <ReactPlayer ref={playerRef} {...props} />;
}

export default VideoPlayer;
