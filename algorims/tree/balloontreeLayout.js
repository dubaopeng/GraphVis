!(function(window){
	var BalloonTreeLayout = function(nodes,links){
		this.nodes = nodes;
		this.links = links;
		
		this.nodeIds = [];
		this.nodeNeighbers = [];
		this.minRadius = 20;
		
		this.boolTransition = true;
		this.intSteps = 50;
	}
	
	BalloonTreeLayout.prototype.runLayout = function(){
		this.goAlgo();
	}
	
	BalloonTreeLayout.prototype.newBallonLayoutData = function(){
		var layoutData = {
			d : 0.0,
	        r : 0.0,
	        rx : 0.0,
	        ry : 0.0,
	        a : 0.0,
	        c : 0.0,
	        f : 0.0 
		};
		return layoutData;
	}
	
	BalloonTreeLayout.prototype.newLayoutData = function(){
		var layoutData = {
			finishx:0.0,
			finishy:0.0,
			xdistance:0.0,
			ydistance:0.0
		};
		return layoutData;
	}
	
	BalloonTreeLayout.prototype.initAlgo = function(){
		var _self = this;
		_self.nodes.forEach(function(node){
			_self.nodeIds.push(node.uniquId);
			var neighbers = _self.initNodeNeighbers(node);
			_self.nodeNeighbers.push(neighbers);
			
			node.ballonData = _self.newBallonLayoutData();
		});
		var rootNode = _self.getRoots()[0];
        _self.layout(rootNode, 0, 0);
	}
	
	BalloonTreeLayout.prototype.initNodeNeighbers = function(node){
		var _self = this;
		var nodeNeighbers = [];
		var outLinks = node.outLinks || [];
		
		outLinks.forEach(function(link){
			var nodeZ = link.nodeZ;
			var nodeA = link.nodeA;
			
			if(nodeA.uniquId != nodeZ.uniquId){
				
				var index = _self.nodeIds.indexOf(nodeZ.uniquId);
				var childNodes = _self.nodeNeighbers[index] || [];
				
				var childNodeIds = [];
				childNodes.forEach(function(n){
					childNodeIds.push(n.uniquId);
				});
				
				if(childNodeIds.indexOf(node.uniquId) == -1){
					nodeNeighbers.push(nodeZ);
				}
			}
		});
		return nodeNeighbers;
	}
	
	BalloonTreeLayout.prototype.layout = function(node, x, y) {
        this.firstWalk(node);
        this.secondWalk(node,null,x,y,1,0);
    }
	
	BalloonTreeLayout.prototype.firstWalk = function(node) {
		var _self = this;
        var np = node.ballonData;
        np.d = 0;
        var s = 0;
        var childNodes = _self.getSuccessors(node);
        childNodes.forEach(function(c){
        	_self.firstWalk(c);
            var cp = c.ballonData;
            np.d = Math.max(np.d,cp.r);
            cp.a = Math.atan(cp.r/(np.d+cp.r));
            s += cp.a;
        });
        _self.adjustChildren(np, s);
        _self.setRadius(node,np);
    }
	
	BalloonTreeLayout.prototype.adjustChildren = function(np,s) {
       	if ( s > Math.PI ) {
            np.c = Math.PI/s;
            np.f = 0;
        } else {
            np.c = 1;
            np.f = Math.PI - s;
        }
    }

	BalloonTreeLayout.prototype.setRadius = function(n,np) {
	     //np.r = Math.max(np.d,this.minRadius) + 2*np.d;
	   
	   var childNodes = this.getSuccessors(n);
	    var numChildren = childNodes.length;
        var p  = Math.PI;
        var fs = (numChildren==0 ? 0 : np.f/numChildren);
        var pr = 0;
        var bx = 0, by = 0;
        
        childNodes.forEach(function(c){
        	var cp = c.ballonData;
            p += pr + cp.a + fs;
            bx += (cp.r)*Math.cos(p);
            by += (cp.r)*Math.sin(p);
            pr = cp.a;
        });
        
        if (numChildren != 0 ) {
            bx /= numChildren;
            by /= numChildren;
        }
        np.rx = -bx;
        np.ry = -by;
        p = Math.PI;
        pr = 0;
        np.r = 0;
        
        childNodes.forEach(function(c){
        	var cp = c.ballonData;
            p += pr + cp.a + fs;
            var x = cp.r*Math.cos(p)-bx;
            var y = cp.r*Math.sin(p)-by;
            var d = Math.sqrt(x*x+y*y) + cp.r;
            np.r = Math.max(np.r, Math.round(d));
            pr = cp.a;
        });
        
        if ( np.r == 0 )
            np.r = this.minRadius + 2*np.d;
	}
	
	BalloonTreeLayout.prototype.secondWalk = function(n,r,x,y,l,t) {
		var _self = this;
        var np = n.ballonData;
        var cost = Math.cos(t);
        var sint = Math.sin(t);
        var nx = x + l*(np.rx*cost-np.ry*sint);
        var ny = y + l*(np.rx*sint+np.ry*cost);
        /*n.x = nx;
        n.y = ny;*/
       
        var posData = _self.newLayoutData();
		posData.finishx = nx;
		posData.finishy = ny;
		posData.xdistance = (1.0 / _self.intSteps) * (nx - n.x);
		posData.ydistance = (1.0 / _self.intSteps) * (ny - n.y);
		n.layoutData = posData;
        
        var dd = l*np.d;
        var p  = Math.PI;
        var childNodes = _self.getSuccessors(n);
	    var numChildren = childNodes.length;
        var fs = np.f / (numChildren+1);
        var pr = 0;
        
        childNodes.forEach(function(c){
            var cp = c.ballonData;
            var aa = np.c * cp.a;
            var rr = np.d * Math.tan(aa)/(1-Math.tan(aa));
            p += pr + aa + fs;
            var xx = (l*rr+dd)*Math.cos(p)+np.rx;
            var yy = (l*rr+dd)*Math.sin(p)+np.ry;
            var x2 = xx*cost - yy*sint;
            var y2 = xx*sint + yy*cost;
            pr = aa;
            _self.secondWalk(c, n, x+x2, y+y2, l*rr/cp.r, p);
        });
    }
	
	BalloonTreeLayout.prototype.secondWalk2 = function(n,r,x,y,l,t) {
		var _self = this;
		//n.x = x;
        //n.y = y;
        
        var posData = _self.newLayoutData();
		posData.finishx = x;
		posData.finishy = y;
		posData.xdistance = (1.0 / _self.intSteps) * (x - n.x);
		posData.ydistance = (1.0 / _self.intSteps) * (x);
		n.layoutData = posData;
        
        var np = n.ballonData;
        var childNodes = _self.getSuccessors(n);
        var numChildren = childNodes.length;
        var dd = l*np.d;
        var p  = t + Math.PI;
        var fs = (numChildren==0 ? 0 : np.f/numChildren);
        var pr = 0;
        
        childNodes.forEach(function(c){
            var cp = c.ballonData;
            var aa = np.c * cp.a;
            var rr = np.d * Math.tan(aa)/(1-Math.tan(aa));
            p += pr + aa + fs;
            var xx = (l*rr+dd)*Math.cos(p);
            var yy = (l*rr+dd)*Math.sin(p);
            pr = aa;
            _self.secondWalk2(c, n, x+xx, y+yy, l*np.c, p);
        });
    }
	
	BalloonTreeLayout.prototype.getRoots = function(){
		var _self = this;
		var roots = [];
		_self.nodes.forEach(function(node){
			if((node.inLinks || []).length == 0){
				roots.push(node);
			}
		});
		return roots;
	}
	
	//获取节点指向的节点集合
	BalloonTreeLayout.prototype.getSuccessors = function(node){
		var _self = this;
		var index = _self.nodeIds.indexOf(node.uniquId);
		var childNodes = _self.nodeNeighbers[index];
		return childNodes;
	}
	
	BalloonTreeLayout.prototype.goAlgo = function(){
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
	window.BalloonTreeLayout = BalloonTreeLayout;
})(window);