import BookCard from '@/components/BookCard';
import HeroSection from '@/components/HeroSection';
import { sampleBooks } from '@/lib/constants';

const Home = () => {
  return (
    <main className="wrapper container">
      <HeroSection />

      <div className="library-books-grid">
        {sampleBooks.map((book) => (
          <BookCard
            key={book._id}
            title={book.title}
            coverURL={book.coverURL}
            slug={book.slug}
            author={book.author}
          />
        ))}
      </div>
    </main>
  );
};

export default Home;
