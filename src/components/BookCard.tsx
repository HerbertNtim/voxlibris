import Link from 'next/link';
import Image from 'next/image';
import { BookCardProps } from 'types';

const bgColors = ['#e0e0e0', '#f3e4c7', '#faf3e0'];

const getCoverColor = (slug: string, providedColor?: string) => {
  if (providedColor) return providedColor;
  // Simple hash of slug to pick a color
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash);
  }
  return bgColors[Math.abs(hash) % bgColors.length];
};

const BookCard = ({
  title,
  author,
  coverURL,
  slug,
  coverColor,
}: BookCardProps) => {
  const finalCoverColor = getCoverColor(slug, coverColor);
  return (
    <Link href={`/books/${slug}`}>
      <article className="book-card">
        <figure className={'book-card-figure'}>
          <div
            className="book-card-cover-wrapper"
            style={{ backgroundColor: finalCoverColor }}
          >
            <Image
              src={coverURL}
              alt={title}
              width={133}
              height={200}
              className="book-card-cover"
              style={{ width: 133, height: 200 }}
            />
          </div>

          <figcaption className="book-card-meta">
            <h3 className="book-card-title">{title}</h3>
            <p className="book-card-author">{author}</p>
          </figcaption>
        </figure>
      </article>
    </Link>
  );
};

export default BookCard;
