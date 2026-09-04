import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  memberId: { type: String, unique: true, required: true },
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phoneNumber: { type: String, required: true },
  dateOfBirth: { type: Date },
  address: { type: String },
  professionalInfo: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ['MEMBER', 'ADMIN'], default: 'MEMBER' },
  isActive: { type: Boolean, default: true },
  fsbcAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'FSBCAccount' },
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', UserSchema);
