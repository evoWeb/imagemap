<?php

declare(strict_types=1);

namespace Evoweb\Imagemap\Controller\Wizard;

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

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Core\Http\HtmlResponse;
use TYPO3\CMS\Core\Resource\Exception\FileDoesNotExistException;
use TYPO3\CMS\Core\Resource\ResourceFactory;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Utility\MathUtility;
use TYPO3\CMS\Fluid\View\StandaloneView;

class ImagemapManipulationController
{
    /**
     * @var string
     */
    private $wizardRouteName = 'ajax_wizard_imagemap_manipulation';

    /**
     * @var StandaloneView
     */
    protected $templateView;

    /**
     * @var ResourceFactory
     */
    protected $resourceFactory;

    public function __construct(StandaloneView $templateView, ResourceFactory $resourceFactory)
    {
        $templateView->setLayoutRootPaths(['EXT:imagemap/Resources/Private/Layouts/']);
        $templateView->setPartialRootPaths(['EXT:imagemap/Resources/Private/Partials/']);
        $templateView->setTemplatePathAndFilename(
            'EXT:imagemap/Resources/Private/Templates/FormEngine/ImagemapWizard.html'
        );

        $this->templateView = $templateView;
        $this->resourceFactory = $resourceFactory;
    }

    /**
     * Default action just renders the Wizard with the default view.
     *
     * @param ServerRequestInterface $request
     *
     * @return ResponseInterface
     */
    public function getWizardContent(ServerRequestInterface $request): ResponseInterface
    {
        if (!$this->isSignatureValid($request)) {
            return new HtmlResponse('', 403);
        }

        $parsedBody = \json_decode($request->getParsedBody()['arguments'], true);
        $fileUid = $parsedBody['image'];
        $image = null;
        if (MathUtility::canBeInterpretedAsInteger($fileUid)) {
            try {
                $image = $this->resourceFactory->getFileObject($fileUid);
            } catch (FileDoesNotExistException $e) {
            }
        }
        $viewData = [
            'image' => $image,
        ];
        $content = $this->templateView->renderSection('Main', $viewData);
        return new HtmlResponse($content);
    }

    /**
     * Check if hmac signature is correct
     *
     * @param ServerRequestInterface $request the request with the POST parameters
     *
     * @return bool
     */
    protected function isSignatureValid(ServerRequestInterface $request): bool
    {
        $token = GeneralUtility::hmac($request->getParsedBody()['arguments'], $this->wizardRouteName);
        return hash_equals($token, $request->getParsedBody()['signature']);
    }
}
