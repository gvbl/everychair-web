export const mdMaxWidth = '(max-width: 767px)'

export const isSmallScreen = () => {
  return window.matchMedia(mdMaxWidth).matches
}
