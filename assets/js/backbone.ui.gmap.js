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
	var View = ( typeof APP != "undefined" && !_.isUndefined( APP.View) ) ? APP.View : Backbone.View;


	var Gmap = View.extend({

		options: {
			mapEl: false,
			data : {},
			icon : "http://maps.google.com/mapfiles/kml/pushpin/grn-pushpin.png",
			polyline: {
				strokeColor: "#FF0000",
				strokeOpacity: 1,
				strokeWeight: 3
			},
			styles : [
				{
					featureType: "all",
					elementType: "all",
					stylers: [
						{ saturation: 0 }
					]
				}
			],
			directions : {
				suppressMarkers: true,
				polylineOptions : {
					strokeColor: "#FF0000",
					strokeWeight: 4
				}
			},
			center : { lat: 37.774929, lng : -122.419416 }, // San Francisco
			zoom : 13
		},

		events : {
			"keypress .input-address input" : "inputAddress"
		},

		initialize: function( options ){
			this.data = new Data({
				//this.options.data
				center: this.options.center,
				zoom: this.options.zoom
			});
			return View.prototype.initialize.call(this, options);
		},
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
		postRender : function(){
			//if( !this.data || !this.template ) return;
			//console.log( this.data );
			//var html = this.template( this.data.toJSON() );
			//$(this.el).html( html );
			// display (in case the container is hidden)
			//$(this.el).show();
			// initialize google map
			var map = ( !this.options.mapEl ) ? $(this.el) : $(this.options.mapEl);
			this.init( map, this.data );
			// add marker(s)
			var markers = this.model.get("markers");
			for( var i in markers ){
				this.marker( markers[i] );
			}
			if( this.options.polyline ){
				this.polyline( this.options.polyline );
			}
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
		},

		init : function( el, model ){
			this.model = model;
			var options = this.setup();
			//
			this.map = new google.maps.Map( this.el , options);
			// init directions (optionally)
			if( this.model.get("input-address") ){
				this.directions = {
					display : new google.maps.DirectionsRenderer( this.options.directions ),
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
			  styles : this.options.styles
		  }
		},

		marker : function( point ){
			// fallbacks
			point = point || false;
			// prerequisites
			if( !point || !point.lat || !point.lng ) return;
			// set options
			var options = {
				position: new google.maps.LatLng( point.lat, point.lng ),
				// -33.86401046326108 hb: 151.1947818
				map: this.map,
				icon: this.options.icon
			}
			if( point.title ) options.title = point.title;
			// add marker
			new google.maps.Marker( options );
			// save to model
			var markers = this.model.get("markers");
			markers.push( point );
			this.model.set({ markers : markers });
		},

		polyline : function( coords ) {

			var path = [];
			for(var i in coords){
				path.push( new google.maps.LatLng( coords.lat, coords.lng ) );
			}

			var options = this.options.polyline;
			options.path = path;

			var it = new google.maps.Polyline( options );
			it.setMap(this.map);

		},

		route : function( address, destination ) {
			var self = this,
				data = this.model;
			// where to end
			destination = destination || data.get("center")

			var request = {
				origin: address,
				destination: destination.lat +", "+ destination.lng,
				travelMode: google.maps.DirectionsTravelMode.DRIVING
			};
			this.directions.service.route(request, function(response, status) {
				if (status == google.maps.DirectionsStatus.OK) {
					self.directions.display.setDirections(response);
				}
			});
		}
	});


	var Data = Backbone.Model.extend({
		defaults:{
			zoom : 0,
			center : { lat: 0, lng : 0},
			markers : []
		}
	});



//google.maps.event.addDomListener(window, 'load', loadMap);


	// Export
	Backbone.UI.Gmap = Gmap;

	return Backbone;
}));
