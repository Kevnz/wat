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
    var setupSearchCharm, handleSearchQuery, setupOnScreenSearch,
        logger = window.console;

    // Public API
    var self = {

        start: function () {
            if (WAT.getModule("log")) {
                logger = WAT.getModule("log");
            }

            if (!WAT.config.search || WAT.config.search.enabled !== true || !WAT.config.search.searchURL) {
                return;
            }

            if (WAT.config.search.useOnScreenSearchBox === true) {
                setupOnScreenSearch();
            } else {
                setupSearchCharm();
            }
        }

    };

    setupSearchCharm = function () {
        try {
            if (Windows.ApplicationModel.Search.SearchPane.getForCurrentView()) {
                Windows.ApplicationModel.Search.SearchPane.getForCurrentView().onquerysubmitted = handleSearchQuery;
            }
        } catch (err) {
            // let's not crash the app for this...
            logger.error("Error initializing search charm:", err);
        }
    };

    setupOnScreenSearch = function () {
        var searchOptions = (WAT.config.search.onScreenSearchOptions || {}),
            searchBox = new WinJS.UI.SearchBox(WAT.options.searchBox, {
                chooseSuggestionOnEnter: (searchOptions.chooseSuggestionOnEnter !== false), // default to true
                focusOnKeyboardInput: !!searchOptions.focusOnKeyboardInput, // default to false
                placeholderText: (searchOptions.placeholderText || "search query"),
                searchHistoryDisabled: !!searchOptions.searchHistoryDisabled, // default to false
                searchHistoryContext: "wat-app-search", // static
                disabled: false
            });

        WAT.options.searchBox.style.display = "block";


        WinJS.UI.processAll().done(function () {
            WAT.options.searchBox.addEventListener("querysubmitted", handleSearchQuery);
        });
    };


    handleSearchQuery = function (e) {
        var query = e.queryText;

        if (e.detail.queryText) {
            query = e.detail.queryText;
        }

        WAT.goToLocation(WAT.config.search.searchURL + query);
    };


    // Module Registration
    WAT.registerModule("search", self);

})(window.WAT);