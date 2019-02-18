<?php

return [
    // @todo where is this used?
    'imagemap_tceform' => [
        'path' => '/imagemap/wizard',
        'target' => \Evoweb\Imagemap\Controller\AjaxController::class . '::tceformAction'
    ],
    'imagemap_browse_link' => [
        'path' => '/imagemap/browse/link',
        'target' => \Evoweb\Imagemap\Controller\AjaxController::class . '::browseLinkAction'
    ],
];
