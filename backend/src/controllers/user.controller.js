const User = require('../models/User');
const Store = require('../models/Store');
const HttpError = require('../utils/httpError');
const { escapeRegex, paginate, listResult } = require('../utils/helpers');

exports.list = async (req, res) => {
  const p = paginate(req.query);
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) {
    const rx = new RegExp(escapeRegex(req.query.search), 'i');
    filter.$or = [{ firstName: rx }, { lastName: rx }, { email: rx }];
  }
  const [data, total] = await Promise.all([
    User.find(filter).populate('store', 'name').sort('lastName').skip(p.skip).limit(p.limit),
    User.countDocuments(filter),
  ]);
  res.json(listResult(data, total, p));
};

exports.create = async (req, res) => {
  const { store, ...rest } = req.body;
  const user = await User.create({ ...rest, store: rest.role === 'gestionnaire' && store ? store : null });
  if (user.store) await Store.updateOne({ _id: user.store }, { manager: user._id });
  res.status(201).json(user);
};

exports.get = async (req, res) => {
  const user = await User.findById(req.params.id).populate('store', 'name');
  if (!user) throw new HttpError(404, 'Utilisateur introuvable');
  res.json(user);
};
