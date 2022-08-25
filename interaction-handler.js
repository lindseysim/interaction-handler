class InteractionHandler {

    constructor(olMap) {
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
    }

    //********************************************************************************************************
    // Generic getters/setters.
    //********************************************************************************************************
    get active() {
        return !!this._activeInteraction;
    }

    isActive() {
        return this.active;
    }

    get activeInteraction() {
        return this._activeInteraction;
    }

    get(name) {
        return (name in this._interactions) && this._interactions[name] || null;
    }

    //********************************************************************************************************
    // Getters/setters for interaction listeners and hooks.
    //********************************************************************************************************
    get onInteractionStart() {
        return this._onInteractionStart;
    }

    set onInteractionStart(callback) {
        this._onInteractionStart = callback;
    }

    get onInteractionEnd() {
        return this._onInteractionEnd;
    }

    set onInteractionEnd(callback) {
        this._onInteractionEnd = callback;
    }

    get onClear() {
        return this._onClear;
    }

    set onClear(callback) {
        this._onClear = callback;
    }

    get onUpdate() {
        return this._onUpdate;
    }

    set onUpdate(callback) {
        this._onUpdate = callback;
    }

    //********************************************************************************************************
    // Adding/removing specific interactions.
    //********************************************************************************************************
    addInteraction(name, interaction) {
        var returnInteraction = null;
        if(name in this._interactions) returnInteraction = this._interactions[name];
        this._interactions[name] = interaction;
        return returnInteraction;
    }

    removeInteraction(name) {
        if(!(name in this._interactions)) return null;
        if(this._activeInteraction && this._activeInteraction === name) {
            this.interrupt(null, this.removeInteraction.bind(this, name));
        } else {
            delete this._interactions[name];
        }
    }

    //********************************************************************************************************
    // Main interaction handlers.
    //********************************************************************************************************
    startInteraction(type, evt) {
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
            let stop;
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
                    !restartInteraction
                    || this._interactions[this._activeInteraction].restart === true
                    || (
                        typeof this._interactions[this._activeInteraction].restart === "function" 
                        && this._interactions[this._activeInteraction].restart(evt) !== false
                    )
                ) {
                    this._interactions[this._activeInteraction].start(evt);
                }
            } catch(e) {
                console.error(e);
                this._activeInteraction = null;
                return;
            }
            if(!this._activeInteraction) return;  // if immediately ended at start
            if(!restartInteraction && this._interactions[this._activeInteraction].olInteraction) {
                this.olMap.addInteraction(this._interactions[this._activeInteraction].olInteraction);
            }
        }
    }

    endInteraction(evt, cancel, suppressClear, suppressUpdate) {
        if(!this._activeInteraction) return;
        var error = null, 
            endObj = null;
        // end interaction callback
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
    }

    clearInteraction() {
        if(this._onClear) this._onClear();
        // case specific UI changes
        if(this._interactions[this._activeInteraction].clear) {
            this._interactions[this._activeInteraction].clear();
        }
    }

    interrupt(evt, onInterrupt, onCancel) {
        if(this._activeInteraction && this._interactions[this._activeInteraction].checkInterrupt) {
            var saveOnInterrupt = this._interactions[this._activeInteraction].saveOnInterrupt;
            try {
                this._interactions[this._activeInteraction].checkInterrupt(
                    () => {
                        this.endInteraction(evt, saveOnInterrupt);
                        if(onInterrupt) onInterrupt();
                    }, 
                    (onCancel || (() => {}))
                );
            } catch(e) {
                console.error(e);
            }
        } else {
            this.endInteraction(evt);
            if(onInterrupt) onInterrupt();
        }
    }

    _cancelStartInteraction(type) {
        if(type && type in this._interactions && this._interactions[type].cancelStart) {
            this._interactions[type].cancelStart();
        }
    }

    //********************************************************************************************************
    // Adding map listeners.
    //********************************************************************************************************
    addMapListener(type) {
        this.removeMapListener(type);
        this._mapInteractions[type] = evt => {
            if(this._blockMapInteraction || !this._activeInteraction) return;
            if(this._interactions[this._activeInteraction].map && type in this._interactions[this._activeInteraction].map) {
                this._interactions[this._activeInteraction].map[type](evt);
            }
        };
        this.olMap.on(type, this._mapInteractions[type]);
    }

    removeMapListener(type) {
        if(type in this._mapInteractions) {
            this.olMap.un(type, this._mapInteractions[type]);
            delete this._mapInteractions[type];
        }
    }

    removeAllMapListeners() {
        for(let type in this._mapInteractions) {
            this.olMap.un(type, this._mapInteractions[type]);
            delete this._mapInteractions[type];
        }
    }

    disableMapInteractions() {
        this._blockMapInteraction = true;
    }

    enableMapInteractions() {
        this._blockMapInteraction = false;
    }

    //********************************************************************************************************
    // Tying UI elements to interactions
    //********************************************************************************************************
    bindUiElements(elems, options) {
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
            listener = evt => {
                if(options.always) options.always();
                this._uiListener(options.value, evt);
            };
        } else {
            listener = evt => {
                if(options.always) options.always();
                self._uiInterruptorListener( options.onInterrupt, evt);
            };
        }
        // add listener
        elems.forEach(elem => elem.addEventListener(options.event, listener));
    }

    _uiListener(elem, getValueFunction, evt) {
        var value = typeof getValueFunction === "function" ? getValueFunction.call(elem, evt) : getValueFunction;
        if(this._activeInteraction && value === this._activeInteraction) {
            this.startInteraction(value, evt);
        } else {
            this.interrupt(
                evt, 
                this.startInteraction.bind(this, value, evt), 
                this._cancelStartInteraction.bind(this, value)
            );
        }
    }

    _uiInterruptorListener(elem, onInterrupt, evt) {
        let willCheckInterrupt = this._activeInteraction && this._interactions[this._activeInteraction].checkInterrupt;
        if(willCheckInterrupt) {
            // halt default behavior while interruption check
            evt.preventDefault();
            evt.stopPropagation();
        }
        this.interrupt(
            evt, 
            () => {
                if(onInterrupt) onInterrupt();
                // if default behavior was interrupt, retrigger event
                if(willCheckInterrupt) elem.click();
            }
        );
    }

}

export default InteractionHandler;