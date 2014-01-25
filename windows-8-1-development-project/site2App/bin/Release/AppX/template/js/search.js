(function (WAT) {
    "use strict";

    // Private method declaration
    var setupSearchCharm, handleSearchQuery,
        logger = window.console;

    // Public API
    var self = {

        start: function () {
            if (WAT.getModule("log")) {
                logger = WAT.getModule("log");
            }

            if (!WAT.config.search || WAT.config.search.enabled !== true) {
                return;
            }

            setupSearchCharm();
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

    handleSearchQuery = function (e) {
        if (WAT.config.search.searchURL) {

            WAT.goToLocation(WAT.config.search.searchURL + e.queryText);

        } else {

            new Windows.UI.Popups.MessageDialog("You searched for '" + e.queryText + "'")
                .showAsync()
                .then(); // TODO: what do we do here? Anything?

        }
    };


    // Module Registration
    WAT.registerModule("search", self);

})(window.WAT);