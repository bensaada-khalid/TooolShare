const Reservation = require('../models/Reservation');
const Equipment = require('../models/Equipment');
const User = require('../models/User');
const HttpError = require('../utils/httpError');
const { escapeRegex, paginate, listResult } = require('../utils/helpers');

const POPULATE = [
  { path: 'user', select: 'firstName lastName email' },
  { path: 'equipment', select: 'name category' },
  { path: 'store', select: 'name city' },
];

const scopeFilter = (user) => {
  if (user.role === 'admin') return {};
  if (user.role === 'gestionnaire') return { store: user.store || null };
  return { user: user._id };
};

function assertAccess(user, r) {
  const ok =
    user.role === 'admin' ||
    (user.role === 'gestionnaire' && user.store && String(r.store._id || r.store) === String(user.store)) ||
    (user.role === 'user' && String(r.user._id || r.user) === String(user._id));
  if (!ok) throw new HttpError(403, 'Accès refusé à cette réservation');
}

async function loadReservation(req) {
  const r = await Reservation.findById(req.params.id);
  if (!r) throw new HttpError(404, 'Réservation introuvable');
  assertAccess(req.user, r);
  return r;
}

const respond = async (res, r, status = 200) => res.status(status).json(await r.populate(POPULATE));

exports.list = async (req, res) => {
  const p = paginate(req.query);
  const filter = scopeFilter(req.user);
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) {
    const rx = new RegExp(escapeRegex(req.query.search), 'i');
    const [eq, us] = await Promise.all([
      Equipment.find({ name: rx }).select('_id'),
      User.find({ $or: [{ firstName: rx }, { lastName: rx }, { email: rx }] }).select('_id'),
    ]);
    filter.$or = [{ equipment: { $in: eq.map((e) => e._id) } }, { user: { $in: us.map((u) => u._id) } }];
  }
  const [data, total] = await Promise.all([
    Reservation.find(filter).populate(POPULATE).sort('-startAt').skip(p.skip).limit(p.limit),
    Reservation.countDocuments(filter),
  ]);
  res.json(listResult(data, total, p));
};

exports.get = async (req, res) => {
  const r = await loadReservation(req);
  await respond(res, r);
};

exports.create = async (req, res) => {
  const equipment = await Equipment.findById(req.body.equipment);
  if (!equipment) throw new HttpError(404, 'Matériel introuvable');
  if (equipment.status !== 'disponible') throw new HttpError(409, "Ce matériel n'est pas disponible (maintenance)");
  const startAt = new Date(req.body.startAt);
  if (startAt.getTime() < Date.now() - 60 * 1000) throw new HttpError(400, 'La date de début doit être dans le futur');
  const endAt = new Date(startAt.getTime() + req.body.durationHours * 3600 * 1000);
  const conflict = await Reservation.findOne({
    equipment: equipment._id,
    status: { $in: ['confirmée', 'en cours'] },
    startAt: { $lt: endAt },
    endAt: { $gt: startAt },
  });
  if (conflict) throw new HttpError(409, 'Conflit : ce matériel est déjà réservé sur ce créneau');
  const r = await Reservation.create({
    user: req.user._id,
    equipment: equipment._id,
    store: equipment.store,
    startAt,
    durationHours: req.body.durationHours,
    endAt,
  });
  await respond(res, r, 201);
};

exports.cancel = async (req, res) => {
  const r = await loadReservation(req);
  if (req.user.role === 'gestionnaire') throw new HttpError(403, "Un gestionnaire ne peut pas annuler : utilisez la remise/retour");
  if (r.status !== 'confirmée') throw new HttpError(409, 'Seule une réservation confirmée peut être annulée');
  r.status = 'annulée';
  await r.save();
  await respond(res, r);
};

exports.handover = async (req, res) => {
  const r = await loadReservation(req);
  if (req.user.role === 'user') throw new HttpError(403, 'Accès refusé');
  if (r.status !== 'confirmée') throw new HttpError(409, 'Seule une réservation confirmée peut être remise');
  r.status = 'en cours';
  r.handedOverAt = new Date();
  await r.save();
  await respond(res, r);
};

exports.giveBack = async (req, res) => {
  const r = await loadReservation(req);
  if (req.user.role === 'user') throw new HttpError(403, 'Accès refusé');
  if (r.status !== 'en cours') throw new HttpError(409, 'Seule une réservation en cours peut être retournée');
  r.status = 'terminée';
  r.returnedAt = new Date();
  r.delayMinutes = req.body.delayMinutes;
  r.damageNotes = req.body.damageNotes;
  await r.save();
  await respond(res, r);
};
