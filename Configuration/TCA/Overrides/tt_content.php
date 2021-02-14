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

$GLOBALS['TCA']['tt_content']['types']['imagemap'] = [
    'showitem' => '
        --div--;LLL:EXT:core/Resources/Private/Language/Form/locallang_tabs.xlf:general,
            --palette--;;general,
            --palette--;;headers,
        --div--;LLL:EXT:frontend/Resources/Private/Language/locallang_ttc.xlf:tabs.images,
            image,
            tx_imagemap_areas,
            --palette--;;mediaAdjustments,
        --div--;LLL:EXT:frontend/Resources/Private/Language/locallang_ttc.xlf:tabs.appearance,
            --palette--;;frames,
            --palette--;;appearanceLinks,
        --div--;LLL:EXT:core/Resources/Private/Language/Form/locallang_tabs.xlf:language,
            --palette--;;language,
        --div--;LLL:EXT:core/Resources/Private/Language/Form/locallang_tabs.xlf:access,
            --palette--;;hidden,
            --palette--;;access,
        --div--;LLL:EXT:core/Resources/Private/Language/Form/locallang_tabs.xlf:categories,
            categories,
        --div--;LLL:EXT:core/Resources/Private/Language/Form/locallang_tabs.xlf:notes,
            rowDescription,
        --div--;LLL:EXT:core/Resources/Private/Language/Form/locallang_tabs.xlf:extended,
    ',
    'columnsOverrides' => [
        'image' => [
            'config' => [
                'maxitems' => 1,
            ]
        ],
    ]
];

$temporaryColumns = [
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
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTCAcolumns('tt_content', $temporaryColumns);

// CSH context sensitive help
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addLLrefForTCAdescr(
    'tt_content',
    'EXT:imagemap/Resources/Private/Language/locallang_csh_ttc.xlf'
);
