<?php
declare(strict_types = 1);
namespace Evoweb\Imagemap\Controller\Wizard;

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

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Backend\Utility\BackendUtility;
use TYPO3\CMS\Core\Http\HtmlResponse;
use TYPO3\CMS\Core\Resource\ResourceFactory;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Utility\MathUtility;
use TYPO3\CMS\Fluid\View\StandaloneView;

class ImagemapAreaController
{
    /**
     * @var \TYPO3\CMS\Backend\View\BackendTemplateView
     */
    protected $templateView;

    public function __construct(StandaloneView $templateView = null)
    {
        if (!$templateView) {
            $templateView = GeneralUtility::makeInstance(StandaloneView::class);
            $templateView->setLayoutRootPaths(['EXT:imagemap/Resources/Private/Layouts/']);
            $templateView->setPartialRootPaths(['EXT:imagemap/Resources/Private/Partials/']);
            $templateView->setTemplatePathAndFilename(GeneralUtility::getFileAbsFileName(
                'EXT:imagemap/Resources/Private/Templates/FormEngine/ImagemapAreaWizard.html'
            ));
        }
        $this->templateView = $templateView;
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
        if ($this->isSignatureValid($request)) {
            $parsedBody = json_decode($request->getParsedBody()['arguments'], true);

            $fileUid = $parsedBody['image'];
            $image = null;
            if (MathUtility::canBeInterpretedAsInteger($fileUid)) {
                try {
                    $image = ResourceFactory::getInstance()->getFileReferenceObject($fileUid);
                } catch (\throwable $e) {
                }
            }

            $record = BackendUtility::getRecord($parsedBody['tableName'], $parsedBody['uid']);
            $viewData = [
                'image' => $image,
                'configuration' => \json_encode($this->getConfiguration($parsedBody, $record))
            ];
            $content = $this->templateView->renderSection('Main', $viewData);
            return new HtmlResponse($content);
        }
        return new HtmlResponse('', 403);
    }

    protected function getConfiguration(
        array $parameters,
        array $record
    ): array {
        $formName = 'imagemap' . GeneralUtility::shortMD5(rand(1, 100000));
        $browseLinkConfiguration = [
            'returnUrl' => GeneralUtility::linkThisScript(),
            'formName' => $formName,
            'tableName' => $parameters['tableName'],
            'fieldName' => $parameters['fieldName'],
            'pid' => $record['pid'],
        ];
        return [
            'formName' => $formName,
            'itemName' => $parameters['itemName'],
            'fieldChangeFunc' => $parameters['fieldChangeFunc'] ?? [],
            'existingAreas' => $record[$parameters['fieldName']],
            'browseLink' => $browseLinkConfiguration
        ];
    }

    /**
     * Check if hmac signature is correct
     *
     * @param ServerRequestInterface $request the request with the POST parameters
     * @return bool
     */
    protected function isSignatureValid(ServerRequestInterface $request): bool
    {
        $token = GeneralUtility::hmac($request->getParsedBody()['arguments'], 'ajax_wizard_imagemap_area');
        return hash_equals($token, $request->getParsedBody()['signature']);
    }
}
