import mongoose, { Document, Schema } from 'mongoose';

export interface IAnnouncement extends Document {
  _id: string;
  title: string;
  content: string;
  link?: string;
  targetGrades: string[];
  author: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>({
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Announcement content is required'],
    trim: true,
  },
  link: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Optional field
        // Basic URL validation
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Please provide a valid URL',
    },
  },
  targetGrades: [{
    type: String,
    required: true,
  }],
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for efficient querying
AnnouncementSchema.index({ targetGrades: 1, isActive: 1, createdAt: -1 });
AnnouncementSchema.index({ author: 1 });

const Announcement = mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);

export default Announcement;