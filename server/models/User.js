/**
 * User — the single collection Agrilink needs for auth.
 * Plaintext passwords are never stored: only bcrypt hashes.
 */
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    /* stored exactly as the client sends it ('Buyer' | 'Farmer')
       because the UI compares against these exact strings */
    role: { type: String, enum: ['Buyer', 'Farmer'], required: true },
  },
  { timestamps: true },
)

userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.passwordHash)
}

export default mongoose.models.User || mongoose.model('User', userSchema)
