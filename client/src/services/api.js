import { API_BASE } from '../constants'

const get = async (path) => {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export const api = {
  getAll:        ()         => get('/disasters'),
  getByCategory: (category) => get(`/disasters/category/${category}`),
  getByType:     (type)     => get(`/disasters/type/${type}`),
  getById:       (id)       => get(`/disasters/${id}`),
}
