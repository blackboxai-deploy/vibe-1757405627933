import mongoose, { Document, Schema } from 'mongoose';

export interface ILesson {
  _id?: string;
  title: string;
  videoUrl: string;
  transcription: string;
  summary: string;
  resources: string[];
  duration?: number;
  order: number;
}

export interface ICourse extends Document {
  _id: string;
  title: string;
  description: string;
  targetGrades: string[];
  lessons: ILesson[];
  createdBy: mongoose.Types.ObjectId;
  enrolledStudents: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILesson>({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true,
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required'],
  },
  transcription: {
    type: String,
    default: '',
  },
  summary: {
    type: String,
    default: '',
  },
  resources: [{
    type: String,
  }],
  duration: {
    type: Number, // Duration in seconds
    default: 0,
  },
  order: {
    type: Number,
    required: true,
  },
});

const CourseSchema = new Schema<ICourse>({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    trim: true,
  },
  targetGrades: [{
    type: String,
    required: true,
  }],
  lessons: [LessonSchema],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  enrolledStudents: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for efficient querying
CourseSchema.index({ targetGrades: 1, isActive: 1 });
CourseSchema.index({ createdBy: 1 });

const Course = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);

export default Course;