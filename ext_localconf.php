<?php

call_user_func(function () {
    $GLOBALS['TYPO3_CONF_VARS']['SC_OPTIONS']['GLOBAL']['softRefParser']['tx_imagemap'] =
        \Evoweb\Imagemap\Service\SoftRefProc::class;

    /**
     * Page TypoScript for new content element wizards
     */
    \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addPageTSConfig(
        '<INCLUDE_TYPOSCRIPT: source="FILE:EXT:imagemap/Configuration/TSconfig/Wizards/NewContentElement.typoscript">'
    );

    // Register Icons
    /** @var \TYPO3\CMS\Core\Imaging\IconRegistry $iconRegistry */
    $iconRegistry = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance(\TYPO3\CMS\Core\Imaging\IconRegistry::class);
    $iconRegistry->registerIcon(
        'extensions-imagemap-content',
        \TYPO3\CMS\Core\Imaging\IconProvider\SvgIconProvider::class,
        ['source' => 'EXT:imagemap/Resources/Public/Icons/content-imagemap.svg']
    );
    $icons = [
        'add' => 'EXT:imagemap/Resources/Public/Icons/add.gif',
        'redo' => 'EXT:imagemap/Resources/Public/Icons/arrow_redo.png',
        'link' => 'EXT:imagemap/Resources/Public/Icons/link_edit.png',
        'zoomin' => 'EXT:imagemap/Resources/Public/Icons/magnifier_zoom_in.png',
        'zoomout' => 'EXT:imagemap/Resources/Public/Icons/magnifier_zoom_out.png',
    ];
    foreach ($icons as $identifier => $iconPath) {
        $iconRegistry->registerIcon(
            'extensions-imagemap-' . $identifier,
            \TYPO3\CMS\Core\Imaging\IconProvider\BitmapIconProvider::class,
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
        'class' => \Evoweb\Imagemap\Form\FieldControl\EditPopup::class,
    ];
});
