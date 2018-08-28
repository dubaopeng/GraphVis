!(function(window){
	var FruchtermanLayout = function(nodes,links){
		
		this.nodes = nodes;
		this.links = links;
		
		this.forceConstant = 0.1;
		this.temp = 1;
		this.maxIter = 700;
		this.EPSILON = 0.001;
		this.canvasSize = 1000;
		this.currentIter = 0;
	}
	
	FruchtermanLayout.prototype.runLayout = function(){
		if(this.currentIter < this.maxIter){
			this.goAlgo();
		}
	}
	
	FruchtermanLayout.prototype.initAlgo = function(){
		var _self = this;
		_self.temp = _self.canvasSize / 10;
		_self.forceConstant = 0.75 * Math.sqrt(_self.canvasSize*_self.canvasSize/_self.nodes.length);
	}
	
	FruchtermanLayout.prototype.goAlgo = function(){
		var _self = this;
		
		var nodes = _self.nodes;
		var links = _self.links;
		
		nodes.forEach(function(n){
			 _self.calcRepulsion(n);
		});
		
		links.forEach(function(link){
			 _self.calcAttraction(link);
		});
		
		nodes.forEach(function(n){
			 _self.calcPositions(n);
		});
		
		_self.cool(_self.currentIter++);
	}
	
	FruchtermanLayout.prototype.calcRepulsion = function(node) {
        var _self = this;
        var nodes = _self.nodes;
        
        node.dispx = 0.0;
        node.dispy = 0.0;
        
        nodes.forEach(function(n){
        	if(node.uniquId != n.uniquId){
        		var xDelta = node.x - n.x;
        		var yDelta = node.y - n.y;
        		var deltaLength = Math.max(_self.EPSILON, Math.sqrt(xDelta*xDelta + yDelta*yDelta));
        			
        		var force = (_self.forceConstant*_self.forceConstant) / deltaLength;

                node.dispx += (xDelta/deltaLength)*force;
                node.dispy += (yDelta/deltaLength)*force;
        	}
		});
    }
	
	FruchtermanLayout.prototype.calcAttraction = function(link) {
        var _self = this;
        var n1 = link.nodeA;
        var n2 = link.nodeZ;
        
        var xDelta = n1.x - n2.x;
        var yDelta = n1.y - n2.y;

        var deltaLength = Math.max(_self.EPSILON, Math.sqrt(xDelta*xDelta + yDelta*yDelta));
        var force = (deltaLength*deltaLength) / _self.forceConstant;

        var xDisp = (xDelta/deltaLength) * force;
        var yDisp = (yDelta/deltaLength) * force;
        
        n1.dispx -= xDisp; 
        n1.dispy -= yDisp;
        n2.dispx += xDisp; 
        n2.dispy += yDisp;
    }
	
	FruchtermanLayout.prototype.calcPositions = function(node) {
		var _self = this;
        var deltaLength = Math.max(_self.EPSILON,Math.sqrt(node.dispx*node.dispx + node.dispy*node.dispy));
        
        var xDisp = node.dispx/deltaLength * Math.min(deltaLength, _self.temp);
        var yDisp = node.dispy/deltaLength * Math.min(deltaLength, _self.temp);
        
        node.x += xDisp;
        node.y += yDisp;
    }
	
	FruchtermanLayout.prototype.cool = function(curIter) {
        this.temp *= (1.0 - curIter / this.maxIter);
    }
	
	window.FruchtermanLayout = FruchtermanLayout;
	
})(window);