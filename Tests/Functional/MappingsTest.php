<?php
namespace Evoweb\Imagemap\Tests\Functional;

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

class MappingsTest extends \TYPO3\TestingFramework\Core\Functional\FunctionalTestCase
{
    /**
     * @var array
     */
    protected $testExtensionsToLoad = ['typo3conf/ext/imagemap'];

    /**
     * @var \TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer|\PHPUnit\Framework\MockObject\MockObject
     */
    protected $cObj;

    protected function setUp(): void
    {
        parent::setUp();
        $this->importDataSet(__DIR__ . '/../Fixtures/pages.xml');
        $this->importDataSet(__DIR__ . '/../Fixtures/sys_template.xml');

        $this->cObj = $this->getMockBuilder(\TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer::class)
            ->setMethods(['typoLink', 'LOAD_REGISTER'])
            ->getMock();
    }

    protected function tearDown(): void
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

    protected function getStubData(): string
    {
        $t = '{"image":{"width":1000,"height":800},"areas":[{"shape":"rect","coords":{"left":22,"top":184,"right":219,"bottom":381},"href":"t3:\/\/page?uid=7","alt":"B\u00fccher","data":{"color":"#339900"}},{"shape":"circle","coords":{"left":298,"top":104,"radius":102},"href":"t3:\/\/page?uid=8","alt":"Suche","data":{"color":"#003399"}},{"shape":"poly","coords":{"points":[{"x":9,"y":97},{"x":130,"y":6},{"x":130,"y":39},{"x":36,"y":107}]},"href":"t3:\/\/page?uid=9","alt":"Autoren","data":{"color":"#990033"}}]}';

        return json_encode([
            'image' => [
                'width' => 1000,
                'height' => 800,
            ],
            'areas' => [

                [
                    "shape" => "rect",
                    "coords" => [
                        "left" => 22,
                        "top" => 184,
                        "right" => 219,
                        "bottom" => 381,
                    ],
                    "href" => "t3://page?uid=7",
                    "alt" => "Bücher",
                    "data" => [
                        "color" => "#339900"
                    ]
                ],
                [
                    "shape" => "circle",
                    "coords" => [
                        "left" => 298,
                        "top" => 104,
                        "radius" => 102,
                    ],
                    "href" => "t3://page?uid=8",
                    "alt" => "Suche",
                    "data" => [
                        "color" => "#003399"
                    ]
                ],
                [
                    "shape" => "poly",
                    "coords" => [
                        "points" => [
                            ["x" => 9, "y" => 97],
                            ["x" => 130, "y" => 6],
                            ["x" => 130, "y" => 39],
                            ["x" => 36, "y" => 107],
                        ],
                    ],
                    "href" => "t3://page?uid=9",
                    "alt" => "Autoren",
                    "data" => [
                        "color" => "#990033"
                    ]
                ]
            ],
        ]);
    }
}
