import { connectToDatabase } from '@/database/mongoose';
import { CreateBook, TextSegment } from 'types';
import { generateSlug, serializeData } from '../utils';
import Book from '@/database/models/book.model';
import BookSegment from '@/database/models/book-segment.model';

export const createBook = async (data: CreateBook) => {
  try {
    await connectToDatabase();

    const slug = generateSlug(data.title);

    const existingBook = await Book.findOne({ slug }).lean();

    if (existingBook) {
      return { success: true, data: serializeData(existingBook) };
    }

    const book = new Book({ ...data, slug, totalSegments: 0 });

    return { success: true, data: serializeData(book) };
  } catch (e) {
    console.error('Error creating book:', e);
    return { success: false, error: e };
  }
};

export const saveBookSegments = async (
  bookId: string,
  clerkId: string,
  segments: TextSegment[],
) => {
  try {
    await connectToDatabase();

    const segmentsToInsert = segments.map(
      ({ text, segmentIndex, pageNumber, wordCount }) => ({
        bookId,
        clerkId,
        text,
        segmentIndex,
        pageNumber,
        wordCount,
      }),
    );

    await BookSegment.insertMany(segmentsToInsert);
    await Book.findByIdAndUpdate(bookId, {
      totalSegments: segmentsToInsert.length,
    });

    console.log(`Saved ${segmentsToInsert.length} segments for book ${bookId}`);

    return { success: true, data: { segmentCreated: segments.length } };
  } catch (error) {
    console.error('Error saving book segments:', error);

    await BookSegment.deleteMany({ bookId });
    await Book.findByIdAndDelete(bookId);

    console.log('Rolled back book and segments due to error.');

    return { success: false, error };
  }
};
