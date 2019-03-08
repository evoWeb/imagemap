function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

define(['jquery', 'TYPO3/CMS/Backend/Icons', 'TYPO3/CMS/Backend/Modal', './AreaEditor', 'TYPO3/CMS/Backend/FormEngineValidation'], function ($, Icons, Modal, AreaEditor, FormEngineValidation) {
  'use strict';

  var EditControl =
  /*#__PURE__*/
  function () {
    /**
     * @type {jQuery}
     */

    /**
     * @type {jQuery}
     */

    /**
     * @type {AreaEditor}
     */

    /**
     * @type {jQuery}
     */

    /**
     * @type {jQuery}
     */

    /**
     * @type {jQuery}
     */

    /**
     * @type {jQuery}
     */

    /**
     * @type {jQuery}
     */

    /**
     * @type {jQuery}
     */

    /**
     * @type {object}
     */
    function EditControl() {
      _classCallCheck(this, EditControl);

      _defineProperty(this, "trigger", null);

      _defineProperty(this, "currentModal", null);

      _defineProperty(this, "areaEditor", null);

      _defineProperty(this, "image", null);

      _defineProperty(this, "buttonAddRect", null);

      _defineProperty(this, "buttonAddCircle", null);

      _defineProperty(this, "buttonAddPoly", null);

      _defineProperty(this, "buttonDismiss", null);

      _defineProperty(this, "buttonSave", null);

      _defineProperty(this, "configuration", null);

      this.initializeTrigger();
    }

    _createClass(EditControl, [{
      key: "initializeTrigger",
      value: function initializeTrigger() {
        $('.t3js-area-wizard-trigger').off('click').on('click', this.triggerHandler.bind(this));
      }
    }, {
      key: "triggerHandler",
      value: function triggerHandler(event) {
        event.preventDefault();
        this.trigger = $(event.currentTarget);
        this.show();
      }
    }, {
      key: "show",
      value: function show() {
        var _this = this;

        var modalTitle = this.trigger.data('modalTitle'),
            buttonAddrectText = this.trigger.data('buttonAddrectText'),
            buttonAddcircleText = this.trigger.data('buttonAddcircleText'),
            buttonAddpolyText = this.trigger.data('buttonAddpolyText'),
            buttonDismissText = this.trigger.data('buttonDismissText'),
            buttonSaveText = this.trigger.data('buttonSaveText'),
            wizardUri = this.trigger.data('url'),
            payload = this.trigger.data('payload'),
            initWizardModal = this.initialize.bind(this);
        Icons.getIcon('spinner-circle', Icons.sizes.default, null, null, Icons.markupIdentifiers.inline).done(function (icon) {
          /**
           * Open modal with areas to edit
           */
          _this.currentModal = Modal.advanced({
            additionalCssClasses: ['modal-area-wizard'],
            buttons: [{
              btnClass: 'btn-default pull-left button-add-rect',
              icon: 'extensions-imagemap-rect',
              text: buttonAddrectText
            }, {
              btnClass: 'btn-default pull-left button-add-circle',
              icon: 'extensions-imagemap-circle',
              text: buttonAddcircleText
            }, {
              btnClass: 'btn-default pull-left button-add-poly',
              icon: 'extensions-imagemap-poly',
              text: buttonAddpolyText
            }, {
              btnClass: 'btn-default button-dismiss',
              icon: 'actions-close',
              text: buttonDismissText
            }, {
              btnClass: 'btn-primary button-save',
              icon: 'actions-document-save',
              text: buttonSaveText
            }],
            callback: function callback(currentModal) {
              $.post({
                url: wizardUri,
                data: payload
              }).done(function (response) {
                currentModal.find('.t3js-modal-body').html(response).addClass('area-editor');
                initWizardModal();
              });
            },
            content: $('<div class="modal-loading">').append(icon),
            size: Modal.sizes.full,
            style: Modal.styles.dark,
            title: modalTitle
          });

          _this.currentModal.on('hide.bs.modal', function () {
            _this.destroy();
          }); // do not dismiss the modal when clicking beside it to avoid data loss


          _this.currentModal.data('bs.modal').options.backdrop = 'static';
        });
      }
    }, {
      key: "initialize",
      value: function initialize() {
        var _this2 = this;

        this.image = this.currentModal.find('.image img');
        this.configuration = this.currentModal.find('.picture').data('configuration');
        this.buttonAddRect = this.currentModal.find('.button-add-rect').off('click').on('click', this.buttonAddRectHandler.bind(this));
        this.buttonAddCircle = this.currentModal.find('.button-add-circle').off('click').on('click', this.buttonAddCircleHandler.bind(this));
        this.buttonAddPoly = this.currentModal.find('.button-add-poly').off('click').on('click', this.buttonAddPolyHandler.bind(this));
        this.buttonDismiss = this.currentModal.find('.button-dismiss').off('click').on('click', this.buttonDismissHandler.bind(this));
        this.buttonSave = this.currentModal.find('.button-save').off('click').on('click', this.buttonSaveHandler.bind(this));
        this.image.on('load', function () {
          setTimeout(_this2.initializeArea.bind(_this2), 100);
        });
      }
    }, {
      key: "initializeArea",
      value: function initializeArea() {
        var _this3 = this;

        var scaleFactor = this.currentModal.find('.picture').data('scale-factor'),
            width = parseInt(this.image.css('width')),
            height = parseInt(this.image.css('height')),
            editorOptions = {
          canvas: {
            width: width,
            height: height,
            top: height * -1
          },
          browseLinkUrlAjaxUrl: window.TYPO3.settings.ajaxUrls.imagemap_browselink_url,
          browseLink: this.configuration.browseLink
        };
        var canvas = this.currentModal.find('#modal-canvas')[0];
        this.areaEditor = new AreaEditor(editorOptions, canvas, '#areasForm', this.currentModal[0]);
        window.imagemap = {
          areaEditor: this.areaEditor
        };

        (function (scaleFactor) {
          _this3.areaEditor.setScale(scaleFactor);

          var that = _this3,
              $magnify = $('#magnify'),
              $zoomOut = $magnify.find('.zoomout'),
              $zoomIn = $magnify.find('.zoomin');

          if (scaleFactor < 1) {
            $zoomIn.removeClass('hide');
            $zoomIn.click(function () {
              that.areaEditor.setScale(1);
              $zoomIn.hide();
              $zoomOut.show();
            });
            $zoomOut.click(function () {
              that.areaEditor.setScale(scaleFactor);
              $zoomOut.hide();
              $zoomIn.show();
            });
          }
        })(scaleFactor);

        this.areaEditor.initializeAreas(this.configuration.existingAreas);
      }
    }, {
      key: "destroy",
      value: function destroy() {
        if (this.currentModal) {
          this.currentModal = null;
          this.areaEditor = null;
        }
      }
    }, {
      key: "buttonAddRectHandler",
      value: function buttonAddRectHandler(event) {
        event.stopPropagation();
        event.preventDefault();
        var width = parseInt(this.image.css('width')),
            height = parseInt(this.image.css('height'));
        this.areaEditor.addRect({
          coords: width / 2 - 50 + ',' + (height / 2 - 50) + ',' + (width / 2 + 50) + ',' + (height / 2 + 50)
        });
      }
    }, {
      key: "buttonAddCircleHandler",
      value: function buttonAddCircleHandler(event) {
        event.stopPropagation();
        event.preventDefault();
        var width = parseInt(this.image.css('width')),
            height = parseInt(this.image.css('height'));
        this.areaEditor.addCircle({
          coords: width / 2 + ',' + height / 2 + ',50'
        });
      }
    }, {
      key: "buttonAddPolyHandler",
      value: function buttonAddPolyHandler(event) {
        event.stopPropagation();
        event.preventDefault();
        var width = parseInt(this.image.css('width')),
            height = parseInt(this.image.css('height'));
        this.areaEditor.addPoly({
          coords: width / 2 + ',' + (height / 2 - 50) + ',' + (width / 2 + 50) + ',' + (height / 2 + 50) + ',' + width / 2 + ',' + (height / 2 + 70) + ',' + (width / 2 - 50) + ',' + (height / 2 + 50)
        });
      }
    }, {
      key: "buttonDismissHandler",
      value: function buttonDismissHandler(event) {
        event.stopPropagation();
        event.preventDefault();
        this.currentModal.modal('hide');
      }
    }, {
      key: "buttonSaveHandler",
      value: function buttonSaveHandler(event) {
        event.stopPropagation();
        event.preventDefault();
        var hiddenField = $("input[name=\"".concat(this.configuration.itemName, "\"]"));
        hiddenField.val(this.areaEditor.toAreaXml()).trigger('imagemap:changed');
        FormEngineValidation.markFieldAsChanged(hiddenField);
        this.currentModal.modal('hide');
      }
    }]);

    return EditControl;
  }();

  return EditControl;
});
//# sourceMappingURL=EditControl.js.map
