<?php

$GLOBALS['TCA']['tt_content']['ctrl']['typeicon_classes']['imagemap'] = 'extensions-imagemap-content';

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTcaSelectItem(
    'tt_content',
    'CType',
    [
        'LLL:EXT:imagemap/Resources/Private/Language/locallang.xlf:imagemap.title',
        'imagemap',
        'extensions-imagemap-content',
    ]
);

$GLOBALS['TCA']['tt_content']['types']['imagemap'] = $GLOBALS['TCA']['tt_content']['types']['image'];
$GLOBALS['TCA']['tt_content']['types']['imagemap']['columnsOverrides'] = [
    'image' => [
        'config' => [
            'maxitems' => 1,
        ]
    ]
];

$tempColumns = [
    'tx_imagemap_areas' => [
        'label' => 'LLL:EXT:imagemap/Resources/Private/Language/locallang.xlf:tt_content.tx_imagemap_areas',
        'config' => [
            'type' => 'input',
            'renderType' => 'imagemap',
            'default' => '',
            'softref' => 'imagemap',
        ],
    ],
];
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTCAcolumns('tt_content', $tempColumns);

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addToAllTCAtypes(
    'tt_content',
    'tx_imagemap_areas',
    'imagemap',
    'after:image'
);

// CSH context sensitive help
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addLLrefForTCAdescr(
    'tt_content',
    'EXT:imagemap/Resources/Private/Language/locallang_csh_ttc.xlf'
);
