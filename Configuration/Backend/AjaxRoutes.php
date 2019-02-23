<?php

return [
    'imagemap_preview_rerender' => [
        'path' => '/imagemap/preview/rerender',
        'target' => \Evoweb\Imagemap\Controller\AjaxController::class . '::rerenderPreviewAction'
    ],

    'imagemap_browselink_url' => [
        'path' => '/imagemap/browselink/url',
        'target' => \Evoweb\Imagemap\Controller\AjaxController::class . '::browselinkUrlAction'
    ],
];
