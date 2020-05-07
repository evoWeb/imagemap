define([
  'jquery',
  './AreaEditor'
], (jQuery, AreaEditor) => {
  'use strict';

  class FormElement {
    /**
     * @type {jQuery}
     */
    formElement = null;

    /**
     * @type {jQuery}
     */
    input = null;

    /**
     * @type {AreaEditor}
     */
    areaEditor = null;

    constructor(fieldSelector) {
      this.initializeFormElement(fieldSelector);
      this.initializeAreaEditor();
      this.initializeEvents();
      this.initializeAreas(fieldSelector);
    }

    initializeFormElement(fieldSelector) {
      this.formElement = jQuery(fieldSelector + '-canvas').eq(0);
    }

    initializeAreaEditor() {
      let image = this.formElement.find('.image'),
        editorOptions = {
          canvas: {
            width: parseInt(image.css('width')),
            height: parseInt(image.css('height')),
            top: parseInt(image.css('height')) * -1,
          },
        };

      this.areaEditor = new AreaEditor(editorOptions, this.formElement.find('#canvas')[0], '', window.document);
    }

    initializeEvents() {
      this.formElement.find('input[type=hidden]').on('imagemap:changed', this.fieldChangedHandler.bind(this));
    }

    initializeAreas(fieldSelector) {
      // @todo remove .areas to use all values
      let areas = jQuery(fieldSelector).eq(0).val();
      this.areaEditor.initializeAreas(JSON.parse(areas).areas);
    }

    fieldChangedHandler(event) {
      let $field = jQuery(event.currentTarget);
      jQuery.ajax({
        url: window.TYPO3.settings.ajaxUrls.imagemap_preview_rerender,
        method: 'POST',
        data: {
          P: {
            itemFormElName: $field.attr('name'),
            tableName: $field.data('tablename'),
            fieldName: $field.data('fieldname'),
            uid: $field.data('uid'),
            value: $field.val()
          }
        }
      }).done((data, textStatus) => {
        if (textStatus === 'success') {
          this.formElement.find('.modifiedState').css('display', 'block');
          this.areaEditor.removeAllAreas();
          this.areaEditor.initializeAreas(data.areas);
        }
      });
    }
  }

  return FormElement;
});
