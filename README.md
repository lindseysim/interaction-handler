# Interaction Handler

Lawrence Sim © 2022

----------

### The problem

In a highly interactive application, there soon becomes many interaction types defined. Some of these interactions are instantaneous -- such as a simple button press -- but some of which are persistent until an action ends it -- such as drawing or editing something. Interactions can further have complex processes on starting/ending (such as saving the edits when finished). This is complicated by the fact that the user may try to start another interaction while one is currently ongoing. The current interaction must be ended, but is it ended gracefully or interrupted? Does it first have a prompt asking the user if they're sure to cancel said interaction? Suddenly, you're writing boilerplate for making sure every interaction interrupts the other correctly and event listeners start to become convoluted.

### The idea

The current active interaction becomes a state, which `InteractionHandler` manages. Interactions are defined by a series of lifecycle hooks, which are called as appropriate by `InteractionHandler`. Aside from the ability to handle listeners on an OpenLayers map instance (optional), it does not actually process the interactions themselves, it only manages them and calls the appropriate hooks. However all interactions must be started and ended through the handler.

### Interaction lifecycle

At the simplest, an interaction starts and eventually ends. The interaction may be instantaneous, in which it runs a process and ends immediately when said process is finished. Or an interaction may be persistent and is active until another action ends it.

Only one interaction may be active at one time. When another interaction attempts to start while an interaction is currently active, it sends an interrupt request. The currently active interaction then begins the interrupt process by canceling the interaction.

There are more complicated routes as we get into ending versus canceling, restarting interactions, interruption confirmation, and cancel starts. These will be covered in more depth in the later sections.

----------

### [API Documentation](API.md)

----------

### Defining an interaction

Interactions are defined primarily through lifecycle hooks. For greater detail see the [API](API.md), but the below gives a rough outline on defining an interaction.

##### `InteractionHandler.prototype.addInteraction(name, interaction)`

| Param | Description |
| --- | --- |
| name | Unique name for this interaction. |
| interaction | Interaction parameters. |
| interaction.start | Hook on starting interaction. Required, even if empty function. |
| interaction.end | Hook on ending the interaction. Required, even if empty function. |
| [interaction.restart] | Optional hook on restarting the interaction (that is, interaction start was called when it was already active). Can also be defined as a boolean if behavior is fixed. |
| [interaction.cancelStart] | Optional hook called when canceling start interaction (e.g. when start was attempted but blocked). |
| [interaction.clear] | Optional hook called on clearing an interaction, which is done when interaction is ended. Generally unnecessary but may have special use cases. |
| [interaction.checkInterrupt] | Optional interrupt checking function. If supplied, hook called to confirm interruption, when this interruption is active and another attempts to interrupt it. |
| [interaction.map] | Optional object of listener callbacks on the `olMap` with key being the event name and value being value being callback on that event. Map event listening must first be enabled via [addMapListener](API.md#InteractionHandler+addMapListener)(). |
| [interaction.saveOnInterrupt] | Special case, if true, to save changes even if interrupted. That is, treat any interruption as a normal end interaction. |

##### Lifecycle flowchart

How the above hooks are called/used when starting a new interaction is shown below.

![](images/lifecycle.png)

----------

### Simple use case

In this example, we have an OpenLayers map onto which want to add measurement tools for both distance and area. For the measurement actions, we will use OpenLayers' built in draw interaction handler, but then wrap everything under the interaction handler. 

The UI elements we'll assume are defined somewhere in the webpage as follows, each of which will start a unique interaction type (plus one button to cancel). Note the attributes `geom` and `for`, which we specially design for use later.

```html
<button class="ui-measure" geom="line" for="measure-line">Measure Distance</button>
<button class="ui-measure" geom="poly" for="measure-poly">Measure Area</button>
<button class="ui-measure-cancel">Cancel</button>
```

First, before we define an interaction for the interaction handler we will define the callbacks for the start/end hooks. The hooks will apply and remove the OpenLayers interactions to the map, and if ending, alert message the final length/area measurement.

```javascript
// Assume at this point the following vars have been defined:
// * olMap - the OpenLayers map
// * interactionHandler - our instance of InteractionHandler

// store the active OpenLayer interaction here so we can remove it
var olInteraction;

function startMeasure(evt) {
    // get the geometry type of the button pressed
    var geomType = evt ? evt.currentTarget.getAttribute("geom") : null;
    switch(geomType) {
        case "line":
            geomType = "LineString";
            break;
        case "poly":
            geomType = "Polygon";
            break;
        default:
            // if no recognized geometry type, end interaction
            interactionHandler.endInteraction(null, true);
            return;
    }
    // create the OpenLayer draw interaction
    olInteraction = new ol.interaction.Draw({
        source: measureLayerSource, 
        type: geomType, 
        style: this.measureStyle
    });
    // on draw end of the OpenLayers interaction, end the currently active 
    // interaction in interaction handler, which we can assume is this one
    olInteraction.on("drawend", evt => interactionHandler.endInteraction(evt, false));
    // add the OpenLayers itneraction to the map
    olMap.addInteraction(olInteraction);
}

function endMeasure(evt, cancel) {
    // remove and dereference the OpenLayers interaction
    if(olInteraction) {
        olMap.removeInteraction(olInteraction);
        olInteraction = null;
    }
    // evt will be a special OpenLayers event, with the feature drawn
    if(!cancel && evt && evt.feature) {
        var geom = evt.feature.getGeometry();
        if(geom.getType() === "LineString") {
            alert(ol.sphere.getLength(geom));
        } else {
            alert(ol.sphere.getArea(geom));
        }
    }
}
```

Here we define the interactions with the start and end lifecycle hooks as previous defined.

While we can share the hooks for both types of measurement interactions, as they're written generically, the interactions themselves (for line and polygon measurements) are unique so they are added separately to the interaction handler with unique names.

The options `saveOnInterrupt` is optional and defaults to `false`, but we'll define it here just to be explicit about it.

```javascript
interactionHandler.addInteraction(
    "measure-line", 
    {
        start:           startMeasure, 
        end:             endMeasure, 
        saveOnInterrupt: false
    }
);
interactionHandler.addInteraction(
    "measure-poly", 
    {
        start:           startMeasure, 
        end:             endMeasure, 
        saveOnInterrupt: false
    }
);
```

Going back to the buttons, we can bind the `click` listeners to the HTML elements via [`bindUiElements(elems, options)`](API.md#InteractionHandler+bindUiElements). The name of the interaction they start are given by the attribute, which will be pulled during the `value` callback to return the interaction name (which we defined earlier as an attribute in the button itself). The cancel button, meanwhile, is set to only interrupt any active events, without starting any interaction of its own.

```javascript
interactionHandler.bindUiElements(
    document.querySelectorAll(".ui-measure"), 
    {
        event: 'click', 
        value: function() {
            return this.getAttribute("for");
        }
    }
);
interactionHandler.bindUiElements(
    document.querySelector(".ui-measure-cancel"), 
    {interruptOnly: true}
);
```

Note you do not necessarily have to use [`bindUiElements()`](API.md#InteractionHandler+bindUiElements), you can manually bind events as you like to [`startInteraction()`](API.md#InteractionHandler+startInteraction) and [`endInteraction()`](API.md#InteractionHandler+endInteraction). This just makes a quick shortcut.

##### Restarting interactions and canceling on reclick

If clicking, say, the measure-line button to activate it, then clicking it again, we actually restarted the interaction. This actually causes `startMeasure` to be called twice without calling `endMeasure`, which is erroneous and will double-up on adding the `ol.interaction.Draw` to the map.

To counter this, you may add code to enable and disable the buttons. But we may also want to add a programmatic check. In the simplest case, we can just set the restart hook explicitly to `false`, thus halting retriggering the start interaction hook from being called while still keeping the interaction active. The restart hook may also be a callback, if the behavior is more dynamic and depends.

```javascript
// and same with 'measure-poly'
interactionHandler.addInteraction(
    "measure-line", 
    {
        start:           startMeasure, 
        end:             endMeasure, 
        restart:         false, 
        checkInterrupt:  confirmInterrupt, 
        saveOnInterrupt: false
    }
);
```

Alternatively, you may want it such that clicking on the button when it's already active actually ends it (via interruption). We can do this by setting the generic interaction start hook, which is called on any interaction start, and if it returns `false`, will cancel the start request before it can begin.

For more, see [API on generic hooks](API.md#generic-hooks).

```javascript
interactionHandler.onInteractionStart = function(evt, name) {
    if(this.activeInteraction === name) {
        this.interrupt();  // call interruption
        return false;      // return false to not continue starting this interaction
    }
};
```

##### Prompt to confirm interruption

As written above, interrupting/canceling the measure interaction will simply end the interaction without computing the distance or area measured. Perhaps we want to have the user prompted whether to confirm cancellation when such an event occurs. If so, in the interaction options, we can define a hook for `checkInterrupt`.

```javascript
// will be passed two callbacks to choose how to continue
function confirmInterrupt(interrupt, cancel) {
    var modal = document.querySelector("#modal");  // assumes this element exists
    modal.innerHTML = (
        "<p>Cancel measurement?</p>" + 
        "<button id='modal-cancel'>No, continue measuring</button>" + 
        "<button id='modal-confirm'>Yes, stop measuring</button>"
    );
    modal.querySelector("#modal-confirm").addEventListener('click', () => {
        interrupt();
        modal.innerHTML = "";
        modal.style.display = "none";
    });
    modal.querySelector("#modal-cancel").addEventListener('click', () => {
        cancel();
        modal.innerHTML = "";
        modal.style.display = "none";
    });
    modal.style.display = "block";
}

interactionHandler.addInteraction(
    "measure-line", 
    {
        start:           startMeasure, 
        end:             endMeasure, 
        restart:         false, 
        checkInterrupt:  confirmInterrupt, 
        saveOnInterrupt: false
    }
);
// and repeat interaction add with 'measure-poly'
```

----------

### More notes

##### End interaction vs. interrupt

Ending an interaction simply ends the interaction. Interrupting the interaction attempts to end the interaction but may be rejected depending on whether a `checkInterrupt` callback exists for the interaction and is therein canceled. If it exists and returns a confirmed response, the interrupt will eventually route to `endInteraction()`. 

The default state of an `endInteraction()` call is that it is not a 'cancel' event. An interaction ended through `interrupt()` sets the `cancel` parameter passed to the hook as `true`. See the definition for the [`interactionEnd` hook](API.md#interactionEnd).

##### Generic hooks

[Generic hooks](API.md#generic-hooks) that are always triggered on starting or ending an interaction can be set on the interaction handler itself with [`onInteractionStart`](API.md#nteractionHandler+onInteractionStart) and [`onInteractionEnd`](API.md#nteractionHandler+onInteractionEnd).

The generic start hook is called immediately before starting the interaction itself (that is, before the interaction specific `interactionStart` hook) and may return `false` to cancel the interaction start. The generic end interaction hook is called after ending the interaction.

Additionally, there you may add generic hooks to clear and update events with [`onClear`](API.md#nteractionHandler+onClear) and [`onUpdate`](API.md#nteractionHandler+onUpdate). 

The generic on-clear hook if called before the generic end interaction hook, but may be suppressed by setting the `suppressClear` parameter in `endInteraction()` to `true`. 

The generic on-update hook is called last and is unique in that it gets passed the ended interaction name-key and, if it exists, any object returned by the interaction specific `interactionEnd` hook, or the exception if said callback errored.

##### Error handling

All user supplied callbacks are wrapped in a try-catch block within the `interactionStart()` and `interactionEnd()` methods. Generally speaking, if an exception occurs during `interactionStart()`, the interaction is assumed to have failed to start and still inactive. If an exception occurs during `interactionEnd()`, the process continues until it has cleared the interaction and is assumed inactive. Obviously though, do not assume exceptions will be handled cleanly and rely solely on this.

##### OpenLayers map listeners

For special map events that are handled internally in OpenLayers, like zoom or view changes, we handle these by supplying an instance of the OpenLayers map in the constructor and using a few special hooks. 

Map listening callback can be optionally provided within the `map` parameter for the interaction definition. The map listener for each interaction will only work when said interaction is active. However, listeners are not applied to the map itself, and thus cannot be activated until [`addMapListener()`](API.md#InteractionHandler+addMapListener) is called for the events specified. It is always safe to call `addMapListener()` again as it overwrites instead of adds. `addMapListener()` does not need to be called again for the same event type after adding a new interaction with map listeners, provided it was already applied. 

```javascript
var interactionHandler = new InteractionHandler(olMap);

interactionHandler.addInteraction(
    'map-move-listening', 
    {
        start: function(evt) { /* does nothing of interest */ }, 
        end: function(evt, cancel) { /* does nothing of interest */ }
        map: {
            movestart: evt => console.log("Map moving in progress."), 
            moveend: evt => console.log("Map view changed.")
        }
    }
);

// need to activate the map listeners on the events we are using
interactionHandler.addMapListener('movestart');
interactionHandler.addMapListener('moveend');

interactionHandler.startInteraction('map-move-listening');
/* 
 * during here, the console log statements will be happening during map moves
 */
interactionHandler.endInteraction()

```

Map listeners can also be temporarily disabled and enabled via [`disableMapInteractions()`](#InteractionHandler+disableMapInteractions) and [`enableMapInteractions()`](#InteractionHandler+enableMapInteractions) without ending or otherwise affecting the currently active interaction.

The OpenLayers map being passed is optional, and the handler will not break if an OpenLayers map is not supplied. However, it will obviously break if attempting to use the map listener functionality. Additionally, the only functions called in the OpenLayers map object are `on(type, listener)` and `un(type, listener)`, so this can be replaced by anything that follows a similar interface.
