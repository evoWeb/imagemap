<?php
declare(strict_types = 1);

/**
 * This file is developed by evoWeb.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 */

namespace Evoweb\Imagemap\Service;

use TYPO3\CMS\Core\Utility\GeneralUtility;

class Environment
{
    /**
     * @var string
     */
    protected $lastError = '';

    /**
     * @var \TYPO3\CMS\Backend\FrontendBackendUserAuthentication
     */
    protected $BE_USER;

    /**
     * @var null
     */
    protected $BE_USER_GLOBAL = null;

    /**
     * Stack variable to store environment-settings
     *
     * @var array
     */
    protected $environmentStack = [];

    /**
     * Initialize TSFE so that the Frontend-Stuff can also be used in the Backend
     *
     * @param int $pid The pid if the page which is simulated
     */
    public function initializeTSFE(int $pid = 1)
    {
        if (!is_object($GLOBALS['TSFE'])) {
            /** @var \TYPO3\CMS\Frontend\Controller\TypoScriptFrontendController $controller */
            $controller = GeneralUtility::makeInstance(
                \TYPO3\CMS\Frontend\Controller\TypoScriptFrontendController::class,
                $GLOBALS['TYPO3_CONF_VARS'],
                $pid,
                0
            );
            $GLOBALS['TSFE'] = $controller;
            $controller->determineId();
            $controller->getConfigArray();
            $controller->newCObj();
        }
    }

    protected function initializeMyBackendUser()
    {
        $this->BE_USER = GeneralUtility::makeInstance(\TYPO3\CMS\Backend\FrontendBackendUserAuthentication::class);
        $this->BE_USER->setBeUserByUid($GLOBALS['BE_USER']->user['uid']);
        $this->BE_USER->unpack_uc('');
        if ($this->BE_USER->user['uid']) {
            $this->BE_USER->fetchGroupData();
        } else {
            $this->BE_USER = null;
        }
    }

    /**
     * Store relevant data
     * Just to be sure that nothing gets lost during FE-simulation
     */
    public function pushEnvironment()
    {
        array_push(
            $this->environmentStack,
            ['workDir' => getcwd(), 'BE_USER' => $GLOBALS['BE_USER'], 'TCA' => $GLOBALS['TCA']]
        );
    }

    /**
     * Prepares Frontend-like-Rendering
     *
     * @param string $backPath
     */
    public function prepareEnvironment($backPath = '')
    {
        if ($this->BE_USER == null) {
            $this->initializeMyBackendUser();
        }
        if ($backPath && is_dir($backPath)) {
            chdir($backPath);
        }
        $GLOBALS['BE_USER'] = $this->BE_USER;
    }

    /**
     * Restore environment
     */
    public function popEnvironment()
    {
        if (is_array($this->environmentStack) && count($this->environmentStack)) {
            $env = array_pop($this->environmentStack);

            if ($env['TCA'] && is_array($env['TCA'])) {
                $GLOBALS['TCA'] = $env['TCA'];
            }

            if ($env['BE_USER'] && is_object($env['BE_USER'])) {
                $GLOBALS['BE_USER'] = $env['BE_USER'];
            }

            if ($env['workDir'] && is_dir($env['workDir'])) {
                chdir($env['workDir']);
            }
        }
    }

    /**
     * Reset/clear enableColumns
     * used to enable preview of access-restricted elements
     *
     * @param string $table
     * @param array $enableColumns
     */
    public function resetEnableColumns(string $table, array $enableColumns = [])
    {
        if (is_array($this->environmentStack)
            && count($this->environmentStack)
            && isset($GLOBALS['TCA'][$table])
        ) {
            $GLOBALS['TCA'][$table]['ctrl']['enablecolumns'] = $enableColumns;
        }
    }

    /**
     * Get last error
     *
     * @return string
     */
    public function getLastError(): string
    {
        return $this->lastError;
    }

    /**
     * Recalculate BACKPATH for the current script-location,
     * since the global BACKPATH might not be available or might be wrong
     *
     * @return string the BACKPATH
     */
    public function getBackPath(): string
    {
        // @todo replace this
        return preg_replace(
            '@([^/]+)/@',
            '..',
            str_replace(
                [
                    \TYPO3\CMS\Core\Core\Environment::getPublicPath() . '/',
                    basename(\TYPO3\CMS\Core\Core\Environment::getCurrentScript())
                ],
                ['', ''],
                \TYPO3\CMS\Core\Core\Environment::getCurrentScript()
            )
        );
    }

    /**
     * Get the value out of the Extension-Configuration determined by the submitted key
     *
     * @param string $confKey the extension configuration key
     * @param mixed $default when every the extension configuration doesn't contain a valid value
     *
     * @return mixed either the config value or the default value
     */
    public function getExtConfValue(string $confKey, $default)
    {
        $configuration = $GLOBALS['TYPO3_CONF_VARS']['EXTENSIONS']['imagemap'] ?? [];
        return isset($configuration[$confKey]) ? $configuration[$confKey] : $default;
    }
}
