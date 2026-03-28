import BookCard from '@/components/BookCard';
import HeroSection from '@/components/HeroSection';
import { getAllBooks } from '@/lib/actions/book.actions';
import { sampleBooks } from '@/lib/constants';

const Home = async () => {
  const bookResults = await getAllBooks();
  const books =
    bookResults.success && bookResults.data && bookResults.data.length > 0
      ? bookResults.data
      : sampleBooks;
  return (
    <main className="wrapper container">
      <HeroSection />

      <div className="library-books-grid">
        {books.map((book) => (
          <BookCard
            key={book._id}
            title={book.title}
            coverURL={book.coverURL}
            slug={book.slug}
            author={book.author}
            coverColor={book.coverColor}
          />
        ))}
      </div>
    </main>
  );
};

export default Home;
