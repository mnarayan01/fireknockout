FBL.ns(function () {
  /**
   *
   * @todo REVIEW: Calling the function `contextFor` accessed via the `window.wrappedJSObject` property appears to be safe, but more investigation would be optimal.
   *
   * @private
   *
   * @param context
   * @param object
   * @returns {Knockout.Context}
   */
  function getKnockoutContext(context, object) {
    var window;
    var knockout;
    var knockoutContextForFunction;

    knockoutContextForFunction = (window = context.window) && (knockout = window.wrappedJSObject.ko) && knockout.contextFor;

    if (knockoutContextForFunction && FBL.isFunction(knockoutContextForFunction)) {
      return knockoutContextForFunction(object);
    } else {
      return null;
    }
  }

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

      var knockoutContext = getKnockoutContext(context, object);
      if (!knockoutContext) {
        return;
      }

      FBL.createMenuSeparator(popup);

      FBL.createMenuItem(popup, {
        label: "Inspect Knockout context",
        tooltiptext: "Open the Knockout context for the current element in the DOM panel",
        command: this.inspectKnockoutContext.bind(this, knockoutContext)
      });
    },

    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
    // Context Menu Actions

    inspectKnockoutContext: function (knockoutContext) {
      Firebug.chrome.select(knockoutContext, "dom");
    }
  });

  Firebug.registerModule(InspectKnockoutContext);
});
