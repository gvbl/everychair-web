import axios from 'axios'

interface MapsData {
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
}

interface MapsResponse {
  results: MapsData[]
}

interface TimeZoneResponse {
  timeZoneId: string
}

export const timeZoneForAddress = async (
  street: string,
  city?: string,
  state?: string,
  zip?: string
) => {
  const encodedAddress = encodeURIComponent(`${street} ${city} ${state} ${zip}`)
  const { data: mapsResponse } = await axios.post<MapsResponse>(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.GOOGLE_API_KEY}`
  )
  const firstResult =
    mapsResponse.results && mapsResponse.results.length > 0
      ? mapsResponse.results[0]
      : undefined
  if (
    firstResult?.geometry?.location?.lat &&
    firstResult?.geometry?.location?.lng
  ) {
    const { data: timeZoneData } = await axios.post<TimeZoneResponse>(
      `https://maps.googleapis.com/maps/api/timezone/json?location=${
        firstResult.geometry.location.lat
      },${firstResult.geometry.location.lng}&timestamp=${Math.round(
        Date.now() / 1000
      )}&key=${process.env.GOOGLE_API_KEY}`
    )
    if (timeZoneData.timeZoneId) {
      return timeZoneData.timeZoneId
    }
  }
  return
}
