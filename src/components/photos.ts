/** Unsplash photos used on the marketing pages. `photo(id, w)` returns a cropped, compressed URL. */
export const photo = (id: string, w = 800) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`

export const PHOTOS = {
  cake: { id: 'photo-1627247359162-4645d9f8543b', alt: 'A homemade birthday cake with berries and a gold topper' },
  yoga: { id: 'photo-1758797315487-b3b225dff7d8', alt: 'A yoga class stretching together on a garden lawn' },
  tutor: { id: 'photo-1522661067900-ab829854a57f', alt: 'A student writing sums on a classroom chalkboard' },
  henna: { id: 'photo-1762162089047-97e09435984d', alt: 'Bridal mehendi on hands with gold bangles and a silk sari' },
  tailor: { id: 'photo-1780504863007-44f229d4d33f', alt: 'A tailor at work on his sewing machine' },
  flowers: { id: 'photo-1779518088115-9dff01e01920', alt: 'A flower seller with a cart of fresh jasmine and roses' },
  shoes: { id: 'photo-1681657628355-bfdf41c08909', alt: 'A smiling shopkeeper in front of a wall of shoes' },
  shop: { id: 'photo-1759334928681-dc7ad674138e', alt: 'A young shop owner standing in his handicrafts store' },
  sana: { id: 'photo-1778550579010-cb0d00cd94e6', alt: 'A smiling shopkeeper behind the counter of her general store' },
  call: { id: 'photo-1706216710784-a9834756c87f', alt: 'A woman in a sari talking on her phone in the evening light' },
} as const

export type PhotoKey = keyof typeof PHOTOS
