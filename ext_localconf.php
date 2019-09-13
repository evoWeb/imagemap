<?php
defined('TYPO3_MODE') || die();

call_user_func(function () {
    $GLOBALS['TYPO3_CONF_VARS']['SC_OPTIONS']['GLOBAL']['softRefParser']['imagemap'] =
        \Evoweb\Imagemap\Database\SoftRefParser::class;

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
        'poly' => 'draw-polygon.svg',
        'rect' => 'draw-square.svg',
    ];
    foreach ($icons as $identifier => $iconPath) {
        $iconRegistry->registerIcon(
            'extensions-imagemap-' . $identifier,
            \TYPO3\CMS\Core\Imaging\IconProvider\SvgIconProvider::class,
            ['source' => 'EXT:imagemap/Resources/Public/Icons/' . $iconPath]
        );
    }

    /** @var \TYPO3\CMS\Extbase\SignalSlot\Dispatcher $signalSlotDispatcher */
    $signalSlotDispatcher = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance(
        \TYPO3\CMS\Extbase\SignalSlot\Dispatcher::class
    );
    $signalSlotDispatcher->connect(
        \TYPO3\CMS\Backend\Controller\EditDocumentController::class,
        'initAfter',
        \Evoweb\Imagemap\Hook\CssLoader::class,
        'addCssFile'
    );
    $GLOBALS['TYPO3_CONF_VARS']['SC_OPTIONS']['typo3/backend.php']['renderPreProcess'][] =
        \Evoweb\Imagemap\Hook\CssLoader::class . '->addCssFile';

    $GLOBALS['TYPO3_CONF_VARS']['SYS']['formEngine']['nodeRegistry'][1549738969] = [
        'nodeName' => 'imagemap',
        'priority' => 70,
        'class' => \Evoweb\Imagemap\Form\Element\ImagemapElement::class,
    ];
});
