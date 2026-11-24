const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function paginate(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

const listResult = (data, total, { page, limit }) => ({
  data,
  total,
  page,
  pages: Math.max(Math.ceil(total / limit), 1),
});

module.exports = { escapeRegex, paginate, listResult };
