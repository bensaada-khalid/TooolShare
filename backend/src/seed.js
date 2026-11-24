const connectDB = require('./config/db');
const User = require('./models/User');
const Store = require('./models/Store');
const Equipment = require('./models/Equipment');
const Reservation = require('./models/Reservation');

(async () => {
  await connectDB();
  await Promise.all([User.deleteMany(), Store.deleteMany(), Equipment.deleteMany(), Reservation.deleteMany()]);
  const [s1, s2] = await Store.create([
    { name: 'ToolShare Casablanca', city: 'Casablanca', address: '12 Bd Zerktouni' },
    { name: 'ToolShare Marrakech', city: 'Marrakech', address: '5 Av Mohammed V' },
  ]);
  await User.create({ firstName: 'Admin', lastName: 'Root', email: 'admin@toolshare.com', password: 'Admin123!', role: 'admin' });
  const m1 = await User.create({ firstName: 'Sara', lastName: 'Manager', email: 'manager@toolshare.com', password: 'Manager123!', role: 'gestionnaire', store: s1._id });
  const m2 = await User.create({ firstName: 'Omar', lastName: 'Gestion', email: 'manager2@toolshare.com', password: 'Manager123!', role: 'gestionnaire', store: s2._id });
  await User.create({ firstName: 'Khalid', lastName: 'Client', email: 'client@toolshare.com', password: 'Client123!', role: 'user' });
  await Store.updateOne({ _id: s1._id }, { manager: m1._id });
  await Store.updateOne({ _id: s2._id }, { manager: m2._id });
  const items = ['Perceuse Bosch', 'Meuleuse', 'Scie circulaire', 'Oscilloscope', 'Multimètre', 'Échafaudage'];
  await Equipment.create(
    items.flatMap((name, i) => [
      { name, category: i < 3 ? 'Outillage' : 'Mesure', description: `${name} professionnel`, store: s1._id },
      { name: `${name} Pro`, category: i < 3 ? 'Outillage' : 'Mesure', description: `${name} haute performance`, store: s2._id },
    ])
  );
  console.log('Seed done');
  process.exit(0);
})();
