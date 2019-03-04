var _this = this;

define(['jquery', 'TYPO3/CMS/Imagemap/AreaEditor'], function ($, AreaEditor) {
  $(document).ready(function () {
    var $control = $('.imagemap-control:eq(0)'),
        $image = $control.find('.image img'),
        $canvas = $control.find('.picture'),
        editorOptions = {
      canvas: {
        width: parseInt($image.css('width')),
        height: parseInt($image.css('height')),
        top: parseInt($image.css('height')) * -1
      }
    },
        areaEditor = new AreaEditor(editorOptions, 'canvas');

    var initializeScaleFactor = function initializeScaleFactor(scaleFactor) {
      areaEditor.setScale(scaleFactor);
    };

    var initializeEvents = function initializeEvents() {
      $control.find('input[type=hidden]').on('imagemap:changed', function () {
        var $field = $(_this);
        $.ajax({
          url: window.TYPO3.settings.ajaxUrls['imagemap_preview_rerender'],
          method: 'POST',
          data: {
            P: {
              itemFormElName: $field.attr('name'),
              tableName: 'tt_content',
              fieldName: 'tx_imagemap_links',
              uid: $field.attr('name').replace('data[tt_content][', '').replace('][tx_imagemap_links]', ''),
              value: $field.val()
            }
          }
        }).done(function (data, textStatus) {
          if (textStatus === 'success') {
            areaEditor.removeAllAreas();
            areaEditor.initializeAreas(data);
          }
        });
      });
    };

    initializeScaleFactor($canvas.data('thumbnail-scale'));
    initializeEvents();
    areaEditor.initializeAreas($canvas.data('existing-areas'));
  });
});
//# sourceMappingURL=FormElement.js.map
