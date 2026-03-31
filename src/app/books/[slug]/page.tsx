import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getBookBySlug } from '@/lib/actions/book.actions';
import Link from 'next/link';
import VapiControls from '@/components/VapiControls';
import { ArrowLeft } from 'lucide-react';

const BookPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  const { slug } = await params;
  const bookResult = await getBookBySlug(slug);

  if (!bookResult.success || !bookResult.data) {
    redirect('/sign-in');
  }

  if (!bookResult.data || !bookResult.success) {
    redirect('/');
  }

  const book = bookResult.data;

  return (
    <div className="book-page-container">
      {/* Floating Back Button */}
      <Link href="/" className="back-btn-floating">
        <ArrowLeft className="size-6 text-[#212a3b]" />
      </Link>

      <VapiControls book={book} />
    </div>
  );
};

export default BookPage;
