const mongoose = require('mongoose');

const STATUSES = ['confirmée', 'en cours', 'terminée', 'annulée'];

const reservationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    startAt: { type: Date, required: true },
    durationHours: { type: Number, required: true, min: 1 },
    endAt: { type: Date, required: true },
    status: { type: String, enum: STATUSES, default: 'confirmée' },
    handedOverAt: Date,
    returnedAt: Date,
    delayMinutes: { type: Number, default: 0 },
    damageNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

reservationSchema.index({ equipment: 1, startAt: 1, endAt: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
module.exports.STATUSES = STATUSES;
