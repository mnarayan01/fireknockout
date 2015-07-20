define(
    [
      "fireKnockout/inspectKnockoutContext"
    ],
    function(InspectKnockoutContext) {
      "use strict";

      return {
        initialize: function () {
          Firebug.registerModule(InspectKnockoutContext);
        },
        shutdown: function () {
          Firebug.unregisterModule(InspectKnockoutContext);
        }
      };
    }
);
