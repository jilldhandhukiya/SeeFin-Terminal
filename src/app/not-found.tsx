'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

const images = [
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3ioZ3LF7DYTOleercHWuBxHoE96NamHYjXw&s',
  'https://m.media-amazon.com/images/I/71G4cj7kr6L._SX679_.jpg',
  'https://i.pinimg.com/1200x/69/de/7f/69de7f877f3a08a21b303c1f2cd8ecf5.jpg',
  'https://i.pinimg.com/736x/15/ab/a3/15aba382e037e8acc94581fb91cc1d7f.jpg',
];

export default function NotFound() {
  const [randomImage] = useState(
    () => images[Math.floor(Math.random() * images.length)]
  );

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-black px-4 py-8 text-white">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-3 flex justify-center">
          <AlertCircle size={48} className="text-red-500" />
        </div>

        <h1 className="text-4xl font-bold md:text-6xl font-mono">
          Page Not Found
        </h1>

        <p className="mt-3 text-sm text-gray-400 md:text-base font-mono">
          Oops! The page or terminal view you are looking for does not exist.
        </p>
      </div>

      {/* Image Card */}
      <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-gray-800 bg-zinc-950 shadow-2xl">
        {/* Fixed Image Container */}
        <div className="flex h-[300px] items-center justify-center bg-black p-4 md:h-[400px]">
          <img
            src={randomImage}
            alt="404 Illustration"
            className="max-h-full max-w-full object-contain"
          />
        </div>

        <div className="p-6 text-center border-t border-gray-800">
          <h2 className="mb-2 text-2xl font-semibold text-white font-mono">
            404 Error {'//'} TERMINAL_NOT_FOUND
          </h2>

          <p className="mb-6 text-gray-400 font-mono text-xs">
            The requested instrument, page, or action route could not be found.
          </p>

          <Link
            href="/"
            className="inline-block rounded border border-amber-500 bg-amber-500 px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-black transition hover:bg-amber-400"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
