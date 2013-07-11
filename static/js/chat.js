        $(function() {
            var registered = false;
            var socket = io.connect("<%= hostName %>");
            //we should save the clientName in the local storage such that a client can reconnect without having to assume a new identity.
            //make sure we save based on multiple hostnames such that we don't 
            var client = {
                name: "",
                x: 0,
                y: 0,
                moveUp: false,
                moveDown: false,
                moveLeft: false,
                moveRight: false
            };
            
            var serializedClientInfoMap = { };
            var localKnowledgeMap = { };
            var body = $("body");
            
            var lk = function(name, callback) {
                if (name in localKnowledgeMap) {
                    callback(localKnowledgeMap[name]);
                }
            };
            
            var sk = function(name, callback) {
                if (name in serializedClientInfoMap) {
                    callback(serializedClientInfoMap[name]);
                }
            };
            
            var initUpdate = function() {
                registered = true;
                serializedClientInfoMap[client.name] = client;
            
                localKnowledgeMap[name] = { 
                    position: new ImmutableV2(),
                    target: new ImmutableV2()
                };
                
                
                socket.on("updated", function(data) {
                   JSON.parse(data).entityUpdates.forEach(function(entityUpdateInfo) {
                       if (entityUpdateInfo.name === client.name) {
                           //don't update our client's data!
                           return;
                       }
                       
                       entityUpdateInfo.wasPlaying = serializedClientInfoMap[entityUpdateInfo.name].isPlaying;
                       serializedClientInfoMap[entityUpdateInfo.name] = entityUpdateInfo;
                       
                   });
                });
                    
                socket.on("server_error", function(data) {
                    $('p').text(data.message);
                    $('p').css('foreground', 'red');
                });
                
                socket.on("new_client", function(data) {
                    JSON.parse(data).newClients.forEach(function(newClient) {
                        if (client.name !== newClient.name) {                            
                            serializedClientInfoMap[newClient.name] = newClient;
                        }
                    });
                });
                
                socket.on("player_dropped", function(clientName) {
                    delete serializedClientInfoMap[clientName];
                });
                
                //the update function will need to be change to accomidate phaser... or phaser will have to accomidate the network updates
                var time;
                
                var serverUpdateFPS = 10;
                //updates the server sending our local client data abroad
                setInterval(function() {
                    socket.emit('update', JSON.stringify(client));
                }, 1000 / serverUpdateFPS);
                
                $("#chatInput").keydown(function(event) {
                    if (event.which === 13) {
                        socket.emit("chat", ("<p class='whitetext'>[" + (new Date()).format() + "] " + client.name + ": " + $(this).val() + "</p>"));
                        
                        $(this).val("");
                    }
                });
                
                var chat = function(chatText) {
                    $("#chat").append(chatText);
                    $("#chat").animate({ scrollTop: $("#chat")[0].scrollHeight }, 500);
                }
                socket.on("chatted", function(data){
                    chat(data);
                });
                
                //chat("<p class='whitetext'>Welcome! Type &quot;&lt;script&gt;Your javascript here! Only use apostrophes in injected javascript!&lt;/script&gt;&quot; to inject javascript!</p>");
                
                
            };
            
            socket.on("registered", function(data) {
                client.name = data;
                serializedClientInfoMap[client.name] = client;
                initUpdate();
            });
            
            var chatFocused = false;
            
            $("#chatInput").focus(function() { 
                chatFocused = true;
            });
            
            $("#chatInput").blur(function() {
               chatFocused = false; 
            });
            
            socket.emit("register", JSON.stringify(client));
            
            var delayedSequence = function(timeout, actions, predicate, callback) {
                if (!actions.Any()) {
                    return;
                }
                
                actions.First()();
                actions.push(actions.shift());
                
                if (predicate()) {
                    setTimeout(function() { delayedSequence(timeout, actions, predicate, callback); }, timeout);
                } else {
                    callback();
                }
            }
            
            {
            //gotta keep the kirbies...
            var kirbyPrefix = "Connecting chat: ";
            var hasCompleted = false;
            delayedSequence(333, [function() { $("#kirby").text(kirbyPrefix + "<(-.-)>"); },
                     function() {
                         $("#kirby").text(kirbyPrefix + "<(o.-)>"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "<(O.-)>"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "<(o.-)>"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "<(-.-)>"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "<(-.o)>"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "<(-.O)>"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "<(-.o)>"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "<(o.o)>"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "<(O.O)>"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "<(0.0)>"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "<(().())>"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "<((o)O(o))>"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "{<((o)O(o))>}"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "{{<((o)O(o))>}}"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "{<((o)O(o))>}"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "{{<((o)O(o))>}}"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "{<((o)O(o))>}"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "<(().())>"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "<(0.0)>"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "<(^.^>"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "<(^..^>"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "<(^..^>"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "<(o..o)>"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "<(o.oo.o)>"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "<(o.o)(o.o)>"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "<(o.O)><(O.o)>"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "(>OcO)> <(O_O<)"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "(>O_O)> <(O_O<)"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "(>OcO)> <(O_O<)"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "(>O_O)> <(O_O<)"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "(>OcO)> <(O_O<)"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "(>OcO)> <(O_O<)"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "(>O_O)> <(O_O<)"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "(>O_O)> <(O_O<)"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "(>o_o)> <(o_o<)"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "(>-_-)> <(-_-<)"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "(>-_-)> <(-_-<)"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "(>=_=)> <(=_=<)"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "(>=_=)> <o_o<)"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "(>=_=)> <(-{}-<)"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "(>=_=)> (-{}-<)"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "(>=_=)> ({}-<)"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "(>=_=)> }-<)"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "(>=_=)>}-<)"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "(>=_=)}-<)"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "(>=_=}-<)"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "(>=_}-<)"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "(>=}-<)"); 
                     },
                       function() {
                         $("#kirby").text(kirbyPrefix + "(>}-<)"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "(}-<)"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "}-<)"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "(-o<)"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "<(o-o<)"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "<(o-o)>"); 
                     },
                     function() {
                         $("#kirby").text(kirbyPrefix + "<(o-o)>"); 
                     },
                     function() { $("#kirby").text(kirbyPrefix + "<(-.-)>"); },
                     function() { $("#kirby").text(kirbyPrefix + "<(-.-)>"); kirbyPrefix = "";}], 
                function() { return true; },
                function() {
                    $("#kirby").text("Loaded!");
                    setTimeout(function() { $("#kirby").remove(); }, 2000);
                });
            }
        })();
                