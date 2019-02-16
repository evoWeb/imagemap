<?php

return [
    // @todo where is this used?
    'imagemap_tceform_ajax' => [
        'path' => '/imagemap/wizard',
        'target' => \Evoweb\Imagemap\Controller\AjaxController::class . '::tceformAjaxAction'
    ],
    'imagemap_browse_link' => [
        'path' => '/imagemap/browse/link',
        'target' => \Evoweb\Imagemap\Controller\AjaxController::class . '::browseLinkAction'
    ],
];
