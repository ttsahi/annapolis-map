/**
 * Created by tzachit on 17/11/14.
 */

(function(window, angular, Cesium, undefined){

    'use strict'

    var module = angular.module('annapolis-map', []);

    module.factory('Map', [function(){

        function MapService(container){
            this._viewer = new Cesium.Viewer(container);
            this._billboards = this._viewer.scene.primitives.add(new Cesium.BillboardCollection());
            this._labels = this._viewer.scene.primitives.add(new Cesium.LabelCollection());
        }

        Object.defineProperties(MapService.prototype, {
            markers: {
                get: function(){ return this._billboards; }
            },
            labels: {
                get: function(){ return this._labels; }
            }
        });

        return MapService;
    }]);

    module.factory('TracksFactory', [function(){

        function create_default_track(image){
            return {
                id: null,
                status: null,
                location: null,
                marker: {
                    image: image,
                    scaleByDistance: new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e7, 0.5),
                    show: false
                },
                label: {
                    font: '10px sans-serif',
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.5e2, 3.0, 1.5e7, 0.5),
                    show: false
                }
            };
        }

        function TracksFactory(map, image, capacity){
            this._markers = map.markers;
            this._labels = map.labels;
            this._defaultImage = image;
            this._capacity = capacity || 0;

            this._tracks = [];
            this._tracksMap = [];

            if(typeof capacity === 'integer' && capacity > (-1)){
                for(var i = 0; i < capacity; i++){
                    var track = create_default_track(this._defaultImage);
                    track.marker = this._markers.add(track.marker);
                    track.label = this._labels.add(track.label);
                    this._tracks.push(track);
                }
            }
        }

        Object.defineProperties(TracksFactory.prototype, {
            capacity: {
                get: function(){ return this._capacity; }
            },
            count: {
                get: function(){ return this._tracksMap.length; }
            }
        });

        TracksFactory.prototype.add = function(id, status, location, width, height, image){
            var track = null;

            if(this._tracks.length > 0){
                track = this._tracks.pop();
            }else{
                track = create_default_track(this._defaultImage);
                track.marker = this._markers.add(track.marker);
                track.label = this._labels.add(track.label);
                this._capacity++;
            }

            track.id = id;
            track.status = status;
            track.location = location;

            track.marker.image = image || this._defaultImage;
            track.marker.position = Cesium.Cartesian3.fromDegrees(location.lat, location.lon);
            track.marker.width = width || undefined;
            track.marker.height = height || undefined;

            track.label.position = Cesium.Cartesian3.fromDegrees(location.lat, location.lon);
            track.label.text = status;

            this._tracksMap[id] = track;
            track.marker.show = true;
            track.label.show = true;
            return true;
        };

        TracksFactory.prototype.remove = function(id){
            if(typeof this._tracksMap[id] === 'undefined'){
                console.log("Track id: " + id + "doesn't exist!");
                return false;
            }

            var track = this._tracksMap[id];
            delete this._tracksMap[id];
            this._tracks.push(track);

            track.marker.show = false;
            track.label.show = false;
            return true;
        };

        TracksFactory.prototype.update = function(id, status, location, width, height, image){
            if(typeof this._tracksMap[id] === 'undefined'){
                console.log("Track id: " + id + "doesn't exist!");
                return false;
            }

            var track = this._tracksMap[id];
            track.marker.image = image || track.marker.image;
            track.marker.position = Cesium.Cartesian3.fromDegrees(location.lat, location.lon);
            track.marker.width = width || track.marker.width;
            track.marker.height = height || track.marker.height;
            track.label.position = Cesium.Cartesian3.fromDegrees(location.lat, location.lon);
            track.label.text = status;
            return true;
        };

        TracksFactory.prototype.createOrUpdate = function(id, status, location, width, height, image){
            if(!this.update(id, status, location, width, height, image)){
                return this.add(id, status, location, width, height, image);
            }

            return true;
        };

        TracksFactory.prototype.removeAll = function(){
            for(var i = 0; i < this._tracksMap.length; i++){
                var track = this._tracksMap.pop();
                track.marker.show = false;
                track.label.show = false;
            }
        };

        TracksFactory.prototype.clear = function(){
            for(var i = 0; i < this._tracksMap.length; i++){
                this._tracksMap.pop();
            }

            this._markers.removeAll();
            this._labels.removeAll();
        };

        return TracksFactory;
    }]);

}(window, window.angular, window.Cesium));