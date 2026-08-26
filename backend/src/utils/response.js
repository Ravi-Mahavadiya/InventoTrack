export function success(res, message = "Success", data = {}, status = 200) {
  return res.status(status).json({ success: true, message, data });
}

export function error(res, message = "Something went wrong", status = 500) {
  return res.status(status).json({ success: false, message });
}
