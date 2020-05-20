<?php

return [
    'imagemap_browselink_url' => [
        'path' => '/imagemap/browselink/url',
        'target' => \Evoweb\Imagemap\Controller\AjaxController::class . '::browselinkUrlAction'
    ],

    'wizard_imagemap_manipulation' => [
        'path' => '/imagemap/modal',
        'target' => \Evoweb\Imagemap\Controller\Wizard\ImagemapManipulationController::class . '::getWizardContent'
    ],
];
