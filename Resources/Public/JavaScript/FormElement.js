define(['jquery', 'jquery-ui/sortable', 'jquery-ui/draggable', 'TYPO3/CMS/Imagemap/JsGraphics'], function ($) {
  $(document).ready(function () {
    var $control = $('.imagemap-control:eq(0)'),
        $canvas = $control.find('.canvas'),
        areaEditor = new previewCanvasClass();
    areaEditor.init($canvas.attr('id'));

    var initializeScaleFactor = function initializeScaleFactor(scaleFactor) {
      areaEditor.setScale(scaleFactor);
    };

    var initializeAreas = function initializeAreas(areas) {
      areas.forEach(function (area) {
        areaEditor.addArea(new window['area' + area.shape + 'Class'](), area.coords, area.alt, area.link, area.color, 0);
      });
    };

    var initializeEvents = function initializeEvents() {
      $control.find('input').on('imagemap:changed', function () {
        var $field = $(this);
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
            areaEditor.removeAreas();
            data.forEach(function (area) {
              areaEditor.addArea(new window['area' + area.shape + 'Class'](), area.coords, area.alt, area.link, area.color, 0);
            });
          }
        });
      });
    };

    initializeScaleFactor($canvas.data('thumbnail-scale'));
    initializeAreas($canvas.data('existing-areas'));
    initializeEvents();
  });
});
//# sourceMappingURL=FormElement.js.map
