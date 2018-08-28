!(function(window){
	var SpringLayout2 = function(nodes,links){
		
		this.nodes = nodes;
		this.links = links;
		
		this.stretch = 0.5;//0.7
		this.repulsion_range_sq = 100*100;
        this.force_multiplier = 0.1;//1.0/3.0;
	}
	
	SpringLayout2.prototype.newLayoutData = function(){
		var layoutData = {
			edgedx : 0.0,
	        edgedy: 0.0,
	        repulsiondx: 0.0,
	        repulsiondy: 0.0,
	        dx: 0.0,
	        dy: 0.0
		};
		return layoutData;
	}
	
	SpringLayout2.prototype.runLayout = function(){
		this.goAlgo();
	}
	
	SpringLayout2.prototype.initAlgo = function(){
		var _self = this;
		_self.nodes.forEach(function(n){
			n.layoutData = _self.newLayoutData();
		});
	}
	
	SpringLayout2.prototype.goAlgo = function(){
		var _self = this;
		
		_self.nodes.forEach(function(n){
			var svd = n.layoutData;
			svd.dx /= 4;
			svd.dy /= 4;
			svd.edgedx = svd.edgedy = 0;
			svd.repulsiondx = svd.repulsiondy = 0;
		});

    	_self.relaxEdges();
    	_self.calculateRepulsion();
    	_self.moveNodes();
	}

	SpringLayout2.prototype.relaxEdges = function(){
		var _self = this;
		_self.links.forEach(function(link){
			
			var node1 = link.nodeA;
			var node2 = link.nodeZ;
			
			//var degree1 = (node1.inLinks||[]).length + (node1.outLinks||[]).length;
			//var degree2 = (node2.inLinks||[]).length + (node2.outLinks||[]).length;
			
			var vx = node1.x - node2.x;
			var vy = node1.y - node2.y;
			
			var len = Math.sqrt(vx * vx + vy * vy);
			len = (len == 0) ? 0.0001 : len;
			
			var f = _self.force_multiplier * (1 - len) / len;
			//f = f * Math.pow(_self.stretch, (degree1 + degree2 - 2));
			f = f * Math.pow(_self.stretch, 2);
			
			var dx = f * vx;
    		var dy = f * vy;
    		
    		var	v1D = node1.layoutData;
    		var v2D = node2.layoutData;
			v1D.edgedx += dx;
			v1D.edgedy += dy;
			v2D.edgedx += -dx;
			v2D.edgedy += -dy;
		});
	}
	
	SpringLayout2.prototype.calculateRepulsion = function(){
        var _self = this;
        _self.nodes.forEach(function(node){
        	var dx = 0, dy = 0;
        	_self.nodes.forEach(function(n){
        		if(node.uniquId != n.uniquId){
        			var vx = node.x - n.x;
        			var vy = node.y - n.y;
        			
			        var distanceSq = vx * vx + vy * vy;
			        if (distanceSq == 0) {
	                    dx += Math.random();
	                    dy += Math.random();
	                } else if (distanceSq < _self.repulsion_range_sq) {
	                    var factor = 1;
	                    dx += factor * vx / distanceSq;
	                    dy += factor * vy / distanceSq;
	                }
        		}
        	});
        	
        	var dlen = dx * dx + dy * dy;
            if (dlen > 0) {
                dlen = Math.sqrt(dlen) / 2;
                var layoutData = node.layoutData;
                layoutData.repulsiondx += dx / dlen;
                layoutData.repulsiondy += dy / dlen;
            }
        });
	}
	
	SpringLayout2.prototype.moveNodes = function(){		
		var _self = this;
		_self.nodes.forEach(function(node){
			var vd = node.layoutData;
			
			vd.dx += vd.repulsiondx + vd.edgedx;
            vd.dy += vd.repulsiondy + vd.edgedy;
			
			node.x += Math.max(-5, Math.min(5, vd.dx));
			node.y += Math.max(-5, Math.min(5, vd.dy));
		});
	}
	
	window.SpringLayout2 = SpringLayout2;
	
})(window);