!(function(window){
	var GraphClient = function(canvas){
		
		this.canvas = canvas;
		this.stage = null;
		this.scene = null;
		this.nodes = [];
		this.links = [];
		this.nodeIdIndexs = [];
		this.loopName = null;
		
		this.init();
	}
	
	GraphClient.prototype.init = function(){
		
		this.stage = new JTopo.Stage(this.canvas);
		this.stage.wheelZoom = 0.9;
		this.scene = new JTopo.Scene(this.stage);
		//this.scene.backgroundColor = "rgba(220,20,20,0.9)";
		this.scene.background = "thems/black2.jpg";
	}
	
	GraphClient.prototype.drawData = function(data){
		
		var _self = this;
		if(data == null){
			return;
			console.log("graph data is null....");
		}
		
		data.nodes.forEach(function(n){
         	 var node = _self.newNode(n);
         	 
             _self.scene.add(node);
             _self.nodes.push(node);
             _self.nodeIdIndexs.push(n.id);
         });
         
         data.links.forEach(function(l){
         	var indexS = _self.nodeIdIndexs.indexOf(l.sourceId);
         	var indexE = _self.nodeIdIndexs.indexOf(l.targetId);
         	var nodeA = _self.nodes[indexS];
         	var nodeZ = _self.nodes[indexE];
         	
         	var link = _self.newLink(nodeA,nodeZ);
         	link.visible = true;
             _self.scene.add(link);
             _self.links.push(link);
         });
	}
	
	GraphClient.prototype.newNode = function(n){
		var node = new JTopo.CircleNode();                           
        node.setLocation(n.x, n.y);
        node.uniquId = n.id;
        node.radius = 10;
        node.label = n.value;//node.text
        node.alpha = 0.9;
        node.fillColor = "195,30,235";//JTopo.util.randomColor();

        node.click(function(evt){
        	//console.log(this);
        	var templWrapper = $('#neighber-nodes').empty();
        	$('#cur-node').text(this.label);
        	this.inLinks.forEach(function(l){
        		templWrapper.append('<dl class="node-label">'+l.nodeA.label+'</dl>');
        	});

        	this.outLinks.forEach(function(l){
        		templWrapper.append('<dl class="node-label">'+l.nodeZ.label+'</dl>');
        	});
        });
		return node;
	}
	
	GraphClient.prototype.newLink = function(nodeA,nodeZ){
		var link = new JTopo.Link(nodeA, nodeZ, '');        
        link.lineWidth = 1.5;
        link.strokeColor = "250,250,250";
        link.alpha = 0.6;
        link.type = 1;
        link.paint = function(cxt){
        	var source = this.nodeA,target = this.nodeZ;
        	cxt.save();
	        cxt.beginPath();
	        cxt.lineWidth = this.lineWidth;
	        cxt.strokeStyle = 'rgba('+this.strokeColor+','+this.alpha+')';
	        cxt.moveTo(source.cx,source.cy);
        	if(this.type == 1){
	        	cxt.lineTo(target.cx,target.cy);
        	}else{
	    	    var x3 = 0.3 * target.cy - 0.3 * source.cy + 0.8 * source.cx + 0.2 * target.cx;
	        	var y3 = 0.8 * source.cy + 0.2 * target.cy - 0.3 * target.cx + 0.3 * source.cx;
	        	var x4 = 0.3 * target.cy - 0.3 * source.cy + 0.2 * source.cx + 0.8 * target.cx;
	        	var y4 = 0.2 * source.cy + 0.8 * target.cy - 0.3 * target.cx + 0.3 * source.cx;
	        	var x5 = target.cx;
	        	var y5 = target.cy;
	    	    cxt.bezierCurveTo(x3,y3,x4,y4,x5,y5);
        	}
        	cxt.stroke();
	    	cxt.restore();
        };
        return link;
	}
	
	GraphClient.prototype.runLayout = function(layoutType){
		var _self = this;
		var layout = null;
		
		switch(layoutType){
			case 'singleCirlce':
				layout = new CircleLayout(_self.nodes,_self.links);
				break;
			case 'dualCirlce':
				layout = new DualCircleLayout(_self.nodes,_self.links);
				break;
			case 'layerCircle':
				layout = new LayerLayout(_self.nodes,_self.links);
				break;
			case 'grid':
				layout = new GirdLayout(_self.nodes,_self.links);
				break;
			case 'arf':
				layout = new ARFLayout(_self.nodes,_self.links);
				break;
			case 'fr':
				layout = new FRlayout(_self.nodes,_self.links);
				break;
			case 'kk':
				layout = new KKLayout(_self.nodes,_self.links);
				break;
			case 'tree':
				layout = new TreeLayout(_self.nodes,_self.links);
				break;
			case 'radiatree':
				layout = new RadiaTreeLayout(_self.nodes,_self.links);
				break;
			case 'balloon':
				layout = new BalloonLayout(_self.nodes,_self.links);
				break;
			case 'balloontree':
				layout = new BalloonTreeLayout(_self.nodes,_self.links);
				break;
			case 'fruchterman':
				layout = new FruchtermanLayout(_self.nodes,_self.links);
				break;
			case 'spring':
				layout = new SpringLayout(_self.nodes,_self.links);
				break;
			case 'spring2':
				layout = new SpringLayout2(_self.nodes,_self.links);
				break;
			default :
				layout = new FRlayout(_self.nodes,_self.links);
				break;
		}
		layout.initAlgo();
    	//layout.runLayout();
    	function loop(){
    		cancelAnimationFrame(_self.loopName);
    		layout.runLayout();
    		_self.loopName = requestAnimationFrame(loop);
    	};
    	_self.loopName = requestAnimationFrame(loop);
	}
	
	GraphClient.prototype.stopLayout = function(layoutType){
		cancelAnimationFrame(this.loopName);
	}
	
	GraphClient.prototype.setMouseModel = function(model){
		if(model == 'drag'){
			this.stage.mode = 'drag';
		}else if(model == 'select'){
			this.stage.mode = 'select';
		}else{
			this.stage.mode = 'normal';
		}
	}
	
	GraphClient.prototype.setZoom = function(type){
		if(type == 'zoomOut'){
			this.stage.zoomOut();
		}else if(type == 'zoomIn'){
			this.stage.zoomIn();
		}else if(type == 'zoom1'){
			this.scene.scaleX = 1;
			this.scene.scaleY = 1;
		}else{
			this.stage.centerAndZoom(1.0,1.0);
		}
	}
	
	GraphClient.prototype.setLineType = function(type){
		this.links.forEach(function(link){
			link.type = type;
		});
	}
	
	GraphClient.prototype.showNodeLabel = function(flag){
		this.nodes.forEach(function(node){
			if(flag){
				node.text = node.label;
			}else{
				node.text = null;
			}
		});
	}
	
	GraphClient.prototype.saveImage = function(){
		this.stage.saveImageInfo();
	}
	
	GraphClient.prototype.showOverView = function(flag){
		this.stage.eagleEye.visible = flag;
	}
	
	GraphClient.prototype.findNode = function(text){
		var nodes = this.nodes.filter(function(e){
			if(e.label == null) return false;
			return e.label.indexOf(text) != -1;
		});
		if(nodes.length > 0){
			var node = nodes[0];
			node.selected = true;
			var location = node.getCenterLocation();
			this.stage.setCenter(location.x, location.y);
			
			function nodeFlash(node, n){
				if(n == 0) {
					node.selected = false;
					return;
				};
				node.selected = !node.selected;
				setTimeout(function(){
					nodeFlash(node, n-1);
				}, 300);
			}
			nodeFlash(node, 6);
		}
	}
	
	GraphClient.prototype.setNodeSize = function(size){
		this.nodes.forEach(function(node){
			node.radius = size;
		});
	}
	
	GraphClient.prototype.setNodeColor = function(r,g,b){
		this.nodes.forEach(function(node){
			node.fillColor = r+','+g+','+b;
		});
	}
	
	GraphClient.prototype.setLinkColor = function(r,g,b){
		this.links.forEach(function(link){
			link.strokeColor = r+','+g+','+b;
		});
	}
	
	
	window.GraphClient = GraphClient;
})(window);