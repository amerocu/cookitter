# Cookitter

## Todo

### Important

- feat: re-render only changed elements
- feat: re-render should render before deleting the old items
- feat: make pages arrangement configurable

### Needed

- feat: visual clue of which are the cloned elements and which are the original one
- feat: show how much it took to render the elements

### Useful

- feat: copy multiple types of elements
- feat: copy layers and groups three
- feat: handle locked layers

  name: "Error"
  message: "Cannot modify a layer that is locked"
  number: 9024

## Done

- feat: lock the copied elements
- fix: the copy and the original element are in a group selection when the original one is selected
- feat: use tags to put ids on elements and track their life?

## Known Bugs

- if a copied item is selected, rerender deselects it
- re-render pollute the illustrator history
