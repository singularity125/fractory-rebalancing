KeyBindings = Ice.$extend('KeyBindings', {
    __init__: function(game) {
        this.game = game;

        var self = this;

        function selfdot(fn) {
            return _.bind(fn, self);
        }



        var binds = {
            'e': self.buy_blank,
            'b': self.buy_blank,
            'q': self.quick_buy,
            'r': self.quick_relay,
            'f': self.quick_fractal,
            'c': self.quick_conduit,
            'd': self.delete,
            '[': self.copy_fractal_links,
            ']': self.paste_fractal_links,
            'shift+space': self.toggle_pause,
            'shift+]': self.clear_fractal_links,
            'shift+[': self.fill_fractal_links,
        };

        _.each(binds, function(fn, key) {
            //console.log("Binding ", key, fn);
            Mousetrap.bind(key, _.bind(fn, self));
        });
        
        Mousetrap.bind('shift', function(){self.set_buy_maximum(true)},'keydown');
        Mousetrap.bind('shift', function(){self.set_buy_maximum(false)},'keyup');
        
        var crystal_types = ["Glow","Arcana","Waxing","Conductivity","Radiance","Imbuing","Infusing","Brilliance","Mystery","Reflection","Vividity","Power","Shine","Lens","Resonance","Prism","Shimmer","Seal","Purity","Gleam"];
        var digit = 1;
        var bound_key;
        _.each(crystal_types, function(type){
            if(digit<10)
                bound_key = digit.toString();
            else if(digit==10)
                bound_key = '0';
            else if(digit>10 && digit<20)
                bound_key = 'shift+'+(digit%10).toString();
            else if(digit==20)
                bound_key = 'shift+0'
            else 
                bound_key = 'ctrl+'+(digit%10).toString();
            
            Mousetrap.bind(bound_key, function() {self.quick_crystal(type);});
            digit++;
        });
    },
    
    set_buy_maximum: function(value){
        game.buy_maximum = value;
    },
    
    buy_blank: function() {
        if(!window.game) return;
        var shop_slot = _.find(game.shop_slots(), function(ss) {
            return ss.mode() === 'blank';
        });
        if(!shop_slot) return;

        var node = game.hovered_node();
        if(!node) return;
        if(node.part()) return;

        node.set_part(shop_slot.part());
        
    },

    quick_buy: function() {
        if(!window.game) return;
        var shop_slot = _.find(game.shop_slots(), function(ss) {
            return ss.mode() === 'single';
        });
        if(!shop_slot) return;

        var node = game.hovered_node();
        if(!node) return;
        if(node.part()) return;

        node.set_part(shop_slot.part());
    },
    
    quick_relay: function() {
        if(!window.game) return;
        var shop_slot = _.find(game.shop_slots(), function(ss) {
            return ss.mode() === 'relay';
        });
        if(!shop_slot) return;

        var node = game.hovered_node();
        if(!node) return;
        if(node.part()) return;

        node.set_part(shop_slot.part());
    },
    
    quick_fractal: function() {
        if(!window.game) return;
        var shop_slot = _.find(game.shop_slots(), function(ss) {
            return ss.mode() === 'fractal';
        });
        if(!shop_slot) return;

        var node = game.hovered_node();
        if(!node) return;
        if(node.part()) return;

        var requiredTier = node.shell.depth();
        if(requiredTier <= shop_slot.max_tier())
        {
            shop_slot.tier(requiredTier);
            shop_slot.restock();
            node.set_part(shop_slot.part());
        }
    },
    
    quick_conduit: function() {
        if(!window.game) return;
        var shop_slot = _.find(game.shop_slots(), function(ss) {
            return ss.mode() === 'conduit';
        });
        if(!shop_slot) return;

        var node = game.hovered_node();
        if(!node) return;
        if(node.part()) return;

        node.set_part(shop_slot.part());
    },
    
    delete: function() {
        if(!window.game) return;
        
        var node = game.hovered_node();
        if(!node) return;
        if(!node.part()) return;
        if(node.part().mana_cost() == Infinity) return;
        
        var part = ko.observable(null);
        node.part(part());
                
    },
    
    toggle_pause: function() {
        game.paused()?game.unpause():game.pause();
    },
    
    quick_crystal: function(type){
        var node = game.hovered_node();
        if(!node) return;
        if(node.part()) return;
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
            node.set_part(part);
            game.mana(game.mana()-cost);
        }
    },
   
    copy_fractal_links: function(){

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
        console.log(pattern);

        game.saved_fractal_pattern = pattern;
        //console.log("Saving");
        alert("Saved!");
    },
 
    paste_pattern: function(pattern){

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
        console.log("Pasting");
    },
    
    paste_fractal_links: function()
    {
        var self = this;
        self.paste_pattern(game.saved_fractal_pattern);
    },
    
    clear_fractal_links: function()
    {
        var self = KeyBindings();
        self.paste_pattern(game.saved_clear_pattern);
    },
    
    fill_fractal_links: function()
    {
        var self = KeyBindings();
        self.paste_pattern(game.saved_filled_pattern);
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
