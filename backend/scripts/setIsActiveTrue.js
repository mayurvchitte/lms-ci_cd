// Run this script with: node scripts/setIsActiveTrue.js
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/userModel.js'

dotenv.config()

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms'

const run = async () => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    console.log('Connected to DB')

    const res = await User.updateMany({ isActive: { $exists: false } }, { $set: { isActive: true } })
    console.log('Migration result:', res)
  } catch (err) {
    console.error('Migration error', err)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected')
  }
}

run()
