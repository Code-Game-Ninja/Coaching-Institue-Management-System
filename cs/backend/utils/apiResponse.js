export const successResponse = (res, data, message = 'Success', status = 200) =>
  res.status(status).json({ success: true, message, data });

export const paginatedResponse = (res, items, pagination, message = 'Success') =>
  res.status(200).json({ success: true, message, data: { items, pagination } });

export const errorResponse = (res, message, status = 500, errors = []) =>
  res.status(status).json({ success: false, message, errors });
