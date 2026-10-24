/**
 * MongoDB connection (Mongoose).
 *
 * Note on the URI: on this machine Node's c-ares DNS resolver cannot read the
 * cluster's SRV record, so the Atlas "mongodb+srv://" URI can fail with
 * querySrv errors. server/.env therefore stores the equivalent *seedlist* URI
 * (hostname:port list + replicaSet) that the driver builds from SRV —
 * functionally identical, deterministically resolvable.
 */
import mongoose from 'mongoose'

export async function connectDb() {
  const uri = process.env.MONGODB_URI
  const dbName = process.env.DB_NAME || 'agrilink'

  await mongoose.connect(uri, {
    dbName,
    serverSelectionTimeoutMS: 15_000, // M0 free tier adds ~4s handshake latency
  })

  console.log(`✓ MongoDB connected → database "${mongoose.connection.name}"`)

  process.on('SIGINT', async () => {
    await mongoose.connection.close()
    process.exit(0)
  })
}
