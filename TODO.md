# Todo

## Important

## Needed

## Useful

- feat: nice logo
- feat: short demonstration video
- feat: settings page
- feat: persistent settings options
- feat: render portals in inverted order on odd pages, this will allow to see through multiple pages with only one render.
- feat: warning if artboard names are not consistent, like missing pages or missing sides.
- feat: display error on locked layer
  name: "Error"
  message: "Cannot modify a layer that is locked"
  number: 9024
- chore: benchmark differnt sections of the sync to understand why it is so slow.

- feat: move imageCapture check in the UI and eventually disable the portals feature
- feat: manage elements that span multiple artbook
- feat: copy multiple types of elements
- feat: if the user does an undo, pause the sync for 1 second
- feat: readd the autosync feature?
- feat: link to a help page

# Known Bugs

- if a copied item is selected, rerender deselects it
- re-render pollute the illustrator history
- portals reuse is not as effective as it seems, because Illustrator kind of recreate the PlacedItem when the image change
