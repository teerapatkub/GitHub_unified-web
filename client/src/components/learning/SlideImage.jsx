import { useState } from 'react';

// The built-in lesson animations in /gif/ were screen recordings saved as GIF:
// first_print.gif alone was 82.8 MB, downloaded on the first lesson slide.
// Each now has an MP4 beside it (about 50-180 KB) that plays the same way: on
// its own, looped, silent. The slide data still names the .gif, so nothing in
// the database had to change, and if the MP4 is missing the GIF is shown.
const BUILT_IN_ANIMATION = /^\/gif\/[^/]+\.gif$/i;

export default function SlideImage({ src, alt }) {
  const [videoFailed, setVideoFailed] = useState(false);
  const className = 'mx-auto max-h-[420px] max-w-full rounded-lg object-contain';

  if (BUILT_IN_ANIMATION.test(src) && !videoFailed) {
    return (
      <video
        key={src}
        src={src.replace(/\.gif$/i, '.mp4')}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-label={alt}
        onError={() => setVideoFailed(true)}
        className={className}
      />
    );
  }
  return <img src={src} alt={alt} className={className} />;
}
