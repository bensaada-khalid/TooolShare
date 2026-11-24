const Equipment = require('../models/Equipment');
const HttpError = require('../utils/httpError');
const { escapeRegex, paginate, listResult } = require('../utils/helpers');

function assertStoreAccess(user, storeId) {
  if (user.role === 'admin') return;
  if (user.role === 'gestionnaire' && user.store && String(user.store) === String(storeId)) return;
  throw new HttpError(403, "Vous ne pouvez gérer que le matériel de votre magasin");
}

exports.list = async (req, res) => {
  const p = paginate(req.query);
  const filter = {};
  if (req.query.store) filter.store = req.query.store;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) filter.name = new RegExp(escapeRegex(req.query.search), 'i');
  const [data, total] = await Promise.all([
    Equipment.find(filter).populate('store', 'name city').sort('name').skip(p.skip).limit(p.limit),
    Equipment.countDocuments(filter),
  ]);
  res.json(listResult(data, total, p));
};

exports.get = async (req, res) => {
  const item = await Equipment.findById(req.params.id).populate('store', 'name city');
  if (!item) throw new HttpError(404, 'Matériel introuvable');
  res.json(item);
};

exports.create = async (req, res) => {
  const storeId = req.user.role === 'admin' ? req.body.store : req.user.store;
  if (!storeId) throw new HttpError(400, 'Magasin requis');
  assertStoreAccess(req.user, storeId);
  res.status(201).json(await Equipment.create({ ...req.body, store: storeId }));
};

exports.update = async (req, res) => {
  const item = await Equipment.findById(req.params.id);
  if (!item) throw new HttpError(404, 'Matériel introuvable');
  assertStoreAccess(req.user, item.store);
  const { store: _ignored, ...fields } = req.body;
  Object.assign(item, fields);
  await item.save();
  res.json(item);
};
