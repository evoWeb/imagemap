#!/usr/bin/env bash

export DEBUG=false;
export PACKAGE='evoWeb/imagemap';
export T3EXTENSION='imagemap';

COMPOSER=$(which composer);

before_install () {
    if [[ ! ${DEBUG} ]]; then
        if [[ $(php -i | grep -v TRAVIS_CMD | grep -q xdebug) ]]; then phpenv config-rm xdebug.ini; fi
    fi
}

install () {
    local PHP=${1};
    local TYPO3_VERSION=${2};
    local TESTING_FRAMEWORK=${3};
    local PREFER_LOWEST=${4};

    rm composer.lock
    rm -rf .Build/Web/

    export TYPO3_PATH_WEB=$PWD/.Build/Web;
    ${PHP} ${COMPOSER} require typo3/cms-core="${TYPO3_VERSION}" ${PREFER_LOWEST};
    if [[ ! -z "${TESTING_FRAMEWORK}" ]]; then ${PHP} ${COMPOSER} require --dev typo3/testing-framework="${TESTING_FRAMEWORK}"; fi;
    git checkout composer.json;
}

jobXMLLint () {
    echo 'Running xmllint (Xliff) (Remember to install libxml2-utils)';
    find Resources/Private/Language/ -name '*.xlf' -type f | xargs xmllint --noout --schema .Build/xliff-core-1.2-strict.xsd
}

jobPHPLint () {
    local PHP=${1};

    before_install

    echo "Running php lint with ${PHP}";
    errors=$(find . -name \*.php ! -path './.Build/*' -exec ${PHP} -d display_errors=stderr -l "{}" 2>&1 >/dev/null \;) && echo "${errors}" && test -z "${errors}"
}

jobUnitTest () {
    local PHP=${1};
    local TYPO3_VERSION=${2};
    local TESTING_FRAMEWORK=${3};
    local PREFER_LOWEST=${4};

    ${PHP} --version
    ${PHP} ${COMPOSER} --version

    before_install
    install ${PHP} ${TYPO3_VERSION} ${TESTING_FRAMEWORK} ${PREFER_LOWEST}

    echo "Running ${TYPO3_VERSION} unit tests with ${PHP}";
    ${PHP} .Build/Web/vendor/bin/phpunit --colors -c .Build/Web/vendor/typo3/testing-framework/Resources/Core/Build/UnitTests.xml Tests/Unit/;
}

jobFunctionalTest () {
    local PHP=${1};
    local TYPO3_VERSION=${2};
    local TESTING_FRAMEWORK=${3};
    local PREFER_LOWEST=${4};

    ${PHP} --version
    ${PHP} ${COMPOSER} --version

    before_install
    install ${PHP} ${TYPO3_VERSION} ${TESTING_FRAMEWORK} ${PREFER_LOWEST}

    echo 'Running functional tests';
    export typo3DatabaseName='typo3';
    export typo3DatabaseHost='localhost';
    export typo3DatabaseUsername='root';
    export typo3DatabasePassword='';
    export typo3DatabaseDriver='pdo_sqlite';
    ${PHP} .Build/Web/vendor/bin/phpunit --colors -c .Build/Web/vendor/typo3/testing-framework/Resources/Core/Build/FunctionalTests.xml Tests/Functional/;
}

main () {
    cd ../;

    jobXMLLint

    jobPHPLint '/usr/bin/php7.4'
    jobPHPLint '/usr/bin/php7.3'
    jobPHPLint '/usr/bin/php7.2'

    jobUnitTest '/usr/bin/php7.3' '^9.5.0' '~4.10.0';
    jobUnitTest '/usr/bin/php7.2' '^9.5.0' '~4.10.0';
    jobUnitTest '/usr/bin/php7.4' '^10.4' '^6.2.3';
    jobUnitTest '/usr/bin/php7.3' '^10.4' '^6.2.3';
    jobUnitTest '/usr/bin/php7.2' '^10.4' '^6.2.3';
    jobUnitTest '/usr/bin/php7.2' '^10.4' '^5.0.15' '--prefer-lowest';
    jobUnitTest '/usr/bin/php7.2' 'dev-master as 10.4.0' '^6.2.3';

    if [[ ! ${DEBUG} ]]; then
        rm composer.lock
        rm -rf .Build/Web/
        rm -rf var/
    fi
}
main
