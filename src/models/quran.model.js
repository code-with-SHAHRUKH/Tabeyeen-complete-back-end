// models/QuranReference.js
import mongoose from 'mongoose';

const QuranReferenceSchema = new mongoose.Schema({
  surahNumber: {
    type: Number,
    required: true
  },
  ayahNumber: {
    type: Number,
    required: true
  },
  ayahArabic: {
    type: String,
  },
  ayahEnglish: {
    type: String,
  },
  ayahUrdu: {
    type: String,
  }
});

export const QuranReference = mongoose.model('QuranReference', QuranReferenceSchema);
