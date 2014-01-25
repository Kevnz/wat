(function () {
    "use strict";

    var page = WinJS.UI.Pages.define("/template/notify-settings.html", {
        ready: function (element, options) {
            var templateElement = document.getElementById("templateDiv");
            var renderElement = document.getElementById("templateControlRenderTarget");
            renderElement.innerHTML = "";

            var templateControl = templateElement.winControl;

            var notify = WAT.getModule("notify");
            for (var i = 0; i < notify.tagSubs.length; i++) {
                templateElement.winControl.render(notify.tagSubs[i], renderElement).then(
                    function completed(result) {
                        // Get a handle to newly rendered toggle switch inside the template
                        var e = renderElement.children[i].children[0];

                        // Need to set id attribute here, wouldn't render in data-win-bind for some reason
                        e.setAttribute("id", notify.tagSubs[i].id);

                        // Add changed event handler
                        e.winControl.addEventListener('change', subscriptionChanged, false);
                    });
            }
        }
    });

    function subscriptionChanged(event) {
        console.log("Changed:" + event.target.winControl.title);

        // Update setting model & subscription
        var notify = WAT.getModule("notify").updateSubscription(event.target.id, event.target.winControl.checked);
    }
})();
