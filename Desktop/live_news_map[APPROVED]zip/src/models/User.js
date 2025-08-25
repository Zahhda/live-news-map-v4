// src/models/User.js
import mongoose from 'mongoose';

const SavedNewsSchema = new mongoose.Schema({
  key:   { type: String, required: true, index: true },
  title: String,
  summary: String,
  link:  String,
  isoDate: String,
  image: String,
  source: String,
  category: { type: String, default: 'others' }
}, { _id: false });

const NotificationSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  title: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
}, { _id: false });

const UserSchema = new mongoose.Schema(
  {
    name:  { type: String, default: '' },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, default: '' },
    // keep the hash ONLY; never store the raw password
    passwordHash: { type: String, required: true },
    role:  { type: String, enum: ['user','admin'], default: 'user', index: true },
    savedNews: { type: [SavedNewsSchema], default: [] },

    // ✅ New notifications array
    notifications: { type: [NotificationSchema], default: [] }
  },
  { timestamps: true }
);

// Normalize email
UserSchema.pre('save', function(next) {
  if (this.email) this.email = String(this.email).toLowerCase().trim();
  next();
});

// Hide internals client-side
UserSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    return ret;
  }
});

export default mongoose.model('User', UserSchema);
