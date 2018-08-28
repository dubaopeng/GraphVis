!(function(window){
	var CircleLayout = function(nodes,links){
		this.nodes = nodes;
		this.links = links;
		
		this.diameter = 500;
		this.boolfixeddiameter = false;
		this.boolNoOverlap = true;
		this.boolTransition = true;
		
		this.TWO_PI = Math.PI * 2;
		this.intSteps = 50;
	}
	
	CircleLayout.prototype.runLayout = function(){
		this.goAlgo();
	}
	
	CircleLayout.prototype.newLayoutData = function(){
		var layoutData = {
			finishx:0.0,
			finishy:0.0,
			xdistance:0.0,
			ydistance:0.0
		};
		return layoutData;
	}
	
	CircleLayout.prototype.initAlgo = function(){
		var _self = this;
		
		var nodes = _self.nodes;
		var nodeCount = nodes.length;
		
		var nodeCoords = [];
		var tempcirc = 0.0;
		var temdiameter = 0.0;
		var index = 0;
		var noderadius = 0.0;
		var theta = _self.TWO_PI / nodeCount;
		var lasttheta = 0.0;
		
		nodes = nodes.sort(function(n1,n2){
			return ((n2.inLinks ||[]).length + (n2.outLinks||[]).length) - ((n1.inLinks||[]).length + (n1.outLinks||[]).length);
		});
		
		if(!_self.boolfixeddiameter){
			
			for(var i=0;i<nodeCount;i++){
				//var n = nodes[i];
				tempcirc += 16 * 2;//32节点大小
			}
		
			tempcirc *= 1.2;
			temdiameter = tempcirc / Math.PI;
			
			if(_self.boolNoOverlap){
				theta = _self.TWO_PI / tempcirc;
			}
		}else{
			temdiameter = _self.diameter;
		}
		
		var radius = temdiameter / 2;
		
		for(var i=0;i<nodeCount;i++){
			var n = nodes[i];
			if(_self.boolNoOverlap){
				//noderadius = n.size;
				noderadius = 16;
				var noderadian = theta * noderadius * 1.2;
				nodeCoords = _self.cartCoors(radius,1,lasttheta + noderadian);
				
				lasttheta += noderadius * 2 * theta * 1.2;
			}else{
				nodeCoords =  _self.cartCoors(radius,index,theta);
			}
			
			var posData = _self.newLayoutData();
			posData.finishx = nodeCoords[0];
			posData.finishy = nodeCoords[1];
			posData.xdistance = (1.0 / _self.intSteps) * (nodeCoords[0] - n.x);
			posData.ydistance = (1.0 / _self.intSteps) * (nodeCoords[1] - n.y);
			
			n.layoutData = posData;
			index++;
		}
	}
	
	CircleLayout.prototype.goAlgo = function(){
		var _self = this;
		var position = null;
		var nodes = _self.nodes;
		var length = nodes.length;
		
		for(var i=0;i<length;i++){
			var n = nodes[i];
			
			position = n.layoutData;
			
			if(position == null){
				continue;
			}
			
			if(_self.boolTransition){
				var currentDistance = Math.abs(n.x - position.finishx);
				var nextDistance = Math.abs((n.x + position.xdistance) - position.finishx);
				if(nextDistance < currentDistance){
					n.x += position.xdistance;
				}else{
					n.x = position.finishx;
				}
				
				currentDistance = Math.abs(n.y - position.finishy);
				nextDistance = Math.abs((n.y + position.ydistance) - position.finishy);
				if(nextDistance < currentDistance){
					n.y += position.ydistance;
				}else{
					n.y = position.finishy;
				}
				
				if(n.x == position.finishx && n.y == position.finishy){
					n.layoutData = null;
				}
			}else{
				n.x = position.finishx;
				n.y = position.finishy;
				n.layoutData = null;
			}
		}
	}
	
	CircleLayout.prototype.cartCoors = function(radius,whichInt,theta){
		var coOrds = [];
		coOrds[0] = (radius * Math.cos(theta * whichInt + Math.PI / 2));
		coOrds[1] = (radius * Math.sin(theta * whichInt + Math.PI / 2));
		return coOrds;
	}
	
	window.CircleLayout = CircleLayout;
	
})(window);