// ##################################
//       Initialize Firebase
// ##################################
firebase.initializeApp(config);

  
// ##################################
//     Get Data From API
// ##################################

window.onload = function() {
    const user_cord = []
    var startPos;
    var geoSuccess = function(position) {
      startPos = position;
      const user_lat = startPos.coords.latitude;
      const user_lng = startPos.coords.longitude;
      user_cord.push(user_lat)
      user_cord.push(user_lng)
      start_func(user_lat, user_lng)
    };
    navigator.geolocation.getCurrentPosition(geoSuccess);
    console.log(user_cord)
  };


function start_func(lat, lng) {
        //console.log(url)

        // this math willl generate random lat / lons in san francisco
        const api_lat = lat  || 37.8 - (Math.random() / 10) + .01 || 37.774921  
        const api_lng = lng  || -122.5 + ((Math.random() / 10) * 1.1) || -122.437578
        url = 'https://accesscontrolalloworiginall.herokuapp.com/' + 
        'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + api_lat 
        + ', ' +  api_lng  + '&rankby=distance&type=restaurant&key=' + GOOGLE_API


        $.getJSON(url).done(function (response) {
            console.log("Below is API call JSON")
            // console.log(response)
            if (response.stat === 'fail') {
                console.log(response.message);
            } else if (response.results.length === 0) {
                console.log("No data found");
            } else {
                console.log('Request succeeded!')
                // console.log(response)
                // console.log(response.results)
                const tree = response.results
                second_func(tree)
                /// return handle_response_success(response) ;

            }
        })
                       
}


// ##################################
//     Build the Tree Structure
// ##################################

function second_func(data) {
        tree = data
        console.log(tree)
        const new_tree_obj = {
            name: "Restaurants",
            children: []
        }
        for (i = 0; i < Math.min(10,tree.length); i++) { 
            const child_obj = {
                name: "",
                children: []
            }
            child_obj.name = tree[i].name

            for (j = 0; j < tree[i].types.length; j++) { 
                const child_2ndlayer_obj = {
                    name: "",
                    children: []
                }

                child_2ndlayer_obj.name = tree[i].types[j]
                child_obj.children.push(child_2ndlayer_obj)

                if (child_2ndlayer_obj.name === 'food') {
                    const child_3rdlayer_obj = {
                        name: "yum!",
                        children: []
                    }
                    child_2ndlayer_obj.children.push(child_3rdlayer_obj)
                }
                if (child_2ndlayer_obj.name === 'meal_delivery') {
                    const child_3rdlayer_obj = {
                        name: 'https://postmates.com/search?q=' + tree[i].name,
                        children: []
                    }
                    child_2ndlayer_obj.children.push(child_3rdlayer_obj)
                }

                if (child_2ndlayer_obj.name === 'restaurant') {
                    const child_3rdlayer_obj = {
                        name: "",
                        children: []
                    }
                    child_3rdlayer_obj.name = 'Rating = ' + tree[i].rating
                    child_2ndlayer_obj.children.push(child_3rdlayer_obj)
                }

                if (child_2ndlayer_obj.name === 'restaurant') {
                    const child_3rdlayer_obj = {
                        name: "",
                        children: []
                    }
                    child_3rdlayer_obj.name = 'Price = ' + tree[i].price_level
                    child_2ndlayer_obj.children.push(child_3rdlayer_obj)
                }
                if (child_2ndlayer_obj.name === 'restaurant') {
                    if (typeof(tree[i].opening_hours) != "undefined") {
                        const child_3rdlayer_obj = {
                            name: "",
                            children: []
                        }
                        child_3rdlayer_obj.name = 'Open Now = ' + tree[i].opening_hours.open_now
                        child_2ndlayer_obj.children.push(child_3rdlayer_obj)
                    }
                }
                if (child_2ndlayer_obj.name === 'restaurant') {
                    const child_3rdlayer_obj = {
                        name: "location",
                        children: []
                    }
                    child_2ndlayer_obj.children.push(child_3rdlayer_obj)
                    if (child_3rdlayer_obj.name === 'location') {
                        const child_4thlayer_obj_2 = {
                            name:  tree[i].vicinity,
                            children: []
                        }
                        child_3rdlayer_obj.children.push(child_4thlayer_obj_2)

                        const child_4thlayer_obj = {
                            name: 'Lat / Lng = ' + tree[i].geometry.location.lat.toFixed(4) + ', ' + tree[i].geometry.location.lng.toFixed(4),
                            children: []
                        }
                        // child_4thlayer_obj.name.link('https://www.google.com/maps/search/?api=1&query' + tree[i].geometry.location.lat + ', ' + tree[i].geometry.location.lng);
                        child_3rdlayer_obj.children.push(child_4thlayer_obj)

                    }
                
                }
                

            }

            new_tree_obj.children.push(child_obj)

        }

        third_func(new_tree_obj)
}


// ##################################
//     Build the Flow Chart
// ##################################

function third_func(data) {

        const treeData = data
        console.log("here is object")
        console.log(tree)

        // Set the dimensions and margins of the diagram
        var margin = {top: 0, right: 90, bottom: 30, left: 120},
            width = 1420 - margin.left - margin.right,
            height = 760 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        // appends a 'group' element to 'svg'
        // moves the 'group' element to the top left margin
        var svg = d3.select("body").append("svg")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate("
                + margin.left + "," + margin.top + ")");

        var i = 0,
            duration = 1000,
            root;

        // declares a tree layout and assigns the size
        var treemap = d3.tree().size([height, width]);

        // Assigns parent, children, height, depth
        root = d3.hierarchy(treeData, function(d) { return d.children; });
        root.x0 = height / 2;
        root.y0 = 0;

        // Collapse after the second level
        root.children.forEach(collapse);

        update(root);

        // Collapse the node and all it's children
        function collapse(d) {
        if(d.children) {
            d._children = d.children
            d._children.forEach(collapse)
            d.children = null
        }
        }

        function update(source) {

        // Assigns the x and y position for the nodes
        var treeData = treemap(root);

        // Compute the new tree layout.
        var nodes = treeData.descendants(),
            links = treeData.descendants().slice(1);

        // Normalize for fixed-depth.
        nodes.forEach(function(d){ d.y = d.depth * 255});

        // ****************** Nodes section ***************************

        // Update the nodes...
        var node = svg.selectAll('g.node')
            .data(nodes, function(d) {return d.id || (d.id = ++i); });

        // Enter any new modes at the parent's previous position.
        var nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr("transform", function(d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on('click', click);

        // Add Circle for the nodes
        nodeEnter.append('circle')
            .attr('class', 'node')
            .attr('r', 1e-6)
            .style("fill", function(d) {
                return d._children ? "lightsteelblue" : "#fff";
            });

        // Add labels for the nodes
        nodeEnter.append('text')
            .attr("dy", "-.2em")
            .attr("x", function(d) {
                return d.children || d._children ? -13 : 13;
            })
            .attr("text-anchor", function(d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function(d) { return d.data.name; });

        // UPDATE
        var nodeUpdate = nodeEnter.merge(node);

        // Transition to the proper position for the node
        nodeUpdate.transition()
            .duration(duration)
            .attr("transform", function(d) { 
                return "translate(" + d.y + "," + d.x + ")";
            });

        // Update the node attributes and style
        nodeUpdate.select('circle.node')
            .attr('r', 10)
            .style("fill", function(d) {
                return d._children ? "lightsteelblue" : "#fff";
            })
            .attr('cursor', 'pointer');


        // Remove any exiting nodes
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        // On exit reduce the node circles size to 0
        nodeExit.select('circle')
            .attr('r', 1e-6);

        // On exit reduce the opacity of text labels
        nodeExit.select('text')
            .style('fill-opacity', 1e-6);

        // ****************** links section ***************************

        // Update the links...
        var link = svg.selectAll('path.link')
            .data(links, function(d) { return d.id; });

        // Enter any new links at the parent's previous position.
        var linkEnter = link.enter().insert('path', "g")
            .attr("class", "link")
            .attr('d', function(d){
                var o = {x: source.x0, y: source.y0}
                return diagonal(o, o)
            });

        // UPDATE
        var linkUpdate = linkEnter.merge(link);

        // Transition back to the parent element position
        linkUpdate.transition()
            .duration(duration)
            .attr('d', function(d){ return diagonal(d, d.parent) });

        // Remove any exiting links
        var linkExit = link.exit().transition()
            .duration(duration)
            .attr('d', function(d) {
                var o = {x: source.x, y: source.y}
                return diagonal(o, o)
            })
            .remove();

        // Store the old positions for transition.
        nodes.forEach(function(d){
            d.x0 = d.x;
            d.y0 = d.y;
        });

        // Creates a curved (diagonal) path from parent to the child nodes
        function diagonal(s, d) {

            path = `M ${s.y} ${s.x}
                    C ${(s.y + d.y) / 2} ${s.x},
                    ${(s.y + d.y) / 2} ${d.x},
                    ${d.y} ${d.x}`

            return path
        }

        // Toggle children on click.
        function click(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
            update(d);
        }
        }

}



// ##################################################
//       Add Messge Board and Functionality
// ##################################################

// connect to your Firebase application using your reference URL
const messageAppReference = firebase.database();
    
$(document).ready(function() {
  $('#message-form').submit(function (event) {
    event.preventDefault()
    const message = $('#message').val()
    $('#message').val('')
    // create a section for messages data in your db
    const messagesReference = messageAppReference.ref('messages');
    messagesReference.push({
      message: message,
      votes: 0
    });
  });
  getPosts();
});

function getPosts() {
  // retrieve messages data when .on() initially executes
  messageAppReference.ref('messages').on('value', function (results) {
    const $messageBoard = $('.message-board');
    const messages = [];

    const allMsgs = results.val();
    // iterate through results coming from database call; messages
    for (let msg in allMsgs) {
      const message = allMsgs[msg].message;
      const votes = allMsgs[msg].votes;
      const $messageListElement = $('<li>');
      const $deleteElement = $('<i class="fa fa-trash pull-right delete"></i>')
      $deleteElement.on('click', function (e) {
        const id = $(e.target.parentNode).data('id')
        deleteMessage(id)
      });



      // create up vote element
      const $upVoteElement = $('<i class="fa fa-thumbs-up pull-right"></i>')
      $upVoteElement.on('click', function (e) {
        const id = $(e.target.parentNode).data('id');
        updateMessage(id, ++allMsgs[id].votes); //votes variable stores value independent of node id. this change targets the id.
      });

      // create down vote element
      const $downVoteElement = $('<i class="fa fa-thumbs-down pull-right"></i>')
      // <font color= #CC0020>
      $downVoteElement.on('click', function (e) {
        const id = $(e.target.parentNode).data('id');
        updateMessage(id, --allMsgs[id].votes);
      });

      // add id as data attribute so we can refer to later for updating
      $messageListElement.attr('data-id', msg)
      // add message to li and vote / delete elements to li
      $messageListElement.html(message);
      $messageListElement.append($deleteElement)
      $messageListElement.append($downVoteElement)
      $messageListElement.append($upVoteElement)

      // show votes
      $messageListElement.append('<div class="pull-right">' + votes + '</div>')
      $downVoteElement.css('color', '#FE052C');
      $upVoteElement.css('color', '#0074D9');

      // push element to array of messages
      messages.push($messageListElement);       
    }

    $messageBoard.empty();
    for (let i in messages) {
      $messageBoard.append(messages[i]);
    }
  });
}

function updateMessage(id, votes) {
  // find message whose objectId is equal to the id we're searching with and update
  const messageReference =  messageAppReference.ref('messages').child(id);
  messageReference.update({
    votes: votes
  });
}

function deleteMessage(id) {
  // find message whose objectId is equal to the id we're searching with
  const messageReference =  messageAppReference.ref('messages').child(id);

  messageReference.remove();
}





// begin the script
start_func()
