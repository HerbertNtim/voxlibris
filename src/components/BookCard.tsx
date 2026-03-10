import Link from 'next/link';
import Image from 'next/image';
import { BookCardProps } from '../../types';

const BookCard = ({ title, coverURL, slug }: BookCardProps) => {
  return (
    <Link href={`/books/${slug}`}>
      <article className="book-card">
        <figure className="book-card-figure">
          <div className="book-card-cover-wrapper">
            <Image
              src={coverURL}
              alt={title}
              width={133}
              height={200}
              className="book-card-cover"
            />
          </div>
        </figure>
      </article>
    </Link>
  );
};

export default BookCard;
