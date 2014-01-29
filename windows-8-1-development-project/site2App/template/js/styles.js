﻿/*
Copyright (c) Microsoft Corporation

All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0   

THIS CODE IS PROVIDED *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABLITY OR NON-INFRINGEMENT.  

See the Apache Version 2.0 License for specific language governing permissions and limitations under the License. 


*/

(function (WAT, Windows) {
    "use strict";

    // Private method declaration
    var setThemeColor, loadCustomStyleString, setupWrapperCssFile, addCustomWrapperStyles,
        getCustomCssFile, customCssFileLoadHandler, loadCustomCssFileString,
        logger = window.console,
        customStylesFromFile = "";

    // Public API
    var self = {

        start: function () {
            if (WAT.getModule("log")) {
                logger = WAT.getModule("log");
            }

            WAT.config.styles = (WAT.config.styles || {});

            setThemeColor();
            addCustomWrapperStyles();

            WAT.options.webView.addEventListener("MSWebViewDOMContentLoaded", loadCustomStyleString);

            if (WAT.config.styles.wrapperCssFile) {
                setupWrapperCssFile();
            }
            if (WAT.config.styles.customCssFile) {
                getCustomCssFile();
            }
        }

    };

    // Private methods

    setThemeColor = function () {
        var newStyleSheet = document.createElement("link");

        newStyleSheet.rel = "stylesheet";

        if (WAT.config.styleTheme) {
            newStyleSheet.href = "/template/css/ui-" + WAT.config.styleTheme + ".css";
        } else {
            newStyleSheet.href = "/template/css/ui-dark.css";
        }

        WAT.wrapperDocHead.appendChild(newStyleSheet);
    };

    addCustomWrapperStyles = function () {
        if (WAT.config.styles.backButton) {
            if (WAT.config.styles.backButton.borderColor) {
                WAT.options.backButton.style.borderColor = WAT.config.styles.backButton.borderColor;
            }
            if (WAT.config.styles.backButton.color) {
                WAT.options.backButton.style.color = WAT.config.styles.backButton.color;
            }
        }
    },

    setupWrapperCssFile = function () {
        var newStyleSheet;

        if (!WAT.config.styles.wrapperCssFile) {
            return;
        }

        newStyleSheet = document.createElement("link");
        newStyleSheet.rel = "stylesheet";
        newStyleSheet.href = WAT.config.styles.wrapperCssFile;

        WAT.wrapperDocHead.appendChild(newStyleSheet);
    };

    loadCustomStyleString = function () {
        var i, l, hiddenEls, exec,
            scriptString = "",
            cssString = "";

        if (WAT.config.styles.setViewport === true) {
            cssString += "@-ms-viewport {";
        }
        if (WAT.config.styles.setViewport === true &&
            WAT.config.styles.targetWidth !== "") {
            cssString += "width:" + WAT.config.styles.targetWidth + ";";
        }
        if (WAT.config.styles.setViewport === true &&
            WAT.config.styles.targetHeight) {
            cssString += "height:" + WAT.config.styles.targetHeight + ";";
        }
        if (WAT.config.styles.setViewport === true) {
            cssString += "}";
        }
        if (WAT.config.styles.surpressTouchAction === true ||
            WAT.config.styles.suppressTouchAction === true) {
            cssString += "body{touch-action:none;}";
        }

        if (WAT.config.styles.hiddenElements && WAT.config.styles.hiddenElements !== "") {
            hiddenEls = WAT.config.styles.hiddenElements;
            var elements = "";
            for (i = 0; i < hiddenEls.length - 1; i++) {
                elements += hiddenEls[i] + ",";
            }
            elements += hiddenEls[hiddenEls.length - 1];
            cssString += elements + "{display:none !important;}";
        }

        //custom css string to add whatever you want
        if (WAT.config.styles.customCssString) {
            cssString += WAT.config.styles.customCssString;
        }

        scriptString += "var cssString = '" + cssString + "';" +
            "var styleEl = document.createElement('style');" +
            "document.body.appendChild(styleEl);" +
            "styleEl.innerHTML = cssString;";

        exec = WAT.options.webView.invokeScriptAsync("eval", scriptString);
        exec.oncomplete = function () {
            WinJS.UI.Animation.enterPage(WAT.options.webView);
        }
        exec.start();
    };

    getCustomCssFile = function () {
        var cssFile = "ms-appx://" + ((/^\//.test(WAT.config.styles.customCssFile)) ? "" : "/") + WAT.config.styles.customCssFile;

        logger.log("Getting custom css file from " + cssFile);

        var url = new Windows.Foundation.Uri(cssFile);
        Windows.Storage.StorageFile.getFileFromApplicationUriAsync(url)
            .then(
                customCssFileLoadHandler,
                function (err) {
                    // log this error, but let things proceed anyway
                    logger.error("Error getting custom css file", err);
                }
            );
    };

    customCssFileLoadHandler = function (file) {
        Windows.Storage.FileIO.readTextAsync(file)
            .then(
                function (text) {
                    customStylesFromFile = text;
                    WAT.options.webView.addEventListener("MSWebViewDOMContentLoaded", loadCustomCssFileString);
                },
                function (err) {
                    // log this error, but let things proceed anyway
                    logger.warn("Error reading custom css file", err);
                }
            );
    };

    loadCustomCssFileString = function () {
        var exec, scriptString;

        logger.log("injecting styles: ", customStylesFromFile.replace(/\r\n/gm, " "));

        scriptString = "var cssFileString = '" + customStylesFromFile.replace(/\r\n/gm, " ") + "';" +
            "var cssFileStyleEl = document.createElement('style');" +
            "document.body.appendChild(cssFileStyleEl);" +
            "cssFileStyleEl.innerHTML = cssFileString;";

        exec = WAT.options.webView.invokeScriptAsync("eval", scriptString);
        exec.start();
    };


    // Module Registration
    WAT.registerModule("styles", self);

})(window.WAT, window.Windows);