define(['jquery', 'TYPO3/CMS/Imagemap/AreaEditor', 'jquery-ui/sortable', 'jquery-ui/draggable'], function ($, AreaEditor) {
  $(document).ready(function () {
    var configuration = window.imagemap,
        $image = $('.image img'),
        editorOptions = {
      canvas: {
        width: parseInt($image.css('width')),
        height: parseInt($image.css('height')),
        top: parseInt($image.css('height')) * -1
      }
    },
        areaEditor = new AreaEditor(editorOptions, 'canvas', '#areasForm');
    configuration.areaEditor = areaEditor;

    var initializeScaleFactor = function initializeScaleFactor() {
      var $magnify = $('#magnify'),
          $zoomOut = $magnify.find('.zoomout'),
          $zoomIn = $magnify.find('.zoomin'),
          scaleFactor = areaEditor.setScale($magnify.data('scale-factor'));
      areaEditor.setScale(scaleFactor);

      if (scaleFactor < 1) {
        $zoomIn.removeClass('hide');
        $zoomOut.addClass('hide');
      } else {
        $zoomIn.addClass('hide');
        $zoomOut.addClass('hide');
      }

      $zoomIn.click(function () {
        areaEditor.setScale(1);
        $zoomIn.hide();
        $zoomOut.show();
      });
      $zoomOut.click(function () {
        areaEditor.setScale(scaleFactor);
        $zoomOut.hide();
        $zoomIn.show();
      });
    };

    var initializeEvents = function initializeEvents() {
      $('#addRect').on('click', function () {
        areaEditor.addRect({
          coords: parseInt($image.css('width')) / 2 - 50 + ',' + (parseInt($image.css('height')) / 2 - 50) + ',' + (parseInt($image.css('width')) / 2 + 50) + ',' + (parseInt($image.css('height')) / 2 + 50)
        });
      });
      $('#addCircle').on('click', function () {
        areaEditor.addCircle({
          coords: parseInt($image.css('width')) / 2 - 50 + ',' + (parseInt($image.css('height')) / 2 - 50) + ',50'
        });
      });
      $('#addPoly').on('click', function () {
        areaEditor.addPoly({
          coords: parseInt($image.css('width')) / 2 + ',' + (parseInt($image.css('height')) / 2 - 50) + ',' + (parseInt($image.css('width')) / 2 + 50) + ',' + (parseInt($image.css('height')) / 2 + 50) + ',' + parseInt($image.css('width')) / 2 + ',' + (parseInt($image.css('height')) / 2 + 70) + ',' + (parseInt($image.css('width')) / 2 - 50) + ',' + (parseInt($image.css('height')) / 2 + 50)
        });
      });
      $('#submit').on('click', function () {
        window.opener.$('input[name="' + configuration.itemName + '"]').val(areaEditor.toAreaXml()).trigger('imagemap:changed');
        close();
      });
    };

    initializeScaleFactor();
    initializeEvents();
    areaEditor.initializeAreas(configuration.existingAreas);
  });
});
//# sourceMappingURL=Wizard.js.map
