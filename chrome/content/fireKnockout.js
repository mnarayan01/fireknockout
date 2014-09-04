FBL.ns(function () {
  // Adapted from UseInCommandLine from the base Firebug source.
  var InspectKnockoutContext = FBL.extend(Firebug.Module, {
    dispatchName: "InspectKnockoutContext",

    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
    // Extends Module

    initialize: function () {
      Firebug.Module.initialize.apply(this, arguments);

      Firebug.registerUIListener(this);
    },

    shutdown: function () {
      Module.shutdown.apply(this, arguments);

      Firebug.unregisterUIListener(this);
    },

    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
    // UI Listener

    onContextMenu: function (items, object, target, context, panel, popup) {
      if (typeof object === "boolean" || object === undefined || object === null) {
        return;
      }

      var rep = Firebug.getRep(object, context);
      if (!rep || !rep.inspectable) {
        return;
      }

      // This was adapted from UseInCommandLine from the base Firebug source. The proceeding two checks may not be
      // needed.
      var realObject = rep.getRealObject(object, context);
      if (!FBL.isElement(realObject)) {
        return;
      }

      var window;
      var knockout;
      var knockoutContext = (window = context.window) && (knockout = window.wrappedJSObject.ko) && knockout.contextFor(object);
      if (!knockoutContext) {
        return;
      }

      FBL.createMenuSeparator(popup);

      FBL.createMenuItem(popup, {
        label: "Inspect Knockout context",
        tooltiptext: "Open the Knockout context for the current element in the DOM panel",
        command: this.inspectKnockoutContext.bind(this, knockoutContext)
      });


      var currentKnockoutDataObject = knockoutContext.$data;
      if (currentKnockoutDataObject) {
        var nameTooltipString = (function () {
          var currentKnockoutDataObjectName = currentKnockoutDataObject.constructor && currentKnockoutDataObject.constructor.name;

          if (currentKnockoutDataObjectName) {
            return " (" + currentKnockoutDataObjectName + ") ";
          } else {
            return " ";
          }
        })();

        FBL.createMenuItem(popup, {
          label: "Inspect Knockout binding",
          tooltiptext: "Open the $data object" + nameTooltipString + "in the Knockout context for the current element in the DOM panel",
          command: this.inspectCurrentKnockoutDataObject.bind(this, currentKnockoutDataObject)
        });
      }
    },

    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
    // Context Menu Actions

    inspectKnockoutContext: function (knockoutContext) {
      Firebug.chrome.select(knockoutContext, "dom");
    },

    inspectCurrentKnockoutDataObject: function (knockoutDataObject) {
      Firebug.chrome.select(knockoutDataObject, "dom");
    }
  });

  Firebug.registerModule(InspectKnockoutContext);
});
