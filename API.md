<a name="InteractionHandler"></a>

## InteractionHandler
A class for grouping map interactions, particularly those with on/off state such as edit-mode, as opposed to instantaneous ineractions, like a click-query. Does not create any interactions on its own but by grouping interactions, allows a better-organized handling of interruptions and coordination of interaction events.

Interactions are started via [startInteraction](#InteractionHandler+startInteraction)() and ended via [endInteraction](#InteractionHandler+endInteraction)(). They may also be interrupted via [interrupt](#InteractionHandler+interrupt)().

* [InteractionHandler](#InteractionHandler)
    * [new InteractionHandler(olMap)](#new_InteractionHandler_new)
    * [.addInteraction(name, interaction)](#InteractionHandler+addInteraction)
    * [.removeInteraction(name)](#InteractionHandler+removeInteraction)
    * [.onInteractionStart(callback)](#InteractionHandler+onInteractionStart)
    * [.onInteractionEnd(callback)](#InteractionHandler+onInteractionEnd)
    * [.onClear(callback)](#InteractionHandler+onClear)
    * [.onUpdate(callback)](#InteractionHandler+onUpdate)
    * [.startInteraction(type, [evt])](#InteractionHandler+startInteraction)
    * [.endInteraction([evt], [cancel], [suppressClear], [suppressUpdate])](#InteractionHandler+endInteraction)
    * [.clearInteraction()](#InteractionHandler+clearInteraction)
    * [.interrupt(evt, [onInterrupt], [onCancel])](#InteractionHandler+interrupt)
    * [.addMapListener(type)](#InteractionHandler+addMapListener)
    * [.removeMapListener(type)](#InteractionHandler+removeMapListener)
    * [.removeAllMapListeners()](#InteractionHandler+removeAllMapListeners)
    * [.disableMapInteractions()](#InteractionHandler+disableMapInteractions)
    * [.enableMapInteractions()](#InteractionHandler+enableMapInteractions)
    * [.bindUiElements(elems, options)](#InteractionHandler+bindUiElements)
    
* [Callback Definitions](#Callback-Definitions)
    * [interactionStart](#interactionStart)
    * [interactionEnd](#interactionEnd)
    * [interactionRestart](#interactionRestart)
    * [interactionCancelStart](#interactionCancelStart)
    * [interactionClear](#interactionClear)
    * [interactionInterrupt](#interactionInterrupt)
    * [interactionMap](#interactionMap)
    * [onInteractionStart](#onInteractionStart)
    * [onInteractionEnd](#onInteractionEnd)
    * [onInteractionClear](#onInteractionClear)
    * [onInteractionUpdate](#onInteractionUpdate)
    * [UIValueFunction](#UIValueFunction)

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
| [interaction.restart] | [<code>interactionRestart</code>](#interactionRestart) | Optional clear function. |
| [interaction.cancelStart] | [<code>interactionCancelStart</code>](#interactionCancelStart) | Optional callback if canceling start interaction. |
| [interaction.clear] | [<code>interactionClear</code>](#interactionClear) | Optional clear function. |
| [interaction.checkInterrupt] | [<code>interactionInterrupt</code>](#interactionInterrupt) | Optional interrupt checking function. |
| [interaction.map] | <code>Object</code> | Optional map of listener functions with key being the event name and value being value being callback on that event. Listener must first be enabled via [addMapListener](#InteractionHandler+addMapListener)(). |
| {ol.Interaction |  | [interaction.olInteraction] - Optional OpenLayers map interaction to bind with this interaction. |
| [interaction.saveOnInterrupt] | <code>boolean</code> | Special case, if true, to save changes even if interrupted. That is, treat any interruption as a normal end interaction. |

<a name="InteractionHandler+removeInteraction"></a>

### interactionHandler.removeInteraction(name)
Remove an interaction. If interaction is currently active, interaction is interrupted first.

**Kind**: instance method of [<code>InteractionHandler</code>](#InteractionHandler)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Unique name for this interaciton. |

<a name="InteractionHandler+onInteractionStart"></a>

### interactionHandler.onInteractionStart(callback) ⇒ <code>boolean</code>
Set a callback to be called before any interaction start. Useful for handling interruptions in other modules or canceling interaction start given certain conditions. Callback is provided event (which may be null) and interaction name as arguments.

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
Set a callback to be called after any interaction is cleared (see clearInteraction()). Usually helpful for UI clearing stuff.

**Kind**: instance method of [<code>InteractionHandler</code>](#InteractionHandler)  

| Param | Type |
| --- | --- |
| callback | [<code>onInteractionClear</code>](#onInteractionClear) | 

<a name="InteractionHandler+onUpdate"></a>

### interactionHandler.onUpdate(callback)
Set a callback to be called after any interaction finished. See [#onInteractionUpdate](#onInteractionUpdate) callback, but useful for passing information gathered on ending interaction (optionally through [#interactionEnd](#interactionEnd) callback), to some trigger
to update the rest of the application based on this information.

**Kind**: instance method of [<code>InteractionHandler</code>](#InteractionHandler)  

| Param | Type |
| --- | --- |
| callback | [<code>onInteractionUpdate</code>](#onInteractionUpdate) | 

<a name="InteractionHandler+startInteraction"></a>

### interactionHandler.startInteraction(type, [evt])
Start/activate interaction. Starting an interaction without while there is currently an active interaction causes an interrupt() on the active interaction. However, restarting the same interaction will not interrupt, though it will retrigger all the releveant start event listeners.

**Kind**: instance method of [<code>InteractionHandler</code>](#InteractionHandler)  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Interaction name. |
| [evt] | <code>Event</code> | The event object. |

<a name="InteractionHandler+endInteraction"></a>

### interactionHandler.endInteraction([evt], [cancel], [suppressClear], [suppressUpdate]) ⇒ <code>string</code>
End interaction. Ends interaction, calling specific function necessary to validate and update changes (or cancel).

**Kind**: instance method of [<code>InteractionHandler</code>](#InteractionHandler)  
**Returns**: <code>string</code> - Error message, if errored, or null.  

| Param | Type | Description |
| --- | --- | --- |
| [evt] | <code>Event</code> | The event object. |
| [cancel] | <code>boolean</code> | If true, specifies so changes are discarded, not saved. |
| [suppressClear] | <code>boolean</code> | If true, suppresses [`clearInteraction()`](interactionHandler+clearInteraction) call after finishing. |
| [suppressUpdate] | <code>boolean</code> | If true, suppresses [`updateInfo()`](interactionHandler+updateInfo) call after finishing. |

<a name="InteractionHandler+clearInteraction"></a>

### interactionHandler.clearInteraction()
Clear active interaction. Here it does not do anything specific unless 'clear' callback is set in the definition of the active interaction or a general on-clear listener is set. This is called after the interaction finish triggered but before the general interaction end listener (if set) is called. Generally you don't call this directly, you call endInteraction() which also calls this function but left public for special cases. It may also not be called despite finishing interaction if `suppressClear` parameter is true. Examples of use are setting UI/elem reset stuff here. Thus you can call it separately if required.

**Kind**: instance method of [<code>InteractionHandler</code>](#InteractionHandler)  
<a name="InteractionHandler+interrupt"></a>

### interactionHandler.interrupt(evt, [onInterrupt], [onCancel])
Interrupt (that is, finish without saving) any active UDA interactions that are currently active.

**Kind**: instance method of [<code>InteractionHandler</code>](#InteractionHandler)  

| Param | Type | Description |
| --- | --- | --- |
| evt | <code>Event</code> | The event object. |
| [onInterrupt] | <code>Callback</code> | Optional callback to run after successful interrupt. Generally good practice to have continuing code encapsulated in this callback as interactions with a check interrupt callback can only continue through this. |
| [onCancel] | <code>Callback</code> | Optional, for internal use only. To pass cancel function if attempting to start an interaction but canceled by check interrupt. |

<a name="InteractionHandler+_cancelStartInteraction"></a>

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

**Kind**: instance method of [<code>InteractionHandler</code>](#InteractionHandler)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| elems | <code>NodeList</code> \| <code>Element</code> \| <code>jQuery</code> |  | Element or elements (accepts either single, NodeList, or jQuery selection) |
| options | <code>Object</code> |  | Optional options to apply to handling. |
| [options.event] | <code>string</code> | <code>"click"</code> | The event type to attach the listener on. |
| [options.value] | <code>string</code> \| [<code>UIValueFunction</code>](#UIValueFunction) |  | How to determine what type of interaction to start. May be a constant value, or it may be a callback function, which will be called in the context of, and with as the only parameter, the element triggered. If not supplied, attempts to return the `value` of the element. |
| [options.always] | <code>Callback</code> |  | Optional callback to always run when event is triggered. Run before         managing any interactions tied to event. |
| [options.interruptOnly] | <code>boolean</code> |  | If true, only interrupts active interactions, does not start any        interaction. E.g. a cancel button. |
| [options.onInterrupt] | <code>Callback</code> |  | If interruptor only type, optional callback to run any time this         is activated (whether there is an active interaction to get interrupted or not). |


<a name="Callback-Definitions"></a>

## Callback Definitions

<a name="interactionStart"></a>

### interactionStart
Callback on starting interaction. Always called when the interaction is started.

| Param | Type | Description |
| --- | --- | --- |
| event | <code>Event</code> | Event object, which may be null. |

<a name="interactionEnd"></a>

### interactionEnd ⇒ <code>Object</code>
Callback on ending interaction. Endings may be divided as ending normally or cancelled using the `cancel` parameter. Interruptions are passed as an ending interaction event with cancel parameter as true.

**Returns**: <code>Object</code> - May optionally return any object, which will get passed to 
         [InteractionHandler#onInteractionUpdate](InteractionHandler#onInteractionUpdate)() in [endInteraction](#InteractionHandler+endInteraction)().  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>Event</code> | Event object, which may be null. |
| cancel | <code>boolean</code> | A parameter denoting a cancel action to the interaction end. May be called manually but also automatically triggered when interaction is interrupted or removed while active. |

<a name="interactionRestart"></a>

### interactionRestart ⇒ <code>boolean</code>
Callback on restarting interaction. Called when the interaction is started but was already the active interaction.

**Returns**: <code>boolean</code> - Return false to cancel calling this interaction's [#startInteraction](#startInteraction) callback.  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>Event</code> | Event object, which may be null. |

<a name="interactionCancelStart"></a>

### interactionCancelStart
If attempting to start this interaction, but could not interrupt the currently active interaction (as it has a confirm interrupt function that was not confirmed), use this callback to undo changes that have already happened. E.g. UI changes that were triggered on the click before the start interaction process was triggered.

<a name="interactionClear"></a>

### interactionClear
Callback triggered on end interaction but separated as depending on case they made be called independently (via [clearInteraction](#InteractionHandler+clearInteraction)()) or not called during end as needed.

<a name="interactionInterrupt"></a>

### interactionInterrupt
Callback triggered when this interaction is interrupted. Determines whether to confirm interruption, using pass callback to continue interruption callback (which may be ignored if canceling interruption).

| Param | Type | Description |
| --- | --- | --- |
| interrupt | <code>callback</code> | If interruption is confirmed, call this parameter to continue interrupt process. Otherwise, interruption is canceled. |
| cancel | <code>callback</code> | If interruption is canceled, call this parameter to undo certain UI changes that may have happened before start interaction that need to be reversed. |

<a name="interactionMap"></a>

### interactionMap
Callback triggered on map interaction.

| Param | Type | Description |
| --- | --- | --- |
| event | <code>Event</code> | Event object. |

<a name="onInteractionStart"></a>

### onInteractionStart ⇒ <code>boolean</code>
Callback on starting any interaction.

**Returns**: <code>boolean</code> - Return false to cancel starting interaction. Strict check, so must be exactly false, not just evaluates to false.  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>Event</code> | Event object, which may be null. |
| type | <code>string</code> | Unique name of interaction to be activated. |

<a name="onInteractionEnd"></a>

### onInteractionEnd 
Callback after ending any interaction.

| Param | Type | Description |
| --- | --- | --- |
| event | <code>Event</code> | Event object, which may be null. |
| type | <code>string</code> | Unique name of interaction to be activated. |
| cancel | <code>boolean</code> | A parameter denoting a cancel action to the interaction end. May be called manually but also automatically triggered when interaction is interrupted or removed while active. |

<a name="onInteractionClear"></a>

### onInteractionClear
Callback on clearing any interaction.

<a name="onInteractionUpdate"></a>

### onInteractionUpdate
Callback after finishing end-interaction to trigger any following updates as needed. As such, passed parameters that may be returned by the interaction end callback ([interactionEnd](#interactionEnd)).

| Param | Type | Description |
| --- | --- | --- |
| endedInteractionName | <code>string</code> | Name of the interaction that was just ended. |
| endObj | <code>Object</code> | Passed object of various data, if created via [interactionEnd](#interactionEnd) callback. |
| errorMsg | <code>string</code> | Error message, if triggered during [interactionEnd](#interactionEnd) callback. |

<a name="UIValueFunction"></a>

### UIValueFunction ⇒ <code>string</code>
Callback for returning a value denoting the interaction type bound to this UI element. Called within 
context such that `this` is the element on which the event was triggered.

**Returns**: <code>string</code> - String value of the interaction type this is triggering.  

| Param | Type | Description |
| --- | --- | --- |
| elem | <code>Element</code> | The element, same as context (`this`). |

