## Callback Definitions

<dl>
<dt><a href="#interactionStart">interactionStart</a> : <code>function</code></dt>
<dd><p>Callback on starting interaction. Always called when the interaction is started.</p>
</dd>
<dt><a href="#interactionEnd">interactionEnd</a> ⇒ <code>Object</code></dt>
<dd><p>Callback on ending interaction. Endings may be divided as ending normally or cancelled using the <code>cancel</code> 
parameter. Interruptions are passed as an ending interaction event with cancel parameter as true.</p>
</dd>
<dt><a href="#interactionCancelStart">interactionCancelStart</a> : <code>function</code></dt>
<dd><p>If attempting to start this interaction, but could not interrupt the currently active interaction (as it 
has a confirm interrupt function that was not confirmed), use this callback to undo changes that have 
already happened. E.g. UI changes that were triggered on the click before the start interaction process 
was triggered.</p>
</dd>
<dt><a href="#interactionClear">interactionClear</a> : <code>function</code></dt>
<dd><p>Callback triggered on end interaction but separated as depending on case they made be called independently 
(via <a href="#InteractionHandler+clearInteraction">clearInteraction</a>()) or not called during end as needed.</p>
</dd>
<dt><a href="#interactionInterrupt">interactionInterrupt</a> : <code>function</code></dt>
<dd><p>Callback triggered when this interaction is interrupted. Determines whether to confirm interruption, using 
pass callback to continue interruption callback (which may be ignored if canceling interruption).</p>
</dd>
<dt><a href="#interactionMap">interactionMap</a> : <code>function</code></dt>
<dd><p>Callback triggered on map interaction.</p>
</dd>
<dt><a href="#onInteractionStart">onInteractionStart</a> ⇒ <code>boolean</code></dt>
<dd><p>Callback on starting any interaction.</p>
</dd>
<dt><a href="#onInteractionEnd">onInteractionEnd</a> : <code>function</code></dt>
<dd><p>Callback after ending any interaction.</p>
</dd>
<dt><a href="#onInteractionClear.">onInteractionClear.</a> : <code>function</code></dt>
<dd><p>Callback on clearing any interaction.</p>
</dd>
<dt><a href="#onInteractionUpdate.">onInteractionUpdate.</a> : <code>function</code></dt>
<dd><p>Callback after finishing end interaction to trigger any following updates as needed. As such, passed 
parameters that may be returned by the interaction end callback 
(<a href="interactionEndInteractionHandler#">interactionEndInteractionHandler#</a>).</p>
</dd>
<dt><a href="#uiValueFunction">uiValueFunction</a> ⇒ <code>string</code></dt>
<dd><p>Callback for returning a value denoting the interaction type bound to this UI element. Called within 
context such that <code>this</code> is the element on which the event was triggered.</p>
</dd>
</dl>

<a name="InteractionHandler"></a>

## InteractionHandler
A class for grouping map interactions, particularly those with on/off state such as edit-mode, as opposed to instantaneous ineractions, like a click-query. Does not create any interactions on its own but by grouping interactions, allows a better-organized handling of interruptions and coordination of interaction events.

Interactions are started via [startInteraction](#InteractionHandler+startInteraction)() and ended via [endInteraction](#InteractionHandler+endInteraction)(). They may also be interrupted via [interrupt](#InteractionHandler+interrupt)().

* [InteractionHandler](#InteractionHandler)
    * [new InteractionHandler(olMap)](#new_InteractionHandler_new)
    * [.addInteraction(name, interaction)](#InteractionHandler+addInteraction) ⇒ <code>Object</code>
    * [.removeInteraction(name)](#InteractionHandler+removeInteraction)
    * [.onInteractionStart(callback)](#InteractionHandler+onInteractionStart) ⇒ <code>boolean</code>
    * [.onInteractionEnd(callback)](#InteractionHandler+onInteractionEnd)
    * [.onClear(callback)](#InteractionHandler+onClear)
    * [.onUpdate(callback)](#InteractionHandler+onUpdate)
    * [.startInteraction(type, [evt])](#InteractionHandler+startInteraction)
    * [.endInteraction([evt], [cancel], [suppressClear], [suppressUpdate])](#InteractionHandler+endInteraction) ⇒ <code>string</code>
    * [.clearInteraction()](#InteractionHandler+clearInteraction)
    * [.interrupt(evt, [onInterrupt], [onCancel])](#InteractionHandler+interrupt)
    * [._cancelStartInteraction(type)](#InteractionHandler+_cancelStartInteraction)
    * [.addMapListener(type)](#InteractionHandler+addMapListener)
    * [.removeMapListener(type)](#InteractionHandler+removeMapListener)
    * [.removeAllMapListeners()](#InteractionHandler+removeAllMapListeners)
    * [.disableMapInteractions()](#InteractionHandler+disableMapInteractions)
    * [.enableMapInteractions()](#InteractionHandler+enableMapInteractions)
    * [.bindUiElements(elems, options)](#InteractionHandler+bindUiElements)

<a name="new_InteractionHandler_new"></a>

### new InteractionHandler(olMap)
Constructor.


| Param | Type | Description |
| --- | --- | --- |
| olMap | <code>ol.Map</code> | OpenLayers map instance. |

<a name="InteractionHandler+addInteraction"></a>

### interactionHandler.addInteraction(name, interaction) ⇒ <code>Object</code>
Add an interaction.

**Kind**: instance method of [<code>InteractionHandler</code>](#InteractionHandler)  
**Returns**: <code>Object</code> - The interaction replaced or null not replacing anything.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Unique name for this interaciton. |
| interaction | <code>Object</code> | Interaction parameters. |
| interaction.start | [<code>interactionStart</code>](#interactionStart) | Callback on starting interaction. |
| interaction.end | [<code>interactionEnd</code>](#interactionEnd) | Callback on ending the interaction. |
| [interaction.cancelStart] | [<code>interactionCancelStart</code>](#interactionCancelStart) | Optional callback if canceling start         interaction. |
| [interaction.clear] | [<code>interactionClear</code>](#interactionClear) | Optional clear function. |
| [interaction.checkInterrupt] | [<code>interactionInterrupt</code>](#interactionInterrupt) | Optional interrupt checking function. |
| [interaction.map] | <code>Object</code> | Optional map of listener functions with key being the event name and         value being value being callback ([InteractionHandler#interactionMap](InteractionHandler#interactionMap)) on that event. Listener        must first be enabled via [addMapListener](#InteractionHandler+addMapListener)(). |
| {ol.Interaction |  | [interaction.olInteraction] - Optional OpenLayers map interaction to bind with this        interaction. |
| [interaction.saveOnInterrupt] | <code>boolean</code> | Special case, if true, to save changes even if         interrupted. That is, treat any interruption as a normal end interaction. |

<a name="InteractionHandler+removeInteraction"></a>

### interactionHandler.removeInteraction(name)
Remove an interaction. If interaction is currently active, interaction is interrupted first.

**Kind**: instance method of [<code>InteractionHandler</code>](#InteractionHandler)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Unique name for this interaciton. |

<a name="InteractionHandler+onInteractionStart"></a>

### interactionHandler.onInteractionStart(callback) ⇒ <code>boolean</code>
Set a callback to be called before any interaction start. Useful for handling interruptions in other 
modules or canceling interaction start given certain conditions. Callback is provided event (which may be 
null) and interaction name as arguments.

**Kind**: instance method of [<code>InteractionHandler</code>](#InteractionHandler)  
**Returns**: <code>boolean</code> - If false, will cancel the interaction start.  

| Param | Type |
| --- | --- |
| callback | [<code>onInteractionStart</code>](#onInteractionStart) | 

<a name="InteractionHandler+onInteractionEnd"></a>

### interactionHandler.onInteractionEnd(callback)
Set a callback to be called after any interaction end.

**Kind**: instance method of [<code>InteractionHandler</code>](#InteractionHandler)  

| Param | Type |
| --- | --- |
| callback | [<code>onInteractionEnd</code>](#onInteractionEnd) | 

<a name="InteractionHandler+onClear"></a>

### interactionHandler.onClear(callback)
Set a callback to be called after any interaction is cleared (see clearInteraction()). Usually helpful for 
UI clearing stuff.

**Kind**: instance method of [<code>InteractionHandler</code>](#InteractionHandler)  

| Param | Type |
| --- | --- |
| callback | <code>onInteractionClear</code> | 

<a name="InteractionHandler+onUpdate"></a>

### interactionHandler.onUpdate(callback)
Set a callback to be called after any interaction finished. See 
[InteractionHandler#onInteractionUpdate](InteractionHandler#onInteractionUpdate) callback, but useful for passing information gathered on 
ending interaction (optionally through [InteractionHandler#interactionEnd](InteractionHandler#interactionEnd) callback), to some trigger
to update the rest of the application based on this information.

**Kind**: instance method of [<code>InteractionHandler</code>](#InteractionHandler)  

| Param | Type |
| --- | --- |
| callback | <code>onInteractionUpdate</code> | 

<a name="InteractionHandler+startInteraction"></a>

### interactionHandler.startInteraction(type, [evt])
Start/activate interaction. Starting an interaction without while there is currently an active interaction 
causes an interrupt() on the active interaction. However, restarting the same interaction will not 
interrupt, though it will retrigger all the releveant start event listeners.

**Kind**: instance method of [<code>InteractionHandler</code>](#InteractionHandler)  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Interaction name. |
| [evt] | <code>Event</code> | The event object. |

<a name="InteractionHandler+endInteraction"></a>

### interactionHandler.endInteraction([evt], [cancel], [suppressClear], [suppressUpdate]) ⇒ <code>string</code>
End interaction. Ends interaction, calling specific function necessary to validate and update changes 
(or cancel).

**Kind**: instance method of [<code>InteractionHandler</code>](#InteractionHandler)  
**Returns**: <code>string</code> - Error message, if errored, or null.  

| Param | Type | Description |
| --- | --- | --- |
| [evt] | <code>Event</code> | The event object. |
| [cancel] | <code>boolean</code> | If true, specifies so changes are discarded, not saved. |
| [suppressClear] | <code>boolean</code> | If true, suppresses clearInteraction() call after finishing. |
| [suppressUpdate] | <code>boolean</code> | If true, suppresses updateInto() call after finishing. |

<a name="InteractionHandler+clearInteraction"></a>

### interactionHandler.clearInteraction()
Clear active interaction. Here it does not do anything specific unless 'clear' callback is set in the 
definition of the active interaction or a general on-clear listener is set. This is called after the 
interaction finish triggered but before the general interaction end listener (if set) is called.
<br /><br />
Generally you don't call this directly, you call endInteraction() which also calls this function but 
left public for special cases. It may also not be called despite finishing interaction if "suppressClear" 
parameter is true.
<br /><br />
Examples of use are setting UI/elem reset stuff here. Thus you can call it separately if required.

**Kind**: instance method of [<code>InteractionHandler</code>](#InteractionHandler)  
<a name="InteractionHandler+interrupt"></a>

### interactionHandler.interrupt(evt, [onInterrupt], [onCancel])
Interrupt (that is, finish without saving) any active UDA interactions that are currently active.

**Kind**: instance method of [<code>InteractionHandler</code>](#InteractionHandler)  

| Param | Type | Description |
| --- | --- | --- |
| evt | <code>Event</code> | The event object. |
| [onInterrupt] | <code>Callback</code> | Optional callback to run after successful interrupt. Generally good         practice to have continuing code encapsulated in this callback as interactions with a check         interrupt callback can only continue through this. |
| [onCancel] | <code>Callback</code> | Optional, for internal use only. To pass cancel function if attempting to         start an interaction but canceled by check interrupt. |

<a name="InteractionHandler+_cancelStartInteraction"></a>

### interactionHandler.\_cancelStartInteraction(type)
Cancel start interaction. Usually needed to "undo" interface changes that triggered by trying to start it.

**Kind**: instance method of [<code>InteractionHandler</code>](#InteractionHandler)  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Interaction name. |

<a name="InteractionHandler+addMapListener"></a>

### interactionHandler.addMapListener(type)
Add/initialize a map listener on defined event type.

**Kind**: instance method of [<code>InteractionHandler</code>](#InteractionHandler)  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | The event name to attach map listener to. |

<a name="InteractionHandler+removeMapListener"></a>

### interactionHandler.removeMapListener(type)
Permanently remove/deactivate a map listener on defined event type.

**Kind**: instance method of [<code>InteractionHandler</code>](#InteractionHandler)  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | The event name remove the listener from. |

<a name="InteractionHandler+removeAllMapListeners"></a>

### interactionHandler.removeAllMapListeners()
Permanently remove/deactivate all map listener.

**Kind**: instance method of [<code>InteractionHandler</code>](#InteractionHandler)  
<a name="InteractionHandler+disableMapInteractions"></a>

### interactionHandler.disableMapInteractions()
Temporarily disabled all map interactions.

**Kind**: instance method of [<code>InteractionHandler</code>](#InteractionHandler)  
<a name="InteractionHandler+enableMapInteractions"></a>

### interactionHandler.enableMapInteractions()
Renabled all map interactions.

**Kind**: instance method of [<code>InteractionHandler</code>](#InteractionHandler)  
<a name="InteractionHandler+bindUiElements"></a>

### interactionHandler.bindUiElements(elems, options)
Bind given elements to interaction handling.
TODO(?) Add detach function for hanging event listeners? Not currently needed but..

**Kind**: instance method of [<code>InteractionHandler</code>](#InteractionHandler)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| elems | <code>NodeList</code> \| <code>Element</code> \| <code>jQuery</code> |  | Element or elements (accepts either single, NodeList, or jQuery         selection) |
| options | <code>Object</code> |  | Optional options to apply to handling. |
| [options.event] | <code>string</code> | <code>&quot;\&quot;click\&quot;&quot;</code> | The event type to attach the listener on. |
| [options.valueFunction] | <code>string</code> \| [<code>uiValueFunction</code>](#uiValueFunction) |  | How to determine what type of interaction to         start. May be a constant value, or it may be a callback function, which will be called in the         context of, and with as the only parameter, the element triggered. |
| [options.always] | <code>Callback</code> |  | Optional callback to always run when event is triggered. Run before         managing any interactions tied to event. |
| [options.interruptOnly] | <code>boolean</code> |  | If true, only interrupts active interactions, does not start any        interaction. E.g. a cancel button. |
| [options.onInterrupt] | <code>Callback</code> |  | If interruptor only type, optional callback to run any time this         is activated (whether there is an active interaction to get interrupted or not). |

<a name="interactionStart"></a>

## interactionStart : <code>function</code>
Callback on starting interaction. Always called when the interaction is started.

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>Event</code> | Event object, which may be null. |

<a name="interactionEnd"></a>

## interactionEnd ⇒ <code>Object</code>
Callback on ending interaction. Endings may be divided as ending normally or cancelled using the `cancel` 
parameter. Interruptions are passed as an ending interaction event with cancel parameter as true.

**Kind**: global typedef  
**Returns**: <code>Object</code> - May optionally return any object, which will get passed to 
         [InteractionHandler#onInteractionUpdate](InteractionHandler#onInteractionUpdate)() in [endInteraction](#InteractionHandler+endInteraction)().  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>Event</code> | Event object, which may be null. |
| cancel | <code>boolean</code> | A parameter denoting a cancel action to the interaction end. May be called         manually but also automatically triggered when interaction is interrupted or removed while active. |

<a name="interactionCancelStart"></a>

## interactionCancelStart : <code>function</code>
If attempting to start this interaction, but could not interrupt the currently active interaction (as it 
has a confirm interrupt function that was not confirmed), use this callback to undo changes that have 
already happened. E.g. UI changes that were triggered on the click before the start interaction process 
was triggered.

**Kind**: global typedef  
<a name="interactionClear"></a>

## interactionClear : <code>function</code>
Callback triggered on end interaction but separated as depending on case they made be called independently 
(via [clearInteraction](#InteractionHandler+clearInteraction)()) or not called during end as needed.

**Kind**: global typedef  
<a name="interactionInterrupt"></a>

## interactionInterrupt : <code>function</code>
Callback triggered when this interaction is interrupted. Determines whether to confirm interruption, using 
pass callback to continue interruption callback (which may be ignored if canceling interruption).

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| interrupt | <code>callback</code> | If interruption is confirmed, call this parameter to continue interrupt         process. Otherwise, interruption is canceled. |
| cancel | <code>callback</code> | If interruption is canceled, call this parameter to undo certain UI changes that        may have happened before start interaction that need to be reversed. |

<a name="interactionMap"></a>

## interactionMap : <code>function</code>
Callback triggered on map interaction.

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>Event</code> | Event object. |

<a name="onInteractionStart"></a>

## onInteractionStart ⇒ <code>boolean</code>
Callback on starting any interaction.

**Kind**: global typedef  
**Returns**: <code>boolean</code> - Return false to cancel starting interaction. Strict check, so must be exactly false, not
         just evaluates to false.  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>Event</code> | Event object, which may be null. |
| type | <code>string</code> | Unique name of interaction to be activated. |

<a name="onInteractionEnd"></a>

## onInteractionEnd : <code>function</code>
Callback after ending any interaction.

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>Event</code> | Event object, which may be null. |
| type | <code>string</code> | Unique name of interaction to be activated. |
| cancel | <code>boolean</code> | A parameter denoting a cancel action to the interaction end. May be called         manually but also automatically triggered when interaction is interrupted or removed while active. |

<a name="onInteractionClear."></a>

## onInteractionClear. : <code>function</code>
Callback on clearing any interaction.

**Kind**: global typedef  
<a name="onInteractionUpdate."></a>

## onInteractionUpdate. : <code>function</code>
Callback after finishing end interaction to trigger any following updates as needed. As such, passed 
parameters that may be returned by the interaction end callback 
([interactionEndInteractionHandler#](interactionEndInteractionHandler#)).

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| endedInteractionName | <code>string</code> | Name of the interaction that was just ended. |
| endObj | <code>Object</code> | Passed object of various data, if created via         [interactionEndInteractionHandler#](interactionEndInteractionHandler#) callback. |
| errorMsg | <code>string</code> | Error message, if triggered during [interactionEndInteractionHandler#](interactionEndInteractionHandler#)         callback. |

<a name="uiValueFunction"></a>

## uiValueFunction ⇒ <code>string</code>
Callback for returning a value denoting the interaction type bound to this UI element. Called within 
context such that `this` is the element on which the event was triggered.

**Kind**: global typedef  
**Returns**: <code>string</code> - String value of the interaction type this is triggering.  

| Param | Type | Description |
| --- | --- | --- |
| elem | <code>Element</code> | The element, same as context (`this`). |

