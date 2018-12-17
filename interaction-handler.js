/**
 * Constructor.
 * @class
 * @classdesc A class for grouping map interactions, particularly those with on/off state such as edit-mode, 
 * as opposed to instantaneous ineractions, like a click-query. Does not create any interactions on its own 
 * but by grouping interactions, allows a better-organized handling of interruptions and coordination of 
 * interaction events.<br /><br />Interactions are started via {@link InteractionHandler#startInteraction}() 
 * and ended via {@link InteractionHandler#endInteraction}(). They may also be interrupted via 
 * {@link InteractionHandler#interrupt}().
 * @constructor
 * @param {ol.Map} olMap - OpenLayers map instance.
 * @returns {InteractionHandler}
 */
function InteractionHandler(olMap) {
    // OpenLayers map
    this.olMap                = olMap;
    // interaction definitions/functionaltiy
    this._interactions        = {};
    // interaction listeners on map
    this._mapInteractions     = {}, 
    // active interaction name/key
    this._activeInteraction   = null;
    // special flag to temporarily disable map interactions related to this
    this._blockMapInteraction = false;
    // interaction listeners
    this._onInteractionStart  = null;
    this._onInteractionEnd    = null;
    this._onClear             = null;
    this._onUpdate            = null;
};

InteractionHandler.prototype.isActive = function() {
    return !!this._activeInteraction;
};

InteractionHandler.prototype.activeInteraction = function() {
    return this._activeInteraction;
};

//************************************************************************************************************
// Adding/removing specific interactions.
//************************************************************************************************************
/**
 * Callback on starting interaction. Always called when the interaction is started.
 * @callback interactionStart
 * @param {Event} event - Event object, which may be null.
 */
/**
 * Callback on ending interaction. Endings may be divided as ending normally or cancelled using the `cancel` 
 * parameter. Interruptions are passed as an ending interaction event with cancel parameter as true.
 * @callback interactionEnd
 * @param {Event} event - Event object, which may be null.
 * @param {boolean} cancel - A parameter denoting a cancel action to the interaction end. May be called 
 *        manually but also automatically triggered when interaction is interrupted or removed while active.
 * @returns {Object} May optionally return any object, which will get passed to 
 *          {@link InteractionHandler#onInteractionUpdate}() in {@link InteractionHandler#endInteraction}().
 */
 /**
 * Callback on restarting interaction. Called when the interaction is started but was already the active 
 * interaction.
 * @callback interactionRestart
 * @param {Event} event - Event object, which may be null.
 * @returns {boolean} Return false to cancel calling this interaction's {@link #startInteraction} callback.
 */
/**
 * If attempting to start this interaction, but could not interrupt the currently active interaction (as it 
 * has a confirm interrupt function that was not confirmed), use this callback to undo changes that have 
 * already happened. E.g. UI changes that were triggered on the click before the start interaction process 
 * was triggered.
 * @callback interactionCancelStart
 */
/**
 * Callback triggered on end interaction but separated as depending on case they made be called independently 
 * (via {@link InteractionHandler#clearInteraction}()) or not called during end as needed.
 * @callback interactionClear
 */
/**
 * Callback triggered when this interaction is interrupted. Determines whether to confirm interruption, using 
 * pass callback to continue interruption callback (which may be ignored if canceling interruption).
 * @param {callback} interrupt - If interruption is confirmed, call this parameter to continue interrupt 
 *        process. Otherwise, interruption is canceled.
 * @param {callback} cancel - If interruption is canceled, call this parameter to undo certain UI changes that
 *        may have happened before start interaction that need to be reversed.
 * @callback interactionInterrupt
 */
/**
 * Callback triggered on map interaction.
 * @callback interactionMap
 * @param {Event} event - Event object.
 */

/**
 * Add an interaction.
 * @memberof InteractionHandler
 * @param {string} name - Unique name for this interaciton.
 * @param {Object} interaction - Interaction parameters.
 * @param {interactionStart} interaction.start - Callback on starting interaction.
 * @param {interactionEnd} interaction.end - Callback on ending the interaction.
 * @param {interactionRestart} [interaction.restart] - Optional clear function.
 * @param {interactionCancelStart} [interaction.cancelStart] - Optional callback if canceling start 
 *        interaction.
 * @param {interactionClear} [interaction.clear] - Optional clear function.
 * @param {interactionInterrupt} [interaction.checkInterrupt] - Optional interrupt checking function.
 * @param {Object} [interaction.map] - Optional map of listener functions with key being the event name and 
 *        value being value being callback ({@link InteractionHandler#interactionMap}) on that event. Listener
 *        must first be enabled via {@link InteractionHandler#addMapListener}().
 * @param {ol.Interaction] [interaction.olInteraction] - Optional OpenLayers map interaction to bind with this
 *        interaction.
 * @param {boolean} [interaction.saveOnInterrupt] - Special case, if true, to save changes even if 
 *        interrupted. That is, treat any interruption as a normal end interaction.
 * @returns {Object} The interaction replaced or null not replacing anything.
 */
InteractionHandler.prototype.addInteraction = function(name, interaction) {
    var returnInteraction = null;
    if(name in this._interactions) returnInteraction = this._interactions[name];
    this._interactions[name] = interaction;
    return returnInteraction;
};

/**
 * Remove an interaction. If interaction is currently active, interaction is interrupted first.
 * @memberof InteractionHandler
 * @param {string} name - Unique name for this interaciton.
 */
InteractionHandler.prototype.removeInteraction = function(name) {
    if(!(name in this._interactions)) return null;
    if(this._activeInteraction && this._activeInteraction === name) {
        this.interrupt(null, this.removeInteraction.bind(this, name));
    } else {
        delete this._interactions[name];
    }
};


//************************************************************************************************************
// Generic interaction listeners called for actions on any interaction.
//************************************************************************************************************
/**
 * Callback on starting any interaction.
 * @callback onInteractionStart
 * @param {Event} event - Event object, which may be null.
 * @param {string} type - Unique name of interaction to be activated.
 * @returns {boolean} Return false to cancel starting interaction. Strict check, so must be exactly false, not
 *          just evaluates to false.
 */
/**
 * Callback after ending any interaction.
 * @callback onInteractionEnd
 * @param {Event} event - Event object, which may be null.
 * @param {string} type - Unique name of interaction to be activated.
 * @param {boolean} cancel - A parameter denoting a cancel action to the interaction end. May be called 
 *        manually but also automatically triggered when interaction is interrupted or removed while active.
 */
/**
 * Callback on clearing any interaction.
 * @callback onInteractionClear.
 */
/**
 * Callback after finishing end interaction to trigger any following updates as needed. As such, passed 
 * parameters that may be returned by the interaction end callback 
 * ({@link interactionEndInteractionHandler#}).
 * @callback onInteractionUpdate.
 * @param {string} endedInteractionName - Name of the interaction that was just ended.
 * @param {Object} endObj - Passed object of various data, if created via 
 *        {@link interactionEndInteractionHandler#} callback.
 * @param {string} errorMsg - Error message, if triggered during {@link interactionEndInteractionHandler#} 
 *        callback.
 */

/**
 * Set a callback to be called before any interaction start. Useful for handling interruptions in other 
 * modules or canceling interaction start given certain conditions. Callback is provided event (which may be 
 * null) and interaction name as arguments.
 * @param {onInteractionStart} callback
 * @returns {boolean} If false, will cancel the interaction start.
 */
InteractionHandler.prototype.onInteractionStart = function(callback) {
    this._onInteractionStart = callback;
};

/**
 * Set a callback to be called after any interaction end.
 * @memberof InteractionHandler
 * @param {onInteractionEnd} callback
 */
InteractionHandler.prototype.onInteractionEnd = function(callback) {
    this._onInteractionEnd = callback;
};

/**
 * Set a callback to be called after any interaction is cleared (see clearInteraction()). Usually helpful for 
 * UI clearing stuff.
 * @memberof InteractionHandler
 * @param {onInteractionClear} callback
 */
InteractionHandler.prototype.onClear = function(callback) {
    this._onClear = callback;
};


/**
 * Set a callback to be called after any interaction finished. See 
 * {@link InteractionHandler#onInteractionUpdate} callback, but useful for passing information gathered on 
 * ending interaction (optionally through {@link InteractionHandler#interactionEnd} callback), to some trigger
 * to update the rest of the application based on this information.
 * @memberof InteractionHandler
 * @param {onInteractionUpdate} callback
 */
InteractionHandler.prototype.onUpdate = function(callback) {
    this._onUpdate = callback;
};


//************************************************************************************************************
// Main interaction handlers.
//************************************************************************************************************
/**
 * Start/activate interaction. Starting an interaction without while there is currently an active interaction 
 * causes an interrupt() on the active interaction. However, restarting the same interaction will not 
 * interrupt, though it will retrigger all the releveant start event listeners.
 * @memberof InteractionHandler
 * @param {string} type - Interaction name.
 * @param {Event} [evt] - The event object.
 */
InteractionHandler.prototype.startInteraction = function(type, evt) {
    // a couple things are handled differently if restarting same interaction
    var restartInteraction = false;
    if(this._activeInteraction) {
        restartInteraction = type === this._activeInteraction;
        // try to interrupt active interaction, only continue (as self callback) if interrupt successful
        if(!restartInteraction) {
            this.interrupt(
                evt, 
                this.startInteraction.bind(this, type, evt), 
                this._cancelStartInteraction.bind(this, type)
            );
            return;
        }
    }
    if(this._onInteractionStart) {
        var stop;
        try {
            stop = this._onInteractionStart(evt, type);
        } catch(e) {
            console.error(e);
            return;
        }
        if(stop === false) {
            if(!restartInteraction) this.interrupt(evt);
            return;
        }
    }
    if(type in this._interactions) {
        this._activeInteraction = type;
        try {
            if(
                !restartInteraction ||
                !this._interactions[this._activeInteraction].restart ||
                this._interactions[this._activeInteraction].restart(evt) !== false
            ) {
                this._interactions[this._activeInteraction].start(evt);
            }
        } catch(e) {
            console.error(e);
            this._activeInteraction = null;
            return;
        }
        if(!restartInteraction && this._interactions[this._activeInteraction].olInteraction) {
            this.olMap.addInteraction(this._interactions[this._activeInteraction].olInteraction);
        }
    }
};

/**
 * End interaction. Ends interaction, calling specific function necessary to validate and update changes 
 * (or cancel).
 * @memberof InteractionHandler
 * @param {Event} [evt] - The event object.
 * @param {boolean} [cancel] - If true, specifies so changes are discarded, not saved.
 * @param {boolean} [suppressClear] - If true, suppresses clearInteraction() call after finishing.
 * @param {boolean} [suppressUpdate] - If true, suppresses updateInto() call after finishing.
 * @returns {string} Error message, if errored, or null.
 */
InteractionHandler.prototype.endInteraction = function(evt, cancel, suppressClear, suppressUpdate) {
    if(!this._activeInteraction) return;
    var error = null, 
        endObj = null;
    // end interaciton callback
    try {
        endObj = this._interactions[this._activeInteraction].end(evt, cancel);
    } catch(e) {
        error = e.message;
        console.error(e);
    }
    // remove ol interactions
    try {
        if(this._interactions[this._activeInteraction].olInteraction) {
            this.olMap.removeInteraction(this._interactions[this._activeInteraction].olInteraction);
        }
    } catch(e) {
        error = e.message;
        console.error(e);
    }
    // clear UI (must come before clearing active interaction)
    try {
        if(!suppressClear) this.clearInteraction();
    } catch(e) {
        error = e.message;
        console.error(e);
    }
    // end interaction callback
    try {
        if(this._onInteractionEnd) this._onInteractionEnd(evt, this._activeInteraction, cancel);
    } catch(e) {
        error = e.message;
        console.error(e);
    }
    // clear active
    var endedInteractionName = this._activeInteraction;
    this._activeInteraction = null;
    // in case an event needed to prevent map interaction
    this._blockMapInteraction = false;
    // update info
    try {
        if(!suppressUpdate && this._onUpdate) {
            this._onUpdate(endedInteractionName, endObj, error);
        }
    } catch(e) {
        error = e.message;
        console.error(e);
    }
    // return error
    return error;
};

/**
 * Clear active interaction. Here it does not do anything specific unless 'clear' callback is set in the 
 * definition of the active interaction or a general on-clear listener is set. This is called after the 
 * interaction finish triggered but before the general interaction end listener (if set) is called.
 * <br /><br />
 * Generally you don't call this directly, you call endInteraction() which also calls this function but 
 * left public for special cases. It may also not be called despite finishing interaction if "suppressClear" 
 * parameter is true.
 * <br /><br />
 * Examples of use are setting UI/elem reset stuff here. Thus you can call it separately if required.
 * @memberof InteractionHandler
 */
InteractionHandler.prototype.clearInteraction = function() {
    if(this._onClear) this._onClear();
    // case specific UI changes
    if(this._interactions[this._activeInteraction].clear) {
        this._interactions[this._activeInteraction].clear();
    }
};

/**
 * Interrupt (that is, finish without saving) any active UDA interactions that are currently active.
 * @param {Event} evt - The event object.
 * @param {Callback} [onInterrupt] - Optional callback to run after successful interrupt. Generally good 
 *        practice to have continuing code encapsulated in this callback as interactions with a check 
 *        interrupt callback can only continue through this.
 * @param {Callback} [onCancel] -Optional, for internal use only. To pass cancel function if attempting to 
 *        start an interaction but canceled by check interrupt.
 * @memberof InteractionHandler
 */
InteractionHandler.prototype.interrupt = function(evt, onInterrupt, onCancel) {
    if(this._activeInteraction && this._interactions[this._activeInteraction].checkInterrupt) {
        var self = this, 
            saveOnInterrupt = this._interactions[this._activeInteraction].saveOnInterrupt;
        try {
            this._interactions[this._activeInteraction].checkInterrupt(
                function() {
                    self.endInteraction(evt, saveOnInterrupt);
                    if(onInterrupt) onInterrupt();
                }, 
                (onCancel || function() {})
            );
        } catch(e) {
            console.error(e);
        }
    } else {
        this.endInteraction(evt);
        if(onInterrupt) onInterrupt();
    }
};

/**
 * Cancel start interaction. Usually needed to "undo" interface changes that triggered by trying to start it.
 * @param {string} type - Interaction name.
 */
InteractionHandler.prototype._cancelStartInteraction = function(type) {
    if(type && type in this._interactions && this._interactions[type].cancelStart) {
        this._interactions[type].cancelStart();
    }
};


//************************************************************************************************************
// Adding map listeners.
//************************************************************************************************************
/**
 * Add/initialize a map listener on defined event type.
 * @memberof InteractionHandler
 * @param {string} type - The event name to attach map listener to.
 */
InteractionHandler.prototype.addMapListener = function(type) {
    this.removeMapListener(type);
    var self = this;
    this._mapInteractions[type] = function(evt) {
        if(self._blockMapInteraction || !self._activeInteraction) return;
        if(self._interactions[self._activeInteraction].map && type in self._interactions[self._activeInteraction].map) {
            self._interactions[self._activeInteraction].map[type](evt);
        }
    };
    this.olMap.on(type, this._mapInteractions[type]);
};

/**
 * Permanently remove/deactivate a map listener on defined event type.
 * @memberof InteractionHandler
 * @param {string} type - The event name remove the listener from.
 */
InteractionHandler.prototype.removeMapListener = function(type) {
    if(type in this._mapInteractions) {
        this.olMap.un(type, this._mapInteractions[type]);
        delete this._mapInteractions[type];
    }
};

/**
 * Permanently remove/deactivate all map listener.
 * @memberof InteractionHandler
 */
InteractionHandler.prototype.removeAllMapListeners = function() {
    for(var type in this._mapInteractions) {
        this.olMap.un(type, this._mapInteractions[type]);
        delete this._mapInteractions[type];
    }
};

/**
 * Temporarily disabled all map interactions.
 * @memberof InteractionHandler
 */
InteractionHandler.prototype.disableMapInteractions = function() {
    this._blockMapInteraction = true;
};

/**
 * Renabled all map interactions.
 * @memberof InteractionHandler
 */
InteractionHandler.prototype.enableMapInteractions = function() {
    this._blockMapInteraction = false;
};


//************************************************************************************************************
// Tying UI elements to interactions
//************************************************************************************************************
/**
 * Callback for returning a value denoting the interaction type bound to this UI element. Called within 
 * context such that `this` is the element on which the event was triggered.
 * @callback uiValueFunction
 * @param {Element} elem - The element, same as context (`this`).
 * @returns {string} String value of the interaction type this is triggering.
 */

/**
 * Bind given elements to interaction handling.
 * TODO(?) Add detach function for hanging event listeners? Not currently needed but..
 * @memberof InteractionHandler
 * @param {NodeList|Element|jQuery} elems - Element or elements (accepts either single, NodeList, or jQuery 
 *        selection)
 * @param {Object} options - Optional options to apply to handling.
 * @param {string} [options.event="click"] - The event type to attach the listener on.
 * @param {string|uiValueFunction} [options.valueFunction] - How to determine what type of interaction to 
 *        start. May be a constant value, or it may be a callback function, which will be called in the 
 *        context of, and with as the only parameter, the element triggered.
 * @param {Callback} [options.always] - Optional callback to always run when event is triggered. Run before 
 *        managing any interactions tied to event.
 * @param {boolean} [options.interruptOnly] - If true, only interrupts active interactions, does not start any
 *        interaction. E.g. a cancel button.
 * @param {Callback} [options.onInterrupt] - If interruptor only type, optional callback to run any time this 
 *        is activated (whether there is an active interaction to get interrupted or not).
 */
InteractionHandler.prototype.bindUiElements = function(elems, options) {
    // defaults stuff
    options = options || {};
    options.valueFunction = options.valueFunction || function() { return this.value; };
    options.event = options.event || "click";
    // convert however elements are passed to NodeList
    if(typeof jQuery !== "undefined" && elems instanceof jQuery) {
        elems = elems.get();
    } else if(elems[Symbol.iterator] !== "function" && !(elems instanceof Array) && !(elems instanceof NodeList)) {
        elems = [elems];
    }
    var self = this, 
        listener = null;
    // create listener by type
    if(!options.interruptOnly) {
        listener = function(evt) {
            if(options.always) options.always();
            self._uiListener(this, options.valueFunction, evt);
        };
    } else {
        listener = function(evt) {
            if(options.always) options.always();
            self._uiInterruptorListener(this, options.onInterrupt, evt);
        };
    }
    // add listener
    for(var i = 0; i < elems.length; ++i) {
        elems[i].addEventListener(options.event, listener);
    }
};

InteractionHandler.prototype._uiListener = function(elem, getValueFunction, evt) {
    var value = typeof getValueFunction === "function" ? getValueFunction.call(elem, elem) : getValueFunction;
    if(this._activeInteraction && value === this._activeInteraction) {
        this.startInteraction(value, evt);
    } else {
        this.interrupt(
            evt, 
            this.startInteraction.bind(this, value, evt), 
            this._cancelStartInteraction.bind(this, value)
        );
    }
};

InteractionHandler.prototype._uiInterruptorListener = function(elem, onInterrupt, evt) {
    var willCheckInterrupt = this._activeInteraction && this._interactions[this._activeInteraction].checkInterrupt;
    if(willCheckInterrupt) {
        // halt default behavior while interruption check
        evt.preventDefault();
        evt.stopPropagation();
    }
    this.interrupt(
        evt, 
        function() {
            if(onInterrupt) onInterrupt();
            // if default behavior was interrupt, retrigger event
            if(willCheckInterrupt) elem.click();
        }
    );
};

module.exports = InteractionHandler;