FBL.ns(function () {
  /**
   *
   * @todo REVIEW: Calling the function `contextFor` accessed via the `window.wrappedJSObject` property appears to be safe, but more investigation would be optimal.
   *
   * @private
   *
   * @param firebugContext
   * @param object
   * @returns {?Knockout.Context}
   */
  function getKnockoutContext(firebugContext, object) {
    var rep;
    var realObject;
    var window;
    var knockout;
    var knockoutContextForFunction;

    // Much of this was adapted from UseInCommandLine from the base Firebug source.

    if (!object || typeof object === "boolean") {
      return null;
    }

    rep = Firebug.getRep(object, firebugContext);
    if (!rep || !rep.inspectable) {
      return null;
    }

    realObject = rep.getRealObject(object, firebugContext);
    if (!FBL.isElement(realObject)) {
      return null;
    }

    // Checking that the object is an instance of `window.Element` is fairly defensive; not sure whether it has any
    // utility. This is simply an attempt to ensure that we don't pass anything exploitable into the `contextFor`
    // function.
    window = firebugContext.window;
    if (!window || !window.Element || !(object instanceof window.Element)) {
      return null;
    }

    knockoutContextForFunction = (knockout = window.wrappedJSObject.ko) && knockout.contextFor;
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
