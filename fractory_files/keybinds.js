KeyBindings = Ice.$extend('KeyBindings', {
    __init__: function(game) {
        this.game = game;

        var self = this;

        function selfdot(fn) {
            return _.bind(fn, self);
        }

        self.binds = ko.observableArray(
            [
            {key:'e', fn: self.buy_blank, description: 'Place a blank crystal.'},
            {key:'b', fn:self.buy_blank, description: 'Place a blank crystal.'},
            {key:'q', fn:self.quick_buy, description: 'Place currently selected simple gem from the shop.'},
            {key:'f', fn:self.quick_fractal, description: 'Place a fractal.'},
            {key:'r', fn:self.quick_relay, description: 'Place a relay.'},
            {key:'c', fn:self.quick_conduit, description: 'Place a conduit.'},
            {key:'a', fn:self.quick_capacitor, description: 'Place a capacitor.'},
            {key:'h', fn:self.quick_hopper, description: 'Place a hopper.'},
            {key:'g', fn:self.quick_blank_generator, description: 'Place a blank generator.'},
            {key:'d', fn:self.delete, description: 'Delete the crystal under your cursor.'},
            {key:'[', fn:self.copy_fractal_links, description: 'Copy the link layout of current fractal.'},
            {key:']', fn:self.paste_fractal_links, description: 'Paste the copied link layout.'},
            {key:'shift+space', fn:self.toggle_pause, description: 'Pause or unpause the game.'},
            {key:'shift+]', fn:self.clear_fractal_links, description: 'Clear all the links in the current fractal.'},
            {key:'shift+[', fn:self.fill_fractal_links, description: 'Activate all links in the current fractal.'},
            ]);
        
        //Default hotkeys for all crystal types
        var digit = 1;
        var bound_key;
        _.each(Mechs, function(mech){
            if(digit<10)
                bound_key = digit.toString();
            else if(digit==10)
                bound_key = '0';
            else if(digit>10 && digit<20)
                bound_key = 'shift+'+(digit%10).toString();
            else if(digit==20)
                bound_key = 'shift+0'
            else 
                bound_key = 'alt+'+(digit%10).toString();
            
            if(!(mech.props().uncounted || mech.$class.$name === "Flux" || mech.$class.$name === "Flaw"))
            {
                self.binds().push({key : bound_key, fn : function() {self.quick_crystal(mech.$class.$name)},description: 'Place '+mech.$class.$name+'.'});
                digit++;
            }
        });
        
        //Add default hotkeys == the ones in code; bind them
        _.each(self.binds(), function(keybind) {
            //console.log("Binding ", key, fn);
            keybind.default = keybind.key;
            Mousetrap.bind(keybind.key, _.bind(keybind.fn, self));
        });
            
        var key_modifiers = ['shift'];
        _.each(key_modifiers, function(key){
            Mousetrap.bind(key, function(){self.set_key_modifier(key,true);},'keydown');
            Mousetrap.bind(key, function(){self.set_key_modifier(key,false);},'keyup');
        });
        
        //Makes the hotkeys update in controls pane when rebinding them
        _.each(self.binds(), function(keybind){
            keybind.key = ko.observable(keybind.key);
        })
        
    },
    
    set_key_modifier: function(modifier, state) {
        switch (modifier) {
            case 'shift':
                game.shift_pressed(state);
                break;
            case 'ctrl':
                break;
            case 'alt':
                break;
            default:
                
                break;
        }
    },
    
    record_rebind: function(keybind) {
        Mousetrap.unbind(keybind['key']());
        keybind['key']('Press new key');
        Mousetrap.record(function(sequence){
            var bound_sequence = sequence.join(' ');
            if(sequence[0] === 'esc')
                keybind['key'](keybind['default']);
            else
                keybind['key'](bound_sequence);
            Mousetrap.bind(keybind['key'](), _.bind(keybind['fn'], self));
        });
    },
    
    buy_blank: function() {
        if(!window.game) return;
        var shop_slot = _.find(game.shop_slots(), function(ss) {
            return ss.mode() === 'blank';
        });
        if(!shop_slot) return;

        var container = game.hovered_node() || game.hovered_inventory_slot();
        if(!container) return;       
        if(container.part()) return;

        var part = shop_slot.part();
        container.set_part(part);
        game.hovered_part(part);
        
    },

    quick_buy: function() {
        if(!window.game) return;
        var shop_slot = _.find(game.shop_slots(), function(ss) {
            return ss.mode() === 'single';
        });
        if(!shop_slot) return;

        var container = game.hovered_node() || game.hovered_inventory_slot();
        if(!container) return;       
        if(container.part()) return;

        var part = shop_slot.part();
        container.set_part(part);
        game.hovered_part(part);
    },
    
    quick_fractal: function() {
        if(!window.game) return;
        var shop_slot = _.find(game.shop_slots(), function(ss) {
            return ss.mode() === 'fractal';
        });
        if(!shop_slot) return;

        var container = game.hovered_node();
        var part = null;
        if(container)
            if(!container.part()){
                var requiredTier = container.shell.depth();
                if(requiredTier <= shop_slot.tier())
                {
                    part = shop_slot.part();
                }
                else {
                    if(requiredTier <= shop_slot.max_tier()) {
                        shop_slot.tier(requiredTier);
                        shop_slot.restock();
                        part = shop_slot.part();
                    }
                }
                container.set_part(part);
                game.hovered_part(part);
                return;
            }
        
        container = game.hovered_inventory_slot();
        if(!container) return;
        if(container.part()) return;
        
        part = shop_slot.part();
        container.set_part(part);
        game.hovered_part(part);
    },
    
    quick_utility_crystal: function(type) {
        if(!window.game) return;
        var shop_slot = _.find(game.shop_slots(), function(ss) {
            return ss.mode() === type;
        });
        if(!shop_slot) return;

        var container = game.hovered_node() || game.hovered_inventory_slot();
        if(!container) return;       
        if(container.part()) return;

        var part = shop_slot.part();
        container.set_part(part);
        game.hovered_part(part);
    },
    
    quick_relay: function() {
        KeyBindings().quick_utility_crystal('relay');
    },
    
    quick_conduit: function() {
        KeyBindings().quick_utility_crystal('conduit');
    },
    
    quick_capacitor: function() {
        KeyBindings().quick_utility_crystal('capacitor');
    },
    
    quick_hopper: function() {
        KeyBindings().quick_utility_crystal('hopper');
    },
    
    quick_blank_generator: function() {
        KeyBindings().quick_utility_crystal('blank_generator');
    },
    
    delete: function() {
        if(!window.game) return;
        
        var part = game.hovered_part();
        if(!part) return;
        if(part.mana_cost() == Infinity) return;
        if(Ice.isa(part.container(), ShopSlot)) return;
        
        if(game.last_moved_part() == part)
            game.last_moved_part(null);
        part.container().part(null);
        part = null;
                
    },
    
    toggle_pause: function() {
        if(!window.game) return;
        game.paused()?game.unpause():game.pause();
    },
    
    quick_crystal: function(type){
        if(!window.game) return;
        var container = game.hovered_node() || game.hovered_inventory_slot();
        if(!container) return;       
        if(container.part()) return;
        
        
        
        if(!_.contains(game.unlocked_stats_list(),type)) return;

        var shop_slot = _.find(game.shop_slots(), function(ss) {
            return ss.mode() === 'single';
        });
        var tier = shop_slot.tier();
        var max_refinement = Math.pow(100, tier);
        var refinement_used, budget;
        refinement_used = _.random(0, max_refinement);
        
        var part = Part();
        part.tier(tier);

        budget = Math.floor(refinement_used * 0.5);

        var flaw = Math.floor(refinement_used - budget);
        part.add_stat('Flaw', flaw);

        part.add_stat(type, budget);
        part.refinement(refinement_used);
        part.highest_stats.recompute();
        
        var cost = Math.floor(part.mana_cost());
        if(game.mana()>=cost)
        {
            container.set_part(part);
            game.hovered_part(part);
            game.mana(game.mana()-cost);
        }
    },
   
    copy_fractal_links: function(){
        if(!window.game) return;
        var pattern = '=';
        var lastState;
        var curRun = 0;
        var counter = 0;
        var goodLinks = [0,1,2,3,4,5,7,8,9,10,11,14,15,16,17,20,21,22,23,26,27,28,29,32,33,34,35,39,40,41,43,44,45,49,52,53,57,60,61,65,68,69,73,76,77,81,84,85];
        Object.keys(game.shell_renders()[game.shell_renders().length - 1].nodes).forEach(function(nodeName) {
            var thisNode = game.shell_renders()[game.shell_renders().length - 1].nodes[nodeName];
            Object.keys(game.shell_renders()[game.shell_renders().length - 1].nodes[nodeName].links).forEach(function(linkName) {
                if (goodLinks.includes(counter)) {
                    var thisLink = game.shell_renders()[game.shell_renders().length - 1].nodes[nodeName].links[linkName];
                    if (counter == 0) {
                        lastState = thisLink.active();
                        if (lastState) {
                            pattern = "+";
                        } else {
                            pattern = "-";
                        }
                    }

                    if (thisLink.active() == lastState) {
                        //console.log("Incrementing.");
                        curRun++;
                    } else {
                        //curRun++;
                        pattern = pattern + curRun + "-";
                        lastState = !lastState
                        //console.log("Resetting to " + lastState + " after " + curRun + " steps.");
                        curRun = 1;
                    }
                    //console.log("Link " + counter + " is " + thisLink.active());
                }
                counter++;
            });
        });
        curRun++;
        pattern = pattern + curRun + "=";
        //console.log(pattern);

        game.saved_fractal_pattern(pattern);
        //console.log("Saving");
        alert("Saved!");
    },
 
    paste_pattern: function(pattern){
        if(!window.game) return;
        var curRun = 0;
        var curRunLength = 0;
        var lastState;
        // Check our first state.
        if (pattern.indexOf('-') == 0) {
            lastState = true;
        } else if (pattern.indexOf('+') == 0) {
            lastState = false;
        } else {
            // Not a valid pattern.
            return;
        }
        // Strip first state character.
        pattern = pattern.substr(1);
        var counter = 0;
        var goodLinks = [0,1,2,3,4,5,7,8,9,10,11,14,15,16,17,20,21,22,23,26,27,28,29,32,33,34,35,39,40,41,43,44,45,49,52,53,57,60,61,65,68,69,73,76,77,81,84,85];
        Object.keys(game.shell_renders()[game.shell_renders().length - 1].nodes).forEach(function(nodeName) {
            var thisNode = game.shell_renders()[game.shell_renders().length - 1].nodes[nodeName];
            Object.keys(game.shell_renders()[game.shell_renders().length - 1].nodes[nodeName].links).forEach(function(linkName) {
                if (goodLinks.includes(counter)) {
                    // Are we starting our next run?
                    if (curRun == curRunLength) {
                        //console.log("Next run length is: " + pattern.substr(0, pattern.indexOf('-')));
                        curRunLength = parseInt(pattern.substr(0, pattern.indexOf('-')));
                        pattern = pattern.substr(pattern.indexOf('-') + 1);
                        lastState = !lastState;
                        curRun = 0;
                    }
                    var thisLink = game.shell_renders()[game.shell_renders().length - 1].nodes[nodeName].links[linkName];
                    curRun++;
                    //console.log("Setting " + thisNode.loc + "/" + thisLink.direction() + " to " + lastState + "(" + curRun + "/" + curRunLength + ")");
                    thisLink.set_active(lastState, true);
                }
                counter++;
            });
        });

        game.shell().refresh_all_flow();
        //console.log("Pasting");
    },
    
    paste_fractal_links: function()
    {
        if(!window.game) return;
        var self = this;
        self.paste_pattern(game.saved_fractal_pattern());
    },
    
    clear_fractal_links: function()
    {
        if(!window.game) return;
        var self = KeyBindings();
        self.paste_pattern(game.saved_clear_pattern());
    },
    
    fill_fractal_links: function()
    {
        if(!window.game) return;
        var self = KeyBindings();
        self.paste_pattern(game.saved_filled_pattern());
    },

    
    /*shop_next: function() {
        var self = this;
        if(!window.game) return;
        var shop_slot = _.find(game.shop_slots(), function(ss) {
            return ss.mode() === 'single';
        });
        shop_slot.next_stat();
    },
    
    shop_prev: function() {
        var self = this;
        if(!window.game) return;
        var shop_slot = _.find(game.shop_slots(), function(ss) {
            return ss.mode() === 'single';
        });
        shop_slot.prev_stat();
    },*/
});
