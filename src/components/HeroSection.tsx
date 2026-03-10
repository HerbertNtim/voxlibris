import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const HeroSection = () => {
  return (
    <section className="wrapper mb:10 md:mb-16">
      <div className="library-hero-card">
        <div className="library-hero-content">
          {/* Left Part */}
          <div className="library-hero-text">
            <h1 className="library-hero-title text-4xl font-serif font-bold">
              Your Library
            </h1>
            <p className="library-hero-description">
              Convert your books into interactive AI conversations.{' '}
              <br className="hidden md:block" />
              Listen, learn, and discuss your favorite reads.
            </p>

            <Link href="/books/new" className="library-cta-primary">
              <span className="text-3xl font-light mb-1 mr-2">+</span>
              <span className="text-[#212a3b]">Add Book</span>
            </Link>
          </div>

          {/* Center part - Desktop*/}
          <div className="library-hero-illustration-desktop">
            <Image
              src={'/hero-illustration.png'}
              alt="hero illustration"
              width={400}
              height={400}
              className="object-contain"
            />
          </div>

          {/* Center part - Mobile (Hidden on Desktop) */}
          <div></div>

          {/* Right Part */}
          <div></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
