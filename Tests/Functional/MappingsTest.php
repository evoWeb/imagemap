<?php

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

namespace Evoweb\Imagemap\Tests;

class MappingsTest extends \TYPO3\TestingFramework\Core\Functional\FunctionalTestCase
{
    /**
     * @var array
     */
    protected $testExtensionsToLoad = ['typo3conf/ext/imagemap'];

    /**
     * @var \Evoweb\Imagemap\Utility\Mapper
     */
    protected $mapper;

    /**
     * @var \TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer|\PHPUnit\Framework\MockObject\MockObject
     */
    protected $cObj;

    protected function setUp()
    {
        parent::setUp();
        $this->importDataSet(__DIR__ . '/../Fixtures/pages.xml');
        $this->importDataSet(__DIR__ . '/../Fixtures/sys_template.xml');

        $this->mapper = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance(\Evoweb\Imagemap\Utility\Mapper::class);
        $this->cObj = $this->getMockBuilder(\TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer::class)
            ->setMethods(['typoLink', 'LOAD_REGISTER'])
            ->getMock();
    }

    protected function tearDown()
    {
        unset($this->mapper);
    }

    /**
     * @test
     */
    public function creatingValidMapNames()
    {
        $strings = ['test name', 'test näme', 'ÄÖÜ..', '1234', 'おはようございます'];

        $regExAttr = '/^[a-zA-Z][a-zA-Z0-9\-_]+[a-zA-Z0-9]$/i';
        foreach ($strings as $key => $string) {
            $this->assertEquals(
                1,
                preg_match($regExAttr, $this->mapper->createValidNameAttribute($string)),
                'Attribute (' . $key . ') is not cleaned as supposed...['
                . $this->mapper->createValidNameAttribute($string) . ']'
            );
        }
    }

    /**
     * @test
     */
    public function simpleComparingWorks()
    {
        $map1 = '[{link:"1"}]';
        $map2 = '[{link:"2"}]';

        $this->assertEquals(
            true,
            $this->mapper->compareJsonEncodedAreas($map1, $map1),
            'Equal maps are not recognized when compared...'
        );
        $this->assertEquals(
            false,
            $this->mapper->compareJsonEncodedAreas($map1, $map2),
            'Different maps are not recognized when compared...'
        );
    }

    /**
     * @test
     */
    public function complexerComparingWithVariousAttributeOrderWorks()
    {
        $map1 = '[{coords:"abc",shape:"circle",link:"1"}]';
        $map2 = '<map><area shape="circle" coords="abc">1</area></map>';

        $this->assertEquals(
            true,
            $this->mapper->compareJsonEncodedAreas($map1, $map2),
            'Equal maps are not recognized when compared...'
        );
    }

    /**
     * @test
     */
    public function compairingDifferentStructures()
    {
        $map1 = '[]';
        $map2 = '[{xxx:"abc",color:"green",link:"1"}]';
        $map3 = '[{xxx:"cde",color:"blue",link:"2"}]';

        $this->assertEquals(
            false,
            $this->mapper->compareJsonEncodedAreas($map1, $map2),
            'Different structured maps are not processed as supposed'
        );
        $this->assertEquals(
            false,
            $this->mapper->compareJsonEncodedAreas($map1, $map3),
            'Different structured maps are not processed as supposed'
        );
        $this->assertEquals(
            false,
            $this->mapper->compareJsonEncodedAreas($map2, $map3),
            'Different structured maps are not processed as supposed'
        );
    }
}
