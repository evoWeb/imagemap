<?php

$GLOBALS['TCA']['tt_content']['ctrl']['typeicon_classes']['imagemap'] = 'extensions-imagemap-content';

$GLOBALS['TCA']['tt_content']['columns']['CType']['config']['items'][] = [
    0 => 'LLL:EXT:imagemap/Resources/Private/Language/locallang.xlf:imagemap.title',
    1 => 'imagemap'
];

$tempColumns = [
    'tx_imagemap_links' => [
        'label' => 'LLL:EXT:imagemap/Resources/Private/Language/locallang.xlf:tt_content.tx_imagemap_links',
        'config' => [
            'type' => 'input',
            'renderType' => 'imagemap',
            'userImage' => [
                'field' => 'image'
            ],
            'fieldControl' => [
                'editControl' => [
                    'renderType' => 'imagemapPopup',
                    'options' => [
                        'title' => 'ImageMap',
                        'windowOpenParameters' => 'height=700,width=780,status=0,menubar=0,scrollbars=1',
                    ]
                ],
            ],
            'softref' => 'tx_imagemap_softrefparser',
        ],
    ],
];
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTCAcolumns('tt_content', $tempColumns);

$GLOBALS['TCA']['tt_content']['types']['imagemap'] = $GLOBALS['TCA']['tt_content']['types']['image'];
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addToAllTCAtypes(
    'tt_content',
    'tx_imagemap_links',
    'imagemap',
    'after:image'
);

// CSH context sensitive help
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addLLrefForTCAdescr(
    'tt_content',
    'EXT:imagemap/Resources/Private/Language/locallang_csh_ttc.xlf'
);
