'use client';

import Image from 'next/image';
import Link from 'next/link';

const Navbar = () => {
  return (
    <header className="w-full fixed z-50 bg-('--bg-primary')">
      <div className="wrapper navbar-height py-4 flex justify-between items-center">
        <Link href={'/'} className="flex items-center gap-0.5">
          <Image src={'/logo.png'} alt="VoxLibris" width={42} height={26} />
          <span className="logo-text">VoxLibris</span>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
