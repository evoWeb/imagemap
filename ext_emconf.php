<?php

$EM_CONF['imagemap'] = [
    'title' => 'Imagemap Element',
    'description' => 'Provides an TYPO3 Wizard for interactive creation of a imagemap',
    'category' => 'be',
    'author' => 'Sebastian Fischer',
    'author_email' => 'typo3@evoweb.de',
    'author_company' => 'evoWeb',
    'modify_tables' => 'tt_content',
    'state' => 'stable',
    'version' => '1.0.0',
    'constraints' => [
        'depends' => [
            'typo3' => '9.5.0-10.4.99',
        ],
    ],
];
