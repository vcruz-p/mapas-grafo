const API = 'http://192.168.83.128:3000'

export async function geocode(address: string) {
  const res = await fetch(`${API}/api/search?q=${encodeURIComponent(address)}`)
  const data = await res.json()

  if (!data.length) throw new Error('No encontrado')

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
  }
}

export async function route(from: any, to: any) {
  const res = await fetch(
    `${API}/api/route?from=${from.lng},${from.lat}&to=${to.lng},${to.lat}`
  )
  return res.json()
}