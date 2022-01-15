<a name="InteractionHandler"></a>

## InteractionHandler
A class for grouping map interactions, particularly those with on/off state such as edit-mode, as opposed to instantaneous interactions, like a click-query. Does not create any interactions on its own but by grouping interactions, allows a better-organized handling of interruptions and coordination of interaction events.

Interactions are started via [startInteraction](#InteractionHandler+startInteraction)() and ended via [endInteraction](#InteractionHandler+endInteraction)(). They may also be interrupted via [interrupt](#InteractionHandler+interrupt)().

* InteractionHandler
    * [new InteractionHandler(olMap)](#new_InteractionHandler_new)
    * [active](#InteractionHandler+active)
    * [isActive()](#InteractionHandler+isActive)
    * [activeInteraction()](#InteractionHandler+activeInteraction)
    * [get(name)](#InteractionHandler+get)
    * [addInteraction(name, interaction)](#InteractionHandler+addInteraction)
    * [removeInteraction(name)](#InteractionHandler+removeInteraction)
    * [startInteraction(type, [evt])](#InteractionHandler+startInteraction)
    * [endInteraction([evt], [cancel], [suppressClear], [suppressUpdate])](#InteractionHandler+endInteraction)
    * [clearInteraction()](#InteractionHandler+clearInteraction)
    * [interrupt(evt, [onInterrupt], [onCancel])](#InteractionHandler+interrupt)
    * [addMapListener(type)](#InteractionHandler+addMapListener)
    * [removeMapListener(type)](#InteractionHandler+removeMapListener)
    * [removeAllMapListeners()](#InteractionHandler+removeAllMapListeners)
    * [disableMapInteractions()](#InteractionHandler+disableMapInteractions)
    * [enableMapInteractions()](#InteractionHandler+enableMapInteractions)
    * [bindUiElements(elems, options)](#InteractionHandler+bindUiElements)
    
* [Generic Hooks](#generic-hooks)
    * [onInteractionStart](#InteractionHandler+onInteractionStart)
    * [onInteractionEnd](#InteractionHandler+onInteractionEnd)
    * [onClear](#InteractionHandler+onClear)
    * [onUpdate](#InteractionHandler+onUpdate)
    
* [Hook and Callback Definitions](#hook-and-callback-definitions)
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

----

<a name="new_InteractionHandler_new">#</a>
new **InteractionHandler**(olMap)

| Param | Type | Description |
| --- | --- | --- |
| olMap | `ol.Map` | OpenLayers map instance. However, simply calls `on()` and `un()`, so any object using the same interface can be used. Or leave null or defined if not using addition object to attach listeners to. |

<a name="InteractionHandler+active">#</a>
*interactionHandler*.**active**<br />
<a name="InteractionHandler+isActive">#</a>
*interactionHandler*.**isActive**()

Check if an interaction is currently active.

&nbsp; &nbsp; **Returns**: Whether there is an active interaction.  

<a name="InteractionHandler+activeInteraction">#</a>
*interactionHandler*.**activeInteraction**()

Get the name of the active interaction.

&nbsp; &nbsp; **Returns**: The name of the active interaction, or `null`.

<a name="InteractionHandler+get">#</a>
*interactionHandler*.**get**(name) ⇒ `Object`

Get the interaction definition by name.

| Param | Type | Description |
| --- | --- | --- |
| name | `string` | Unique name for interaction to return. |

&nbsp; &nbsp; **Returns**: Name of the active interaction, or `null`.

<a name="InteractionHandler+addInteraction">#</a>
*interactionHandler*.**addInteraction**(name, interaction) ⇒ `Object`

Add an interaction to be handled.

| Param | Type | Description |
| --- | --- | --- |
| name | `string` | Unique name for this interaction. |
| interaction | `Object` | Interaction parameters. |
| interaction.start | [`interactionStart`](#interactionStart) | Hook on starting interaction. |
| interaction.end | [`interactionEnd`](#interactionEnd) | Hook on ending the interaction. |
| [interaction.restart] | [`interactionRestart`](#interactionRestart) | Optional hook on restarting the interaction (that is, interaction start was called when it was already active). |
| [interaction.cancelStart] | [`interactionCancelStart`](#interactionCancelStart) | Optional hook called when canceling start interaction (e.g. when start was attempted but blocked). |
| [interaction.clear] | [`interactionClear`](#interactionClear) | Optional hook called on clearing an interaction, which is done when interaction is ended. Generally unnecessary but may have special use cases. |
| [interaction.checkInterrupt] | [`interactionInterrupt`](#interactionInterrupt) | Optional interrupt checking function. If supplied, hook called to confirm interruption, when this interruption is active and another attempts to interrupt it. |
| [interaction.map] | `Object` | Optional object of listener callbacks on the `olMap` with key being the event name and value being value being callback on that event. Map event listening must first be enabled via [addMapListener](#InteractionHandler+addMapListener)(). |
| [interaction.olInteraction] | ol.Interaction | Optional OpenLayers map interaction to bind with this interaction. |
| [interaction.saveOnInterrupt] | `boolean` | Special case, if true, to save changes even if interrupted. That is, treat any interruption as a normal end interaction. |

&nbsp; &nbsp; **Returns**: The interaction replaced or `null` not replacing anything.

<a name="InteractionHandler+removeInteraction">#</a>
*interactionHandler*.**removeInteraction**(name)

Remove an interaction definition from the handler. If interaction is currently active, interaction is interrupted first.

| Param | Type | Description |
| --- | --- | --- |
| name | `string` | Unique name for this interaction. |

<a name="InteractionHandler+startInteraction">#</a>
*interactionHandler*.**startInteraction**(type, [evt])

Start/activate interaction. Starting an interaction while there is currently an active interaction causes an `interrupt()` on the active interaction. However, restarting the same interaction will not interrupt, though it will retrigger all the relevant start hooks/listeners.

| Param | Type | Description |
| --- | --- | --- |
| type | `string` | Interaction name. |
| [evt] | `Event` | The event object. |

<a name="InteractionHandler+endInteraction">#</a>
*interactionHandler*.**endInteraction**([evt], [cancel], [suppressClear], [suppressUpdate]) ⇒ `string`

Ends the currently active interaction, calling specific function necessary to validate and update changes (or cancel).

| Param | Type | Description |
| --- | --- | --- |
| [evt] | `Event` | The event object. |
| [cancel] | `boolean` | If true, specifies so changes are discarded, not saved. |
| [suppressClear] | `boolean` | If true, suppresses [`clearInteraction()`](interactionHandler+clearInteraction) call after finishing. |
| [suppressUpdate] | `boolean` | If true, suppresses [`updateInfo()`](interactionHandler+updateInfo) call after finishing. |

&nbsp; &nbsp; **Returns**: Error message, if errored, or null.  

<a name="InteractionHandler+clearInteraction">#</a>
*interactionHandler*.**clearInteraction**()

Clear the active interaction. Here it does not do anything specific unless 'clear' callback is set in the definition of the active interaction or a general on-clear listener is set. This is called after the interaction finish triggered but before the general interaction end listener (if set) is called. Generally you don't call this directly, you call endInteraction() which also calls this function but left public for special cases. It may also not be called despite finishing interaction if `suppressClear` parameter is true. Examples of use are setting UI/elem reset stuff here. Thus you can call it separately if required.

<a name="InteractionHandler+interrupt">#</a>
*interactionHandler*.**interrupt**(evt, [onInterrupt], [onCancel])

Interrupt any active interactions that are currently active. If the currently active interaction has a [`checkInterrupt`](#interactionInterrupt) parameter defined, this callback/hook must be cleared first (by calling the passed callback to continue the interrupt request). Otherwise, it functions similarly to [`endInteraction()`](#InteractionHandler-endInteraction). Use if ending interaction should defer to any active check interruption definition first. That is, this is a 'softer' end request -- unlike [`endInteraction()`](#InteractionHandler-endInteraction), which always ends the interaction.

| Param | Type | Description |
| --- | --- | --- |
| evt | `Event` | The event object. |
| [onInterrupt] | `Callback` | Optional callback to run after successful interrupt. Generally good practice to have continuing code encapsulated in this callback as interactions with a check interrupt callback can only continue through this. |
| [onCancel] | `Callback` | Optional, for internal use only. To pass cancel function if attempting to start an interaction but canceled by check interrupt. |

<a name="InteractionHandler+addMapListener">#</a>
*interactionHandler*.**addMapListener**(type)

Add/initialize a OpenLayers map listener on defined event type. This calls `on(type, listener)` to the parameter supplied (if supplied) in the handler's constructor. As such, can be modified for anything using the same interface.

| Param | Type | Description |
| --- | --- | --- |
| type | `string` | The event name to attach map listener to. |

<a name="InteractionHandler+removeMapListener">#</a>
*interactionHandler*.**removeMapListener**(type)

Permanently remove/deactivate an OpenLayers map listener on defined event type. This calls `un(type, listener)` to the parameter supplied (if supplied) in the handler's constructor. As such, can be modified for anything using the same interface.

| Param | Type | Description |
| --- | --- | --- |
| type | `string` | The event name remove the listener from. |

<a name="InteractionHandler+removeAllMapListeners">#</a>
*interactionHandler*.**removeAllMapListeners**()

Permanently remove/deactivate all OpenLayers map listeners. This calls `un(type, listener)` to the parameter supplied (if supplied) in the handler's constructor. As such, can be modified for anything using the same interface.

<a name="InteractionHandler+disableMapInteractions">#</a>
*interactionHandler*.**disableMapInteractions**()

Temporarily disabled all map interactions.

<a name="InteractionHandler+enableMapInteractions">#</a>
*interactionHandler*.**enableMapInteractions**()

Renabled all map interactions.

<a name="InteractionHandler+bindUiElements">#</a>
*interactionHandler*.**bindUiElements**(elems, options)

Bind given elements to interaction handling listeners.

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| elems | `NodeList` \| `Element` \| `jQuery` |  | Element or elements (accepts either single, NodeList, or jQuery selection) |
| options | `Object` |  | Optional options to apply to handling. |
| [options.event] | `string` | `"click"` | The event type to attach the listener on. |
| [options.value] | `string` \| [`UIValueFunction`](#UIValueFunction) |  | How to determine what type of interaction to start. May be a constant value, or it may be a callback function, which will be called in the context of, and with as the only parameter, the element triggered. If not supplied, attempts to return the `value` of the element. |
| [options.always] | `Callback` |  | Optional callback to always run when event is triggered. Run before managing any interactions tied to event. |
| [options.interruptOnly] | `boolean` |  | If true, only interrupts active interactions, does not start any interaction. E.g. a cancel button. |
| [options.onInterrupt] | `Callback` |  | If interruptor only type, optional callback to run any time this is activated (whether there is an active interaction to get interrupted or not). |

&nbsp;

## Generic Hooks

<a name="InteractionHandler+onInteractionStart">#</a>
*interactionHandler*.**onInteractionStart**

The callback to be called before any interaction start. Useful for handling interruptions in other modules or canceling interaction start given certain conditions. 

See [`onInteractionStart`](#onInteractionStart).

<a name="InteractionHandler+onInteractionEnd">#</a>
*interactionHandler*.**onInteractionEnd**

The callback to be called after any interaction is ended.

See [`onInteractionEnd`](#onInteractionEnd).

<a name="InteractionHandler+onClear">#</a>
*interactionHandler*.**onClear**

The callback to be called after any interaction is cleared (see clearInteraction()). Usually helpful for UI clearing stuff.

See [`onInteractionClear`](#onInteractionClear).

<a name="InteractionHandler+onUpdate">#</a>
*interactionHandler*.**onUpdate**

The callback to be called after any interaction finished. Useful for passing information gathered on ending interaction (optionally through [#interactionEnd](#interactionEnd) callback), to some trigger to update the rest of the application based on this information.

See [`onInteractionUpdate`](#onInteractionUpdate).

&nbsp;

## Hook and Callback Definitions

<a name="interactionStart">#</a>
**interactionStart**()

Callback on starting an interaction. Callback is provided event (which may be null) and, if generic [`onInteractionStart`](#interactionHandler+onInteractionStart) hook, the name of interaction started.

| Param | Type | Description |
| --- | --- | --- |
| event | `Event` | Event object, which may be null. |
| name | `string` | Interaction name. Provided if generic [`onInteractionStart`](#interactionHandler+onInteractionStart) hook.  |

<a name="interactionEnd">#</a>
**interactionEnd**() ⇒ `Object`

Callback on ending an interaction. Endings may be defined as having ended normally or having been cancelled (in which case the param `cancel` wil be `true`). Interruptions will end the currently active interaction as cancelled.

| Param | Type | Description |
| --- | --- | --- |
| event | `Event` | Event object, which may be null. |
| cancel | `boolean` | A parameter denoting a cancel action to the interaction end. May be called manually but also automatically triggered when interaction is interrupted or removed while active. |

&nbsp; &nbsp; **Returns**: May optionally return any object, which will get passed to 
         [InteractionHandler#onInteractionUpdate](InteractionHandler#onInteractionUpdate)() in [endInteraction](#InteractionHandler+endInteraction)().  

<a name="interactionRestart">#</a>
**interactionRestart**() ⇒ `boolean`

Callback on restarting interaction. Called when the interaction is started but was already the active interaction. 

| Param | Type | Description |
| --- | --- | --- |
| event | `Event` | Event object, which may be null. |

&nbsp; &nbsp; **Returns**: Return `false` to cancel calling this interaction's [#startInteraction](#startInteraction) callback. 

<a name="interactionCancelStart">#</a>
**interactionCancelStart**()

If attempting to start this interaction, but could not interrupt the currently active interaction (as it has a confirm interrupt function that was not confirmed), use this callback to undo changes that have already happened. E.g. UI changes that were triggered on the click before the start interaction process was triggered.

<a name="interactionClear">#</a>
**interactionClear**()

Callback triggered on end interaction but separated as depending on case they made be called independently (via [clearInteraction](#InteractionHandler+clearInteraction)()) or not called during end as needed.

<a name="interactionInterrupt">#</a>
**interactionInterrupt**()

Callback triggered when this interaction is interrupted. Determines whether to confirm interruption, using pass callback to continue interruption callback (which may be ignored if canceling interruption).

| Param | Type | Description |
| --- | --- | --- |
| interrupt | `callback` | If interruption is confirmed, call this parameter to continue interrupt process. Otherwise, interruption is canceled. |
| cancel | `callback` | If interruption is canceled, call this parameter to undo certain UI changes that may have happened before start interaction that need to be reversed. |

<a name="interactionMap">#</a>
**interactionMap**()

Callback triggered on map interaction.

| Param | Type | Description |
| --- | --- | --- |
| event | `Event` | Event object. |

<a name="onInteractionStart">#</a>
**onInteractionStart**() ⇒ `boolean`

Callback on starting any interaction.

| Param | Type | Description |
| --- | --- | --- |
| event | `Event` | Event object, which may be null. |
| type | `string` | Unique name of interaction to be activated. |

&nbsp; &nbsp; **Returns**: Return `false` to cancel starting interaction. Strict check, so must be exactly `false`, not just evaluates to false.  

<a name="onInteractionEnd">#</a>
**onInteractionEnd**()

Callback after ending any interaction.

| Param | Type | Description |
| --- | --- | --- |
| event | `Event` | Event object, which may be null. |
| type | `string` | Unique name of interaction to be activated. |
| cancel | `boolean` | A parameter denoting a cancel action to the interaction end. May be called manually but also automatically triggered when interaction is interrupted or removed while active. |

<a name="onInteractionClear">#</a>
**onInteractionClear**()

Callback on clearing any interaction.

<a name="onInteractionUpdate">#</a>
**onInteractionUpdate**()

Callback after finishing end-interaction to trigger any following updates as needed. As such, passed parameters that may be returned by the interaction end callback ([interactionEnd](#interactionEnd)).

| Param | Type | Description |
| --- | --- | --- |
| endedInteractionName | `string` | Name of the interaction that was just ended. |
| endObj | `Object` | Passed object of various data, if created via [interactionEnd](#interactionEnd) callback. |
| errorMsg | `string` | Error message, if triggered during [interactionEnd](#interactionEnd) callback. |

<a name="UIValueFunction">#</a>
**UIValueFunction**() ⇒ `string`

Callback for returning a value denoting the interaction type bound to this UI element. Called within 
context such that `this` is the element on which the event was triggered.

| Param | Type | Description |
| --- | --- | --- |
| elem | `Element` | The element, same as context (`this`). |

&nbsp; &nbsp; **Returns**: Return the string value of the interaction type this is triggering.  
