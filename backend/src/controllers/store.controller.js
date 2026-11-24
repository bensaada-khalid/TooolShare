const Store = require('../models/Store');
const User = require('../models/User');
const HttpError = require('../utils/httpError');
const { escapeRegex, paginate, listResult } = require('../utils/helpers');

exports.list = async (req, res) => {
  const p = paginate(req.query);
  const filter = {};
  if (req.query.search) {
    const rx = new RegExp(escapeRegex(req.query.search), 'i');
    filter.$or = [{ name: rx }, { city: rx }];
  }
  const [data, total] = await Promise.all([
    Store.find(filter).populate('manager', 'firstName lastName email').sort('name').skip(p.skip).limit(p.limit),
    Store.countDocuments(filter),
  ]);
  res.json(listResult(data, total, p));
};

exports.get = async (req, res) => {
  const store = await Store.findById(req.params.id).populate('manager', 'firstName lastName email');
  if (!store) throw new HttpError(404, 'Magasin introuvable');
  res.json(store);
};

exports.create = async (req, res) => res.status(201).json(await Store.create(req.body));

exports.update = async (req, res) => {
  const store = await Store.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!store) throw new HttpError(404, 'Magasin introuvable');
  res.json(store);
};

exports.assignManager = async (req, res) => {
  const store = await Store.findById(req.params.id);
  if (!store) throw new HttpError(404, 'Magasin introuvable');
  const manager = await User.findById(req.body.managerId);
  if (!manager || manager.role !== 'gestionnaire') throw new HttpError(400, "L'utilisateur doit avoir le rôle gestionnaire");
  if (store.manager) await User.updateOne({ _id: store.manager }, { store: null });
  await Store.updateMany({ manager: manager._id }, { manager: null });
  manager.store = store._id;
  await manager.save();
  store.manager = manager._id;
  await store.save();
  res.json(await store.populate('manager', 'firstName lastName email'));
};
