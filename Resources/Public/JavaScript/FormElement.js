define(['jquery', 'jquery-ui/sortable', 'jquery-ui/draggable', 'TYPO3/CMS/Imagemap/JsGraphics'], function ($) {
  $(document).ready(function () {
    var $control = $('.imagemap-control:eq(0)'),
        $canvas = $control.find('.canvas'),
        canvasObject = new previewCanvasClass();
    canvasObject.init($canvas.attr('id'), $canvas.data('thumbnail-scale'));
    $canvas.data('existing-areas').forEach(function (area) {
      canvasObject.addArea(new window['area' + area.shape + 'Class'](), area.coords, area.alt, area.link, area.color, 0);
    });
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
          canvasObject.removeAreas();
          data.forEach(function (area) {
            canvasObject.addArea(new window['area' + area.shape + 'Class'](), area.coords, area.alt, area.link, area.color, 0);
          });
        }
      });
    });
  });
});
//# sourceMappingURL=FormElement.js.map
