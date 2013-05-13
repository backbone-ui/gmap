// Backbone.js Modal extension
//
// Created by: Lyndel Thomas (@ryndel)
// Source: https://github.com/backbone-ui/gmap
//
// Licensed under the MIT license:
// http://makesites.org/licenses/MIT


// AMD wrapper from https://github.com/umdjs/umd/blob/master/amdWebGlobal.js

(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module and set browser global
		define(['underscore', 'backbone'], function (_, Backbone) {
			return (root.Backbone = factory(_, Backbone));
		});
	} else {
		// Browser globals
		root.Backbone = factory(root._, root.Backbone);
	}
}(this, function (_, Backbone) {

	// fallbacks
	if( _.isUndefined( Backbone.UI ) ) Backbone.UI = {};

	// conditioning the existance of the Backbone APP()
	var View = ( APP ) ? APP.View : Backbone.View;


	var Data = Backbone.Model.extend({
		defaults: {
			zoom : 16,
			center : { lat: -33.86630, lng : 151.19478180 },
			markers : [
				{ lat: -33.8630, lng : 151.19528999 }
			]
		}
	});



	var Gmap = View.extend({
		el: "#show-map",

		initialize : function(e){
			var self = this;
			// e.preventDefault();
			// option to display address
			// var input = ($(e.target).attr("rel") == "input-address");
			//self.model.set({ "input-address" :  input });
			// display the polyline on the 'static' map
			//var polyline = !input;

			var map = new APP.Views.Map({
				// model : self.model,
				template : "assets/html/map.html",
				scroll : false,
				// polyline : polyline
			});
		}
});


APP.Views.Map = APP.View.extend({
		events : _.extend({}, Backbone.UI.Modal.prototype.events, {
			"keypress .input-address input" : "inputAddress"
		}),
		// initialize: function( options ){
		//	$(this.el).unbind();
		//	return Backbone.UI.Modal.prototype.initialize.call(this, options);
		// },
		/*
		initialize: function( options ){
			_.bindAll(this, 'compile', 'render');


			console.log( this.options );

			// fetch the template file
			if( options.template ){
				$.get(options.template, this.compile);
			}

			//this.template = Handlebars.compile( options.template )

		},
		compile : function( html ){
			this.template = Handlebars.compile( html );
			// attempt to render straight away
			this.render();
		},
		*/
		// override default render() to include map initialization
		render : function(){
			if( !this.data || !this.template ) return;
			//console.log( this.data );
			var html = this.template( this.data.toJSON() );
			$(this.el).html( html );
			// display (in case the container is hidden)
			$(this.el).show();
			// initialize google map
			gMap.init( $(this.el).find("#contact-map"), this.data );
			// add marker(s)
			var markers = this.model.get("markers");
			for( var i in markers ){
				gMap.marker( markers[i] );
			}
			if( this.options.polyline ){
				gMap.polyline();
			}
			this.scroll( false );
			this.center();
		},

		inputAddress : function( e ){
			// passthrough everything except the enter key
			var key = e.keyCode || e.charCode || 0;
			if( key == 13){
				e.preventDefault();
				var address = $(e.target).val();
				gMap.route( address );
				// hide the input field?
				$(e.target).closest("div").hide();
			}
		}

	});


var gMap = {

	attributes : {
		// icon : "http://mjwadvertising.com.au/assets/img/kennel-red.png",
		styles : [
			{
			  featureType: "all",
			  elementType: "all",
			  stylers: [
				{ saturation: -100 }
			  ]
			}
		],
		directions : {
			suppressMarkers: true,
			polylineOptions : {
				strokeColor: "#FF0000",
				strokeWeight: 4
			}
		}
	},

	init : function( el, model ){
		this.model = model;
		var options = this.setup();
		//
		this.map = new google.maps.Map(document.getElementById("contact-map") , options);
		// init directions (optionally)
		if( this.model.get("input-address") ){
			this.directions = {
				display : new google.maps.DirectionsRenderer( this.attributes.directions ),
				service : new google.maps.DirectionsService()
			};
			this.directions.display.setMap( this.map );
		}
	},

	setup : function(){
		var data = this.model;
		return {
			zoom: data.get("zoom"),
			disableDefaultUI: true,
			scrollwheel: false,
			center: new google.maps.LatLng( data.get("center").lat, data.get("center").lng ),
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			styles : this.attributes.styles
		}
	},

	marker : function( coords ){
		return new google.maps.Marker({
			position: new google.maps.LatLng( coords.lat, coords.lng ),
			// -33.86401046326108 hb: 151.1947818
			map: this.map,
			icon: this.attributes.icon
			//title: 'A simple pin!'
		});
	},

	polyline : function() {

		var myCoordinates = [
			new google.maps.LatLng(-33.869284,151.193665),
			new google.maps.LatLng(-33.867547,151.192700),
			new google.maps.LatLng(-33.867164,151.193612),
			new google.maps.LatLng(-33.866505,151.193440),
			new google.maps.LatLng(-33.865186,151.193011),
			new google.maps.LatLng(-33.864857,151.193805),
			new google.maps.LatLng(-33.862781,151.195489)
			];
			var polyOptions = {
			path: myCoordinates,
			strokeColor: "#FF0000",
			strokeOpacity: 1,
			strokeWeight: 3
			}
			var it = new google.maps.Polyline(polyOptions);
			it.setMap(this.map);

	},

	route : function( address ) {
		// always end to the first marker (variable?)
		var self = this;
		// var destination = this.model.get("markers")[0];



		var request = {
			origin: address,
			// destination: destination.lat +", "+ destination.lng,
			destination : "-33.86503,151.19342",
			travelMode: google.maps.DirectionsTravelMode.DRIVING
		};
		this.directions.service.route(request, function(response, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				self.directions.display.setDirections(response);
			}
		});
	}
}

//google.maps.event.addDomListener(window, 'load', loadMap);

	});

	// Export
	Backbone.UI.Gmap = Gmap;

	return Backbone;
}));