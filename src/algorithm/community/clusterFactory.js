;(function(){
	var BicomponentClusterer = function(nodes,links){
		this.nodes = nodes;
		this.links = links;

		this.nodeIds = [];
		this.nodeNeighbers = [];

		this.dfs_num = {};
		this.high = {};
		this.parents = {};
		this.stack = [];
		this.converse_depth = 0;
	};

	BicomponentClusterer.prototype.applay = function(){
		var self = this;
	    if (self.nodes.length == 0){
	    	return;
	    }
		var bicomponents = [];
	    self.nodes.forEach(function(node){
	    	self.dfs_num[node.id] = 0;
	    });

		self.converse_depth = this.nodes.length;
	    self.nodes.forEach(function(node){
	     	if(self.dfs_num[node.id] == 0){

	     		self.converse_depth = self.nodes.length;
	     		self.findBiconnectedComponents(node, bicomponents);

	     		if (self.nodes.length - self.converse_depth == 1)
	            {
	                var s = [node];
	                bicomponents.push(s);
	            }
	     	}
	    });

	    var clusterNo = 1;
	    var clusterResult = {};
	    bicomponents.forEach(function(clusterNodes){
			var color = randomColor();
			var clusterKey = 'cluster'+(clusterNo++);
			clusterNodes.forEach(function(node){
				node.fillColor = color;
				node.cluster = clusterKey;
			});
			clusterResult[clusterKey]={
				'color':color,
				'size':clusterNodes.length,
				'rate':(clusterNodes.length/self.nodes.length)
			};
		});

		return clusterResult;

		function randomColor(){
          return Math.floor(255 * Math.random()) + "," + Math.floor(255 * Math.random()) + "," + Math.floor(255 * Math.random());
        };
	};

	BicomponentClusterer.prototype.findBiconnectedComponents = function(v,bicomponents){
		var self = this;
	    var v_dfs_num = self.converse_depth;
	    self.dfs_num[v.id] = v_dfs_num;
	    self.converse_depth--;
	    self.high[v.id] = v_dfs_num;

	    var neighbors = self.getNeighbors(v) || [];

	    neighbors.forEach(function(w){
	    	var w_dfs_num = self.dfs_num[w.id];
	    	var vw = self.findEdge(v,w);

	    	if(w_dfs_num == 0){
	    		self.parents[w.id] = v.id;
	    		self.stack.push(vw);
	    		self.findBiconnectedComponents(w, bicomponents);

	    		var w_high = self.high[w.id] || 0;
	    		if (w_high <= v_dfs_num){
	    			var bicomponent = [];
	    			var e;
	    			do
	                {
	                    e = self.stack.pop();
	                    bicomponent.push(e.source);
	                    bicomponent.push(e.target);
	                }
	                while (e != vw);
	                bicomponents.push(bicomponent);
	            }
	            self.high[v.id] = Math.max(w_high, self.high[v.id]||0);
	    	} else if (w.id != self.parents[v.id]){
	    		self.high[v.id] = Math.max(w_dfs_num, self.high[v.id]||0);
	    	} 	
	    });
	};

	BicomponentClusterer.prototype.getNeighbors = function(node){
		var self = this;
		var nodeNeighbers = [];
		var outLinks = node.outLinks || [];
		
		outLinks.forEach(function(link){
			var target = link.target;
			var source = link.source;		
			if(source.id != target.id){
				var index = self.nodeIds.indexOf(target.id);
				var childNodes = self.nodeNeighbers[index] || [];
				
				var childNodeIds = [];
				childNodes.forEach(function(n){
					childNodeIds.push(n.id);
				});
				
				if(childNodeIds.indexOf(node.id) == -1){
					nodeNeighbers.push(target);
				}
			}
		});
		return nodeNeighbers;
	};

	BicomponentClusterer.prototype.findEdge = function(source,nodeB){
		var link;
		(source.outLinks||[]).forEach(function(_link){
			if(_link.target.id == nodeB.id){
				link = _link;
				return link;
			}
		});
		return link;
	};

	var WeakCommpentClutser = function(nodes,links){
		this.nodes = nodes;
		this.links = links;
		this.nodeIds = [];
		this.nodeNeighbers = [];
	};

	WeakCommpentClutser.prototype.applay = function(){
		var self = this;

		var unvisitedNodes = [];
		self.nodes.forEach(function(node){
			unvisitedNodes.push(node);

			self.nodeIds.push(node.id);
			var neighbers = self.initNodeNeighbers(node);
			self.nodeNeighbers.push(neighbers);
		});
		
		var clusters = [];
		while(unvisitedNodes.length > 0){
			var cluster = [];

			var root = unvisitedNodes[0];
			unvisitedNodes.splice(0,1);
			cluster.push(root);

			var queue =[];
			queue.push(root);

			while(queue.length > 0){
				var node = queue.splice(0,1)[0];
				var neighbors = self.initNodeNeighbers(node);
				neighbors.forEach(function(neighbor){
					var index = unvisitedNodes.indexOf(neighbor);
					if (index != -1) {
	                    queue.push(neighbor);

	                    unvisitedNodes.splice(index,1);
	                    
	                    cluster.push(neighbor);
	                }
				});
			}
			clusters.push(cluster);
		}

		var clusterNo = 1;
		var clusterResult = {};
		clusters.forEach(function(clusterNodes){
			var color = randomColor();
			var clusterKey = 'cluster'+(clusterNo++);
			clusterNodes.forEach(function(node){
				node.fillColor = color;
				node.cluster = clusterKey;
			});
			clusterResult[clusterKey]={
				'color':color,
				'size':clusterNodes.length,
				'rate':(clusterNodes.length/self.nodes.length)
			};
		});

		return clusterResult;

		function randomColor(){
          return Math.floor(255 * Math.random()) + "," + Math.floor(255 * Math.random()) + "," + Math.floor(255 * Math.random());
        };
	};

	WeakCommpentClutser.prototype.initNodeNeighbers = function(node){
		var _self = this;
		var nodeNeighbers = [];
		var outLinks = node.outLinks || [];
		
		outLinks.forEach(function(link){
			var target = link.target;
			var source = link.source;
			if(source.id != target.id){
				var index = _self.nodeIds.indexOf(target.id);
				var childNodes = _self.nodeNeighbers[index] || [];
				
				var childNodeIds = [];
				childNodes.forEach(function(n){
					childNodeIds.push(n.id);
				});
				
				if(childNodeIds.indexOf(node.id) == -1){
					nodeNeighbers.push(target);
				}
			}
		});
		return nodeNeighbers;
	};

	var NewmanCluster = function(nodes,links){
		this.nodes = nodes;
		this.links = links;
	};

	NewmanCluster.prototype.applay = function(){
		var self = this;
	    if (self.nodes.length == 0){
	    	return;
	    }
	    const n = self.nodes.length;
		const m = self.links.length;
		const vertices = self.nodes;
		const ck = new Array(n);
		const nb = new Array(n * n);
		const mask = new Array(n);
		const communities = new Array(n);
		var cluster={};

		for (let i = 0; i < n; ++i) {
		    const u = vertices[i];
		    communities[i] = i;
		    ck[i] = (u.inLinks||[]).length + (u.outLinks||[]).length;
		    mask[i] = false;
		    for (let j = 0; j < n; ++j) {
		      const v = vertices[j];
		      nb[i * n + j] = self.hasEdge(v,u) || self.hasEdge(u,v)  ? 1 : 0;
		    }
		}

		let qMax = -Infinity;
		let q = 0;
		for (let nc = n; nc > 1; --nc) {
		    let deltaQMax = -Infinity;
		    let fromIndex;
		    let toIndex;
		    for (let i = 0; i < n; ++i) {
		      if (mask[i]) {
		        continue;
		      }
		      for (let j = i + 1; j < n; ++j) {
		        if (mask[j]) {
		          continue;
		        }
		        const deltaQ = (nb[i * n + j] - ck[i] * ck[j] / 2 / m) / m;
		        if (deltaQ > deltaQMax) {
		          deltaQMax = deltaQ;
		          toIndex = i;
		          fromIndex = j;
		        }
		      }
		    }
		    ck[toIndex] += ck[fromIndex] + nb[toIndex * n + fromIndex];
		    for (let i = 0; i < n; ++i) {
		      nb[toIndex * n + i] += nb[fromIndex * n + i];
		      nb[i * n + toIndex] += nb[i * n + fromIndex];
		      if (communities[i] === fromIndex) {
		         communities[i] = toIndex;
		      }
		    }
		    mask[fromIndex] = true;

		    q += deltaQMax;
		    if (q > qMax) {
		      qMax = q;
		      for (let i = 0; i < n; ++i) {
		        const u = vertices[i];
		        u.cluster=communities[i];
		        var clusterKey=communities[i];
		        if(cluster[clusterKey]!=null){
		        	cluster[clusterKey].push(u);
		        }else{
		        	cluster[clusterKey]=[u];
		        }
		      }
		    }
		}

		var clusterNo = 1;
		var clusterResult = {};
		for(var _clusterKey in cluster){
			var clusterNodes=cluster[_clusterKey];
			var color = randomColor();

			var clusterKey = 'cluster'+(clusterNo++);
			clusterNodes.forEach(function(node){
				node.fillColor = color;
				node.cluster = clusterKey;
			});
			clusterResult[clusterKey]={
				'color':color,
				'size':clusterNodes.length,
				'rate':(clusterNodes.length/self.nodes.length)
			};
		}
		return clusterResult;

		function randomColor(){
          return Math.floor(255 * Math.random()) + "," + Math.floor(255 * Math.random()) + "," + Math.floor(255 * Math.random());
        };
	};
	NewmanCluster.prototype.hasEdge =function(u, v) {
		var target=null;
		(u.outLinks||[]).forEach(function(l){
			if(l.target.id == v.id){
				target=v;
				return v;
			}
		});
	    return target;
	};

	var ChineseWhisperCluster = function(nodes,links){
	    this.nodes = nodes;
	};

  	ChineseWhisperCluster.prototype.applay = function(){
  	  var self =this;
      var cluster = createChineseWhisper({nodes:this.nodes});
      var runFlag=true;
      var clusters=null;
      while(runFlag){
         cluster.step();
         if(cluster.getChangeRate() == 0){
          runFlag=false;
          clusters = cluster.createClusterMap();
         }
      }

      var clusterNo = 1;
      var clusterResult = {};
      var nodeMap = cluster.getIdMapNode();
      for(var clusterId in clusters){
         var _nodeIds = clusters[clusterId]||[];
         var color = randomColor();
         var clusterKey = 'cluster'+(clusterNo++);
         _nodeIds.forEach(function(nodeId){
            var node = nodeMap[nodeId];
            node.fillColor = color;
            node.cluster = clusterKey;
         });
         clusterResult[clusterKey]={
			'color':color,
			'size':_nodeIds.length,
			'rate':(_nodeIds.length/self.nodes.length)
		 };
      }
      return clusterResult;

      function randomColor(){
          return Math.floor(255 * Math.random()) + "," + Math.floor(255 * Math.random()) + "," + Math.floor(255 * Math.random());
      };

      function createChineseWhisper(graph, kind) {
        var api = {
          step: step,
          getClass: getClass,
          getChangeRate: getChangeRate,
          forEachCluster: forEachCluster,
          createClusterMap: createClusterMap,
          getIdMapNode:getIdMapNode
        };

        var changeRate = 1;
        var classChangesCount = 0;
        var random = createRandom(42);
        var iterator;
        var classMap = {};
        var nodeIds = [];
        var idMapNode={};
        var nodes=null;

        initInternalStructures();
        return api;

        function step() {
          classChangesCount = 0;
          iterator.forEach(assignHighestClass);
          changeRate = classChangesCount/nodeIds.length;
        };

        function getIdMapNode(){
        	return idMapNode;
        };

        function getChangeRate() {
          return changeRate;
        };

        function getClass(nodeId) {
          return classMap[nodeId];
        };

        function initInternalStructures() {
          nodes = graph.nodes;
          nodes.forEach(function(node) {
            classMap[node.id]=nodeIds.length;
            nodeIds.push(node.id);
            idMapNode[node.id]=node;
          });

          iterator = createRandomIterator(nodeIds, random);
        };

        function assignHighestClass(nodeId) {
          var newLevel = getHighestClassInTheNeighborhoodOf(nodeId);
          var currentLevel = classMap[nodeId];
          if (newLevel !== currentLevel) {
            classMap[nodeId]=newLevel;
            classChangesCount += 1;
          }
        };

        function getHighestClassInTheNeighborhoodOf(nodeId) {
          var seenClasses = {};
          var maxClassValue = 0;
          var maxClassName = -1;
          forEachLinkedNode(nodeId, visitNeighbour);
          if (maxClassName === -1) {
            return classMap[nodeId];
          }
          return maxClassName;

          function visitNeighbour(otherNode, link) {
            if (shouldUpdate(link.target.id === nodeId)) {
              var otherNodeClass = classMap[otherNode.id];
              var counter = seenClasses[otherNodeClass] || 0;
              counter += 1;
              if (counter > maxClassValue) {
                maxClassValue = counter;
                maxClassName = otherNodeClass;
              }

              seenClasses[otherNodeClass]=counter;
            }
          };
        };

        function shouldUpdate(isInLink) {
          if (kind === 'in') return isInLink;
          if (kind === 'out') return !isInLink;
          return true;
        };

        function forEachLinkedNode(nodeId, callback, oriented) {
          var node = getNode(nodeId);
          var links=[];
          (node.outLinks||[]).forEach(function(ol){
            links.push(ol);
          });
          (node.inLinks||[]).forEach(function(il){
            links.push(il);
          }); 

          if (node && links && typeof callback === 'function') {
            if (oriented) {
              return forEachOrientedLink(links, nodeId, callback);
            } else {
              return forEachNonOrientedLink(links, nodeId, callback);
            }
          }
        };

        function getNode(nodeId) {
          return idMapNode[nodeId];
        };

        function forEachNonOrientedLink(links, nodeId, callback) {
          var quitFast;
          for (var i = 0; i < links.length; ++i) {
            var link = links[i];
            var linkedNodeId = link.source.id === nodeId ? link.target.id : link.source.id;
            var _node = getNode(linkedNodeId);
            quitFast = callback(_node, link);
            if (quitFast) {
              return true;
            }
          }
        };

        function forEachOrientedLink(links, nodeId, callback) {
          var quitFast;
          for (var i = 0; i < links.length; ++i) {
            var link = links[i];
            if (link.source.id === nodeId) {
              quitFast = callback(nodes[link.target.id], link);
              if (quitFast) {
                return true; 
              }
            }
          }
        };

        function createClusterMap() {
          var clusters ={};
          for (var i = 0; i < nodeIds.length; ++i) {
            var nodeId = nodeIds[i];
            var clusterId = getClass(nodeId);
            var nodesInCluster = clusters[clusterId];
            if (nodesInCluster) nodesInCluster.push(nodeId);
            else clusters[clusterId]= [nodeId];
          }

          return clusters;
        };

        function randomColor(){
          return Math.floor(255 * Math.random()) + "," + Math.floor(255 * Math.random()) + "," + Math.floor(255 * Math.random());
        };

        function forEachCluster(cb) {
          var clusters = createClusterMap();
          clusters.forEach(reportToClient);
          function reportToClient(value, key) {
            cb({
              class: key,
              nodes: value
            });
          }
        };

        function createRandom(inputSeed) {
          var seed = typeof inputSeed === 'number' ? inputSeed : (+ new Date());
          var randomFunc = function() {
              seed = ((seed + 0x7ed55d16) + (seed << 12))  & 0xffffffff;
              seed = ((seed ^ 0xc761c23c) ^ (seed >>> 19)) & 0xffffffff;
              seed = ((seed + 0x165667b1) + (seed << 5))   & 0xffffffff;
              seed = ((seed + 0xd3a2646c) ^ (seed << 9))   & 0xffffffff;
              seed = ((seed + 0xfd7046c5) + (seed << 3))   & 0xffffffff;
              seed = ((seed ^ 0xb55a4f09) ^ (seed >>> 16)) & 0xffffffff;
              return (seed & 0xfffffff) / 0x10000000;
          };
          return {
              next : function (maxValue) {
                  return Math.floor(randomFunc() * maxValue);
              },
              nextDouble : function () {
                  return randomFunc();
              }
          };
        };

        function createRandomIterator(array, customRandom) {
            var localRandom = customRandom || createRandom();
            if (typeof localRandom.next !== 'function') {
              throw new Error('customRandom does not match expected API: next() function is missing');
            }
            return {
                forEach : function (callback) {
                    var i, j, t;
                    for (i = array.length - 1; i > 0; --i) {
                        j = localRandom.next(i + 1); 
                        t = array[j];
                        array[j] = array[i];
                        array[i] = t;
                        callback(t);
                    }
                    if (array.length) {
                        callback(array[0]);
                    }
                },
                shuffle : function () {
                    var i, j, t;
                    for (i = array.length - 1; i > 0; --i) {
                        j = localRandom.next(i + 1); 
                        t = array[j];
                        array[j] = array[i];
                        array[i] = t;
                    }
                    return array;
                }
            };
        };
      };
  	};

  	var LouvainCluster = function(nodes,links){
        this.nodes = nodes;
        this.links = links;
        this.idMapNode={};
    };

    LouvainCluster.prototype.applay = function(){
        var self = this;
        var jLouvain = function () {
            var __PASS_MAX = -1;
            var __MIN = 0.0000001;

            var original_graph_nodes;
            var original_graph_edges;
            var original_graph = {};
            var partition_init;
            var edge_index = {};
            var status_listS = [];

            function make_set(array) {
                var set = {};
                array.forEach(function (d, i) {
                    set[d] = true;
                });
                return Object.keys(set);
            };

            function obj_values(obj) {
                var vals = [];
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        vals.push(obj[key]);
                    }
                }
                return vals;
            };

            function get_degree_for_node(graph, node) {
                var neighbours = graph._assoc_mat[node] ? Object.keys(graph._assoc_mat[node]) : [];
                var weight = 0;
                neighbours.forEach(function (neighbour, i) {
                    var value = graph._assoc_mat[node][neighbour] || 1;
                    if (node === neighbour) {
                        value *= 2;
                    }
                    weight += value;
                });
                return weight;
            };

            function get_neighbours_of_node(graph, node) {
                if (typeof graph._assoc_mat[node] === 'undefined') {
                    return [];
                }
                var neighbours = Object.keys(graph._assoc_mat[node]);
                return neighbours;
            };

            function get_edge_weight(graph, node1, node2) {
                return graph._assoc_mat[node1] ? graph._assoc_mat[node1][node2] : undefined;
            };

            function get_graph_size(graph) {
                var size = 0;
                graph.edges.forEach(function(edge) {
                    size += edge.weight;
                });
                return size;
            };

            function add_edge_to_graph(graph, edge) {
                update_assoc_mat(graph, edge);
                if (edge_index[edge.source + '_' + edge.target]) {
                    graph.edges[edge_index[edge.source + '_' + edge.target]].weight = edge.weight;
                } else {
                    graph.edges.push(edge);
                    edge_index[edge.source + '_' + edge.target] = graph.edges.length - 1;
                }
            };

            function make_assoc_mat(edge_list) {
                var mat = {};
                edge_list.forEach(function (edge, i) {
                    mat[edge.source] = mat[edge.source] || {};
                    mat[edge.source][edge.target] = edge.weight;
                    mat[edge.target] = mat[edge.target] || {};
                    mat[edge.target][edge.source] = edge.weight;
                });
                return mat;
            };

            function update_assoc_mat(graph, edge) {
                graph._assoc_mat[edge.source] = graph._assoc_mat[edge.source] || {};
                graph._assoc_mat[edge.source][edge.target] = edge.weight;
                graph._assoc_mat[edge.target] = graph._assoc_mat[edge.target] || {};
                graph._assoc_mat[edge.target][edge.source] = edge.weight;
            };

            function clone(obj) {
                if (obj === null || typeof (obj) !== 'object')
                    return obj;
                var temp = obj.constructor();
                for (var key in obj) {
                    temp[key] = clone(obj[key]);
                }
                return temp;
            };

            function init_status(graph, status, part) {
                status['nodes_to_com'] = {};
                status['total_weight'] = 0;
                status['internals'] = {};
                status['degrees'] = {};
                status['gdegrees'] = {};
                status['loops'] = {};
                status['total_weight'] = get_graph_size(graph);

                if (typeof part === 'undefined') {
                    graph.nodes.forEach(function (node, i) {
                        status.nodes_to_com[node] = i;
                        var deg = get_degree_for_node(graph, node);

                        if (deg < 0)
                            throw 'Bad graph type, use positive weights!';

                        status.degrees[i] = deg;
                        status.gdegrees[node] = deg;
                        status.loops[node] = get_edge_weight(graph, node, node) || 0;
                        status.internals[i] = status.loops[node];
                    });
                } else {
                    graph.nodes.forEach(function (node, i) {
                        var com = part[node];
                        status.nodes_to_com[node] = com;
                        var deg = get_degree_for_node(graph, node);
                        status.degrees[com] = (status.degrees[com] || 0) + deg;
                        status.gdegrees[node] = deg;
                        var inc = 0.0;

                        var neighbours = get_neighbours_of_node(graph, node);
                        neighbours.forEach(function (neighbour, i) {
                            var weight = graph._assoc_mat[node][neighbour];

                            if (weight <= 0) {
                                throw "Bad graph type, use positive weights";
                            }

                            if (part[neighbour] === com) {
                                if (neighbour === node) {
                                    inc += weight;
                                } else {
                                    inc += weight / 2.0;
                                }
                            }
                        });
                        status.internals[com] = (status.internals[com] || 0) + inc;
                    });
                }
            };

            function __modularity(status) {
                var links = status.total_weight;
                var result = 0.0;
                var communities = make_set(obj_values(status.nodes_to_com));
                communities.forEach(function (com, i) {
                    var in_degree = status.internals[com] || 0;
                    var degree = status.degrees[com] || 0;
                    if (links > 0) {
                        result = result + in_degree / links - Math.pow((degree / (2.0 * links)), 2);
                    }
                });
                return result;
            };

            function __neighcom(node, graph, status) {
                var weights = {};
                var neighboorhood = get_neighbours_of_node(graph, node);
                neighboorhood.forEach(function (neighbour, i) {
                    if (neighbour !== node) {
                        var weight = graph._assoc_mat[node][neighbour] || 1;
                        var neighbourcom = status.nodes_to_com[neighbour];
                        weights[neighbourcom] = (weights[neighbourcom] || 0) + weight;
                    }
                });
                return weights;
            };

            function __insert(node, com, weight, status) {
                status.nodes_to_com[node] = +com;
                status.degrees[com] = (status.degrees[com] || 0) + (status.gdegrees[node] || 0);
                status.internals[com] = (status.internals[com] || 0) + weight + (status.loops[node] || 0);
            };

            function __remove(node, com, weight, status) {
                status.degrees[com] = ((status.degrees[com] || 0) - (status.gdegrees[node] || 0));
                status.internals[com] = ((status.internals[com] || 0) - weight - (status.loops[node] || 0));
                status.nodes_to_com[node] = -1;
            };

            function __renumber(dict) {
                var count = 0;
                var ret = clone(dict); 
                var new_values = {};
                var dict_keys = Object.keys(dict);
                dict_keys.forEach(function (key) {
                    var value = dict[key];
                    var new_value = typeof new_values[value] === 'undefined' ? -1 : new_values[value];
                    if (new_value === -1) {
                        new_values[value] = count;
                        new_value = count;
                        count = count + 1;
                    }
                    ret[key] = new_value;
                    status_listS.push([clone(ret)])
                });
                return ret;
            };

            function __one_level(graph, status) {
                var modif = true;
                var nb_pass_done = 0;
                var cur_mod = __modularity(status);
                var new_mod = cur_mod;
                while (modif && nb_pass_done !== __PASS_MAX) {
                    cur_mod = new_mod;
                    modif = false;
                    nb_pass_done += 1;
                    graph.nodes.forEach(function (node, i) {
                        var com_node = status.nodes_to_com[node];
                        var degc_totw = (status.gdegrees[node] || 0) / (status.total_weight * 2.0);
                        var neigh_communities = __neighcom(node, graph, status);
                        __remove(node, com_node, (neigh_communities[com_node] || 0.0), status);
                        var best_com = com_node;
                        var best_increase = 0;
                        var neigh_communities_entries = Object.keys(neigh_communities);

                        neigh_communities_entries.forEach(function (com, i) {
                            var incr = neigh_communities[com] - (status.degrees[com] || 0.0) * degc_totw;
                            if (incr > best_increase) {
                                best_increase = incr;
                                best_com = com;
                            }
                        });
                        __insert(node, best_com, neigh_communities[best_com] || 0, status);
                        if (best_com !== com_node) {
                            modif = true;
                        }
                    });
                    new_mod = __modularity(status);
                    if (new_mod - cur_mod < __MIN) {
                        break;
                    }
                }
            };

            function induced_graph(partition, graph) {
                var ret = { nodes: [], edges: [], _assoc_mat: {} };
                var w_prec, weight;
                var partition_values = obj_values(partition);
                ret.nodes = ret.nodes.concat(make_set(partition_values));
                graph.edges.forEach(function (edge, i) {
                    weight = edge.weight || 1;
                    var com1 = partition[edge.source];
                    var com2 = partition[edge.target];
                    w_prec = (get_edge_weight(ret, com1, com2) || 0);
                    var new_weight = (w_prec + weight);
                    add_edge_to_graph(ret, { 'source': com1, 'target': com2, 'weight': new_weight });
                });
                edge_index = {};
                return ret;
            };

            function partition_at_level(dendogram, level) {
                var partition = clone(dendogram[0]);
                for (var i = 1; i < level + 1; i++) {
                    Object.keys(partition).forEach(function (key, j) {
                        var node = key;
                        var com = partition[key];
                        partition[node] = dendogram[i][com];
                    });
                }
                return partition;
            };

            function generate_dendogram(graph, part_init) {
                if (graph.edges.length === 0) {
                    var part = {};
                    graph.nodes.forEach(function (node, i) {
                        part[node] = node;
                    });
                    return part;
                }
                var status = {};

                init_status(original_graph, status, part_init);
                var mod = __modularity(status);
                var status_list = [];
                __one_level(original_graph, status);
                var new_mod = __modularity(status);
                var partition = __renumber(status.nodes_to_com);
                status_list.push(partition);
                mod = new_mod;
                var current_graph = induced_graph(partition, original_graph);
                init_status(current_graph, status);

                while (true) {
                    __one_level(current_graph, status);
                    new_mod = __modularity(status);
                    status_listS.push(clone(status_list));
                    if (new_mod - mod < __MIN) {
                        break;
                    }

                    partition = __renumber(status.nodes_to_com);
                    status_list.push(partition);

                    mod = new_mod;
                    current_graph = induced_graph(partition, current_graph);
                    init_status(current_graph, status);
                }
                return status_list;
            };

            var dendogramS = {};
            var core = function () {
                var status = {};
                var dendogram = generate_dendogram(original_graph, partition_init);
                dendogramS = dendogram;
                return partition_at_level(dendogram, dendogram.length - 1);
            };
            var nextS = -1;
            core.resetAll = function () {
                nextS = -1;
                status_listS = [];
            };
            core.nextStep = function () {
                if (nextS == -1) {
                    var dendogram = generate_dendogram(original_graph, partition_init);
                    dendogramS = clone(dendogram);
                }
                if (nextS < status_listS.length) {
                    nextS += 1;
                    if(status_listS[nextS] == undefined){
                        return partition_at_level(status_listS[nextS-1], status_listS[nextS-1].length - 1);
                    }
                    return partition_at_level(status_listS[nextS], status_listS[nextS].length - 1);
                }
                else {
                    return undefined;
                }
            };
            core.nodes = function (nds) {
                if (arguments.length > 0) {
                    original_graph_nodes = nds;
                }
                return core;
            };
            core.edges = function (edgs) {
                if (typeof original_graph_nodes === 'undefined')
                    throw 'Please provide the graph nodes first!';
                if (arguments.length > 0) {
                    original_graph_edges = edgs;
                    var assoc_mat = make_assoc_mat(edgs);
                    original_graph = {
                        'nodes': original_graph_nodes,
                        'edges': original_graph_edges,
                        '_assoc_mat': assoc_mat
                    };
                }
                return core;
            };
            core.partition_init = function (prttn) {
                if (arguments.length > 0) {
                    partition_init = prttn;
                }
                return core;
            };
            return core;
        };

        function randomColor(){
          return Math.floor(255 * Math.random()) + "," + Math.floor(255 * Math.random()) + "," + Math.floor(255 * Math.random());
        };

        var node_data = [],edge_data=[];
        self.nodes.forEach(function(node){
            node_data.push(node.id);
            self.idMapNode[node.id] = node;
        });

        self.links.forEach(function(link){
            edge_data.push({
                source:link.source.id,
                target:link.target.id,
                weight:link.weight
            });
        });

        var community = jLouvain().nodes(node_data).edges(edge_data);
        var runFlag=true;
        var befor_community_result,community_assignment_result;
        while(runFlag){
            community_assignment_result = community.nextStep();
            if (community_assignment_result == undefined) {
                runFlag = false;
            }else{
                befor_community_result=community_assignment_result;
            }
        }
        communities = {};
        Object.keys(befor_community_result).forEach(function (k) {
            if (befor_community_result[k] in communities) {
                communities[befor_community_result[k]].push(k);
            } else {
                communities[befor_community_result[k]] = [k];
            }
        });

		var clusterNo = 1;
		var clusterResult = {};
        for(var clusterId in communities){
             var _nodeIds = communities[clusterId]||[];
             var color = randomColor();
             var clusterKey = 'cluster'+(clusterNo++);
             _nodeIds.forEach(function(nodeId){
                var node = self.idMapNode[nodeId];
                node.fillColor = color;
                node.cluster = clusterKey;
             });
            clusterResult[clusterKey]={
				'color':color,
				'size':_nodeIds.length,
				'rate':(_nodeIds.length/self.nodes.length)
			};
        }

        return clusterResult;
    };

    var KMeansCluster = function(nodes){
		this.nodes = nodes;
		this.centroids=[];
		this.numClusters=5;
		this.colors=[];
	};

	KMeansCluster.prototype.applay = function(config){
		var self = this;

		if(config){
			this.numClusters=Number(config['numClusters']||5);
		}

		this.init();
		this.clustering();
		this.centroids = this.updateCentroids();
		this.clustering();

		var clusters = {};
		this.nodes.forEach(function(node){
			var clusterId = node.clusterId;
			if(clusterId >= 0){
				var clusterNodes = clusters[clusterId];
				if(clusterNodes){
					clusterNodes.push(node);
				}else{
					clusterNodes=[node];
				}
				clusters[clusterId]=clusterNodes;
			}
		});

		var clusterNo = 1;
		var clusterResult = {};
		for(var _clusterKey in clusters){
			var clusterNodes = clusters[_clusterKey];
			var color = randomColor();

			var clusterKey = 'cluster'+(clusterNo++);
			clusterNodes.forEach(function(node){
				node.fillColor = color;
				node.cluster = clusterKey;
			});
			clusterResult[clusterKey]={
				'color':color,
				'size':clusterNodes.length,
				'rate':(clusterNodes.length/self.nodes.length)
			};
		}
		return clusterResult;

		function randomColor(){
          return Math.floor(255 * Math.random()) + "," + Math.floor(255 * Math.random()) + "," + Math.floor(255 * Math.random());
        };
	};

	KMeansCluster.prototype.init =function(u, v) {
		var self = this;
		this.centroids=[];
		this.numClusters=this.numClusters;
		this.colors=[];

		var minX=Number.MAX_VALUE,maxX=Number.MIN_VALUE,minY= Number.MAX_VALUE,maxY=Number.MIN_VALUE;
		for (i = 0; i < self.nodes.length; i++) {
			var node = self.nodes[i];
		    node.clusterId=null;

		    minX = Math.min(minX,node.x);
		    maxX = Math.max(minX,node.x);
		    minY = Math.min(minY,node.y);
		    maxY = Math.max(maxY,node.y);
		}
		var width=Math.abs(maxX-minX);
		var height=Math.abs(maxY-minY);
		var x, y, i;
		for (i = 0; i < self.numClusters; i++) {
		    x = Math.floor(Math.random() * width); 
		    y = Math.floor(Math.random() * height);
		    self.centroids.push({
		    	x:x,
		    	y:y,
		    	clusterId:i
		    }); 
		}
  	};

  	KMeansCluster.prototype.clustering = function() {
  		  var self = this;
	  	  var i, j;
		  for (i = 0; i < self.centroids.length; i++) {
		    self.centroids[i].bestMatches = [];
		  }
		  for (j = 0; j < self.nodes.length; j++) {
		    var p = self.nodes[j];
		    var bestMatch = 0;
		    var bestMatchDist = self.getSquareDistance(p, self.centroids[bestMatch]);
		    for (i = 1; i < self.centroids.length; i++) {
		      var d = self.getSquareDistance(p, self.centroids[i]);
		      if (d < bestMatchDist) {
					bestMatch = i;
					bestMatchDist = d;
		      }
		    }
		    self.centroids[bestMatch].bestMatches.push(j); 
		    self.nodes[j].clusterId = bestMatch;
		  }
	};

  	KMeansCluster.prototype.updateCentroids = function() {
  		var self = this;
		var newCentroids = [];
		for (var j = 0; j < self.centroids.length; j++) {
		    if (self.centroids[j].bestMatches.length > 0) {
			      var ax = 0;
			      var ay = 0;
			      var bestMatches = self.centroids[j].bestMatches;
			      for (var i = 0; i < bestMatches.length; i++) {
						var p = self.nodes[bestMatches[i]];
						ax += p.x;
						ay += p.y;
			      }
			      ax /= bestMatches.length;
			      ay /= bestMatches.length; 
			      newCentroids.push({
				    	x:ax,
			    		y:ay,
			    		clusterId:j
			      });
		    }
		    else {
		      newCentroids.push(self.centroids[j]);
		    }
		}
		return newCentroids;
	};

  	KMeansCluster.prototype.getSquareDistance = function(p1, p2) {
	  var dx = p2.x - p1.x;
	  var dy = p2.y - p1.y;
	  return dx * dx + dy * dy;
	};

  	KMeansCluster.prototype.hsv2rgb = function(h, s, v) {
	  var r, g, b;
	  if (s === 0) {
	    var val = Math.round(v);
	    return styleRGB(val, val, val);
	  }
	  if (h < 0) {
	    h += 360;
	  }
	  h = h % 360;
	  s = s / 255;
	  var hi = Math.floor(h / 60) % 6;
	  var f = (h / 60) - hi;
	  var p = Math.round(v * (1 - s));
	  var q = Math.round(v * (1 - f * s));
	  var t = Math.round(v * (1 - (1 - f) * s));
	  switch (hi) {
		  case 0:
		    r = v;
		    g = t;
		    b = p;
		    break;
		  case 1:
		    r = q;
		    g = v;
		    b = p;
		    break;
		  case 2:
		    r = p;
		    g = v;
		    b = t;
		    break;
		  case 3:
		    r = p;
		    g = q;
		    b = v;
		    break;
		  case 4:
		    r = t;
		    g = p;
		    b = v;
		    break;
		  case 5:
		    r = v;
		    g = p;
		    b = q;
		    break;
		  default:
		    break;
	  }
	  return r+','+g+','+b;
	};

    var ClusterFac = function(_graph){
		if(!_graph || _graph == null){
			return;
		}
		this.graph = {
			nodes :_graph.nodes || [],
			links :_graph.links || []
		};
	};
	
	ClusterFac.prototype.createClutser = function(clusterType){
		if(clusterType == null){
			return;
		}
		return this.getCluster(clusterType);
	};

	ClusterFac.prototype.getCluster = function(clusterType){
		var _self = this;
		var nodes = _self.graph.nodes || [];
		var links = _self.graph.links || [];
		var cluster;
		switch(clusterType){
			case 'bicomponet': cluster = new BicomponentClusterer(nodes,links);break;
			case 'weakcommpent':cluster = new WeakCommpentClutser(nodes,links);break;
			case 'newman': cluster = new NewmanCluster(nodes,links);break;
			case 'chinesewisper': cluster = new ChineseWhisperCluster(nodes,links);break;
			case 'louvain': cluster = new LouvainCluster(nodes,links);break;
			case 'kmeans': cluster = new KMeansCluster(nodes,links);break;
			default:break;
		}
		if(!cluster){
			return;
		}
		return cluster;
	};

	var ClusterFactory = ClusterFac;
	if (typeof module !== 'undefined' && typeof exports === 'object') {
	    module.exports = ClusterFactory;
	} else if (typeof define === 'function' && (define.amd || define.cmd)) {
	    define(function() { return ClusterFactory; });
	} else {
	    this.ClusterFactory = ClusterFactory;
	}
}).call(this || (typeof window !== 'undefined' ? window : global));
