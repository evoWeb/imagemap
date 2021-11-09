<?php

defined('TYPO3') or die();

call_user_func(function () {
    /**
     * Page TypoScript for new content element wizards
     */
    \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addPageTSConfig(
        '@import \'EXT:imagemap/Configuration/TSconfig/Wizards/NewContentElement.typoscript\''
    );

    // Register Icons
    /** @var \TYPO3\CMS\Core\Imaging\IconRegistry $iconRegistry */
    $iconRegistry = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance(\TYPO3\CMS\Core\Imaging\IconRegistry::class);
    $icons = [
        'content' => 'content-imagemap.svg',
        'circle' => 'draw-circle.svg',
        'polygon' => 'draw-polygon.svg',
        'rectangle' => 'draw-square.svg',
    ];
    foreach ($icons as $identifier => $iconPath) {
        $iconRegistry->registerIcon(
            'extensions-imagemap-' . $identifier,
            \TYPO3\CMS\Core\Imaging\IconProvider\SvgIconProvider::class,
            ['source' => 'EXT:imagemap/Resources/Public/Icons/' . $iconPath]
        );
    }

    $GLOBALS['TYPO3_CONF_VARS']['SYS']['formEngine']['nodeRegistry'][1549738969] = [
        'nodeName' => 'imagemap',
        'priority' => 70,
        'class' => \Evoweb\Imagemap\Form\Element\ImagemapElement::class,
    ];

    $GLOBALS['TYPO3_CONF_VARS']['SC_OPTIONS']['typo3/backend.php']['constructPostProcess'][] =
        \Evoweb\Imagemap\Hooks\BackendHook::class . '->addPageRendererResources';
});
