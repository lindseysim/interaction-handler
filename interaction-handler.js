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

InteractionHandler.prototype.get = function(name) {
    if(name in this._interactions) return this._interactions[name];
    return null;
};

//************************************************************************************************************
// Adding/removing specific interactions.
//************************************************************************************************************
InteractionHandler.prototype.addInteraction = function(name, interaction) {
    var returnInteraction = null;
    if(name in this._interactions) returnInteraction = this._interactions[name];
    this._interactions[name] = interaction;
    return returnInteraction;
};

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
InteractionHandler.prototype.onInteractionStart = function(callback) {
    this._onInteractionStart = callback;
};

InteractionHandler.prototype.onInteractionEnd = function(callback) {
    this._onInteractionEnd = callback;
};

InteractionHandler.prototype.onClear = function(callback) {
    this._onClear = callback;
};

InteractionHandler.prototype.onUpdate = function(callback) {
    this._onUpdate = callback;
};


//************************************************************************************************************
// Main interaction handlers.
//************************************************************************************************************
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

InteractionHandler.prototype.clearInteraction = function() {
    if(this._onClear) this._onClear();
    // case specific UI changes
    if(this._interactions[this._activeInteraction].clear) {
        this._interactions[this._activeInteraction].clear();
    }
};

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

InteractionHandler.prototype._cancelStartInteraction = function(type) {
    if(type && type in this._interactions && this._interactions[type].cancelStart) {
        this._interactions[type].cancelStart();
    }
};


//************************************************************************************************************
// Adding map listeners.
//************************************************************************************************************
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
InteractionHandler.prototype.removeMapListener = function(type) {
    if(type in this._mapInteractions) {
        this.olMap.un(type, this._mapInteractions[type]);
        delete this._mapInteractions[type];
    }
};

InteractionHandler.prototype.removeAllMapListeners = function() {
    for(var type in this._mapInteractions) {
        this.olMap.un(type, this._mapInteractions[type]);
        delete this._mapInteractions[type];
    }
};
InteractionHandler.prototype.disableMapInteractions = function() {
    this._blockMapInteraction = true;
};

InteractionHandler.prototype.enableMapInteractions = function() {
    this._blockMapInteraction = false;
};


//************************************************************************************************************
// Tying UI elements to interactions
//************************************************************************************************************
InteractionHandler.prototype.bindUiElements = function(elems, options) {
    // defaults stuff
    options = options || {};
    options.value = options.value || options.valueFunction || function() { return this.value; };
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
            self._uiListener(this, options.value, evt);
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

export {InteractionHandler as default};