'use strict';
(function () {
  var boxes = [];
  var selects = document.querySelectorAll('form select');
  var chipsDisplay = document.getElementById('display');

  generateChipsIntoDisplay();
  decorateSelects();

  chipsDisplay.addEventListener('click', _handleRemoveChip);
  chipsDisplay.addEventListener('remove-chip', _handleRemoveChip);

  clearMemory();

  /////////////////////////////


  function _handleRemoveChip(event) {
    if( ! event.target.classList.contains('chip-close') ) {
      return;
    }

    _removeChip( event.target.parentNode );
  }


  function _removeChip(chip) {
    if( ! chip || ! chip.parentNode ) {
      return;
    }

    chipsDisplay.removeChild( chip );
    var option = chip.optionOwner;
    option.selected = false;
    _setItemUnselected( option.itemChild );
    fillVisibleLabel(option.parentNode.selectBox);
  }


  function generateChipsIntoDisplay() {
    for(var i = 0, total = selects.length; i < total; i++ )
      createSelectedChips( selects[i] );
  }


  function createSelectedChips(select) {
    var selectedOptions = select.selectedOptions;

    for(var i = 0, total = selectedOptions.length; i < total; i++ )
      createChip( selectedOptions[i] );
  }


  function createChip(option) {
    var chip = option.chipChild || _newChip(option);
    chipsDisplay.appendChild(chip);
  }


  function _newChip(option) {
    var chip = document.createElement('span');
    chip.optionOwner = option;
    option.chipChild = chip;
    chip.className += ' chip';
    chip.innerHTML = option.innerHTML;
    createChipCloseIcon( chip );
    return chip;
  }


  function createChipCloseIcon( chip ) {
    var chipClose = document.createElement('span');
    chipClose.className += ' chip-close';
    chipClose.innerHTML = 'X';
    chip.appendChild( chipClose );
  }


  function decorateSelects() {
    if( ! selects.length ) {
      return;
    }

    document.body.addEventListener('click', hideOptions);
    document.body.addEventListener('click', showOptions);

    _decorate();
  }


  function hideOptions(event) {
    if( event.target.classList.contains('select-box-option') ) {
      return;
    }

    for( var i = 0; i < boxes.length; i++ ) {
      if( boxes[i].itemsBox ) {
        hideItemBox( boxes[i].itemsBox );
      }
    }
  }


  function showOptions(event) {
    var targetBox = event.target;

    if( targetBox.nodeName === 'LABEL' ) {
      targetBox = targetBox.parentNode;
    }

    if( ! targetBox.classList.contains('select-box') ) {
      return;
    }

    if( ! targetBox.itemsBox ) {
      createItemsBox(targetBox);
    }

    showItemBox( targetBox.itemsBox );
  }


  function _decorate() {
    for(var i = 0, total = selects.length; i < total; i++ ) {
      var select = selects[i];
      select.className += ' virtually-hidden';
      createSelectBox(select);
      _handleSelectFirstOption( select );
    }
  }


  function createSelectBox(select) {
    var box = _newSelectBox(select);
    fillVisibleLabel(box);
    boxes.push(box);
    select.parentNode.insertBefore(box, select);
    return box;
  }


  function _newSelectBox(select) {
    var box = document.createElement('div');
    box.className += 'select-box';
    box.owner = select;
    select.selectBox = box;
    createLabel(box);
    return box;
  }


  function createLabel(box) {
    var label = document.createElement('label');
    label.className += 'select-box-label';
    box.appendChild(label);
  }


  function _handleSelectFirstOption(select) {
    if( select.multiple ) {
      return;
    }

    select.insertBefore( document.createElement('option'), select.firstChild );
  }


  function createItemsBox(box) {
    var itemsBox = document.createElement('ul');
    itemsBox.className += 'select-box-options select-box-options-hidden';
    box.itemsBox = itemsBox;
    createItems(box, itemsBox);
    box.appendChild(itemsBox);
    box.addEventListener('click', _toggleItemSelection);
  }


  function createItems(box, itemsBox) {
    for( var i = 0, totalOptions = box.owner.length; i < totalOptions; i++) {
      itemsBox.appendChild( createItem(box.owner[i]) );
    }
  }


  function createItem(option) {
    var item = document.createElement('li');
    item.optionNode = option;
    option.itemChild = item;
    _setItemClasses(item, option);
    item.innerHTML = option.innerHTML;
    return item;
  }


  function _setItemClasses(item, option) {
    item.className += 'select-box-option';
    if( option.selected ) {
      item.className += ' select-box-option-selected';
    }
  }


  function _toggleItemSelection(event) {
    var item = event.target;
    if( ! item.classList.contains('select-box-option') ) {
      return;
    }

    _unselectAllItems(item);

    item.optionNode.selected ? _setItemUnselected(item) : _setItemSelected(item);
    fillVisibleLabel(item.optionNode.parentNode.selectBox);
    _hideNonMultiple( item );
  }


  function _unselectAllItems(clickedItem) {
    if( clickedItem.optionNode.parentNode.multiple ) {
      return;
    }

    var selectedOptions = clickedItem.optionNode.parentNode.selectedOptions;
    for( var i = 0, totalSelected = selectedOptions.length; i < totalSelected; i++ ) {
      _setItemUnselected( selectedOptions[i].itemChild );
    }

  }


  function _setItemUnselected(item) {
    if( ! item ) return;
    item.className = item.className.replace(/\s*select-box-option-selected\s*/, '');
    item.optionNode.selected = false;
    _removeChip( item.optionNode.chipChild );
  }


  function _setItemSelected(item) {
    item.className += ' select-box-option-selected';
    item.optionNode.selected = true;
    createChip(item.optionNode);
  }


  function fillVisibleLabel(box) {
    if( box.owner.selectedOptions.length > 1 ) {
      box.firstChild.innerHTML = box.owner.selectedOptions.length + ' items';
      return;
    }

    if( box.owner.selectedOptions.length == 1 ) {
      box.firstChild.innerHTML = box.owner.selectedOptions[0].innerHTML;
      return;
    }

    box.firstChild.innerHTML = '';
  }


  function _hideNonMultiple(item) {
    if( ! item.optionNode.parentNode.multiple ) {
      hideItemBox( item.optionNode.parentNode.selectBox.itemsBox );
    }
  }


  function showItemBox(itemBox) {
    itemBox.className = itemBox.className.replace(/\s*select-box-options-hidden\s*/ig, '');
  }


  function hideItemBox( itemsBox ) {
    itemsBox.className += ' select-box-options-hidden';
  }


  function clearMemory() {
    selects = null;
    createSelectedChips = null;
    generateChipsIntoDisplay = null;
    decorateSelects = null;
    _decorate = null;
    createSelectBox = null;
    _newSelectBox = null;
    createLabel = null;
    _handleSelectFirstOption = null;
    clearMemory = null;
  }

})();
