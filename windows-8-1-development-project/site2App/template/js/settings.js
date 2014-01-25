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
    var setupSettingsCharm,
        logger = window.console;

    // Public API
    var self = {

        start: function () {
            if (WAT.getModule("log")) {
                logger = WAT.getModule("log");
            }

            WinJS.Application.onsettings = setupSettingsCharm;
        }

    };

    // Private methods

    setupSettingsCharm = function (e) {

        if (WAT.config.settings &&
            WAT.config.settings.enabled &&
            WAT.config.settings.items &&
            WAT.config.settings.items.length) {

            if (WAT.config.settings.privacyUrl) {
                e.detail.e.request.applicationCommands.append(
                    new Windows.UI.ApplicationSettings.SettingsCommand("defaults", "Privacy", function () {
                        Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(WAT.config.settings.privacyUrl));
                    })
                );
            }

            WAT.config.settings.items.forEach(function (item) {
                e.detail.e.request.applicationCommands.append(
                    new Windows.UI.ApplicationSettings.SettingsCommand(
                        "defaults",
                        item.title,
                        function () {
                            if (item.loadInApp === true) {
                                WAT.goToLocation(item.page);
                            } else {
                                Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(item.page));
                            }
                        }
                    )
                );
            });
        }

        if (WAT.config.notifications &&
            WAT.config.notifications.enabled &&
            WAT.config.notifications.azureNotificationHub &&
            WAT.config.notifications.azureNotificationHub.enabled) {

            // Adds notification page command link to the settings flyout pane
            e.detail.applicationcommands = {
                "notifications": {
                    title: "Notifications",
                    href: "/template/notify-settings.html"
                }
            };
            // Add this line to add another settings fly out page
            //    ,"about": { title: "About", href: "/template/about.html" }
        }

        WinJS.UI.SettingsFlyout.populateSettings(e);
    };


    // Module Registration
    WAT.registerModule("settings", self);

})(window.WAT);