define(['jquery', './AreaEditor'], function ($, AreaEditor) {
  $(document).ready(function () {
    var $control = $('.imagemap-control:eq(0)'),
        $image = $control.find('.image img'),
        $canvas = $control.find('.picture'),
        editorOptions = {
      canvas: {
        width: parseInt($image.css('width')),
        height: parseInt($image.css('height')),
        top: parseInt($image.css('height')) * -1
      },
      previewRerenderAjaxUrl: window.TYPO3.settings.ajaxUrls.imagemap_preview_rerender
    },
        canvasContainer = $control.find('#canvas')[0],
        areaEditor = new AreaEditor(editorOptions, canvasContainer, '', window.document);

    var initializeScaleFactor = function initializeScaleFactor(scaleFactor) {
      areaEditor.setScale(scaleFactor);
    };

    var initializeEvents = function initializeEvents(editorOptions) {
      $control.find('input[type=hidden]').on('imagemap:changed', function (event) {
        var $field = $(event.currentTarget);
        $.ajax({
          url: editorOptions.previewRerenderAjaxUrl,
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
    initializeEvents(editorOptions);
    areaEditor.initializeAreas($canvas.data('existing-areas'));
  });
});
//# sourceMappingURL=FormElement.js.map
