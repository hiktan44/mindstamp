// Native <video> ve YouTube/Vimeo embed oynatıcılarının ortak kontrol arayüzü.
// Etkileşim motoru (interactive-player, editor-layout) oynatmayı bu handle
// üzerinden yönetir; böylece kaynak ister dosya ister YouTube/Vimeo olsun
// duraklat/oynat/ileri sar/zaman okuma aynı şekilde çalışır.
export interface PlayerHandle {
  play: () => void
  pause: () => void
  seek: (time: number) => void
  getCurrentTime: () => number
  getDuration: () => number
}
