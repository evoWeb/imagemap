<?php

defined('TYPO3') or die();

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addStaticFile(
    'imagemap',
    'Configuration/TypoScript/',
    'Imagemap Element'
);
