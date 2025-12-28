'use client';

import React from 'react';

export const LoginVideo: React.FC = () => {
  return (
    <div className="bg-muted relative hidden lg:block">
      <video
        width="1920"
        height="1080"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/video/promo.mp4" type="video/mp4" />
        Your browser does not support video playback.
      </video>
    </div>
  );
};
