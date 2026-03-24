import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getBookBySlug } from '@/lib/actions/book.action';
import { Mic, MicOff, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

interface BookPageProps {
  params: {
    slug: string;
  };
}

const BookPage = async ({ params }: BookPageProps) => {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  const { slug } = params;
  const bookResult = await getBookBySlug(slug);

  if (!bookResult.success || !bookResult.data) {
    redirect('/');
  }

  const book = bookResult.data;

  return (
    <div className="book-page-container">
      {/* Floating Back Button */}
      <button className="back-btn-floating">
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Card */}
        <div className="vapi-header-card">
          <div className="flex items-center gap-6">
            {/* Book Cover with Mic Button */}
            <div className="relative">
              <Image
                src={book.coverURL}
                alt={`${book.title} cover`}
                className="w-30 h-auto rounded-lg shadow-book"
              />
              <button className="vapi-mic-btn absolute -bottom-3 -right-3">
                <MicOff className="w-6 h-6" />
              </button>
            </div>

            {/* Book Info */}
            <div className="flex-1">
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-text-primary mb-2">
                {book.title}
              </h1>
              <p className="text-text-secondary mb-4">by {book.author}</p>

              {/* Status Badges */}
              <div className="flex gap-2">
                <div className="vapi-status-indicator">
                  <div className="vapi-status-dot vapi-status-dot-ready"></div>
                  <span className="vapi-status-text">Ready</span>
                </div>
                <div className="vapi-status-indicator">
                  <span className="vapi-status-text">
                    Voice: {book.persona || 'Default'}
                  </span>
                </div>
                <div className="vapi-status-indicator">
                  <span className="vapi-status-text">0:00/15:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transcript Area */}
        <div className="transcript-container">
          <div className="transcript-empty">
            <Mic className="w-12 h-12 text-text-muted mb-4" />
            <p className="transcript-empty-text">No conversation yet</p>
            <p className="transcript-empty-hint">
              Click the mic button above to start talking
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookPage;
