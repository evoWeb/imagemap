<?php
namespace Evoweb\Imagemap\Tests;

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

class ConvertingTest extends \TYPO3\TestingFramework\Core\Unit\UnitTestCase
{
    /**
     * @var \Evoweb\Imagemap\Utility\Mapper|\PHPUnit\Framework\MockObject\MockObject
     */
    protected $mapper;

    protected function setUp()
    {
        $this->mapper = $this->getMockBuilder(\Evoweb\Imagemap\Utility\Mapper::class)
            ->setMethods(['dummy'])
            ->getMock();
    }

    protected function tearDown()
    {
        unset($this->mapper);
    }

    /**
     * @test
     */
    public function basicMap2ArrayWorks()
    {
        $this->assertEquals(
            ['name' => 'map'],
            $this->mapper->map2array('<map></map>'),
            'Map to Array mappings fails to convert empty Maps'
        );
        $this->assertEquals(
            ['name' => 'map'],
            $this->mapper->map2array('<map />'),
            'Map to Array mappings fails to convert empty Maps'
        );
        $this->assertEquals(
            ['name' => 'map', 'attributes' => ['name' => 'test']],
            $this->mapper->map2array('<map name="test"></map>'),
            'Map to Array fails to extract the Name-Attribute.'
        );
    }

    /**
     * @test
     */
    public function singleAreaInMap2ArrayWorks()
    {
        $supposed = [
            'name' => 'map',
            'attributes' => ['name' => 'test'],
            'areas' => [['name' => 'area', 'attributes' => ['shape' => 'rect', 'coords' => '0,0,1,1']]],
        ];
        $this->assertEquals(
            $supposed,
            $this->mapper->map2array('<map name="test"><area shape="rect" coords="0,0,1,1" /></map>'),
            'Map is not converted as supposed'
        );
        $supposed['areas'][0]['value'] = '1';
        $this->assertEquals(
            $supposed,
            $this->mapper->map2array('<map name="test"><area shape="rect" coords="0,0,1,1">1</area></map>'),
            'Map is not converted / Value is ot set as supposed'
        );
    }

    /**
     * @test
     */
    public function basicArray2MapWorks()
    {
        $this->assertEquals('<map />', $this->mapper->array2map([]), 'Empty Map-creation fails.');
        $this->assertEquals(
            '<map name="test" />',
            $this->mapper->array2map(['name' => 'map', 'attributes' => ['name' => 'test']]),
            'Map without areas is not created as supposed'
        );
        $this->assertEquals(
            '<map>value</map>',
            $this->mapper->array2map(['value' => 'value']),
            'Values are not represented within the map.'
        );
    }

    /**
     * @test
     */
    public function simpleMapWithAreaConverts()
    {
        $inputArray = [
            'name' => 'map',
            'attributes' => ['name' => 'test'],
            'areas' => [['name' => 'area', 'attributes' => ['shape' => 'rect', 'coords' => '0,0,1,1', 'id' => '1']]],
        ];

        $inputString = '<map name="test"><area shape="rect" coords="0,0,1,1" id="1" /></map>';

        $this->assertEquals(
            $inputString,
            $this->mapper->array2map($this->mapper->map2array($inputString)),
            'Map is destroyed within the conversions'
        );
        $this->assertEquals(
            $inputArray,
            $this->mapper->map2array($this->mapper->array2map($inputArray)),
            'Map is destroyed within the conversions'
        );
    }

    /**
     * @test
     */
    public function specialCharsShouldNotBreakIt()
    {
        $inputString = [
            '<map name="test &amp; test2" />',
            '<map><area title="test &amp; test2">http://www.example.com</area></map>',
            '<map><area title="test(&quot;stringvalue&quot;); test2">http://www.example.com</area></map>',
        ];

        foreach ($inputString as $key => $value) {
            $this->assertEquals(
                $value,
                $this->mapper->array2map($this->mapper->map2array($value)),
                'Special chars break map within the conversions - String ' . $key
            );
        }
    }
}
