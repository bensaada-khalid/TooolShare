const Reservation = require('../models/Reservation');
const Equipment = require('../models/Equipment');
const Store = require('../models/Store');
const User = require('../models/User');

const STATUSES = Reservation.STATUSES;

async function byStatus(filter) {
  const rows = await Reservation.aggregate([{ $match: filter }, { $group: { _id: '$status', count: { $sum: 1 } } }]);
  const out = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  rows.forEach((r) => {
    out[r._id] = r.count;
  });
  return out;
}

exports.get = async (req, res) => {
  if (req.user.role === 'admin') {
    const [stores, equipment, users, reservations] = await Promise.all([
      Store.countDocuments(),
      Equipment.countDocuments(),
      User.countDocuments(),
      byStatus({}),
    ]);
    return res.json({ stores, equipment, users, reservations });
  }
  const store = req.user.store;
  const [equipment, reservations, late] = await Promise.all([
    Equipment.countDocuments({ store }),
    byStatus({ store }),
    Reservation.countDocuments({ store, status: 'en cours', endAt: { $lt: new Date() } }),
  ]);
  res.json({ equipment, reservations, late });
};
