!(function(window){
	var GirdLayout = function(nodes,links){
		this.nodes = nodes;
		this.links = links;
		
		this.xOrigin = 0;
		this.yOrigin = 0;
		
		this.horizontalScale = 50;
		this.verticalScale = 50;
		this.horizontal = false
		
		this.boolTransition = true;
		this.intSteps = 50;
	}
	
	GirdLayout.prototype.newLayoutData = function(){
		var layoutData = {
			finishx:0.0,
			finishy:0.0,
			xdistance:0.0,
			ydistance:0.0
		};
		return layoutData;
	}
	
	GirdLayout.prototype.runLayout = function(){
		this.goAlgo();
	}
	
	GirdLayout.prototype.initAlgo = function(){
		var _self = this;
		
		var nodes = _self.nodes;
		var nodeCount = nodes.length;
		
		var xGridScales = Math.round(Math.sqrt(nodeCount))+ 1;
		var yGridScales = Math.round(Math.sqrt(nodeCount))+ 1;
		
		/*nodes = nodes.sort(function(n1,n2){
			return ((n2.inLinks ||[]).length + (n2.outLinks||[]).length) - ((n1.inLinks||[]).length + (n1.outLinks||[]).length);
		});*/
		
		var k = 0;
		for(var i=0;i<xGridScales;i++){
			
			for(var j=0;j<yGridScales;j++){
				
				if(k >= nodeCount){
					continue;
				}
				
				var tempX,tempY;
				if(_self.horizontal){
					tempX = _self.xGridToScreen(i,j);
					tempY = _self.yGridToScreen(i,j);
				}else{
					tempX = _self.yGridToScreen(i,j);
					tempY = -_self.xGridToScreen(i,j);
				}
				
				var node = nodes[k];
				var posData = _self.newLayoutData();
				posData.finishx = tempX;
				posData.finishy = tempY;
				posData.xdistance = (1.0 / _self.intSteps) * (tempX - node.x);
				posData.ydistance = (1.0 / _self.intSteps) * (tempY - node.y);
				node.layoutData = posData;
				
				k++;
			}
		}
	}
	
	GirdLayout.prototype.goAlgo = function(){
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
	
	GirdLayout.prototype.xGridToScreen = function(xg,yg){
		return this.xOrigin + xg * this.horizontalScale;
	}
	
	GirdLayout.prototype.yGridToScreen = function(xg,yg){
		return this.yOrigin + yg * this.verticalScale;
	}
	
	window.GirdLayout = GirdLayout;
	
})(window);