import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getBookBySlug } from '@/lib/actions/book.action';
import { Mic, MicOff, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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
                width={120}
                height={180}
                loading="eager"
                style={{ width: '100%', height: 'auto' }}
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

            {/* wave image */}
            <div className="hidden md:block ml-12">
              <Image
                src={'/book-detail.png'}
                alt="book detail illustration"
                width={500}
                height={500}
                style={{ width: '100%', height: 'auto' }}
              />
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
