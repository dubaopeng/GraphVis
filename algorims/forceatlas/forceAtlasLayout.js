!(function(window){
	var FruchtermanLayout = function(nodes,links){
		
		this.nodes = nodes;
		this.links = links;
		
		this.inertia = 0.1;
		this.repulsionStrength = 200;
		this.attractionStrength = 10;
		this.maxDisplacement = 10;
		this.freezeBalance = true;
		this.freezeStrength = 80;
		this.freezeInertia = 0.2;
		this.gravity = 30;
		this.speed = 10;
		this.cooling = 1;
		this.outboundAttractionDistribution = false;
		this.adjustSizes = false;
	}
	
	FruchtermanLayout.prototype.runLayout = function(){
		this.goAlgo();
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
        
        nodes.forEach(function(n){
        	if(node.uniquId != n.uniquId){
        		var xDelta = node.x - n.x;
        		var yDelta = node.y - n.y;
        		var deltaLength = Math.max(_self.EPSILON, Math.sqrt(xDelta*xDelta + yDelta*yDelta));

        		var force = (_self.forceConstant*_self.forceConstant) / deltaLength;
        		
        		console.log(force);

                if (isNaN(force)) {
                    console.log("Mathematical error...");
                }

                node.x += (xDelta/deltaLength)*force;
                node.y += (yDelta/deltaLength)*force;
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

        if (isNaN(force)) {
            console.log("Mathematical error...");
        }

        var xDisp = (xDelta/deltaLength) * force;
        var yDisp = (yDelta/deltaLength) * force;
        
        n1.x -= xDisp; 
        n1.y -= yDisp;
        n2.x += xDisp; 
        n2.y += yDisp;
    }
	
	FruchtermanLayout.prototype.calcPositions = function(node) {
		var _self = this;
        var deltaLength = Math.max(_self.EPSILON,Math.sqrt(node.x*node.x + node.y*node.y));
        
        var xDisp = node.x/deltaLength * Math.min(deltaLength, _self.temp);

        if (isNaN(xDisp)) {
            console.log("Mathematical error... (calcPositions:xDisp)");
         }

        var yDisp = node.y/deltaLength * Math.min(deltaLength, _self.temp);
        
        node.x += xDisp;
        node.y += yDisp;
    }
	
	FruchtermanLayout.prototype.cool = function(curIter) {
        this.temp *= (1.0 - curIter / this.maxIter);
    }
	
	window.FruchtermanLayout = FruchtermanLayout;
	
})(window);