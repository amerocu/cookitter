# Cookitter

Cookitter from "cookie cutter" allows you to mirror elements from one artbook to another.

The use case is to aid the design of books with holes, holes needs to be mirrored from one side to the other side of the same page.

To allow Cookitter to work in your project some preparation is needed:

1. Artbooks that needs their emelents to be mirrored should be name accordinly to this format: `CK-<page_number>-<side_lette>`.

   For example the first side of the first page should be called `CK-1-A` while the second side will be `CK-1-B`.

2. Create a layer called `cookie` to hold your elements.

3. Create a layer called `cutter` in which Cookiecutter will place all mirrored elements.

## Todo

### Important\

- feat: simplify UI.

### Needed

- feat: visual clue of which are the cloned elements and which are the original one
- feat: show how much it took to render the elements
- feat: if the user does an undo, pause the sync for 1 second.

### Useful

- feat: manage elements that span multiple artbook
- feat: copy multiple types of elements
- feat: copy layers and groups three
- feat: handle locked layers

  name: "Error"
  message: "Cannot modify a layer that is locked"
  number: 9024

## Known Bugs

- if a copied item is selected, rerender deselects it
- re-render pollute the illustrator history
