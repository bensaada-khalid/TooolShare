const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    category: { type: String, trim: true, default: 'Général' },
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    status: { type: String, enum: ['disponible', 'maintenance'], default: 'disponible' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Equipment', equipmentSchema);
