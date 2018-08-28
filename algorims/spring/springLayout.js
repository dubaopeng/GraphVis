!(function(window){
	var SpringLayout = function(nodes,links){
		
		this.nodes = nodes;
		this.links = links;
		
		this.area = 100 * 100;
        this.force_multiplier = 1.0 / 3.0;
	}
	
	SpringLayout.prototype.runLayout = function(){
		this.goAlgo();
	}
	
	SpringLayout.prototype.initAlgo = function(){
		var _self = this;
		_self.k = Math.sqrt(_self.area / _self.nodes.length);
	}
	
	SpringLayout.prototype.goAlgo = function(){
		var _self = this;
		
		var nodes = _self.nodes;
		var links = _self.links;
		
		var ejectfactor = 6;
		nodes.forEach(function(node1,i){
            node1.dispx = 0.0;
            node1.dispy = 0.0;
            
            nodes.forEach(function(node2,j){
            	if (i != j) {
            		var diffx = node1.x - node2.x;
            		var diffy = node1.y - node2.y;
            		var diff = Math.sqrt(diffx * diffx + diffy * diffy);
            		diff == 0 ? 0.0001:diff;
                 
                    if (diff < 30){
                    	ejectfactor = 5;
                    }

                    if (diff > 0 && diff < 250) {
                    	node1.dispx += (diffx / diff * _self.k * _self.k / diff * ejectfactor);
                    	node1.dispy += (diffy / diff * _self.k * _self.k / diff * ejectfactor);
                    }
                }
            });
		});
		
		var condensefactor = 3;
		links.forEach(function(link){
			var visnodeS = link.nodeA;
			var visnodeE = link.nodeZ;
			
			var diffx = visnodeS.x - visnodeE.x;
			var diffy = visnodeS.y - visnodeE.y;
			var diff = Math.sqrt(diffx * diffx + diffy * diffy);

			visnodeS.dispx -= (diffx * diff / _self.k * condensefactor);
			visnodeS.dispy -= (diffy * diff / _self.k * condensefactor);
			visnodeE.dispx += (diffx * diff / _self.k * condensefactor);
			visnodeE.dispy += (diffy * diff / _self.k * condensefactor);
		});
		
		var maxt = 4 ,maxty = 4;
		nodes.forEach(function(node){
			var dx = node.dispx;
			var dy = node.dispy;
            
            var disppx =  Math.floor(dx);
            var disppy =  Math.floor(dy);
            if (disppx < -maxt){
            	disppx = -maxt;
            }
            if (disppx > maxt){
            	disppx = maxt;
            }
            if (disppy < -maxty){
            	disppy = -maxty;
            }
            if (disppy > maxty){
            	 disppy = maxty;
            }
            
        	node.x += disppx;
        	node.y += disppy;
		});
	}

	
	window.SpringLayout = SpringLayout;
	
})(window);