define(['jquery', 'TYPO3/CMS/Imagemap/Imagemap', 'jquery-ui/sortable', 'jquery-ui/draggable'], function ($, Imagemap) {
  $(document).ready(function () {
    var configuration = window.imagemap,
        $image = $('#image img'),
        areaEditor = new Imagemap.AreaEditor('canvas', 'areasForm', {
      width: parseInt($image.css('width')),
      height: parseInt($image.css('height')),
      top: parseInt($image.css('height')) * -1
    });
    configuration.areaEditor = areaEditor;

    var initializeScaleFactor = function initializeScaleFactor() {
      var $magnify = $('#magnify'),
          $zoomOut = $magnify.find('.zoomout'),
          $zoomIn = $magnify.find('.zoomin'),
          scaleFactor = areaEditor.initializeScaling($magnify.data('scale-factor'));
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

    var initializeAreas = function initializeAreas(areas) {
      areas.forEach(function (configuration) {
        switch (configuration.shape) {
          case 'rect':
            areaEditor.addRect(configuration);
            break;

          case 'circle':
            areaEditor.addCircle(configuration);
            break;

          case 'poly':
            areaEditor.addPoly(configuration);
            break;
        }
      });
    };

    var initializeEvents = function initializeEvents() {
      $('#addRect').on('click', function () {
        areaEditor.addRect({
          color: '#ff0',
          coords: parseInt($image.css('width')) / 2 - 50 + ',' + (parseInt($image.css('height')) / 2 - 50) + ',' + (parseInt($image.css('width')) / 2 + 50) + ',' + (parseInt($image.css('height')) / 2 + 50)
        });
      });
      $('#addCircle').on('click', function () {
        areaEditor.addCircle({
          color: '#ff0',
          coords: parseInt($image.css('width')) / 2 - 50 + ',' + (parseInt($image.css('height')) / 2 - 50) + ',50'
        });
      });
      $('#addPoly').on('click', function () {
        areaEditor.addPoly({
          color: '#ff0',
          coords: parseInt($image.css('width')) / 2 + ',' + (parseInt($image.css('height')) / 2 - 50) + ',' + (parseInt($image.css('width')) / 2 + 50) + ',' + (parseInt($image.css('height')) / 2 + 50) + ',' + (parseInt($image.css('width')) / 2 - 50) + ',' + (parseInt($image.css('height')) / 2 + 50)
        });
      });
      $('#submit').on('click', function () {
        var $field = window.opener.$('input[name="' + configuration.itemName + '"]');
        $field.val('<map>' + areaEditor.persistanceXML() + '</map>').trigger('imagemap:changed');
        close();
      });
      $('#canvas').on('mousedown', areaEditor.mousedown.bind(areaEditor)).on('mouseup', areaEditor.mouseup.bind(areaEditor)).on('mousemove', areaEditor.mousemove.bind(areaEditor)).on('dblclick', areaEditor.dblclick.bind(areaEditor));
    };

    initializeScaleFactor();
    initializeAreas(configuration.existingAreas);
    initializeEvents();
  });
});
//# sourceMappingURL=Wizard.js.map
