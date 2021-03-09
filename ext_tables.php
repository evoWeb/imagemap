<?php

defined('TYPO3') or die();

call_user_func(function () {
    $GLOBALS['TBE_STYLES']['skins']['imagemap'] = [
        'name' => 'imagemap',
        'stylesheetDirectories' => [
            'css' => 'EXT:imagemap/Resources/Public/Stylesheets/',
        ],
    ];
});
