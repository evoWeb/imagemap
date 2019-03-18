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

namespace Evoweb\Imagemap\Domain\Model;

use TYPO3\CMS\Core\Utility\GeneralUtility;

class Data
{
    /**
     * @var \Evoweb\Imagemap\Service\Environment
     */
    protected $environment;

    /**
     * @var array
     */
    protected $row;

    /**
     * @var array
     */
    protected $liveRow;

    /**
     * @var string
     */
    protected $table;

    /**
     * @var string
     */
    protected $mapField;

    /**
     * @var bool
     */
    protected $modified = false;

    /**
     * @var array
     */
    protected $fieldConf;

    /**
     * @var \Evoweb\Imagemap\Utility\Mapper
     */
    protected $mapper;

    /**
     * @var array
     */
    protected $map;

    /**
     * @param string $table
     * @param string $field
     * @param int $uid
     * @param string|null $currentValue
     */
    public function __construct(string $table, string $field, int $uid, $currentValue = '')
    {
        if (!in_array($table, array_keys($GLOBALS['TCA']))) {
            throw new \Exception('table (' . $table . ') not defined in TCA');
        }
        $this->table = $table;

        if (!in_array($field, array_keys($GLOBALS['TCA'][$table]['columns']))) {
            throw new \Exception('field (' . $field . ') unknown for table in TCA');
        }
        $this->mapField = $field;

        $this->mapper = GeneralUtility::makeInstance(\Evoweb\Imagemap\Utility\Mapper::class);

        $this->row = \TYPO3\CMS\Backend\Utility\BackendUtility::getRecordWSOL($table, $uid);
        if ($currentValue) {
            $this->setCurrentData($currentValue);
        }
        $this->liveRow = $this->row;
        \TYPO3\CMS\Backend\Utility\BackendUtility::fixVersioningPid($table, $this->liveRow);

        $value = $this->getFieldValue($field);
        $this->map = $value ? \json_decode($value, true) : [];
    }

    /**
     * @param string $field
     *
     * @return mixed
     */
    protected function getFieldValue(string $field)
    {
        if (!is_array($this->row) || !array_key_exists($field, $this->row)) {
            return null;
        }
        return $this->row[$field];
    }

    /**
     * Retrieves current image location
     * if multiple files are stored in the field only the first is recognized
     *
     * @param int $uid
     *
     * @return \TYPO3\CMS\Core\Resource\File|null
     */
    protected function getImageFile(int $uid)
    {
        $imageField = $this->determineImageFieldName();
        /** @var \TYPO3\CMS\Core\Resource\FileRepository $fileRepository */
        $fileRepository = GeneralUtility::makeInstance(\TYPO3\CMS\Core\Resource\FileRepository::class);
        /** @var \TYPO3\CMS\Core\Resource\FileReference $fileReference */
        $fileReference = current($fileRepository->findByRelation($this->table, $imageField, $uid));
        return $fileReference ? $fileReference->getOriginalFile() : null;
    }

    public function hasValidImageFile(): bool
    {
        $uid = $this->getFieldValue('uid');
        $image = $this->getImageFile((int)$uid);
        return $uid && $image !== null && $image->exists();
    }

    /**
     * Renders the image within a frontend context
     */
    public function getImage(): string
    {
        $conf = [
            'table' => $this->table,
            'select.' => [
                'uidInList' => $this->getLiveUid(),
                'pidInList' => $this->getLivePid(),
            ],
        ];

        $environment = $this->getEnvironment();
        $environment->initializeTSFE($this->getLivePid());
        // render like in FE with WS-preview etc...
        $environment->pushEnvironment();
        $environment->prepareEnvironment(PATH_site);
        $environment->resetEnableColumns('pages');
        $environment->resetEnableColumns($this->table);

        $result = $this->getTypoScriptFrontendController()->cObj->cObjGetSingle('CONTENT', $conf);

        $environment->popEnvironment();

        // extract the image
        $matches = [];
        if (!preg_match('/(<img[^>]+usemap="#[^"]+"[^>]*\/>)/', $result, $matches)) {
            return 'No image with usemap rendered in frontend. :(<br/>Error was:' . $environment->getLastError();
        }
        $result = str_replace('src="', 'src="' . $environment->getBackPath(), $matches[1]);
        return $result;
    }

    /**
     * Renders a thumbnail with preconfigured dimensions
     *
     * @param string $confKey
     * @param int $defaultMaxWH
     *
     * @return string
     */
    public function renderThumbnail(string $confKey, int $defaultMaxWH): string
    {
        $image = $this->getImage();
        $matches = [];
        $result = '';
        if (preg_match('/width="(\d+)" height="(\d+)"/', $image, $matches)) {
            $maxSize = $this->getEnvironment()->getExtConfValue($confKey, $defaultMaxWH);

            $width = intval($matches[1]);
            $height = intval($matches[2]);
            if (($width > $maxSize) && ($width >= $height)) {
                $height = ($maxSize / $width) * $height;
                $width = $maxSize;
            } elseif ($height > $maxSize) {
                $width = ($maxSize / $height) * $width;
                $height = $maxSize;
            }
            $result = preg_replace(
                '/width="(\d+)" height="(\d+)"/',
                'width="' . $width . '" height="' . $height . '"',
                $image
            );
        }
        return $result;
    }

    /**
     * Calculates the scale-factor which is required to scale down the imagemap to the thumbnail
     *
     * @param string $confKey
     * @param int $defaultMaxWH
     *
     * @return float
     */
    public function getThumbnailScale(string $confKey, int $defaultMaxWH): float
    {
        $image = $this->getImage();
        $matches = [];
        $result = 1;
        if (preg_match('/width="(\d+)" height="(\d+)"/', $image, $matches)) {
            $maxSize = $this->getEnvironment()->getExtConfValue($confKey, $defaultMaxWH);

            $width = intval($matches[1]);
            $height = intval($matches[2]);
            if (($width > $maxSize) && ($width >= $height)) {
                $result = ($maxSize / $width);
            } elseif ($height > $maxSize) {
                $result = ($maxSize / $height);
            }
        }
        return (float)$result;
    }

    protected function getLivePid(): int
    {
        return (int)($this->row['pid'] > 0 ? $this->row['pid'] : $this->liveRow['pid']);
    }

    protected function getLiveUid(): int
    {
        return (int)($GLOBALS['BE_USER']->workspace === 0 || $this->row['t3ver_oid'] == 0) ?
            $this->row['uid'] :
            $this->row['t3ver_oid'];
    }

    public function determineImageFieldName(): string
    {
        return $this->getFieldConf('config/userImage/field') ?? 'image';
    }

    public function getMap(): array
    {
        return $this->map;
    }

    public function setMap(string $map)
    {
        if (is_string($map)) {
            $map = \json_decode($map, true);
        }
        $this->map = $map;
    }

    public function getRow(): array
    {
        return $this->row;
    }

    /**
     * @param mixed $value
     */
    protected function setCurrentData($value)
    {
        $this->row[$this->mapField] = $value;
    }

    /**
     * @return mixed
     */
    public function getCurrentData()
    {
        return $this->row[$this->mapField];
    }

    public function setFieldConf(array $fieldConf)
    {
        $this->fieldConf = $fieldConf;
    }

    /**
     * @param string $path
     *
     * @return mixed
     */
    protected function getFieldConf(string $path = null)
    {
        if ($path === null) {
            return $this->fieldConf;
        }
        return \TYPO3\CMS\Core\Utility\ArrayUtility::getValueByPath($this->fieldConf, $path, '/');
    }

    public function getEnvironment(): \Evoweb\Imagemap\Service\Environment
    {
        if (!$this->environment) {
            $this->environment = GeneralUtility::makeInstance(\Evoweb\Imagemap\Service\Environment::class);
        }
        return $this->environment;
    }

    /**
     * @return \TYPO3\CMS\Frontend\Controller\TypoScriptFrontendController|null
     */
    protected function getTypoScriptFrontendController()
    {
        return $GLOBALS['TSFE'] ?? null;
    }
}
