define(['jquery', 'jquery-ui/sortable', 'jquery-ui/draggable', 'TYPO3/CMS/Imagemap/JsGraphics'], function (jQuery) {
    window.imagemapwizard_valueChanged = function (fieldId) {
        jQuery.ajax({
            url: TYPO3.settings.ajaxUrls['imagemap_tceform'],
            global: false,
            type: 'POST',
            data: {
                context: 'tceform',
                P: {
                    itemFormElName: field.name,
                    tableName: 'tt_content',
                    fieldName: 'tx_imagemap_links',
                    uid: 'uid',
                    value: field.value
                }
            }
        }).done(function (data, textStatus) {
            if (textStatus === 'success') {
                jQuery(fieldId).html(data);
            }
        });
    };

    return new previewCanvasClass();
});
