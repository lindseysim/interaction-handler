# Interaction Handler #

2019 -- Lawrence Sim

[API](API.md)

----------


### The problem ###

In a highly interactive application, there soon becomes many interaction types defined. Some of these interactions are instantaneous (e.g. a simple button press), but some of which are persistent until an action ends it (e.g. drawing or editing something). Interactions can have complex processes on starting/ending (such as saving the edits). This is complicated by the fact that the user may try to start another interaction while one is currently ongoing. The current interaction must be ended, but is it ended gracefully or interrupted? Does it first have a prompt asking the user if they're sure to cancel said interaction?

### The philosophy ###

"Interaction" itself becomes a state, which **Interaction Handler** manages. Aside from ability to handle listeners on an OpenLayers map instance (optional), it does not actually process the interactions themselves. It only manages them. However all interactions must be started and ended through the handler.

### Interaction lifecycle ###

At the simplest, an interaction starts and eventually ends. The interaction may be instantaneous, in which it runs a process and ends immediately when said process is finished. Or an interaction may be persistent and is active until another action ends it.

Only one interaction may be active at one time. When another interaction attempts to start while an interaction is currently active, it sends an interrupt request. The currently active interaction then begins the interrupt process by canceling the interaction.

There are more complicated routes as we get into ending versus canceling, restarting interactions, interruption confirmation, and cancel starts. These will be covered in more depth in the later sections.

----------

### Defining an interaction ###

Interactions are defined primarily through callbacks. Thus. For greater detail see the [API](API.md), but the below gives a rough outline on defining an interaction.

##### `addInteraction(name, interaction)` #####

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

----------

### Simple use case ###

In this example, we're adding OpenLayers map-measure interactions, which handle the actual interactions themselves. One for measuring by distance by line, other for measuring area by polygon. 

First create the interactions in the handlers. Because the interactions are quite similar, we will share the same routes. However, the interactions themselves are unique, so added separately with different names.

    var measureInteraction = null, 
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
        measureInteraction = new ol.interaction.Draw({
            source: this.measureSource, 
            type: geomType, 
            style: this.measureStyle
        });
        // on draw end of the OpenLayers interaction, end the interaction
        measureInteraction.on("drawend", function(evt) {
            interactionHandler.endInteraction(evt, false);
        });
        olMap.addInteraction(measureInteraction);
    }

    function endMeasure(evt, cancel) {
        if(measureInteraction) {
            olMap.removeInteraction(this.measureInteraction);
            measureInteraction = null;
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

### Restarting interactions and canceling on reclick ###

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

### Confirm interruption ###

As written above, clicking the cancel button will simply end the interaction without alerting the distance or area measured. Perhaps we want to have the user prompted whether to cancel while they're in the middle of their drawing first.

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