/*
Copyright (c) Microsoft Corporation

All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0   

THIS CODE IS PROVIDED *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABLITY OR NON-INFRINGEMENT.  

See the Apache Version 2.0 License for specific language governing permissions and limitations under the License. 


*/

(function (WAT, WinJS, Windows) {
    "use strict";

    // Private method declaration
    var handleOfflineEvent, redirectToOfflineSolution, offlineViewLoaded, handleOnlineEvent,
        loadRemoteZipOfflineSolution, getRemoteZipFile, deleteLocalOfflineFolder, unzipAndStoreSolution,
        getOfflineFullRootURL,
        logger = window.console,
        lastOnlineLocation = "",
        defaultURL = "template/offline.html",
        localURLBase = "ms-appx:///",
        remoteURLBase = "ms-appdata:///local/",
        zipURLBase = "offline/",
        zipURLTempBase = "offline-temp/",
        defaultTTL = (1000 * 60 * 60 * 24 * 7); // default to re-download weekly

    // Public API
    var self = {

        active: false,
        urlBase: localURLBase,
        rootURL: defaultURL,
        remoteZipTTL: defaultTTL,
        remoteZipFilename: null,

        start: function () {
            if (WAT.getModule("log")) {
                logger = WAT.getModule("log");
            }

            WAT.config.offline = (WAT.config.offline || {});
            lastOnlineLocation = WAT.config.baseURL; // default last location to home page

            if (!WAT.options.offlineView) { return; }

            window.addEventListener("offline", handleOfflineEvent);
            window.addEventListener("online", handleOnlineEvent);

            // If they have specified a remote zip solution, we need to determine
            // if we already have it, and if not (or if it's old), get it.
            if (WAT.config.offline.remoteZipURL) {

                if (WAT.options.ZipLibClass) {
                    loadRemoteZipOfflineSolution();

                    // alter properties to point to remote offline solution
                    self.urlBase = remoteURLBase + zipURLBase;
                    if (WAT.config.offline.rootURL) {
                        self.rootURL = WAT.config.offline.rootURL;
                    } else {
                        self.rootURL = "index.html";
                    }

                } else {
                    logger.error("Sorry, but there is no Zip library class defined. You will not be able to use the 'remoteZipURL' option.");
                }

            } else if (WAT.config.offline.rootURL)  {
                // If they're providing a local root URL for offline functionality
                // then we'll use that instead of our template default
                self.urlBase = localURLBase;
                self.rootURL = WAT.config.offline.rootURL;
            }

            logger.log("Set offline solution url to: " + self.urlBase + self.rootURL);

            WAT.options.offlineView.addEventListener("MSWebViewDOMContentLoaded", offlineViewLoaded);

            // If we're not online to start, go to offline solution, this could mean 
            // using the default solution if the zip is unavailable
            if (!window.navigator.onLine) {
                handleOfflineEvent();
            }
        },

        forceOffline: function () {
            var nav = WAT.getModule("nav");
            if (nav) {
                nav.removeExtendedSplashScreen();
            }
            handleOfflineEvent();
        }
    };

    // Private Methods

    handleOfflineEvent = function () {
        var uri;

        if (self.active) { return; }

        logger.info("Device is offline...", self.urlBase + self.rootURL);
        self.active = true;
        lastOnlineLocation = WAT.options.webView.src;
        
        // check for existence of offline rootURL file, use default if it doesn't exist
        uri = new Windows.Foundation.Uri(self.urlBase + self.rootURL);
        Windows.Storage.StorageFile.getFileFromApplicationUriAsync(uri)
            .then(
                redirectToOfflineSolution,
                function (err) {
                    logger.warn("Offline solution unavailable (" + self.urlBase + self.rootURL + "), reverting to default (" + localURLBase + defaultURL + ")");

                    self.urlBase = localURLBase;
                    self.rootURL = defaultURL;
                    redirectToOfflineSolution();
                }
            );
    };

    redirectToOfflineSolution = function () {
        var url = getOfflineFullRootURL();

        WAT.options.webView.style.display = "none";
        WAT.options.offlineView.style.display = "block";
        WAT.options.offlineView.navigate(url);
    },

    getOfflineFullRootURL = function() {
        return self.urlBase.replace(/ms\-appx\:/, "ms-appx-web:") + self.rootURL;
    };

    offlineViewLoaded = function () {
        var exec, scriptString;

        // inject the offline message if requested...
        if (WAT.config.offline.message) {
            scriptString = "var msg = document.querySelector('.offlineMessage');" +
                            "if (msg) { msg.innerHTML = '" + WAT.config.offline.message + "'; }";

            exec = WAT.options.offlineView.invokeScriptAsync("eval", scriptString);
            exec.start();
        }

        if (WAT.getModule("nav")) {
            if (WAT.options.offlineView.canGoBack === true) {
                WAT.getModule("nav").toggleBackButton(true);
            } else {
                WAT.getModule("nav").toggleBackButton(false);
            }
        }
    };

    handleOnlineEvent = function () {
        var loc = WAT.config.baseURL;

        if (!self.active) { return; }

        logger.info("Online connection restored, redirecting to " + loc);
        self.active = false;

        WAT.options.offlineView.style.display = "none";
        WAT.options.offlineView.navigate(getOfflineFullRootURL());
        WAT.options.webView.style.display = "block";

        WAT.goToLocation(loc);
    };

    loadRemoteZipOfflineSolution = function () {
        var zipFile, tempFolder,
            prevTimestamp = localStorage.getItem("offline-download-time"),
            now = (new Date()).getTime();

        logger.log("loading remote zip offline solution");

        self.remoteZipTTL = (WAT.config.offline.remoteZipTTL || defaultTTL);

        if (prevTimestamp && (now - prevTimestamp) < self.remoteZipTTL) {

            logger.log("previous solution downloaded and still within TTL");
            return;

        } else {
            logger.log("no prev offline zip download or TTL passed");

            getRemoteZipFile()
                .then(
                    // delete the old local offline folder
                    function (zip) {

                        zipFile = zip; // cache this for use later

                        return deleteLocalOfflineFolder();
                    },
                    function (err) {
                        logger.error("getRemoteZipFile error", err);
                    }
                )
                .then(
                    // re-create the (now empty) local offline temp folder
                    function () {
                        return Windows.Storage.ApplicationData.current.localFolder
                            .createFolderAsync(zipURLTempBase, Windows.Storage.CreationCollisionOption.openIfExists);
                    },
                    function (err) {
                        logger.error("deleteLocalOfflineFolder error", err);
                    }
                )
                .then(
                    // unzip contents of remote file into local offline folder
                    function (folder) {
                        logger.log("retrieved local offline folder", folder.path);

                        // cahce for use later
                        tempFolder = folder;

                        return unzipAndStoreSolution(zipFile, folder);
                    },
                    function (err) {
                        logger.error("createFolderAsync error", err);
                    }
                )
                .then(
                    function () {
                        logger.log("renaming temp folder to override old local offline folder");

                        return tempFolder.renameAsync(zipURLBase.replace(/\//, ""), Windows.Storage.NameCollisionOption.replaceExisting);
                    },
                    function (err) {
                        logger.error("rename error", err);
                    }
                )
                .then(
                    // set download timestamp, etc
                    function () {
                        logger.log("unzipped remote solution to local system");

                        localStorage.setItem("offline-download-time", now);

                    },
                    function (err) {
                        logger.error("unzipAndStoreSolution error", err);
                    }
                );
        }
    };

    getRemoteZipFile = function (localFolder) {
        return new WinJS.Promise(function (complete, error) {
            logger.log("getting remote zip file from ", WAT.config.offline.remoteZipURL);

            WinJS.xhr({ "url": WAT.config.offline.remoteZipURL, "responseType": "arraybuffer" })
                .done(
                    function (e) {
                        if (!e.getResponseHeader("content-type") === "application/zip") {
                            error(new Error("Remote file was not sent with correct Content-Type: expected 'application/zip', but received '" + e.getResponseHeader("content-type") + "'"));
                        }

                        complete(e.response);
                    },
                    error
                );
        });
    };

    deleteLocalOfflineFolder = function (folder) {
        return new WinJS.Promise(function (complete, error) {
            logger.log("deleting local offline temp folder");
            Windows.Storage.ApplicationData.current.localFolder
                .getFolderAsync(zipURLTempBase)
                    .done(
                        function (folder) {
                            folder.deleteAsync(Windows.Storage.StorageDeleteOption.permanentDelete)
                                .done(complete, error);
                        },
                        // we just use the "complete" callback as the error condition
                        // because either folder doesn't exist, or we can't access it
                        complete
                     );
        });
    };

    unzipAndStoreSolution = function (zipData, offlineFolder) {
        var promises = [],
            zip = new WAT.options.ZipLibClass(zipData);

        if (!zip) {
            error(new Error("No zip file provided (or it is invalid)"));
            return;
        }

        Object.keys(zip.files).forEach(function (key) {
            var fileName;

            // ignore folder entries, they're handled as needed below
            if (/\/$/.test(key)) { return; }

            fileName = zip.files[key].name.match(/[^\/]+\.[^\.\/]+$/);
            if (!fileName) {
                logger.error("Unable to process zip entry without proper filename: ", zip.files[key].name);
                return;
            }
            fileName = fileName[0];

            promises.push(
                WAT.getFolderFromPathRecursive(zip.files[key].name, offlineFolder)
                    .then(
                        function (subFolder) {
                            logger.log("creating file in folder: ", fileName, subFolder.name);

                            return subFolder.createFileAsync(fileName, Windows.Storage.CreationCollisionOption.replaceExisting)
                        }
                    )
                    .then(
                        function (localStorageFile) {
                            return Windows.Storage.FileIO
                                .writeBytesAsync(localStorageFile, zip.file(zip.files[key].name).asUint8Array());
                        }
                    )
            );

        });

        return WinJS.Promise.join(promises);
    };


    // Module Registration
    WAT.registerModule("offline", self);

})(window.WAT, window.WinJS, window.Windows);