<?php

call_user_func(function () {
    $GLOBALS['TYPO3_CONF_VARS']['SC_OPTIONS']['GLOBAL']['softRefParser']['tx_imagemap_softrefparser'] =
        \Evoweb\Imagemap\Database\SoftRefParser::class;

    /**
     * Page TypoScript for new content element wizards
     */
    \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addPageTSConfig(
        '<INCLUDE_TYPOSCRIPT: source="FILE:EXT:imagemap/Configuration/TSconfig/Wizards/NewContentElement.typoscript">'
    );

    // Register Icons
    /** @var \TYPO3\CMS\Core\Imaging\IconRegistry $iconRegistry */
    $iconRegistry = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance(\TYPO3\CMS\Core\Imaging\IconRegistry::class);
    $icons = [
        'content' => 'EXT:imagemap/Resources/Public/Icons/content-imagemap.svg',
        'zoomin' => 'EXT:imagemap/Resources/Public/Icons/search-plus.svg',
        'zoomout' => 'EXT:imagemap/Resources/Public/Icons/search-minus.svg',
        'circle' => 'EXT:imagemap/Resources/Public/Icons/draw-circle.svg',
        'poly' => 'EXT:imagemap/Resources/Public/Icons/draw-polygon.svg',
        'rect' => 'EXT:imagemap/Resources/Public/Icons/draw-square.svg',
    ];
    foreach ($icons as $identifier => $iconPath) {
        $iconRegistry->registerIcon(
            'extensions-imagemap-' . $identifier,
            \TYPO3\CMS\Core\Imaging\IconProvider\SvgIconProvider::class,
            ['source' => $iconPath]
        );
    }

    $GLOBALS['TYPO3_CONF_VARS']['SYS']['formEngine']['nodeRegistry'][1549738969] = [
        'nodeName' => 'imagemap',
        'priority' => '70',
        'class' => \Evoweb\Imagemap\Form\Element\ImagemapElement::class,
    ];
    $GLOBALS['TYPO3_CONF_VARS']['SYS']['formEngine']['nodeRegistry'][1549819420] = [
        'nodeName' => 'imagemapPopup',
        'priority' => '70',
        'class' => \Evoweb\Imagemap\Form\FieldControl\EditControl::class,
    ];
});
