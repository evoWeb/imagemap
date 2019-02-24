function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

define(['jquery', 'TYPO3/CMS/Imagemap/Imagemap', 'jquery-ui/sortable', 'jquery-ui/draggable'], function ($, Imagemap) {
  $(document).ready(function () {
    var configuration = window.imagemap,
        defaultAttributeSet = configuration.defaultAttributeset,
        areaEditor = new Imagemap.AreaEditor('canvas', 'picture', 'areaForms');
    configuration.areaEditor = areaEditor;

    var initializeScaleFactor = function initializeScaleFactor(scaleFactor) {
      var $zoomOut = $('> .zout', '#magnify'),
          $zoomIn = $('> .zin', '#magnify');
      scaleFactor = areaEditor.initializeScaling(scaleFactor);
      areaEditor.setScale(scaleFactor);

      if (scaleFactor < 1) {
        $zoomIn.show();
        $zoomOut.hide();
      } else {
        $zoomIn.hide();
        $zoomOut.hide();
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
        var _configuration$coords = configuration.coords.split(','),
            left = _configuration$coords.left,
            top = _configuration$coords.top,
            width = _configuration$coords.width,
            height = _configuration$coords.height;

        var area = new Imagemap[configuration.shape](_objectSpread({}, configuration, {
          originX: 'left',
          originY: 'top',
          top: top,
          left: left,
          width: width,
          height: height,
          fill: configuration.color
        }));
        areaEditor.add(area);
      });
    };

    var initializeEvents = function initializeEvents() {
      var addArea = function addArea(shape) {
        areaEditor.add(new Imagemap[shape](), '', '', '', '', 1, defaultAttributeSet);
      };

      $('#addRect').on('click', function () {
        addArea('Rect');
      });
      $('#addPoly').on('click', function () {
        addArea('Poly');
      });
      $('#addCircle').on('click', function () {
        addArea('Circle');
      });
      $('#submit').on('click', function () {
        var $field = window.opener.$('input[name="' + configuration.itemName + '"]');
        $field.val('<map>' + areaEditor.persistanceXML() + '</map>').trigger('imagemap:changed');
        close();
      });
      $('#canvas').on('mousedown', areaEditor.mousedown.bind(areaEditor)).on('mouseup', areaEditor.mouseup.bind(areaEditor)).on('mousemove', areaEditor.mousemove.bind(areaEditor)).on('dblclick', areaEditor.dblclick.bind(areaEditor));
    };

    initializeScaleFactor(configuration.scaleFactor);
    initializeAreas(configuration.existingAreas);
    initializeEvents();
  });
});
//# sourceMappingURL=Wizard.js.map
