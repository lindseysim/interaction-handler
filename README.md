# Interaction Handler #

2019 -- Lawrence Sim

----------


### The problem ###

In a highly interactive application, there soon becomes many interaction types defined. Some of these interactions are instantaneous (e.g. a simple button press), but some of which are persistent until an action ends it (e.g. drawing or editing something). Interactions can have complex processes on starting/ending (such as saving the edits). This is complicated by the fact that the user may try to start another interaction while one is currently ongoing. The current interaction must be ended, but is it ended gracefully or interrupted? Does it first have a prompt asking the user if they're sure to cancel said interaction? Suddenly, you're writing boilerplate for making sure every interaction interrupts the other correctly and event listeners start to become convoluted.

### The idea ###

"Interaction" itself becomes a state, which **Interaction Handler** manages. Aside from ability to handle listeners on an OpenLayers map instance (optional), it does not actually process the interactions themselves, it only manages them. However all interactions must be started and ended through the handler.

### Interaction lifecycle ###

At the simplest, an interaction starts and eventually ends. The interaction may be instantaneous, in which it runs a process and ends immediately when said process is finished. Or an interaction may be persistent and is active until another action ends it.

Only one interaction may be active at one time. When another interaction attempts to start while an interaction is currently active, it sends an interrupt request. The currently active interaction then begins the interrupt process by canceling the interaction.

There are more complicated routes as we get into ending versus canceling, restarting interactions, interruption confirmation, and cancel starts. These will be covered in more depth in the later sections.

----------

### [API Documentation](API.md) ###

----------

### Defining an interaction ###

Interactions are defined primarily through callbacks. Thus. For greater detail see the [API](API.md), but the below gives a rough outline on defining an interaction.

##### `InteractionHandler.prototype.addInteraction(name, interaction)` #####

<table>
  <tbody>
    <tr>
      <th>Parameter</th><th>Description</th>
    </tr>
    <tr>
      <td>name</td><td>Unique name-key for the interaction.</td>
    </tr>
    <tr>
      <td>interaction.start</td><td>Callback on starting this interaction. Provided <code>event</code> parameter.</td>
    </tr>
    <tr>
      <td>interaction.end</td><td>Callback on ending this interaction. Provided <code>event</code>, and <code>cancel</code> parameters.</td>
    </tr>
    <tr>
      <td>interaction.restart</td><td><i>Optional.</i> Callback if restarting this interaction (that is, interaction start was called when it was already active). Provided <code>evt</code> parameter. If calling start twice without the end callback may cause issues, return <code>false</code> to skip retriggering <code>interaction.start</code> (while still keeping this interaction active).</td>
    </tr>
    <tr>
      <td>interaction.cancelStart</td><td><i>Optional.</i> Callback if attempt to start this interaction was canceled as the interruption of the currently active interaction was blocked. Provided <code>type</code> parameter.</td>
    </tr>
    <tr>
      <td>interaction.clear</td><td><i>Optional.</i> Callback on clearing an interaction, which is done when interaction is ended. Generally unnecessary but may have special use cases.</td>
    </tr>
    <tr>
      <td>interaction.checkInterrupt</td><td><i>Optional.</i> If supplied, callback to confirm interruption, when this interruption is active and another attempts to interrupt it. Provided callbacks of <code>interrupt</code> and <code>cancel</code> as parameters. One, and only one, of the provided callbacks must be called depending on confirming  or canceling the interruption.</td>
    </tr>
    <tr>
      <td>interaction.map</td><td><i>Optional.</i> Key-value map of event names and callbacks to apply to the OpenLayers map when this interaction is active.</td>
    </tr>
    <tr>
      <td>interaction.saveOnInterrupt</td><td><i>Optional.</i> If true, interruptions are provided the <code>cancel</code> parameter as false -- that is, treating interruptions as if a normal end interaction event.</td>
    </tr>
  </tbody>
</table>

##### Flowchart on starting and interaction #####

How the above callback parameters are used when starting a new interaction, is shown below.

![](images/lifecycle.png)

----------

### Simple use case ###

In this example, we're adding OpenLayers map-measure interactions, which handle the actual interactions themselves. One for measuring by distance by line, other for measuring area by polygon. 

First create the interactions in the handlers. Because the interactions are quite similar, we will share the same routes. However, the interactions themselves are unique, so added separately with different names.

    var olInteraction = null, 
        iOptions = {
            start: startMeasure, 
            end: endMeasure, 
            saveOnInterrupt: false
        };
    interactionHandler.addInteraction("measure-line", iOptions);
    interactionHandler.addInteraction("measure-poly", iOptions);

    function startMeasure(evt) {
        var geomType = evt ? evt.currentTarget.getAttribute("geom") : null;
        if(geomType === "line") {
            geomType = "LineString";
        } else if(geomType === "poly") {
            geomType = "Polygon";
        } else {
            // if no recognized geometry type, end interaction
            return interactionHandler.endInteraction(null, true);
        }
        olInteraction = new ol.interaction.Draw({
            source: measureLayerSource, 
            type: geomType, 
            style: this.measureStyle
        });
        // on draw end of the OpenLayers interaction, end the interaction
        olInteraction.on("drawend", function(evt) {
            interactionHandler.endInteraction(evt, false);
        });
        olMap.addInteraction(olInteraction);
    }

    function endMeasure(evt, cancel) {
        if(olInteraction) {
            olMap.removeInteraction(olInteraction);
            olInteraction = null;
        }
        if(!cancel && evt && evt.feature) {
            var geom = evt.feature.getGeometry();
            if(geom.getType() === "LineString") {
                alert(ol.sphere.getLength(geom));
            } else {
                alert(ol.sphere.getArea(geom));
            }
        }
    }

Now the UI elements..

    <button class="ui-measure" geom="line">Measure Distance</button>
    <button class="ui-measure" geom="poly">Measure Area</button>
    <button class="ui-measure-cancel">Cancel</button>

..are bound to `click` events. The name of the interaction they start are given by the `valueFunction` option. The cancel button, meanwhile, is set to only interrupt any active events, without starting any interaction of its own.

    interactionHandler.bindUiElements(
        document.querySelectorAll(".ui-measure"), 
        {
            event: 'click', 
            valueFunction: function() {
                return "measure-"+this.getAttribute("geom");
            }
        }
    );
    interactionHandler.bindUiElements(
        document.querySelector(".ui-measure-cancel"), 
        {interruptOnly: true}
    );

Note you do not necessarily have to use `bindUiElements()`, and you can manually bind events as you like to `startInteraction()` and `endInteraction()`.

##### Restarting interactions and canceling on reclick #####

If clicking, say, the measure line button to activate it, then clicking it again, we actually just restart the interaction. This actually causes `startMeasure` to be called twice, without calling `endMeasure`, which is erroneous and will double up adding `ol.interaction.Draw` to the map.

To counter this, you may add code to enable and disable the buttons. But we may also want to add a programmatic check. In the simplest case, we can add a restart callback that returns false, thus halting retriggering the start interaction callback while still keeping the interaction active.

    var iOptions = {
            start: startMeasure, 
            end: endMeasure, 
            restart: function() { return false; }, 
            checkInterrupt: confirmInterrupt, 
            saveOnInterrupt: false
        };

Alternatively, you may want it such that clicking on the button when it's already active actually interrupts it. Assuming you already placed code to swap the button labels on click so their behavior is evident:

    interactionHandler.onInteractionStart(function(evt, type) {
        // note startsWith() requires polyfill in IE
        if(type.startsWith("measure") && this.activeInteraction === type) {
            this.interrupt();
            return false;
        }
    });

##### Prompt to confirm interruption #####

As written above, interrupting/canceling the measure interaction will simply end the interaction without computing the distance or area measured. Perhaps we want to have the user prompted whether to confirm cancellation when such an event occurs.

If so, in the interaction options, we can adjust the interaction options like so, linking in to a confirm interruption function.

    var iOptions = {
            start: startMeasure, 
            end: endMeasure, 
            restart: function() { return false; }, 
            checkInterrupt: confirmInterrupt, 
            saveOnInterrupt: false
        };
    
    function confirmInterrupt(interrupt, cancel) {
        var modal = document.querySelector("#modal");
        modal.innerHTML = (
            "<p>Cancel measurement?</p>" + 
            "<button id='modal-cancel'>No, continue measuring</button>" + 
            "<button id='modal-confirm'>Yes, stop measuring</button>"
        );
        modal.querySelector("#modal-confirm").addEventListener('click', function() {
            interrupt();
            modal.innerHTML = "";
            modal.style.display = "none";
        });
        modal.querySelector("#modal-cancel").addEventListener('click', function() {
            cancel();
            modal.innerHTML = "";
            modal.style.display = "none";
        });
        modal.style.display = "block";
    }

----------

### More notes ###

##### End interaction vs. interrupt #####

Ending an interaction simply ends the interaction. Interrupting the interaction attempts to end the interaction, but may be rejected, depending on whether a `checkInterrupt` callback exists for the interaction is therein canceled. However, if confirmed, interrupt will eventually route to `endInteraction()`. Additionally, the default state of an `endInteraction()` call is that it is not a 'cancel' event. An interaction ended through `interrupt()` sets the `cancel` parameter to `true`.

##### Default listeners #####

Default listeners that are always triggered on starting or ending an interaction can be applied through `onInteractionStart()` and `onInteractionEnd()`. 

The default start interaction event listener is called immediately before starting the interaction itself (that is, before the interaction specific `interactionStart` callback), and may return `false` to cancel the interaction start. The default end interaction event listener is called after ending the interaction.

Additionally, there you may add default event listeners to clear and update events with `onClear()` and `onUpdate()`. 

The *on-clear* listener if called before the default end interaction listener, but may be suppressed with `suppressClear` parameter in `endInteraction()` is `true`. 

The *on-update* listener is called last and is unique in that it gets passed the ended interaction name-key and, if it exists, any object returned by the interaction specific `interactionEnd` callback, or the exception if said callback errored.

##### Error handling #####

All user supplied callbacks are wrapped in a try-catch block within the `interactionStart()` and `interactionEnd()` methods. Generally speaking, if an exception occurs during `interactionStart()`, the interaction is assumed to have failed to start and still inactive. If an exception occurs during `interactionEnd()`, the process continues until it has cleared the interaction and is assumed inactive. Obviously though, do not assume exceptions will be handled cleanly and rely on this.

##### OpenLayers map listeners #####

OpenLayers is optional, and the handler will not break if an OpenLayers map is not supplied. However, it will obviously break if attempting to use the map listener functionality.

Map listening callback are optionally provided with each interaction via the `interaction.map` parameter. The map listener for each interaction will only work when said interaction is active. However, listeners are not applied to the map itself, and thus cannot be activated, until `addMapListener()` is called for the events specified. It is always safe to call `addMapListener()` again as it overwrites instead of adds. `addMapListener()` does not need to be called again for the same event type after adding a new interaction with map listeners, provided it was already applied. 

Map listeners can be temporarily disabled and enabled via `disableMapInteraction()` and `enableMapInteraction()`. Note that on ending an interaction, map listeners are always reenabled, just in case.