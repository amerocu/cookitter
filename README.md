# Cookitter

Cookitter from "cookie cutter" allows you to mirror elements from one artbook to another.

The use case is to aid the design of books with holes, holes needs to be mirrored from one side to the other side of the same page.

To allow Cookitter to work in your project some preparation is needed:

1. Create a layer called `cookitter` to hold your elements, or just run "Sync" for the first time!.

2. Artbooks that needs their elements to be mirrored should be name accordinly to this format: `CK-<page_number>-<side_lette>`.

   For example the first side of the first page should be called `CK-1-A` while the second side will be `CK-1-B`.

## Todo

### Important

### Needed

- feat: nice logo
- feat: short demonstration video
- fix: window size

### Useful

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

## Known Bugs

- if a copied item is selected, rerender deselects it
- re-render pollute the illustrator history
- portals reuse is not as effective as it seems, because Illustrator kind of recreate the PlacedItem when the image change
