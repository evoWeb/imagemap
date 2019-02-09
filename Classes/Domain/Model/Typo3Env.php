<?php
namespace Evoweb\Imagemap\Domain\Model;

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

class Typo3Env
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
    public function initTSFE($pid = 1)
    {
        // initialize time tracker
        if (!is_object($GLOBALS['TT'])) {
            $GLOBALS['TT'] = GeneralUtility::makeInstance(\TYPO3\CMS\Core\TimeTracker\TimeTracker::class);
            $GLOBALS['TT']->start();
        }

        // initialize TSFE
        if (!is_object($GLOBALS['TSFE'])) {
            $GLOBALS['TSFE'] = GeneralUtility::makeInstance(
                \TYPO3\CMS\Frontend\Controller\TypoScriptFrontendController::class,
                $GLOBALS['TYPO3_CONF_VARS'],
                $pid,
                0
            );
            $GLOBALS['TSFE']->connectToDB();
            $GLOBALS['TSFE']->initFEuser();
            $GLOBALS['TSFE']->determineId();
            $GLOBALS['TSFE']->initTemplate();
            $GLOBALS['TSFE']->getConfigArray();
            $GLOBALS['TSFE']->newCObj();
        }
    }

    /**
     * Stack variable to store environment-settings
     */
    protected $envStack = [];

    /**
     * Store relevant data - just to be sure that nothing gets lost
     * during FE-simulation and it really sucks that this is needed
     *
     * @see popEnv()
     */
    public function pushEnv()
    {
        array_push(
            $this->envStack,
            ['workDir' => getcwd(), 'BE_USER' => $GLOBALS['BE_USER'], 'TCA' => $GLOBALS['TCA']]
        );
    }

    /**
     * prepares Frontend-like-Rendering
     * and it really sucks that this is needed
     *
     * @param string $backPath
     */
    public function setEnv($backPath = '')
    {
        if ($this->BE_USER == null) {
            $this->initMyBackendUser();
        }
        if ($backPath && is_dir($backPath)) {
            chdir($backPath);
        }
        $GLOBALS['BE_USER'] = $this->BE_USER;
    }

    /**
     * closes Frontend-like-Rendering
     * and it also really sucks that this is needed
     */
    public function popEnv()
    {
        if (is_array($this->envStack) && count($this->envStack)) {
            $env = array_pop($this->envStack);

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
        if (!is_array($this->envStack) || !count($this->envStack)) {
            return false;
        }
        if (!in_array($table, array_keys($GLOBALS['TCA']))) {
            return false;
        }
        $GLOBALS['TCA'][$table]['ctrl']['enablecolumns'] = $newConf;
        return true;
    }

    /**
     * lazyload the feBEUSER
     */
    protected function initMyBackendUser()
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
    public static function getBackPath()
    {
        return preg_replace(
            '/([^\/]+)\//',
            '..',
            str_replace([PATH_site, basename(PATH_thisScript)], ['', ''], PATH_thisScript)
        );
    }

    /**
     * Find extension BACKPATH,
     * used to include resources from an extension (usually this is only used with imagemap)
     * but it has a more generic functionality - YAGNI rules :P
     *
     * @param string $extKey - the source extension
     *
     * @return string the Extensions BACKPATH
     */
    public static function getExtBackPath($extKey = 'imagemap')
    {
        return self::getBackPath() . str_replace(
            PATH_site,
            '',
            \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::extPath($extKey)
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
    public static function getExtConfValue($confKey, $default)
    {
        $conf = unserialize($GLOBALS['TYPO3_CONF_VARS']['EXT']['extConf']['imagemap']);
        return is_array($conf) && isset($conf[$confKey]) ? $conf[$confKey] : $default;
    }
}
