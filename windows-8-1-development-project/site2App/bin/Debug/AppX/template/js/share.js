/*
Copyright (c) Microsoft Corporation

All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0   

THIS CODE IS PROVIDED *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABLITY OR NON-INFRINGEMENT.  

See the Apache Version 2.0 License for specific language governing permissions and limitations under the License. 


*/

(function (WAT) {
    "use strict";

    // Private method declaration
    var setupShare, handleShareRequest, getScreenshot, processScreenshot, sharePage,
        logger = window.console;

    // Public API
    var self = {

        start: function () {
            if (WAT.getModule("log")) {
                logger = WAT.getModule("log");
            }

            setupShare();
        }

    };

    // Private methods

    setupShare = function () {
        var dataTransferManager;

        if (!WAT.config.share || WAT.config.share.enabled !== true) {
            return;
        }
        
        dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
        dataTransferManager.addEventListener("datarequested", handleShareRequest);
    };

    handleShareRequest = function (e) {
        var deferral = e.request.getDeferral();
        
        if (WAT.config.share.screenshot) {
            getScreenshot().then(
                function (imageFile) {
                    sharePage(e.request, deferral, imageFile);
                },
                function (err) {
                    // There was an error capturing, but we still want to share
                    logger.warn("Error capturing screenshot, sharing anyway", err);
                    sharePage(e.request, deferral, null);
                }
            );
        } else {
            sharePage(e.request, deferral, null);
        }
    };

    getScreenshot = function () {
        var screenshotFile;

        return new WinJS.Promise(function (complete, error) {

            if (!WAT.options.webView.capturePreviewToBlobAsync) {
                // screen capturing not available, but we still want to share...
                error(new Error("The capturing method (capturePreviewToBlobAsync) does not exist on the webview element"));
                return;
            }

            // we create the screenshot file first...
            Windows.Storage.ApplicationData.current.temporaryFolder.createFileAsync("screenshot.png", Windows.Storage.CreationCollisionOption.replaceExisting)
                .then(
                    function (file) {
                        // open the file for reading...
                        screenshotFile = file;
                        return file.openAsync(Windows.Storage.FileAccessMode.readWrite);
                    },
                    error
                )
                .then(processScreenshot, error)
                .then(
                    function () {
                        complete(screenshotFile);
                    },
                    error
                );
        });
    };

    processScreenshot = function (fileStream) {
        return new WinJS.Promise(function (complete, error) {
            var captureOperation = WAT.options.webView.capturePreviewToBlobAsync();

            captureOperation.addEventListener("complete", function (e) {
                var inputStream = e.target.result.msDetachStream();

                Windows.Storage.Streams.RandomAccessStream.copyAsync(inputStream, fileStream).then(
                    function () {
                        fileStream.flushAsync().done(
                            function () {
                                inputStream.close();
                                fileStream.close();
                                complete();
                            }
                        );
                    }
                );
            });

            captureOperation.start();
        });
    };

    sharePage = function (dataReq, deferral, imageFile) {
        var msg = WAT.config.share.message,
            currentURL = WAT.options.webView.src,
            shareURL = WAT.config.share.url;

        shareURL = shareURL.replace("{currentURL}", currentURL);

        msg = msg.replace("{url}", shareURL).replace("{currentURL}", currentURL);

        dataReq.data.properties.title = WAT.config.share.title;
        dataReq.data.properties.description = msg;
        dataReq.data.setText(msg);

        if (dataReq.data.setApplicationLink) {
            dataReq.data.setApplicationLink(new Windows.Foundation.Uri(shareURL));
        }
        if (dataReq.data.setUri) {
            dataReq.data.setUri(new Windows.Foundation.Uri(shareURL));
        }

        if (imageFile) {
            dataReq.data.setStorageItems([imageFile], true);
        }

        deferral.complete();
    };

    
    // Module Registration
    WAT.registerModule("share", self);

})(window.WAT);