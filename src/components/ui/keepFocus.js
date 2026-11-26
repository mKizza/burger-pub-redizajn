// Fokus ostaje u polju dok se klikće gumb forme: inače blur prikaže grešku,
// raspored se pomakne između mousedown i click, i klik promaši gumb.
export function keepFocusOnButtonPress(event) {
  if (event.button === 0 && event.target.closest("button")) {
    event.preventDefault();
  }
}
