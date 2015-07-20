/* global FBL, Firebug */

FBL.ns(function () {
  /**
   *
   * ### Security
   *
   * It is _believed_ that the following usage of `ko.contextFor` via `window.wrappedJSObject` is secure, but I'm not
   * going to stake anything too valuable on it. Potentially useful additional references:
   *
   * 1.  https://developer.mozilla.org/en-US/docs/en/XPCNativeWrapper
   * 2.  https://getfirebug.com/wiki/index.php/Using_win.wrappedJSObject
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

    // Checking that `realObject` is an instance of `window.Element` is fairly defensive; not sure whether it has any
    // utility. This is simply an attempt to ensure that we don't pass anything exploitable into the `contextFor`
    // function.
    window = firebugContext.window;
    if (!window || !window.Element || !(realObject instanceof window.Element)) {
      return null;
    }

    knockoutContextForFunction = (knockout = window.wrappedJSObject.ko) && knockout.contextFor;
    if (knockoutContextForFunction && FBL.isFunction(knockoutContextForFunction)) {
      return knockoutContextForFunction(realObject);
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
      Firebug.Module.shutdown.apply(this, arguments);

      Firebug.unregisterUIListener(this);
    },

    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
    // UI Listener

    onContextMenu: function (items, object, target, firebugContext, panel, popup) {
      var knockoutContext;
      var knockoutContextRep;
      var knockoutContextRealObject;

      knockoutContext = getKnockoutContext(firebugContext, object);
      if (!knockoutContext) {
        return;
      }

      // REVIEW: Not sure if going through `getRep` and `getRealObject` serve any purpose what so ever.

      knockoutContextRep = Firebug.getRep(knockoutContext, firebugContext);
      if (!knockoutContextRep || !knockoutContextRep.inspectable) {
        return;
      }

      knockoutContextRealObject = knockoutContextRep.getRealObject(knockoutContext, firebugContext);
      if (!knockoutContextRealObject) {
        return;
      }

      FBL.createMenuSeparator(popup);

      FBL.createMenuItem(popup, {
        label: "Inspect Knockout context",
        tooltiptext: "Open the Knockout context for the current element in the DOM panel",
        command: this.inspectKnockoutContext.bind(this, knockoutContextRealObject)
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
