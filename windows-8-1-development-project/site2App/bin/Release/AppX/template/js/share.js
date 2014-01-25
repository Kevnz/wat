(function (WAT) {
    "use strict";

    // Private method declaration
<<<<<<< HEAD
<<<<<<< HEAD
    var setupShare, handleShareRequest;
=======
    var setupShare, handleShareRequest, getScreenshot, processScreenshot, sharePage;
>>>>>>> release-0.6
=======
    var setupShare, handleShareRequest, getScreenshot, processScreenshot, sharePage,
        logger = window.console;
>>>>>>> release-1.0.0

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

<<<<<<< HEAD
<<<<<<< HEAD
        if (WAT.config.share.enabled !== true) {
            return;
        }

=======
        if (WAT.config.share && WAT.config.share.enabled !== true) {
=======
        if (!WAT.config.share || WAT.config.share.enabled !== true) {
>>>>>>> release-1.0.0
            return;
        }
        
>>>>>>> release-0.6
        dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
        dataTransferManager.addEventListener("datarequested", handleShareRequest);
    };

    handleShareRequest = function (e) {
<<<<<<< HEAD
        // allow you to share current URL
=======
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
>>>>>>> release-0.6
        var msg = WAT.config.share.message,
            currentURL = WAT.options.webView.src,
            shareURL = WAT.config.share.url;

        shareURL = shareURL.replace("{currentURL}", currentURL);

        msg = msg.replace("{url}", shareURL).replace("{currentURL}", currentURL);

<<<<<<< HEAD
        e.request.data.properties.title = WAT.config.share.title;
        e.request.data.setText(msg);
        e.request.data.setUri(new Windows.Foundation.Uri(currentURL));
    };

=======
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

    
>>>>>>> release-0.6
    // Module Registration
    WAT.registerModule("share", self);

})(window.WAT);