<?php
namespace Evoweb\Imagemap\Service;

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

use TYPO3\CMS\Core\Utility\GeneralUtility;

class Environment
{
    /**
     * @var string
     */
    protected $lastError = '';

    /**
     * @var null
     */
    protected $BE_USER = null;

    /**
     * @var null
     */
    protected $BE_USER_GLOBAL = null;

    /**
     * Initialize TSFE so that the Frontend-Stuff can also be used in the Backend
     *
     * @param int $pid The pid if the page which is simulated
     */
    public function initializeTSFE($pid = 1)
    {
        if (!is_object($GLOBALS['TT'])) {
            $GLOBALS['TT'] = GeneralUtility::makeInstance(\TYPO3\CMS\Core\TimeTracker\TimeTracker::class);
            $GLOBALS['TT']->start();
        }

        if (!is_object($GLOBALS['TSFE'])) {
            /** @var \TYPO3\CMS\Frontend\Controller\TypoScriptFrontendController $controller */
            $controller = GeneralUtility::makeInstance(
                \TYPO3\CMS\Frontend\Controller\TypoScriptFrontendController::class,
                $GLOBALS['TYPO3_CONF_VARS'],
                $pid,
                0
            );
            $GLOBALS['TSFE'] = $controller;
            $controller->connectToDB();
            $controller->initFEuser();
            $controller->determineId();
            $controller->initTemplate();
            $controller->getConfigArray();
            $controller->newCObj();
        }
    }

    /**
     * Stack variable to store environment-settings
     */
    protected $environmentStack = [];

    /**
     * Store relevant data - just to be sure that nothing gets lost
     * during FE-simulation and it really sucks that this is needed
     *
     * @see popEnvironment()
     */
    public function pushEnvironment()
    {
        array_push(
            $this->environmentStack,
            ['workDir' => getcwd(), 'BE_USER' => $GLOBALS['BE_USER'], 'TCA' => $GLOBALS['TCA']]
        );
    }

    /**
     * prepares Frontend-like-Rendering
     * and it really sucks that this is needed
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
     * finish Frontend-like-Rendering
     * and it also really sucks that this is needed
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
     * reset/clear enableColumns - used to enable preview of access-restricted
     * elements - use only with stored Env!!!!!
     *
     * @param string $table
     * @param null $newConf
     *
     * @return bool
     */
    public function resetEnableColumns($table, $newConf = null)
    {
        if (!is_array($this->environmentStack) || !count($this->environmentStack)) {
            return false;
        }
        if (!in_array($table, array_keys($GLOBALS['TCA']))) {
            return false;
        }
        $GLOBALS['TCA'][$table]['ctrl']['enablecolumns'] = $newConf;
        return true;
    }

    /**
     * lazy load the FrontendBackendUserAuthentication
     */
    protected function initializeMyBackendUser()
    {
        $this->BE_USER = GeneralUtility::makeInstance(\TYPO3\CMS\Backend\FrontendBackendUserAuthentication::class);
        $this->BE_USER->OS = TYPO3_OS;
        $this->BE_USER->setBeUserByUid($GLOBALS['BE_USER']->user['uid']);
        $this->BE_USER->unpack_uc('');
        if ($this->BE_USER->user['uid']) {
            $this->BE_USER->fetchGroupData();
        } else {
            $this->BE_USER = null;
        }
    }

    /**
     * Enables external debugging ...
     */
    public function getLastError()
    {
        return $this->lastError;
    }

    /**
     * Recalculate BACKPATH for the current script-location,
     * since the global BACKPATH might not be available or might be wrong
     *
     * @return string the BACKPATH
     */
    public function getBackPath()
    {
        return preg_replace(
            '/([^\/]+)\//',
            '..',
            str_replace([PATH_site, basename(PATH_thisScript)], ['', ''], PATH_thisScript)
        );
    }

    /**
     * Get the value out of the Extension-Configuration determined by the submitted key
     *
     * @param string $confKey the extension configuration key
     * @param string $default when every the extension configuration doesn't contain a valid value
     *
     * @return mixed either the config value or the default value
     */
    public function getExtConfValue($confKey, $default)
    {
        $conf = unserialize($GLOBALS['TYPO3_CONF_VARS']['EXT']['extConf']['imagemap']);
        return is_array($conf) && isset($conf[$confKey]) ? $conf[$confKey] : $default;
    }
}
