<?php

declare(strict_types=1);

namespace Evoweb\Imagemap\Tests\Unit\Database;

/*
 * This file is developed by evoWeb.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 */

use Evoweb\Imagemap\Database\SoftReferenceIndex;
use Psr\EventDispatcher\EventDispatcherInterface;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;

/**
 * Test case
 */
class SoftReferenceIndexTest extends UnitTestCase
{
    protected $resetSingletonInstances = true;

    public function findRefReturnsParsedElementsDataProvider(): array
    {
        return [
            'link to page' => [
                [
                    'imagemap' => [
                        'content' => '[{"coords":{"left":0,"top":0,"right":100,"bottom":100},"shape":"rect","href":"t3:\/\/page?uid=42"}]',
                        'elementKey' => 0,
                        'matchString' => '{"coords":{"left":0,"top":0,"right":100,"bottom":100},"shape":"rect","href":"t3:\/\/page?uid=42"}',
                    ],
                ],
                [
                    'subst' => [
                        'type' => 'db',
                        'recordRef' => 'pages:42',
                        'tokenValue' => 42,
                    ],
                ],
            ],
            'links to page' => [
                [
                    'imagemap' => [
                        'content' => '[{"points":[{"x":0.3,"y":0.112359551},{"x":0.05,"y":0.887640449},{"x":0.55,"y":0.887640449}],"shape":"poly","href":"t3://page?uid=2","color":"#73f883"},{"coords":{"left":0.7,"top":0.5,"radius":0.2575},"shape":"circle","href":"t3://page?uid=3","color":"#15befc"},{"coords":{"left":0.25,"top":0.112359551,"right":0.75,"bottom":0.887640449},"shape":"rect","href":"t3://page?uid=4","color":"#364362"}]',
                        'elementKey' => 2,
                        'matchString' => '{"coords":{"left":0.25,"top":0.112359551,"right":0.75,"bottom":0.887640449},"shape":"rect","href":"t3:\/\/page?uid=4","color":"#364362"}',
                    ],
                ],
                [
                    'subst' => [
                        'type' => 'db',
                        'recordRef' => 'pages:4',
                        'tokenValue' => 4,
                    ],
                ],
            ],
            'link to external URL without scheme' => [
                [
                    'imagemap' => [
                        'content' => '[{"coords":{"left":0,"top":0,"right":100,"bottom":100},"shape":"rect","href":"www.example.com"}]',
                        'elementKey' => 0,
                        'matchString' => '{"coords":{"left":0,"top":0,"right":100,"bottom":100},"shape":"rect","href":"www.example.com"}',
                    ],
                ],
                [
                    'subst' => [
                        'type' => 'external',
                        'tokenValue' => 'http://www.example.com',
                    ],
                ],
            ],
            'link to external URL with scheme' => [
                [
                    'imagemap' => [
                        'content' => '[{"coords":{"left":0,"top":0,"right":100,"bottom":100},"shape":"rect","href":"https:\/\/www.example.com"}]',
                        'elementKey' => 0,
                        'matchString' => '{"coords":{"left":0,"top":0,"right":100,"bottom":100},"shape":"rect","href":"https:\/\/www.example.com"}',
                    ],
                ],
                [
                    'subst' => [
                        'type' => 'external',
                        'tokenValue' => 'https://www.example.com',
                    ],
                ],
            ],
            'link to email' => [
                [
                    'imagemap' => [
                        'content' => '[{"coords":{"left":0,"top":0,"right":100,"bottom":100},"shape":"rect","href":"mailto:test@example.com"}]',
                        'elementKey' => 0,
                        'matchString' => '{"coords":{"left":0,"top":0,"right":100,"bottom":100},"shape":"rect","href":"mailto:test@example.com"}',
                    ],
                ],
                [
                    'subst' => [
                        'type' => 'string',
                        'tokenValue' => 'test@example.com',
                    ],
                ],
            ],
            'link to email without schema' => [
                [
                    'imagemap' => [
                        'content' => '[{"coords":{"left":0,"top":0,"right":100,"bottom":100},"shape":"rect","href":"test@example.com"}]',
                        'elementKey' => 0,
                        'matchString' => '{"coords":{"left":0,"top":0,"right":100,"bottom":100},"shape":"rect","href":"test@example.com"}',
                    ],
                ],
                [
                    'subst' => [
                        'type' => 'string',
                        'tokenValue' => 'test@example.com',
                    ],
                ],
            ],
            /* @todo enable test once 9.5 support is dropped
            'link to phone number' => [
                [
                    'imagemap' => [
                        'content' => '[{"coords":{"left":0,"top":0,"right":100,"bottom":100},"shape":"rect","href":"tel:0123456789"}]',
                        'elementKey' => 0,
                        'matchString' => '{"coords":{"left":0,"top":0,"right":100,"bottom":100},"shape":"rect","href":"tel:0123456789"}',
                    ],
                ],
                [
                    'subst' => [
                        'type' => 'string',
                        'tokenValue' => '0123456789',
                    ],
                ],
            ],*/
        ];
    }

    /**
     * @test
     * @dataProvider findRefReturnsParsedElementsDataProvider
     * @param array $softrefConfiguration
     * @param array $expectedElement
     */
    public function findRefReturnsParsedElements(array $softrefConfiguration, array $expectedElement)
    {
        $eventDispatcherProphecy = $this->prophesize(EventDispatcherInterface::class);
        foreach ($softrefConfiguration as $softrefKey => $configuration) {
            /** @var EventDispatcherInterface $eventDispatcher */
            $eventDispatcher = $eventDispatcherProphecy->reveal();
            $subject = new SoftReferenceIndex($eventDispatcher);
            $result = $subject->findRef(
                'tt_content',
                'tx_imagemap_areas',
                1,
                $configuration['content'],
                $softrefKey,
                []
            );

            self::assertArrayHasKey('elements', $result);
            self::assertArrayHasKey($configuration['elementKey'], $result['elements']);

            // Remove tokenID as this one depends on the softrefKey and doesn't need to be verified
            unset($result['elements'][$configuration['elementKey']]['subst']['tokenID']);

            $expectedElement['matchString'] = $configuration['matchString'];
            self::assertEquals($expectedElement, $result['elements'][$configuration['elementKey']]);
        }
    }
}
